import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  icon: {
    type: String,
    default: '📦'
  },
  imageUrl: String,
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
