import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const fixAdmin = async () => {
  try {
    console.log('🔧 Fixing admin user...');
    
    // Connect to MongoDB
    await connectDB();

    // Delete existing admin
    const deleted = await User.deleteOne({ email: process.env.ADMIN_EMAIL });
    if (deleted.deletedCount > 0) {
      console.log('🗑️ Deleted old admin user');
    }

    // Create new admin with correct field
    await User.create({
      fullName: 'Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin'
    });
    console.log('✅ Created new admin user with correct fields');

    console.log('\n📋 Admin Credentials:');
    console.log(`Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixAdmin();
