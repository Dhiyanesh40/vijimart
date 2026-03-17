import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  interests: [{
    type: String,
    trim: true
  }],
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  // AI Grocery Planner fields
  budget: {
    type: Number,
    default: 5000,
    min: 0
  },
  preferences: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free'],
    trim: true
  }],
  favoriteCategories: [{
    type: String,
    trim: true
  }],
  householdSize: {
    type: Number,
    default: 1,
    min: 1,
    max: 20
  },
  defaultShoppingDays: {
    type: Number,
    default: 7,
    min: 1,
    max: 30
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user is hardcoded admin
userSchema.methods.isHardcodedAdmin = function() {
  return this.email === 'dhiyaneshb439@gmail.com';
};

const User = mongoose.model('User', userSchema);

export default User;
