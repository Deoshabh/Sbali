/**
 * Migration Script: Update image URLs to use CDN
 * Target: api.minio.sbali.in / minio.sbali.in → cdn.sbali.in
 *
 * Run on VPS: node migrate-image-urls.js
 * Requires MONGO_URI env var (reads from .env automatically)
 */
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");

const OLD_DOMAINS = ["api.minio.sbali.in", "minio.sbali.in"];
const NEW_DOMAIN = "cdn.sbali.in";

async function migrate() {
  console.log("🔄 Connecting to MongoDB...");
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected\n");

  const db = mongoose.connection.db;

  // Helper to replace domains in a string
  const replaceDomains = (url) => {
    if (!url || typeof url !== "string") return url;
    let newUrl = url;
    for (const domain of OLD_DOMAINS) {
      if (newUrl.includes(domain)) {
        newUrl = newUrl.replace(domain, NEW_DOMAIN);
      }
    }
    return newUrl;
  };

  // 1. Products — images[].url
  console.log("📦 Migrating Product image URLs...");
  const products = db.collection("products");
  
  // Find products containing ANY of the old domains
  const productQuery = {
    $or: OLD_DOMAINS.map(d => ({ "images.url": { $regex: d } }))
  };
  
  const productDocs = await products.find(productQuery).toArray();
  let productCount = 0;
  
  for (const doc of productDocs) {
    let changed = false;
    const updatedImages = doc.images.map((img) => {
      const newUrl = replaceDomains(img.url);
      if (newUrl !== img.url) changed = true;
      return { ...img, url: newUrl };
    });

    if (changed) {
      await products.updateOne(
        { _id: doc._id },
        { $set: { images: updatedImages } }
      );
      productCount++;
    }
  }
  console.log(`   ✅ Updated ${productCount} products\n`);

  // 2. Categories — image.url
  console.log("📁 Migrating Category image URLs...");
  const categories = db.collection("categories");
  let categoryCount = 0;
  
  // Update one by one for safety or use bulkWrite if massive
  const categoryDocs = await categories.find({
    $or: OLD_DOMAINS.map(d => ({ "image.url": { $regex: d } }))
  }).toArray();

  for (const doc of categoryDocs) {
    const newUrl = replaceDomains(doc.image.url);
    if (newUrl !== doc.image.url) {
      await categories.updateOne(
        { _id: doc._id },
        { $set: { "image.url": newUrl } }
      );
      categoryCount++;
    }
  }
  console.log(`   ✅ Updated ${categoryCount} categories\n`);

  // 3. SiteSettings
  console.log("⚙️  Migrating SiteSettings image URLs...");
  const settings = db.collection("sitesettings");
  const settingsQuery = {
    $or: [
      ...OLD_DOMAINS.map(d => ({ "branding.logo.url": { $regex: d } })),
      ...OLD_DOMAINS.map(d => ({ "branding.favicon.url": { $regex: d } })),
      ...OLD_DOMAINS.map(d => ({ "banners.imageUrl": { $regex: d } }))
    ]
  };
  
  const settingsDocs = await settings.find(settingsQuery).toArray();
  let settingsCount = 0;
  
  for (const doc of settingsDocs) {
    const update = {};
    let changed = false;

    if (doc.branding?.logo?.url) {
      const newUrl = replaceDomains(doc.branding.logo.url);
      if (newUrl !== doc.branding.logo.url) {
        update["branding.logo.url"] = newUrl;
        changed = true;
      }
    }
    
    if (doc.branding?.favicon?.url) {
      const newUrl = replaceDomains(doc.branding.favicon.url);
      if (newUrl !== doc.branding.favicon.url) {
        update["branding.favicon.url"] = newUrl;
        changed = true;
      }
    }

    if (doc.banners?.length) {
      const newBanners = doc.banners.map(b => {
        const newUrl = replaceDomains(b.imageUrl);
        if (newUrl !== b.imageUrl) changed = true;
        return { ...b, imageUrl: newUrl };
      });
      if (changed) {
        update.banners = newBanners;
      }
    }

    if (changed) {
      await settings.updateOne({ _id: doc._id }, { $set: update });
      settingsCount++;
    }
  }
  console.log(`   ✅ Updated ${settingsCount} site settings docs\n`);

  console.log("🎉 Migration complete!");
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch((err) => {
  console.error("❌ Migration failed:", err);
  process.exit(1);
});
