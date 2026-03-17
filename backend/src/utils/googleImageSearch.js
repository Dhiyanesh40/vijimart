/**
 * Google Image Search Helper
 * Uses Google Custom Search API to find product images
 */

import fetch from 'node-fetch';

// Fallback images if Google search fails
const fallbackImages = {
  'salt': 'https://images.unsplash.com/photo-1523278957019-5e72dc46cd68?w=800&q=80',
  'sugar': 'https://images.unsplash.com/photo-1518264954388-cca5f1c1588d?w=800&q=80',
  'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
  'wheat': 'https://images.unsplash.com/photo-1628289876753-35d8e6d7a85f?w=800&q=80',
  'tomato': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&q=80',
  'onion': 'https://images.unsplash.com/photo-1552282077-2619f620b720?w=800&q=80',
  'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
  'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80',
  'default': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
};

/**
 * Clean product name for better search results
 */
const cleanProductName = (name) => {
  return name
    .toLowerCase()
    .replace(/\([^)]*\)/g, '') // Remove (1kg), (500g) etc
    .replace(/\d+\s*(kg|g|l|ml|pc|pcs|pack|dozen)/gi, '')
    .replace(/premium|fresh|pure|classic|organic/gi, '')
    .trim();
};

/**
 * Search Google Images using Custom Search API
 * Note: Requires GOOGLE_API_KEY and GOOGLE_CX in .env
 */
export const searchGoogleImage = async (productName) => {
  try {
    const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
    const GOOGLE_CX = process.env.GOOGLE_CX; // Custom Search Engine ID
    
    if (!GOOGLE_API_KEY || !GOOGLE_CX) {
      console.log('⚠️  Google API credentials not found, using fallback');
      return getFallbackImage(productName);
    }

    const cleanName = cleanProductName(productName);
    const searchQuery = encodeURIComponent(`${cleanName} product food grocery`);
    
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CX}&searchType=image&q=${searchQuery}&num=1&imgSize=large&safe=active`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.log(`⚠️  Google API error: ${response.status}, using fallback`);
      return getFallbackImage(productName);
    }
    
    const data = await response.json();
    
    if (data.items && data.items.length > 0) {
      const imageUrl = data.items[0].link;
      console.log(`✅ Found Google image for: ${productName}`);
      return imageUrl;
    } else {
      console.log(`⚠️  No Google results for: ${productName}, using fallback`);
      return getFallbackImage(productName);
    }
    
  } catch (error) {
    console.log(`❌ Google search error for ${productName}:`, error.message);
    return getFallbackImage(productName);
  }
};

/**
 * Alternative: Use Bing Image Search (doesn't require custom search engine setup)
 */
export const searchBingImage = async (productName) => {
  try {
    const BING_API_KEY = process.env.BING_API_KEY;
    
    if (!BING_API_KEY) {
      console.log('⚠️  Bing API key not found, using fallback');
      return getFallbackImage(productName);
    }

    const cleanName = cleanProductName(productName);
    const searchQuery = encodeURIComponent(`${cleanName} product food grocery`);
    
    const url = `https://api.bing.microsoft.com/v7.0/images/search?q=${searchQuery}&count=1&safeSearch=Moderate`;
    
    const response = await fetch(url, {
      headers: {
        'Ocp-Apim-Subscription-Key': BING_API_KEY
      }
    });
    
    if (!response.ok) {
      console.log(`⚠️  Bing API error: ${response.status}, using fallback`);
      return getFallbackImage(productName);
    }
    
    const data = await response.json();
    
    if (data.value && data.value.length > 0) {
      const imageUrl = data.value[0].contentUrl;
      console.log(`✅ Found Bing image for: ${productName}`);
      return imageUrl;
    } else {
      console.log(`⚠️  No Bing results for: ${productName}, using fallback`);
      return getFallbackImage(productName);
    }
    
  } catch (error) {
    console.log(`❌ Bing search error for ${productName}:`, error.message);
    return getFallbackImage(productName);
  }
};

/**
 * Use Unsplash as fallback (free, no API key needed)
 */
const getFallbackImage = (productName) => {
  const cleanName = cleanProductName(productName);
  
  // Check if we have a specific fallback for this product
  for (const [key, url] of Object.entries(fallbackImages)) {
    if (cleanName.includes(key)) {
      return url;
    }
  }
  
  // Generate Unsplash URL based on product name
  const keywords = cleanName.split(/\s+/)
    .filter(word => word.length > 2)
    .slice(0, 2)
    .join('+');
    
  return `https://source.unsplash.com/800x800/?${keywords},food,product,grocery`;
};

/**
 * Main function: Try multiple sources in order
 * 1. Google Custom Search (best quality, requires API key)
 * 2. Bing Image Search (good quality, easier setup)
 * 3. Unsplash (free fallback)
 */
export const getProductImageFromSearch = async (productName) => {
  console.log(`🔍 Searching image for: ${productName}`);
  
  // Try Google first
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_CX) {
    const googleImage = await searchGoogleImage(productName);
    if (googleImage && !googleImage.includes('unsplash')) {
      return googleImage;
    }
  }
  
  // Try Bing as backup
  if (process.env.BING_API_KEY) {
    const bingImage = await searchBingImage(productName);
    if (bingImage && !bingImage.includes('unsplash')) {
      return bingImage;
    }
  }
  
  // Fall back to Unsplash
  console.log(`ℹ️  Using Unsplash for: ${productName}`);
  return getFallbackImage(productName);
};

export default {
  searchGoogleImage,
  searchBingImage,
  getProductImageFromSearch
};
