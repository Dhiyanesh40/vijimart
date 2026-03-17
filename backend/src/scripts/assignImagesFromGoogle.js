/**
 * Assign images from Google Image Search to all products
 * Searches Google for each product and uses the first image result
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import { getProductImageFromSearch } from '../utils/googleImageSearch.js';

// Load environment variables
dotenv.config();

const assignImagesFromGoogle = async () => {
  try {
    console.log('🔍 Starting Google Image Search for all products...\n');
    
    // Check for API keys
    if (!process.env.GOOGLE_API_KEY && !process.env.BING_API_KEY) {
      console.log('⚠️  WARNING: No API keys found in .env file!');
      console.log('ℹ️  Add GOOGLE_API_KEY and GOOGLE_CX for Google search');
      console.log('ℹ️  Or add BING_API_KEY for Bing search');
      console.log('ℹ️  Will use Unsplash as fallback\n');
    } else if (process.env.GOOGLE_API_KEY) {
      console.log('✅ Google Custom Search API configured');
    } else if (process.env.BING_API_KEY) {
      console.log('✅ Bing Image Search API configured');
    }
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected:', mongoose.connection.host);
    console.log('📦 Database:', mongoose.connection.name);
    console.log('');

    // Find all products without images
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
    let failedCount = 0;

    // Process each product with a delay to avoid rate limiting
    for (let i = 0; i < productsWithoutImages.length; i++) {
      const product = productsWithoutImages[i];
      
      try {
        console.log(`\n[${i + 1}/${productsWithoutImages.length}] Processing: ${product.name}`);
        
        // Search for image
        const imageUrl = await getProductImageFromSearch(product.name);
        
        // Update product using direct MongoDB update to avoid pre-save hook
        await Product.updateOne(
          { _id: product._id },
          { $set: { imageUrl: imageUrl } }
        );
        
        console.log(`✅ Assigned image: ${imageUrl.substring(0, 60)}...`);
        updatedCount++;
        
        // Add delay to avoid rate limiting (1 second between requests)
        if (i < productsWithoutImages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.log(`❌ Failed for ${product.name}:`, error.message);
        failedCount++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✨ Assignment complete!`);
    console.log(`✅ Successfully updated: ${updatedCount} products`);
    if (failedCount > 0) {
      console.log(`❌ Failed: ${failedCount} products`);
    }
    console.log(`${'='.repeat(60)}\n`);
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

// Run the script
assignImagesFromGoogle();
