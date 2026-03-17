import express from 'express';
import AIGroceryPlanner from '../services/aiGroceryPlanner.js';
import DecisionSupportSystem from '../services/decisionSupport.js';
import { protect } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

const router = express.Router();

/**
 * Generate AI-powered grocery list
 * POST /api/ai/grocery-planner/generate
 */
router.post('/grocery-planner/generate', protect, async (req, res) => {
  try {
    const {
      budget = 5000,
      preferences = [],
      favoriteCategories = [],
      householdSize = 1,
      daysToShop = 7
    } = req.body;

    // Fetch all available products
    const products = await Product.find({ inStock: true }).lean();

    // Fetch user's order history for personalization
    const userOrders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .lean();

    // Extract purchase history as array of items for AI planner
    const purchaseHistory = [];
    userOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          purchaseHistory.push({
            product: item.product?._id || item.product
          });
        });
      }
    });

    // Generate optimized grocery list
    const result = AIGroceryPlanner.generateGroceryList(
      {
        budget,
        preferences,
        favoriteCategories,
        householdSize,
        daysToShop
      },
      products,
      purchaseHistory
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error generating grocery list:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate grocery list',
      error: error.message
    });
  }
});

/**
 * Get user preferences
 * GET /api/ai/grocery-planner/preferences
 */
router.get('/grocery-planner/preferences', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('budget preferences favoriteCategories householdSize defaultShoppingDays')
      .lean();

    res.json({
      success: true,
      data: {
        budget: user?.budget || 5000,
        preferences: user?.preferences || [],
        favoriteCategories: user?.favoriteCategories || [],
        householdSize: user?.householdSize || 1,
        defaultShoppingDays: user?.defaultShoppingDays || 7
      }
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch preferences',
      error: error.message
    });
  }
});

/**
 * Update user preferences
 * PUT /api/ai/grocery-planner/preferences
 */
router.put('/grocery-planner/preferences', protect, async (req, res) => {
  try {
    const {
      budget,
      preferences,
      favoriteCategories,
      householdSize,
      defaultShoppingDays
    } = req.body;

    const updateData = {};
    if (budget !== undefined) updateData.budget = budget;
    if (preferences !== undefined) updateData.preferences = preferences;
    if (favoriteCategories !== undefined) updateData.favoriteCategories = favoriteCategories;
    if (householdSize !== undefined) updateData.householdSize = householdSize;
    if (defaultShoppingDays !== undefined) updateData.defaultShoppingDays = defaultShoppingDays;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updateData },
      { new: true }
    ).select('budget preferences favoriteCategories householdSize defaultShoppingDays');

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
});

/**
 * Get business intelligence report
 * GET /api/ai/business-intelligence
 */
router.get('/business-intelligence', protect, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user._id);
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { days = 30 } = req.query;

    // Fetch data
    const [orders, products, users] = await Promise.all([
      Order.find().populate('user items.product').lean(),
      Product.find().lean(),
      User.find().lean()
    ]);

    // Generate comprehensive report
    const report = await DecisionSupportSystem.generateBusinessReport(
      orders,
      products,
      users,
      parseInt(days)
    );

    res.json({
      success: true,
      data: report,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating BI report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate business intelligence report',
      error: error.message
    });
  }
});

/**
 * Get sales report for specific date range
 * GET /api/ai/reports/sales
 */
router.get('/reports/sales', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate are required'
      });
    }

    const orders = await Order.find().populate('user items.product').lean();
    const report = DecisionSupportSystem.generateSalesReport(orders, startDate, endDate);

    res.json({
      success: true,
      data: report,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating sales report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate sales report',
      error: error.message
    });
  }
});

/**
 * Get inventory report
 * GET /api/ai/reports/inventory
 */
router.get('/reports/inventory', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }

    const products = await Product.find().lean();
    const report = DecisionSupportSystem.generateInventoryReport(products);

    res.json({
      success: true,
      data: report,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating inventory report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate inventory report',
      error: error.message
    });
  }
});

export default router;
