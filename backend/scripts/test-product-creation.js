// ===============================
// Test Product Creation Script
// ===============================
const dotenv = require("dotenv");
const path = require("path");
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const Product = require("../models/Product");

async function createTestProduct() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    console.log(
      "   MongoDB URI:",
      process.env.MONGO_URI?.replace(/:[^:@]+@/, ":****@"),
    );

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected\n");

    // Check if product already exists
    const existing = await Product.findOne({ slug: "test-oxford-shoes" });
    if (existing) {
      console.log("⚠️  Test product already exists. Deleting...");
      await Product.deleteOne({ slug: "test-oxford-shoes" });
    }

    // Create test product
    const testProduct = {
      name: "Test Oxford Shoes",
      slug: "test-oxford-shoes",
      description:
        "A test product to verify database connection and product creation.",
      specifications: "Test specifications",
      materialAndCare: "Test material and care instructions",
      shippingAndReturns: "Test shipping information",
      category: "oxford",
      price: 2999,
      comparePrice: 3999,
      brand: "Test Brand",
      sku: "TEST-001",
      stock: 100,
      sizes: [
        { size: "7", stock: 10 },
        { size: "8", stock: 20 },
        { size: "9", stock: 30 },
        { size: "10", stock: 40 },
      ],
      colors: ["Black", "Brown"],
      tags: ["test", "oxford", "formal"],
      images: [
        {
          url: `https://${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET}/test/test-image.png`,
          key: "test/test-image.png",
          isPrimary: true,
          order: 0,
        },
      ],
      featured: true,
      isActive: true,
    };

    console.log("📦 Creating test product...");
    const product = await Product.create(testProduct);
    console.log("✅ Product created successfully!\n");

    console.log("Product details:");
    console.log(`   ID: ${product._id}`);
    console.log(`   Name: ${product.name}`);
    console.log(`   Slug: ${product.slug}`);
    console.log(`   Category: ${product.category}`);
    console.log(`   Price: ₹${product.price}`);
    console.log(`   Active: ${product.isActive}`);
    console.log(`   Featured: ${product.featured}`);
    console.log();

    // Verify it can be fetched
    console.log("🔍 Verifying product can be fetched...");
    const fetchedProduct = await Product.findOne({
      slug: "test-oxford-shoes",
      isActive: true,
    });

    if (fetchedProduct) {
      console.log("✅ Product successfully fetched from database!");
      console.log(`   Name: ${fetchedProduct.name}`);
    } else {
      console.log("❌ Failed to fetch product!");
    }

    // Count all products
    const count = await Product.countDocuments({ isActive: true });
    console.log(`\n📊 Total active products in database: ${count}`);

    console.log("\n✅ Test completed successfully!");
    console.log("\nNext steps:");
    console.log("1. Try accessing: http://localhost:5000/api/v1/products");
    console.log("2. Or on VPS: https://api.sbali.in/api/v1/products");
    console.log("3. You should see the test product in the response");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestProduct();
