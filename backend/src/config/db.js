import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Check your MongoDB URI in .env file');
    console.error('2. Verify your database password (no special characters like @, :, /)');
    console.error('3. Ensure IP address 0.0.0.0/0 is whitelisted in MongoDB Atlas');
    console.error('4. Check if your cluster is active and running');
    process.exit(1);
  }
};

export default connectDB;
