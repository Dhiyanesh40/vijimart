import express from 'express';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import { emitOrderUpdate } from '../socket/socket.js';

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { customerName, phone, address } = req.body;

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total and prepare order items
    let total = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      
      if (!product.inStock) {
        return res.status(400).json({ 
          message: `Product ${product.name} is out of stock` 
        });
      }

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price
      });

      total += product.price * item.quantity;
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      customerName,
      phone,
      address,
      items: orderItems,
      total
    });

    // Clear cart
    cart.items = [];
    await cart.save();

    // Populate order with product details
    await order.populate('items.product');

    // Emit real-time update to admin
    emitOrderUpdate('created', order, req.user._id.toString());

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/:id
// @desc    Get order by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure user owns the order or is admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/orders/:id/cancel
// @desc    Cancel order (user can cancel their own pending/confirmed orders)
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to cancel this order' });
    }

    // Check if order is already in terminal state
    if (order.isTerminalState()) {
      return res.status(400).json({ 
        message: `Order is already ${order.status}. No further changes allowed.` 
      });
    }

    // Check if customer can cancel this order
    if (!order.canBeCancelledByCustomer()) {
      return res.status(400).json({ 
        message: `Cannot cancel order with status: ${order.status}. Orders can only be cancelled while pending or confirmed (before processing starts).` 
      });
    }

    order.status = 'cancelled';
    order.cancellationReason = reason || 'Cancelled by customer';

    // If the order was already paid online, flag it for manual refund by admin
    if (order.paymentStatus === 'paid' && order.paymentMethod !== 'cod') {
      order.refundStatus = 'pending_refund';
      order.refundAmount = order.total;
    }

    await order.save();

    // Emit real-time update
    emitOrderUpdate('cancelled', order, req.user._id.toString());

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/orders/:id/return
// @desc    Request return for delivered order
// @access  Private
router.put('/:id/return', protect, async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Ensure user owns the order
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to return this order' });
    }

    // Check if order is already in terminal state
    if (order.isTerminalState()) {
      return res.status(400).json({ 
        message: `Order is already ${order.status}. No further changes allowed.` 
      });
    }

    // Check if customer can return this order
    if (!order.canBeReturnedByCustomer()) {
      return res.status(400).json({ 
        message: `Cannot return order with status: ${order.status}. Orders can only be returned after delivery.` 
      });
    }

    order.status = 'returned';
    order.returnReason = reason || 'Returned by customer';
    await order.save();

    // Emit real-time update
    emitOrderUpdate('returned', order, req.user._id.toString());

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/admin/all
// @desc    Get all orders (admin only)
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'fullName email')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (admin can only move forward, not backward)
// @access  Private/Admin
router.put('/:id/status', protect, admin, async (req, res) => {
  try {
    const { status } = req.body;

    // Find the current order
    const order = await Order.findById(req.params.id)
      .populate('items.product')
      .populate('user', 'fullName email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if order is in terminal state (cancelled or returned)
    if (order.isTerminalState()) {
      return res.status(400).json({ 
        message: `Cannot modify order. Order is ${order.status}. Terminal state orders cannot be changed.`,
        currentStatus: order.status,
        reason: order.status === 'cancelled' ? order.cancellationReason : order.returnReason
      });
    }

    // Validate if the transition is allowed
    if (!order.canTransitionTo(status)) {
      const validNextStatuses = order.getValidNextStatuses();
      return res.status(400).json({ 
        message: `Invalid status transition from '${order.status}' to '${status}'. Orders can only move forward in the workflow.`,
        currentStatus: order.status,
        validNextStatuses: validNextStatuses,
        error: 'INVALID_TRANSITION'
      });
    }

    // Update the status
    order.status = status;
    await order.save();

    // Emit real-time update
    emitOrderUpdate('status_updated', order, order.user._id.toString());

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// @route   GET /api/orders/:id/valid-transitions
// @desc    Get valid next statuses for an order
// @access  Private/Admin
router.get('/:id/valid-transitions', protect, admin, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const validNextStatuses = order.getValidNextStatuses();
    const isTerminal = order.isTerminalState();

    res.json({
      currentStatus: order.status,
      validNextStatuses: validNextStatuses,
      isTerminalState: isTerminal,
      canModify: !isTerminal
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
