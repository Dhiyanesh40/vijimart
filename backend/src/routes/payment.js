import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { protect, admin } from '../middleware/auth.js';
import { emitOrderUpdate } from '../socket/socket.js';

const router = express.Router();

// Initialize Razorpay instance
const getRazorpayInstance = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
  return res.status(500).json({
    message: "Payment service not configured"
  });
}

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

// @route   POST /api/payment/create-order
// @desc    Create a Razorpay order for checkout
// @access  Private
router.post('/create-order', protect, async (req, res) => {
  try {
    const { customerName, phone, address, paymentMethod } = req.body;

    if (!customerName || !phone || !address) {
      return res.status(400).json({ message: 'Customer name, phone and address are required' });
    }

    // Get user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (!product.inStock) {
        return res.status(400).json({
          message: `Product "${product.name}" is out of stock`,
        });
      }

      orderItems.push({
        product: product._id,
        productName: product.name,
        quantity: item.quantity,
        price: product.price,
      });

      total += product.price * item.quantity;
    }

    // For COD — create order directly without Razorpay
    if (paymentMethod === 'cod') {
      const order = await Order.create({
        user: req.user._id,
        customerName,
        phone,
        address,
        items: orderItems,
        total,
        paymentMethod: 'cod',
        paymentStatus: 'pending',
      });

      // Clear cart
      cart.items = [];
      await cart.save();

      await order.populate('items.product');
      emitOrderUpdate('created', order, req.user._id.toString());

      return res.status(201).json({
        success: true,
        paymentMethod: 'cod',
        order,
      });
    }

    // For online payment — create Razorpay order
    const razorpay = getRazorpayInstance();

    // Amount in paise (multiply by 100)
    const amountInPaise = Math.round(total * 100);

    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        customerName,
        phone,
        address,
        userId: req.user._id.toString(),
      },
    });

    // Store a pending order in DB so we can update it on verification
    const order = await Order.create({
      user: req.user._id,
      customerName,
      phone,
      address,
      items: orderItems,
      total,
      paymentMethod: paymentMethod || 'razorpay',
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id,
    });

    res.status(201).json({
      success: true,
      paymentMethod: 'razorpay',
      razorpayOrderId: razorpayOrder.id,
      razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      amount: amountInPaise,
      currency: 'INR',
      orderId: order._id,
      orderDetails: {
        customerName,
        phone,
        address,
        total,
        items: orderItems,
      },
    });
  } catch (error) {
    console.error('Payment create-order error:', error);
    if (error.statusCode === 401 || (error.error && error.error.code === 'BAD_REQUEST_ERROR' && error.error.description === 'Authentication failed')) {
      return res.status(502).json({
        message: 'Payment gateway authentication failed. Please verify your Razorpay API keys in the server configuration.',
      });
    }
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment and confirm order
// @access  Private
router.post('/verify', protect, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    // Verify signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Mark order as failed
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
      });
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // Signature valid — fetch full payment details from Razorpay to capture
    // instrument info (UPI VPA, card network, wallet name, etc.)
    let paymentInstrument = null;
    try {
      const razorpay = getRazorpayInstance();
      const rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);

      const m = rzpPayment.method; // 'upi' | 'card' | 'netbanking' | 'wallet' | 'emi'
      if (m === 'upi') {
        const vpa = rzpPayment.vpa || '';
        // Infer app from VPA handle
        const handle = vpa.split('@')[1]?.toLowerCase() || '';
        const upiAppMap = {
          ybl: 'PhonePe', ibl: 'PhonePe', axl: 'PhonePe',
          oksbi: 'Google Pay', okaxis: 'Google Pay', okhdfc: 'Google Pay', okhdfcbank: 'Google Pay',
          paytm: 'Paytm', ptyes: 'Paytm',
          upi: 'BHIM', mbk: 'MobiKwik',
          icici: 'iMobile (ICICI)', hdfcbank: 'HDFC',
          sbi: 'SBI Pay', barodampay: 'Bank of Baroda',
        };
        const upiApp = upiAppMap[handle] || null;
        paymentInstrument = { method: 'upi', vpa, upiApp };
      } else if (m === 'card') {
        const card = rzpPayment.card || {};
        paymentInstrument = {
          method: 'card',
          network: card.network || null,      // Visa / Mastercard / RuPay / Amex
          issuer: card.issuer || null,         // HDFC / SBI etc.
          last4: card.last4 || null,
          cardType: card.type || null,         // credit / debit
          international: card.international || false,
        };
      } else if (m === 'netbanking') {
        paymentInstrument = {
          method: 'netbanking',
          bank: rzpPayment.bank || null,       // Bank code e.g. 'HDFC'
          bankName: rzpPayment.bank_name || null,
        };
      } else if (m === 'wallet') {
        paymentInstrument = {
          method: 'wallet',
          wallet: rzpPayment.wallet || null,   // 'paytm' | 'mobikwik' etc.
        };
      } else {
        paymentInstrument = { method: m };
      }
    } catch (fetchErr) {
      // Non-critical — don't fail the whole verify if this errors
      console.warn('Could not fetch Razorpay payment details:', fetchErr?.message);
    }

    // Update order
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        paymentStatus: 'paid',
        paymentPaidAt: new Date(),
        paymentInstrument,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'confirmed', // Auto-confirm paid orders
      },
      { new: true }
    ).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Clear cart
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    emitOrderUpdate('created', order, req.user._id.toString());

    res.json({
      success: true,
      message: 'Payment verified successfully',
      order,
    });
  } catch (error) {
    console.error('Payment verify error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   POST /api/payment/failure
// @desc    Handle payment failure — mark order as failed
// @access  Private
router.post('/failure', protect, async (req, res) => {
  try {
    const { orderId } = req.body;

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'failed',
        status: 'cancelled',
        cancellationReason: 'Payment failed',
      });
    }

    res.json({ success: true, message: 'Order marked as failed' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// @route   GET /api/payment/razorpay-key
// @desc    Get Razorpay key ID for frontend
// @access  Private
router.get('/razorpay-key', protect, (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    return res.status(500).json({ message: 'Razorpay not configured' });
  }
  res.json({ keyId });
});

// @route   POST /api/payment/refund/:orderId
// @desc    Admin manually marks a refund as done (no automated payout)
// @access  Private/Admin
router.post('/refund/:orderId', protect, admin, async (req, res) => {
  try {
    const { notes, refundAmount } = req.body;
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.refundStatus === 'refunded') {
      return res.status(400).json({ message: 'Refund already marked as done' });
    }

    if (order.refundStatus !== 'pending_refund') {
      return res.status(400).json({ message: 'This order does not have a pending refund' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        paymentStatus: 'refunded',
        refundStatus: 'refunded',
        refundedAt: new Date(),
        refundedBy: req.user.fullName || req.user.email,
        refundNotes: notes || '',
        refundAmount: refundAmount || order.refundAmount || order.total,
      },
      { new: true }
    ).populate('items.product');

    emitOrderUpdate('refunded', updatedOrder, updatedOrder.user.toString());

    res.json({
      success: true,
      message: 'Refund marked as done',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Refund mark error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
