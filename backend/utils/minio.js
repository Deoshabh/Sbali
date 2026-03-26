const Minio = require("minio");
const https = require("https");
const { log } = require("./logger");

/**
 * ===============================
 * S3-Compatible Object Storage Configuration
 * ===============================
 * Supports: RustFS, MinIO, AWS S3, Cloudflare R2, or any S3-compatible storage
 *
 * Bucket structure:
 *   sbali-products  — product images (public read, versioned)
 *   sbali-media     — CMS media uploads (public read, versioned)
 *   sbali-reviews   — customer review photos (private)
 *   sbali-temp      — temporary uploads (auto-deleted after 24h)
 */
const {
  MINIO_ENDPOINT,
  MINIO_PORT,
  MINIO_USE_SSL,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET,
  MINIO_REGION,
  MINIO_PUBLIC_URL,
  MINIO_CDN_URL,
  MINIO_INSECURE_SKIP_TLS_VERIFY,
} = process.env;

if (
  !MINIO_ENDPOINT ||
  !MINIO_PORT ||
  !MINIO_ACCESS_KEY ||
  !MINIO_SECRET_KEY ||
  !MINIO_BUCKET
) {
  throw new Error(
    "❌ Missing required S3 storage environment variables (MINIO_*)",
  );
}

/** Bucket name constants */
const BUCKETS = {
  PRODUCTS: process.env.MINIO_BUCKET_PRODUCTS || "sbali-products",
  MEDIA: process.env.MINIO_BUCKET_MEDIA || "sbali-media",
  REVIEWS: process.env.MINIO_BUCKET_REVIEWS || "sbali-reviews",
  TEMP: process.env.MINIO_BUCKET_TEMP || "sbali-temp",
  /** Legacy default bucket — for backward compatibility */
  DEFAULT: MINIO_BUCKET,
};

/** Public base URL for assets (typically CDN domain) */
const PUBLIC_BASE_URL = (MINIO_PUBLIC_URL || MINIO_CDN_URL || "").replace(/\/$/, "");

const REGION = MINIO_REGION || "us-east-1";

function parseBooleanEnv(value, defaultValue = false) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return defaultValue;
  }

  const normalized = String(value).trim().toLowerCase();
  return ["true", "1", "yes", "y", "on"].includes(normalized);
}

function normalizeObjectKey(fileName) {
  return String(fileName || "").replace(/^\/+/, "");
}

function buildInternalObjectBaseUrl() {
  const useSSL = parseBooleanEnv(MINIO_USE_SSL, false);
  const protocol = useSSL ? "https" : "http";
  const hasPort = MINIO_PORT !== undefined && MINIO_PORT !== null && String(MINIO_PORT).trim() !== "";
  const portPart = hasPort ? `:${String(MINIO_PORT).trim()}` : "";
  return `${protocol}://${MINIO_ENDPOINT}${portPart}`;
}

// Internal state
let minioClient = null;
let isInitialized = false;

/**
 * Initialize S3 bucket and policy
 * Works with RustFS, MinIO, AWS S3, or any S3-compatible storage
 * MUST be called before server starts
 */
async function initializeBucket() {
  if (isInitialized) return;

  try {
    log.info("Initializing S3-compatible storage client...", {
      endpoint: MINIO_ENDPOINT,
      port: MINIO_PORT,
      ssl: MINIO_USE_SSL,
    });

    const useSSL = parseBooleanEnv(MINIO_USE_SSL, false);
    const skipTlsVerify = parseBooleanEnv(MINIO_INSECURE_SKIP_TLS_VERIFY, false);

    log.info("S3 TLS configuration", {
      useSSL,
      skipTlsVerify,
      skipTlsVerifyRaw: MINIO_INSECURE_SKIP_TLS_VERIFY,
    });

    if (useSSL && skipTlsVerify) {
      log.warn("MINIO_INSECURE_SKIP_TLS_VERIFY is enabled. TLS certificate verification is disabled for storage client.");
    } else if (useSSL && !skipTlsVerify) {
      log.info("TLS certificate verification is enabled for storage client. If your MinIO uses a self-signed certificate, set MINIO_INSECURE_SKIP_TLS_VERIFY=true.");
    }

    minioClient = new Minio.Client({
      endPoint: MINIO_ENDPOINT,
      port: Number(MINIO_PORT),
      useSSL: useSSL,
      accessKey: MINIO_ACCESS_KEY,
      secretKey: MINIO_SECRET_KEY,
      ...(useSSL && skipTlsVerify
        ? { transportAgent: new https.Agent({ rejectUnauthorized: false }) }
        : {}),
    });

    log.info(
      `Testing connection to ${useSSL ? "https" : "http"}://${MINIO_ENDPOINT}:${MINIO_PORT}`,
    );

    // Ensure all buckets exist with appropriate policies
    for (const [label, bucketName] of Object.entries(BUCKETS)) {
      const exists = await minioClient.bucketExists(bucketName);
      if (!exists) {
        log.info(`Bucket '${bucketName}' does not exist, creating...`);
        await minioClient.makeBucket(bucketName, REGION);
        log.success(`Bucket created: ${bucketName}`);
      } else {
        log.info(`Bucket exists: ${bucketName}`);
      }

      // Public read policy for PRODUCTS, MEDIA, DEFAULT; private for REVIEWS, TEMP
      if (label === "PRODUCTS" || label === "MEDIA" || label === "DEFAULT") {
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: { AWS: ["*"] },
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucketName}/*`],
            },
          ],
        };
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      }
    }

    log.success("Storage bucket initialization complete");
    isInitialized = true;
  } catch (error) {
    log.error("S3 storage initialization failed", {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    });
    throw error;
  }
}

/**
 * Internal guard
 */
function requireInitialized() {
  if (!isInitialized || !minioClient) {
    throw new Error("MinIO not initialized. Server should not have started.");
  }
}

async function ensureBucketExists(bucket = MINIO_BUCKET) {
  requireInitialized();
  const exists = await minioClient.bucketExists(bucket);
  if (!exists) {
    await minioClient.makeBucket(bucket, REGION);
    log.warn(`Bucket '${bucket}' was missing and has been created on demand.`);
  }
}

/**
 * Delete one object
 */
async function deleteObject(key) {
  requireInitialized();
  await ensureBucketExists(MINIO_BUCKET);
  await minioClient.removeObject(MINIO_BUCKET, key);
}

/**
 * Delete multiple objects
 */
async function deleteObjects(keys) {
  requireInitialized();
  await ensureBucketExists(MINIO_BUCKET);
  await minioClient.removeObjects(MINIO_BUCKET, keys);
}

/**
 * Public file URL for client responses
 * Prefers MINIO_PUBLIC_URL, then MINIO_CDN_URL, then internal endpoint fallback.
 */
function getPublicFileUrl(fileName, bucket = MINIO_BUCKET) {
  const key = normalizeObjectKey(fileName);
  if (PUBLIC_BASE_URL) {
    // Required format: https://cdn.sbali.in/<bucket>/<fileName>
    return `${PUBLIC_BASE_URL}/${bucket}/${key}`;
  }
  return `${buildInternalObjectBaseUrl()}/${bucket}/${key}`;
}

function getPublicUrl(key, bucket = MINIO_BUCKET) {
  return getPublicFileUrl(key, bucket);
}

/**
 * Upload buffer directly to MinIO
 * @param {Buffer} buffer - File buffer
 * @param {string} key - Object key/path
 * @param {string} contentType - MIME type
 * @param {string} [bucket=MINIO_BUCKET] - Bucket name
 * @returns {Promise<string>} - Public URL
 */
async function uploadBuffer(buffer, key, contentType, bucket = MINIO_BUCKET) {
  requireInitialized();

  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "video/mp4",
    "video/mpeg",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!allowedTypes.includes(contentType.toLowerCase())) {
    throw new Error(
      "Invalid file type. Allowed types: Images, Videos, PDFs, Docs.",
    );
  }

  const metadata = {
    "Content-Type": contentType,
  };

  await ensureBucketExists(bucket);

  await minioClient.putObject(bucket, key, buffer, buffer.length, metadata);
  return getPublicFileUrl(key, bucket);
}

/**
 * Runtime storage health check
 */
async function getStorageHealth() {
  const details = {
    endpoint: MINIO_ENDPOINT,
    bucket: MINIO_BUCKET,
    initialized: isInitialized,
  };

  if (!isInitialized || !minioClient) {
    return {
      status: "disconnected",
      details,
    };
  }

  try {
    const bucketExists = await minioClient.bucketExists(MINIO_BUCKET);
    return {
      status: bucketExists ? "operational" : "degraded",
      details: {
        ...details,
        bucketExists,
      },
    };
  } catch (error) {
    return {
      status: "error",
      details: {
        ...details,
        error: error.message,
      },
    };
  }
}

module.exports = {
  initializeBucket,
  deleteObject,
  deleteObjects,
  ensureBucketExists,
  getPublicFileUrl,
  getPublicUrl,
  uploadBuffer,
  getStorageHealth,
  BUCKETS,
};
