import express from 'express';
import Category from '../models/Category.js';
import { protect, admin } from '../middleware/auth.js';
import { getProductImageFromSearch } from '../utils/googleImageSearch.js';

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ sortOrder: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/categories
// @desc    Create category
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    const { name, slug, icon, imageUrl, sortOrder } = req.body;

    // If imageUrl is not provided or empty, automatically search for an image
    let finalImageUrl = imageUrl;
    if (!imageUrl || imageUrl.trim() === '') {
      console.log(`🔍 No image provided for category: ${name}`);
      finalImageUrl = await getProductImageFromSearch(name + ' category grocery');
      console.log(`🖼️  Auto-assigned image for new category: ${name}`);
    }

    const category = await Category.create({
      name,
      slug,
      icon,
      imageUrl: finalImageUrl,
      sortOrder: sortOrder || 0
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    // If imageUrl is not provided or empty, search for an image
    if (!req.body.imageUrl || req.body.imageUrl.trim() === '') {
      const category = await Category.findById(req.params.id);
      if (category) {
        req.body.imageUrl = await getProductImageFromSearch((req.body.name || category.name) + ' category grocery');
        console.log(`🖼️  Auto-assigned image for category update: ${req.body.name || category.name}`);
      }
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
