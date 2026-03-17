/**
 * Clear all product image URLs
 * This prepares the database for fresh image assignment from Google search
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

// Load environment variables
dotenv.config();

const clearAllImages = async () => {
  try {
    console.log('🗑️  Clearing all product image URLs...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected:', mongoose.connection.host);
    console.log('📦 Database:', mongoose.connection.name);
    console.log('');

    // Count products with images
    const productsWithImages = await Product.countDocuments({
      imageUrl: { $exists: true, $ne: '', $ne: null }
    });

    console.log(`Found ${productsWithImages} products with images\n`);

    if (productsWithImages === 0) {
      console.log('✨ No images to clear!');
      process.exit(0);
    }

    // Clear all imageUrl fields
    const result = await Product.updateMany(
      {},
      { $set: { imageUrl: '' } }
    );

    console.log(`✨ Cleared! ${result.modifiedCount} products now have empty imageUrl`);
    console.log('\n💡 Run "node src/scripts/assignImagesFromGoogle.js" to fetch new images');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
clearAllImages();
