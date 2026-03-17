/**
 * Image Helper - Automatically generates product images using Unsplash
 */

/**
 * Generate image URL for a product based on its name
 * Uses Unsplash Source API for automatic, relevant images
 * @param {string} productName - The name of the product
 * @returns {string} Image URL
 */
export const generateProductImageUrl = (productName) => {
  if (!productName) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'; // Default product image
  }

  // Clean up product name for better image search
  const cleanName = productName
    .toLowerCase()
    .replace(/\([^)]*\)/g, '') // Remove content in parentheses like (1kg), (500g)
    .replace(/\d+\s*(kg|g|l|ml|pc|pcs|pack|dozen)/gi, '') // Remove measurements
    .replace(/premium|fresh|pure|classic|organic/gi, '') // Remove generic adjectives
    .trim();

  // Extract main keywords (first 1-2 meaningful words)
  const keywords = cleanName.split(/\s+/)
    .filter(word => word.length > 2) // Filter out short words
    .slice(0, 2) // Take first 2 words
    .join('+');

  // Use Unsplash Source API with specific search terms
  return `https://source.unsplash.com/800x800/?${keywords},product,fresh,grocery`;
};

/**
 * Product-specific image mappings for better accuracy
 * Maps common product categories to specific Unsplash collections
 */
const categoryImageMap = {
  // Groceries & Staples
  'salt': 'https://images.unsplash.com/photo-1523278957019-5e72dc46cd68?w=800&q=80',
  'sugar': 'https://images.unsplash.com/photo-1518264954388-cca5f1c1588d?w=800&q=80',
  'oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
  'ghee': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&q=80',
  'flour': 'https://images.unsplash.com/photo-1628289876753-35d8e6d7a85f?w=800&q=80',
  'wheat': 'https://images.unsplash.com/photo-1628289876753-35d8e6d7a85f?w=800&q=80',
  
  // Vegetables
  'tomato': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&q=80',
  'onion': 'https://images.unsplash.com/photo-1552282077-2619f620b720?w=800&q=80',
  'potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
  'carrot': 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=800&q=80',
  'beans': 'https://images.unsplash.com/photo-1597516664715-21b303c8fd2d?w=800&q=80',
  'cabbage': 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800&q=80',
  'cauliflower': 'https://images.unsplash.com/photo-1568584711271-7d93eabb39bb?w=800&q=80',
  'brinjal': 'https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=800&q=80',
  
  // Fruits
  'banana': 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800&q=80',
  'apple': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&q=80',
  'orange': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800&q=80',
  'grapes': 'https://images.unsplash.com/photo-1599819177841-6a6e29d660ea?w=800&q=80',
  'mango': 'https://images.unsplash.com/photo-1587411768941-672fde51ce3f?w=800&q=80',
  'papaya': 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=800&q=80',
  'watermelon': 'https://images.unsplash.com/photo-1587049352846-4a222e784d52?w=800&q=80',
  'pomegranate': 'https://images.unsplash.com/photo-1553279456-3a9241e8da85?w=800&q=80',
  
  // Dairy
  'milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80',
  'curd': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800&q=80',
  'butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&q=80',
  'cheese': 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=800&q=80',
  'paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80',
  'egg': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80',
  
  // Rice & Pulses
  'rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
  'dal': 'https://images.unsplash.com/photo-1617484155660-f3c8905fb89f?w=800&q=80',
  'toor': 'https://images.unsplash.com/photo-1617484155660-f3c8905fb89f?w=800&q=80',
  'moong': 'https://images.unsplash.com/photo-1632485532365-6c79c7b4c668?w=800&q=80',
  'chana': 'https://images.unsplash.com/photo-1607969220038-e5286d72b7eb?w=800&q=80',
  'rajma': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800&q=80',
  
  // Snacks
  'biscuit': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&q=80',
  'chips': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800&q=80',
  'cookie': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80',
  'chocolate': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800&q=80',
  'namkeen': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800&q=80',
  
  // Beverages
  'tea': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80',
  'coffee': 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80',
  'juice': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80',
  'cola': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800&q=80',
  'drink': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800&q=80',
  
  // Personal Care
  'shampoo': 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800&q=80',
  'soap': 'https://images.unsplash.com/photo-1585735386116-0e1b6bcd586e?w=800&q=80',
  'toothpaste': 'https://images.unsplash.com/photo-1622207411460-368fe34b4a70?w=800&q=80',
  'facewash': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800&q=80',
  
  // Home Care
  'detergent': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800&q=80',
  'cleaner': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800&q=80',
  'dishwash': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800&q=80'
};

/**
 * Get optimized image URL for a product
 * First checks category map for exact matches, then generates dynamic URL
 * @param {string} productName - The name of the product
 * @returns {string} Optimized image URL
 */
export const getProductImageUrl = (productName) => {
  if (!productName) {
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';
  }

  const nameLower = productName.toLowerCase();
  
  // Check for exact category matches first
  for (const [key, url] of Object.entries(categoryImageMap)) {
    if (nameLower.includes(key)) {
      return url;
    }
  }
  
  // Fall back to dynamic generation
  return generateProductImageUrl(productName);
};

export default {
  generateProductImageUrl,
  getProductImageUrl
};
