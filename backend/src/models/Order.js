import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  items: [orderItemSchema],
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'pending'
  },
  // Payment fields
  paymentMethod: {
    type: String,
    enum: ['cod', 'razorpay', 'upi', 'card', 'netbanking', 'wallet'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  razorpaySignature: {
    type: String
  },
  // Timestamp when payment was captured
  paymentPaidAt: {
    type: Date
  },
  // Instrument used for payment — populated from Razorpay payment fetch
  // e.g. { method: 'upi', vpa: 'user@ybl', upiApp: 'PhonePe' }
  //      { method: 'card', network: 'Visa', issuer: 'HDFC', last4: '1234' }
  //      { method: 'netbanking', bank: 'HDFC Bank' }
  //      { method: 'wallet', wallet: 'Paytm' }
  paymentInstrument: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  // Refund tracking (manual — admin processes outside the app)
  refundStatus: {
    type: String,
    enum: ['not_applicable', 'pending_refund', 'refunded'],
    default: 'not_applicable'
  },
  refundAmount: {
    type: Number
  },
  refundedAt: {
    type: Date
  },
  refundedBy: {
    type: String   // admin email / name who marked the refund
  },
  refundNotes: {
    type: String   // e.g. "Transferred via UPI to 98XXXXXX"
  },
  returnReason: {
    type: String
  },
  cancellationReason: {
    type: String
  }
}, {
  timestamps: true
});

// Order State Machine - Valid Transitions
const ORDER_STATE_MACHINE = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped'],
  shipped: ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered: ['returned'],
  cancelled: [], // Terminal state
  returned: []   // Terminal state
};

// Helper method to check if order can be cancelled by customer
orderSchema.methods.canBeCancelledByCustomer = function() {
  // Customer can only cancel pending or confirmed orders (before processing starts)
  return ['pending', 'confirmed'].includes(this.status);
};

// Helper method to check if order can be returned by customer
orderSchema.methods.canBeReturnedByCustomer = function() {
  // Customer can only return delivered orders
  return this.status === 'delivered';
};

// Helper method to check if status transition is valid
orderSchema.methods.canTransitionTo = function(newStatus) {
  const validNextStatuses = ORDER_STATE_MACHINE[this.status] || [];
  return validNextStatuses.includes(newStatus);
};

// Helper method to check if order is in terminal state
orderSchema.methods.isTerminalState = function() {
  return ['cancelled', 'returned'].includes(this.status);
};

// Helper method to get valid next statuses
orderSchema.methods.getValidNextStatuses = function() {
  return ORDER_STATE_MACHINE[this.status] || [];
};

// Static method to get the state machine
orderSchema.statics.getStateMachine = function() {
  return ORDER_STATE_MACHINE;
};

const Order = mongoose.model('Order', orderSchema);

export default Order;
