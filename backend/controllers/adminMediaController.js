const { log } = require('../utils/logger');
const crypto = require("crypto");
const { deleteObject, uploadBuffer, getPublicFileUrl, BUCKETS } = require("../utils/minio");
const sharp = require("sharp");
const Product = require("../models/Product");
const Media = require("../models/Media");
const { getOrSetCache, invalidateCache } = require("../utils/cache");
const { generateVariants, getImageMetadata } = require('../utils/imageOptimizer');

const UPLOAD_PROXY_TTL_SECONDS = 5 * 60;
const UPLOAD_PROXY_SECRET =
  process.env.UPLOAD_PROXY_SECRET ||
  process.env.JWT_ACCESS_SECRET ||
  process.env.JWT_SECRET ||
  "change-me-in-production";

function sanitizeFileName(fileName) {
  return String(fileName || "")
    .toLowerCase()
    .replace(/[^a-z0-9.-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createUploadToken({ key, contentType, expires }) {
  return crypto
    .createHmac("sha256", UPLOAD_PROXY_SECRET)
    .update(`${key}:${contentType}:${expires}`)
    .digest("hex");
}

function tokensMatch(expected, received) {
  const a = Buffer.from(String(expected || ""), "utf8");
  const b = Buffer.from(String(received || ""), "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

function getUploadProxyUrlBase(req) {
  const configured = process.env.API_PUBLIC_URL || process.env.NEXT_PUBLIC_API_URL || "";

  if (configured) {
    try {
      const origin = new URL(configured).origin;
      return `${origin}/api/v1/admin/media/upload-proxy`;
    } catch {
      // fall back to request host
    }
  }

  return `${req.protocol}://${req.get("host")}/api/v1/admin/media/upload-proxy`;
}

/**
 * Generate tokenized upload URL for admin upload proxy
 * POST /api/v1/admin/media/upload-url
 */
exports.getUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType, productSlug } = req.body;
    const normalizedFileType = String(fileType || '').toLowerCase();
    const allowedMediaTypes = new Set([
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ]);

    // Validate input
    if (!fileName || !fileType) {
      return res.status(400).json({
        success: false,
        message: "fileName and fileType are required",
      });
    }

    // Use provided slug or default to 'uploads'
    const folder = productSlug || 'uploads';

    // Validate file size (if provided)
    const isVideo = normalizedFileType.startsWith('video/');
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024; // 50MB for video, 5MB for images
    if (req.body.fileSize && req.body.fileSize > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds ${isVideo ? '50MB' : '5MB'} limit`,
      });
    }

    if (!allowedMediaTypes.has(normalizedFileType)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file type. Allowed: JPEG, JPG, PNG, WebP, MP4, WebM, MOV',
      });
    }

    // Sanitize filename
    const sanitizedFileName = sanitizeFileName(fileName);
    if (!sanitizedFileName) {
      return res.status(400).json({
        success: false,
        message: "Invalid fileName",
      });
    }

    // Generate unique object key
    const timestamp = Date.now();
    const key = `products/${folder}/${timestamp}-${sanitizedFileName}`;

    const expires = Date.now() + UPLOAD_PROXY_TTL_SECONDS * 1000;
    const token = createUploadToken({ key, contentType: normalizedFileType, expires });
    const uploadProxyBaseUrl = getUploadProxyUrlBase(req);
    const signedUrl =
      `${uploadProxyBaseUrl}?key=${encodeURIComponent(key)}` +
      `&contentType=${encodeURIComponent(normalizedFileType)}` +
      `&expires=${encodeURIComponent(String(expires))}` +
      `&token=${encodeURIComponent(token)}`;

    const result = {
      signedUrl,
      publicUrl: getPublicFileUrl(key, BUCKETS.DEFAULT),
      key,
    };

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    log.error("Error generating upload URL:", error);
    if (error?.message?.includes('MinIO not initialized')) {
      return res.status(503).json({
        success: false,
        message: 'Media storage is not configured or unavailable. Please check MINIO_* environment and storage connectivity.',
      });
    }
    res.status(500).json({
      success: false,
      message: "Failed to generate upload URL",
    });
  }
};

/**
 * Upload file via API proxy and store directly in MinIO using putObject.
 * PUT /api/v1/admin/media/upload-proxy
 */
exports.uploadProxy = async (req, res) => {
  try {
    const key = String(req.query.key || "");
    const contentType = String(req.query.contentType || "").toLowerCase();
    const expiresRaw = String(req.query.expires || "");
    const token = String(req.query.token || "");

    if (!key || !contentType || !expiresRaw || !token) {
      return res.status(400).json({ success: false, message: "Missing upload query parameters" });
    }

    const expires = Number(expiresRaw);
    if (!Number.isFinite(expires) || Date.now() > expires) {
      return res.status(410).json({ success: false, message: "Upload URL has expired" });
    }

    const expected = createUploadToken({ key, contentType, expires });
    if (!tokensMatch(expected, token)) {
      return res.status(403).json({ success: false, message: "Invalid upload token" });
    }

    const body = req.body;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      return res.status(400).json({ success: false, message: "Request body must be a file buffer" });
    }

    const isVideo = contentType.startsWith("video/");
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (body.length > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds ${isVideo ? "50MB" : "5MB"} limit`,
      });
    }

    const requestContentType = String(req.headers["content-type"] || "")
      .split(";")[0]
      .trim()
      .toLowerCase();
    if (requestContentType && requestContentType !== contentType) {
      return res.status(400).json({ success: false, message: "Content-Type mismatch" });
    }

    const publicUrl = await uploadBuffer(body, key, contentType, BUCKETS.DEFAULT);

    return res.status(200).json({
      success: true,
      data: {
        key,
        publicUrl,
      },
    });
  } catch (error) {
    log.error("Upload proxy failed:", error);
    return res.status(500).json({ success: false, message: "Failed to upload media" });
  }
};

/**
 * Direct authenticated upload endpoint (no presigned URL in browser).
 * POST /api/v1/admin/media/upload-direct
 */
exports.uploadDirect = async (req, res) => {
  try {
    const file = req.file;
    const key = String(req.body?.key || "").trim();
    const requestedType = String(req.body?.contentType || "").trim().toLowerCase();

    if (!file || !Buffer.isBuffer(file.buffer)) {
      return res.status(400).json({ success: false, message: "File is required" });
    }

    if (!key) {
      return res.status(400).json({ success: false, message: "Object key is required" });
    }

    const contentType = requestedType || String(file.mimetype || "").toLowerCase();
    if (!contentType) {
      return res.status(400).json({ success: false, message: "Content-Type is required" });
    }

    const isVideo = contentType.startsWith("video/");
    const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: `File size exceeds ${isVideo ? "50MB" : "5MB"} limit`,
      });
    }

    const publicUrl = await uploadBuffer(file.buffer, key, contentType, BUCKETS.DEFAULT);

    return res.status(200).json({
      success: true,
      data: {
        key,
        publicUrl,
      },
    });
  } catch (error) {
    log.error("Direct upload failed:", error);
    return res.status(500).json({ success: false, message: "Failed to upload media" });
  }
};

/**
 * Delete media object from MinIO
 * DELETE /api/v1/admin/media
 */
exports.deleteMedia = async (req, res) => {
  try {
    const { key } = req.body;

    if (!key) {
      return res.status(400).json({
        success: false,
        message: "Object key is required",
      });
    }

    await deleteObject(key);

    res.json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    log.error("Error deleting media:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete media",
    });
  }
};

/**
 * Upload 360 viewer frames
 * POST /api/v1/admin/media/frames
 * Expects multipart/form-data with "frames" array
 */
exports.uploadFrames = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No frames uploaded",
      });
    }

    const { productSlug } = req.body;
    const folder = productSlug || "uploads";
    const timestamp = Date.now();

    // Process each frame
    // We run sequentially to maintain order if needed, but Promise.all is faster
    // Naming convention: frame_01.webp, frame_02.webp, etc.
    const uploadPromises = req.files.map(async (file, index) => {
      // 1. Process with Sharp
      const processedBuffer = await sharp(file.buffer)
        .resize(1500, 1500, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 }) // WebP conversion
        .toBuffer();

      // 2. Generate key
      // Sortable filename: frame_001.webp, frame_002.webp
      const sequenceNum = String(index + 1).padStart(3, "0");
      const key = `products/${folder}/360/${timestamp}/frame_${sequenceNum}.webp`;

      // 3. Upload to MinIO
      const url = await uploadBuffer(processedBuffer, key, "image/webp");
      
      // Return details
      return {
        index,
        url,
        key
      };
    });

    const results = await Promise.all(uploadPromises);

    // Sort by index to ensure order matches input
    results.sort((a, b) => a.index - b.index);
    const urls = results.map(r => r.url);

    if (productSlug) {
      await invalidateCache(`frame-manifest:${productSlug}`);
    }

    res.json({
      success: true,
      message: `Successfully uploaded ${urls.length} frames`,
      data: {
        frames: urls,
        folder: `products/${folder}/360/${timestamp}`
      },
    });
  } catch (error) {
    log.error("Error uploading frames:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload frames",
    });
  }
};

/**
 * Get 360 frame manifest for a product (cached in Redis)
 * GET /api/v1/admin/media/frames/:slug/manifest
 */
exports.getFrameManifest = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({
        success: false,
        message: "Product slug is required",
      });
    }

    const cacheKey = `frame-manifest:${slug}`;

    const manifest = await getOrSetCache(
      cacheKey,
      async () => {
        const product = await Product.findOne({ slug }).select("slug images360 updatedAt").lean();

        if (!product) {
          return null;
        }

        const frames = (product.images360 || [])
          .slice()
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((frame, index) => ({
            index,
            order: frame.order || index,
            url: frame.url,
            key: frame.key,
          }));

        return {
          slug: product.slug,
          frameCount: frames.length,
          frames,
          updatedAt: product.updatedAt,
        };
      },
      600,
    );

    if (!manifest) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      data: manifest,
    });
  } catch (error) {
    log.error("Error fetching frame manifest:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch frame manifest",
    });
  }
};

/**
 * Optimize an uploaded image â€” generates multiple size variants + WebP
 * POST /api/v1/admin/media/optimize
 * Body: multipart/form-data with "image" file + optional "preset" (product|category|banner) + optional "folder"
 */
exports.optimizeAndUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const { preset = "product", folder = "uploads" } = req.body;
    const inputBuffer = req.file.buffer;
    const originalName = req.file.originalname
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/\.[^.]+$/, ""); // Strip extension â€” we'll use .webp

    // Get metadata for the original
    const metadata = await getImageMetadata(inputBuffer);

    // Generate all variants for the chosen preset
    const variants = await generateVariants(inputBuffer, preset);
    const timestamp = Date.now();
    const uploadResults = {};

    // Upload each variant to MinIO
    await Promise.all(
      Object.entries(variants).map(async ([variantName, result]) => {
        if (result.error) {
          uploadResults[variantName] = { error: result.error };
          return;
        }

        const key = `products/${folder}/${originalName}-${variantName}-${timestamp}.webp`;
        const publicUrl = await uploadBuffer(result.buffer, key, "image/webp");

        uploadResults[variantName] = {
          url: publicUrl,
          key,
          width: result.info.width,
          height: result.info.height,
          size: result.info.size,
          savings: result.info.savings + "%",
        };
      }),
    );

    res.json({
      success: true,
      data: {
        original: {
          name: req.file.originalname,
          size: inputBuffer.length,
          format: metadata.format,
          width: metadata.width,
          height: metadata.height,
        },
        variants: uploadResults,
      },
    });
  } catch (error) {
    log.error("Error optimizing image:", error);
    res.status(500).json({
      success: false,
      message: "Failed to optimize image",
    });
  }
};

/**
 * Get image metadata without processing
 * POST /api/v1/admin/media/metadata
 * Body: multipart/form-data with "image" file
 */
exports.getMetadata = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const metadata = await getImageMetadata(req.file.buffer);

    res.json({
      success: true,
      data: metadata,
    });
  } catch (error) {
    log.error("Error reading image metadata:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get image metadata",
    });
  }
};

/**
 * Get orphaned media files (usageCount = 0, older than N days)
 * GET /api/v1/admin/media/orphaned?days=30&limit=50
 */
exports.getOrphanedMedia = async (req, res) => {
  try {
    const days = Math.max(parseInt(req.query.days, 10) || 30, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 50, 1), 200);

    const orphaned = await Media.findUnused(days).limit(limit).lean();

    const totalSize = orphaned.reduce((sum, m) => sum + (m.fileSize || 0), 0);

    res.json({
      success: true,
      count: orphaned.length,
      totalSizeBytes: totalSize,
      totalSizeHuman: formatBytes(totalSize),
      media: orphaned,
    });
  } catch (error) {
    log.error("Get orphaned media error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Bulk delete orphaned media files
 * DELETE /api/v1/admin/media/orphaned/bulk
 * Body: { ids: ["id1", "id2", ...] }
 */
exports.deleteOrphanedMedia = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ids array is required",
      });
    }

    if (ids.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Maximum 100 items per bulk delete",
      });
    }

    // Only delete media that is actually orphaned (usageCount = 0)
    const mediaItems = await Media.find({
      _id: { $in: ids },
      usageCount: 0,
    });

    const results = { deleted: 0, failed: 0, skipped: ids.length - mediaItems.length };

    for (const item of mediaItems) {
      try {
        // Delete from MinIO
        await deleteObject(item.key, item.bucket || BUCKETS.MEDIA);
        // Delete from DB
        await Media.deleteOne({ _id: item._id });
        results.deleted++;
      } catch (err) {
        log.error("Failed to delete orphaned media", { id: item._id, error: err.message });
        results.failed++;
      }
    }

    res.json({
      success: true,
      message: `Deleted ${results.deleted} orphaned files`,
      results,
    });
  } catch (error) {
    log.error("Bulk delete orphaned media error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

function formatBytes(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
