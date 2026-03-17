import express from 'express';
import Favorite from '../models/Favorite.js';
import Product from '../models/Product.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/favorites
// @desc    Get user's favorites
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user._id })
      .populate('product')
      .sort({ createdAt: -1 });

    res.json(favorites);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/favorites
// @desc    Add product to favorites
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { productId } = req.body;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: req.user._id,
      product: productId
    });

    if (existingFavorite) {
      return res.status(400).json({ message: 'Product already in favorites' });
    }

    const favorite = await Favorite.create({
      user: req.user._id,
      product: productId
    });

    await favorite.populate('product');
    res.status(201).json(favorite);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/favorites/:productId
// @desc    Remove product from favorites
// @access  Private
router.delete('/:productId', protect, async (req, res) => {
  try {
    const favorite = await Favorite.findOneAndDelete({
      user: req.user._id,
      product: req.params.productId
    });

    if (!favorite) {
      return res.status(404).json({ message: 'Favorite not found' });
    }

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/favorites/check/:productId
// @desc    Check if product is favorited
// @access  Private
router.get('/check/:productId', protect, async (req, res) => {
  try {
    const favorite = await Favorite.findOne({
      user: req.user._id,
      product: req.params.productId
    });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
