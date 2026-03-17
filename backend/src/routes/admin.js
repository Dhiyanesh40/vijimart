import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/admin/analytics
// @desc    Get dashboard analytics
// @access  Private/Admin
router.get('/analytics', protect, admin, async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Today's orders
    const todayOrders = await Order.countDocuments({
      createdAt: { $gte: todayStart }
    });

    // Today's revenue
    const todayRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart },
          status: { $nin: ['cancelled'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    // This month's orders
    const monthOrders = await Order.countDocuments({
      createdAt: { $gte: monthStart }
    });

    // This month's revenue
    const monthRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart },
          status: { $nin: ['cancelled'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' }
        }
      }
    ]);

    // Total users
    const totalUsers = await User.countDocuments({ role: 'customer' });

    // Total products
    const totalProducts = await Product.countDocuments();

    // Products in stock
    const productsInStock = await Product.countDocuments({ inStock: true });

    // Best selling products (this month)
    const bestSellingProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: monthStart },
          status: { $nin: ['cancelled'] }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' }
    ]);

    // Recent orders
    const recentOrders = await Order.find()
      .populate('user', 'fullName email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(10);

    // Orders by status
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      today: {
        orders: todayOrders,
        revenue: todayRevenue[0]?.total || 0
      },
      month: {
        orders: monthOrders,
        revenue: monthRevenue[0]?.total || 0
      },
      totals: {
        users: totalUsers,
        products: totalProducts,
        productsInStock
      },
      bestSellingProducts,
      recentOrders,
      ordersByStatus
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
