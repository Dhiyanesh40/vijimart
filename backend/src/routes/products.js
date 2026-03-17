import express from 'express';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import { getProductImageFromSearch } from '../utils/googleImageSearch.js';
import { emitProductUpdate, emitInventoryUpdate } from '../socket/socket.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, search, featured, inStock } = req.query;

    let query = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (featured) {
      query.featured = featured === 'true';
    }

    if (inStock) {
      query.inStock = inStock === 'true';
    }

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   POST /api/products
// @desc    Create product
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  try {
    // If imageUrl is not provided or empty, automatically search for an image
    if (!req.body.imageUrl || req.body.imageUrl.trim() === '') {
      console.log(`🔍 No image provided for: ${req.body.name}`);
      req.body.imageUrl = await getProductImageFromSearch(req.body.name);
      console.log(`🖼️  Auto-assigned image for new product: ${req.body.name}`);
    }
    
    const product = await Product.create(req.body);
    const populatedProduct = await Product.findById(product._id).populate('category', 'name slug');
    
    // Emit real-time update
    emitProductUpdate('created', populatedProduct);
    
    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    // If imageUrl is not provided or empty, search Google for an image
    if (!req.body.imageUrl || req.body.imageUrl.trim() === '') {
      const product = await Product.findById(req.params.id);
      if (product) {
        req.body.imageUrl = await getProductImageFromSearch(req.body.name || product.name);
        console.log(`🖼️  Auto-assigned image for update: ${req.body.name || product.name}`);
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Emit real-time update
    emitProductUpdate('updated', product);
    
    // Emit inventory update if stock changed
    if (req.body.inStock !== undefined) {
      emitInventoryUpdate(product._id, product.inStock);
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    
    // Emit real-time update
    emitProductUpdate('deleted', product);

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
