/**
 * Auto-assign images to all products without imageUrl
 * This script runs through all existing products and assigns appropriate images
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import { getProductImageUrl } from '../utils/imageHelper.js';

// Load environment variables
dotenv.config();

const autoAssignImages = async () => {
  try {
    console.log('🖼️  Starting automatic image assignment...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected:', mongoose.connection.host);
    console.log('📦 Database:', mongoose.connection.name);
    console.log('');

    // Find all products without imageUrl or with empty imageUrl
    const productsWithoutImages = await Product.find({
      $or: [
        { imageUrl: { $exists: false } },
        { imageUrl: '' },
        { imageUrl: null }
      ]
    });

    console.log(`Found ${productsWithoutImages.length} products without images\n`);

    if (productsWithoutImages.length === 0) {
      console.log('✨ All products already have images!');
      process.exit(0);
    }

    let updatedCount = 0;

    // Update each product
    for (const product of productsWithoutImages) {
      try {
        const imageUrl = getProductImageUrl(product.name);
        product.imageUrl = imageUrl;
        await product.save();
        console.log(`✅ Updated: ${product.name}`);
        updatedCount++;
      } catch (error) {
        console.log(`⚠️  Failed to update ${product.name}:`, error.message);
      }
    }

    console.log(`\n✨ Assignment complete! ${updatedCount} products updated with images`);
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
autoAssignImages();
