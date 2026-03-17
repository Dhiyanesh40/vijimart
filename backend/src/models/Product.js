import mongoose from 'mongoose';
import { getProductImageFromSearch } from '../utils/googleImageSearch.js';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: 0
  },
  mrp: {
    type: Number,
    min: 0
  },
  imageUrl: {
    type: String
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  unit: {
    type: String,
    default: '1 pc'
  },
  inStock: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add text index for search
productSchema.index({ name: 'text', description: 'text' });

// Auto-generate image URL if not provided (using Google Image Search)
productSchema.pre('save', async function(next) {
  // If imageUrl is not set or is empty, search Google for an image
  if (!this.imageUrl || this.imageUrl.trim() === '') {
    try {
      this.imageUrl = await getProductImageFromSearch(this.name);
      console.log(`🖼️  Auto-assigned image for: ${this.name}`);
    } catch (error) {
      console.log(`⚠️  Failed to get image for ${this.name}:`, error.message);
    }
  }
  next();
});

const Product = mongoose.model('Product', productSchema);

export default Product;
