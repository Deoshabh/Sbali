#!/usr/bin/env node

/**
 * Quick Fix: Activate All Products
 * Run this to make all products available on frontend
 */

const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const Product = require("../models/Product");

async function activateProducts() {
  try {
    console.log("🔧 Activating Products...\n");
    console.log("=".repeat(60));

    // Connect
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all inactive products
    const inactiveProducts = await Product.find({
      $or: [
        { isActive: false },
        { isActive: { $exists: false } },
        { inStock: false },
        { inStock: { $exists: false } },
      ],
    });

    console.log(`📦 Found ${inactiveProducts.length} products to update:\n`);

    if (inactiveProducts.length === 0) {
      console.log("✅ All products are already active!");
    } else {
      // Show products before update
      inactiveProducts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Slug: ${p.slug}`);
        console.log(`   isActive: ${p.isActive}`);
        console.log(`   inStock: ${p.inStock}`);
        console.log(`   stock: ${p.stock || 0}\n`);
      });

      // Update all products
      const result = await Product.updateMany(
        {},
        {
          $set: {
            isActive: true,
            isOutOfStock: false,
            stock: 100, // Set default stock
          },
        },
      );

      console.log("=".repeat(60));
      console.log(`✅ Updated ${result.modifiedCount} products!\n`);

      // Show updated products
      console.log("📦 Products after update:\n");
      const updatedProducts = await Product.find().select(
        "name slug isActive inStock stock",
      );

      updatedProducts.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name}`);
        console.log(`   Slug: ${p.slug}`);
        console.log(`   isActive: ✅ ${p.isActive}`);
        console.log(`   inStock: ✅ ${p.inStock}`);
        console.log(`   stock: ${p.stock}\n`);
      });
    }

    console.log("=".repeat(60));
    console.log("✅ All products are now ACTIVE and IN STOCK!\n");
    console.log("🎉 Go to https://sbali.in to see your products!\n");
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    console.error("\nFull error:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  activateProducts();
}

module.exports = activateProducts;
