import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { initializeSocket } from './socket/socket.js';
import User from './models/User.js';
import Product from './models/Product.js';

// Import routes
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import favoriteRoutes from './routes/favorites.js';
import adminRoutes from './routes/admin.js';
import aiRoutes from './routes/aiRoutes.js';
import paymentRoutes from './routes/payment.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = initializeSocket(httpServer);
console.log('🔌 Socket.IO initialized for real-time updates');

// Make io available to routes via app.locals
app.locals.io = io;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payment', paymentRoutes);

// Public stats route
app.get('/api/stats', async (req, res) => {
  try {
    const [userCount, productCount] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      Product.countDocuments(),
    ]);
    res.json({ users: userCount, products: productCount });
  } catch (err) {
    res.json({ users: 0, products: 0 });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`🌐 WebSocket enabled for real-time updates`);
});
