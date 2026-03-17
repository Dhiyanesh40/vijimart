/**
 * Socket.IO Configuration
 * Handles real-time updates for products, orders, cart, and inventory
 */

import { Server } from 'socket.io';

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    // Join user-specific room for personalized updates
    socket.on('join-user-room', (userId) => {
      if (userId) {
        socket.join(`user-${userId}`);
        console.log(`👤 User ${userId} joined their room`);
      }
    });

    // Join admin room for admin-specific updates
    socket.on('join-admin-room', () => {
      socket.join('admin-room');
      console.log(`👨‍💼 Admin joined admin room`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Event emitters for different updates

/**
 * Emit when a product is created, updated, or deleted
 */
export const emitProductUpdate = (action, product) => {
  if (io) {
    io.emit('product-update', { action, product });
    console.log(`📦 Product ${action}: ${product.name}`);
  }
};

/**
 * Emit when inventory/stock changes
 */
export const emitInventoryUpdate = (productId, inStock) => {
  if (io) {
    io.emit('inventory-update', { productId, inStock });
    console.log(`📊 Inventory update: Product ${productId} - ${inStock ? 'In Stock' : 'Out of Stock'}`);
  }
};

/**
 * Emit when an order is created or updated
 */
export const emitOrderUpdate = (action, order, userId) => {
  if (io) {
    // Send to admin room
    io.to('admin-room').emit('order-update', { action, order });
    
    // Send to specific user if userId provided
    if (userId) {
      io.to(`user-${userId}`).emit('order-update', { action, order });
    }
    
    console.log(`📋 Order ${action}: ${order._id}`);
  }
};

/**
 * Emit when cart is updated (for syncing across devices)
 */
export const emitCartUpdate = (userId, cart) => {
  if (io) {
    io.to(`user-${userId}`).emit('cart-update', { cart });
    console.log(`🛒 Cart updated for user: ${userId}`);
  }
};

/**
 * Emit when a new user registers or user data changes
 */
export const emitUserUpdate = (action, user) => {
  if (io) {
    io.to('admin-room').emit('user-update', { action, user });
    console.log(`👤 User ${action}: ${user.email}`);
  }
};

/**
 * Emit category updates
 */
export const emitCategoryUpdate = (action, category) => {
  if (io) {
    io.emit('category-update', { action, category });
    console.log(`🗂️ Category ${action}: ${category.name}`);
  }
};

export default {
  initializeSocket,
  getIO,
  emitProductUpdate,
  emitInventoryUpdate,
  emitOrderUpdate,
  emitCartUpdate,
  emitUserUpdate,
  emitCategoryUpdate
};
