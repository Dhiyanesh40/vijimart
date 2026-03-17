import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database initialization...');
    
    // Connect to MongoDB
    await connectDB();

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      console.log('👤 Creating admin user...');
      await User.create({
        fullName: 'Admin',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      });
      console.log('✅ Admin user created');
    } else {
      console.log('ℹ️ Admin user already exists, skipping...');
    }

    // Check if categories already exist
    const existingCategories = await Category.countDocuments();
    if (existingCategories === 0) {
      console.log('📁 Creating categories...');
      const categories = await Category.insertMany([
        { name: 'Groceries & Staples', slug: 'groceries-staples', icon: '🛒', sortOrder: 1 },
        { name: 'Fresh Vegetables', slug: 'fresh-vegetables', icon: '🥬', sortOrder: 2 },
        { name: 'Fresh Fruits', slug: 'fresh-fruits', icon: '🍎', sortOrder: 3 },
        { name: 'Dairy & Eggs', slug: 'dairy-eggs', icon: '🥛', sortOrder: 4 },
        { name: 'Snacks & Biscuits', slug: 'snacks-biscuits', icon: '🍪', sortOrder: 5 },
        { name: 'Beverages', slug: 'beverages', icon: '🥤', sortOrder: 6 },
        { name: 'Personal Care', slug: 'personal-care', icon: '🧴', sortOrder: 7 },
        { name: 'Home Care', slug: 'home-care', icon: '🧹', sortOrder: 8 },
        { name: 'Cooking Essentials', slug: 'cooking-essentials', icon: '🍳', sortOrder: 9 },
        { name: 'Bakery & Bread', slug: 'bakery-bread', icon: '🍞', sortOrder: 10 },
        { name: 'Rice & Rice Products', slug: 'rice-products', icon: '🍚', sortOrder: 11 },
        { name: 'Pulses & Dals', slug: 'pulses-dals', icon: '🫘', sortOrder: 12 },
        { name: 'Spices & Masalas', slug: 'spices-masalas', icon: '🌶️', sortOrder: 13 },
        { name: 'Salt & Sugar', slug: 'salt-sugar', icon: '🧂', sortOrder: 14 },
        { name: 'Dry Fruits & Nuts', slug: 'dry-fruits-nuts', icon: '🥜', sortOrder: 15 },
        { name: 'Packaged Food', slug: 'packaged-food', icon: '📦', sortOrder: 16 },
        { name: 'Breakfast Cereals', slug: 'breakfast-cereals', icon: '🥣', sortOrder: 17 },
        { name: 'Noodles & Pasta', slug: 'noodles-pasta', icon: '🍝', sortOrder: 18 },
        { name: 'Sauces & Spreads', slug: 'sauces-spreads', icon: '🍯', sortOrder: 19 },
        { name: 'Baby Care', slug: 'baby-care', icon: '👶', sortOrder: 20 }
      ]);
      console.log('✅ 20 Categories created');

      // Check if products already exist
      const existingProducts = await Product.countDocuments();
      if (existingProducts === 0) {
        console.log('🛍️ Creating 100 products...');
        
        const products = [
          // Groceries & Staples (5 products)
          { name: 'Tata Salt', price: 22, mrp: 25, category: categories[13]._id, imageUrl: 'https://picsum.photos/seed/salt1/400/400', unit: '1 kg', inStock: true, featured: true },
          { name: 'Sugar White Premium', price: 45, mrp: 50, category: categories[13]._id, imageUrl: 'https://picsum.photos/seed/sugar1/400/400', unit: '1 kg', inStock: true, featured: true },
          { name: 'Refined Oil', price: 135, mrp: 150, category: categories[8]._id, imageUrl: 'https://picsum.photos/seed/oil1/400/400', unit: '1 L', inStock: true, featured: false },
          { name: 'Ghee Pure', price: 520, mrp: 580, category: categories[3]._id, imageUrl: 'https://picsum.photos/seed/ghee1/400/400', unit: '1 kg', inStock: true, featured: true },
          { name: 'Wheat Flour Aashirvaad', price: 280, mrp: 310, category: categories[0]._id, imageUrl: 'https://picsum.photos/seed/flour1/400/400', unit: '5 kg', inStock: true, featured: false },
          
          // Fresh Vegetables (8 products)
          { name: 'Tomato Fresh', price: 35, mrp: 45, category: categories[1]._id, imageUrl: 'https://picsum.photos/seed/tomato/400/400', unit: '1 kg', inStock: true, featured: true },
          { name: 'Onion', price: 30, mrp: 40, category: categories[1]._id, imageUrl: 'https://picsum.photos/seed/onion/400/400', unit: '1 kg', inStock: true, featured: false },
          { name: 'Potato', price: 25, mrp: 32, category: categories[1]._id, imageUrl: 'https://picsum.photos/seed/potato/400/400', unit: '1 kg', inStock: true, featured: false },
          { name: 'Carrot Fresh', price: 40, mrp: 50, category: categories[1]._id, imageUrl: 'https://picsum.photos/seed/carrot/400/400', unit: '500 g', inStock: true, featured: false },
          { name: 'Beans Green', price: 45, mrp: 55, category: categories[1]._id, imageUrl: 'https://picsum.photos/seed/beans/400/400', unit: '250 g', inStock: true, featured: false },
          { name: 'Cabbage', price: 20, mrp: 28, category: categories[1]._id, imageUrl: 'https://picsum.photos/seed/cabbage/400/400', unit: '1 pc', inStock: true, featured: false },
          { name: 'Cauliflower', price: 35, mrp: 45, category: categories[1]._id, imageUrl: 'https://picsum.photos/seed/cauliflower/400/400', unit: '1 pc', inStock: true, featured: false },
          { name: 'Brinjal', price: 30, mrp: 40, category: categories[1]._id, imageUrl: 'https://picsum.photos/seed/brinjal/400/400', unit: '500 g', inStock: true, featured: false },
          
          // Fresh Fruits (8 products)
          { name: 'Banana', price: 40, mrp: 50, category: categories[2]._id, imageUrl: 'https://picsum.photos/seed/banana/400/400', unit: '1 dozen', inStock: true, featured: true },
          { name: 'Apple Shimla', price: 150, mrp: 180, category: categories[2]._id, imageUrl: 'https://picsum.photos/seed/apple/400/400', unit: '1 kg', inStock: true, featured: true },
          { name: 'Orange Nagpur', price: 80, mrp: 100, category: categories[2]._id, imageUrl: 'https://picsum.photos/seed/orange/400/400', unit: '1 kg', inStock: true, featured: false },
          { name: 'Grapes Green', price: 65, mrp: 80, category: categories[2]._id, imageUrl: 'https://picsum.photos/seed/grapes/400/400', unit: '500 g', inStock: true, featured: false },
          { name: 'Mango Alphonso', price: 180, mrp: 220, category: categories[2]._id, imageUrl: 'https://picsum.photos/seed/mango/400/400', unit: '1 kg', inStock: false, featured: true },
          { name: 'Papaya', price: 30, mrp: 40, category: categories[2]._id, imageUrl: 'https://picsum.photos/seed/papaya/400/400', unit: '1 kg', inStock: true, featured: false },
          { name: 'Watermelon', price: 25, mrp: 32, category: categories[2]._id, imageUrl: 'https://picsum.photos/seed/watermelon/400/400', unit: '1 kg', inStock: true, featured: false },
          { name: 'Pomegranate', price: 120, mrp: 150, category: categories[2]._id, imageUrl: 'https://picsum.photos/seed/pomegranate/400/400', unit: '1 kg', inStock: true, featured: false },
          
          // Dairy & Eggs (6 products)
          { name: 'Amul Milk Full Cream', price: 60, mrp: 65, category: categories[3]._id, imageUrl: 'https://picsum.photos/seed/milk1/400/400', unit: '1 L', inStock: true, featured: true },
          { name: 'Curd Fresh', price: 30, mrp: 35, category: categories[3]._id, imageUrl: 'https://picsum.photos/seed/curd/400/400', unit: '400 g', inStock: true, featured: false },
          { name: 'Amul Butter Salted', price: 50, mrp: 55, category: categories[3]._id, imageUrl: 'https://picsum.photos/seed/butter1/400/400', unit: '100 g', inStock: true, featured: false },
          { name: 'Cheese Slice Amul', price: 125, mrp: 140, category: categories[3]._id, imageUrl: 'https://picsum.photos/seed/cheese1/400/400', unit: '200 g', inStock: true, featured: false },
          { name: 'Paneer Fresh', price: 85, mrp: 95, category: categories[3]._id, imageUrl: 'https://picsum.photos/seed/paneer/400/400', unit: '200 g', inStock: true, featured: true },
          { name: 'Farm Eggs Brown', price: 55, mrp: 65, category: categories[3]._id, imageUrl: 'https://picsum.photos/seed/eggs/400/400', unit: '6 pcs', inStock: true, featured: false },
          
          // Rice & Rice Products (5 products)
          { name: 'India Gate Basmati Rice', price: 180, mrp: 210, category: categories[10]._id, imageUrl: 'https://picsum.photos/seed/rice1/400/400', unit: '1 kg', inStock: true, featured: true },
          { name: 'Sona Masoori Rice', price: 65, mrp: 75, category: categories[10]._id, imageUrl: 'https://picsum.photos/seed/rice2/400/400', unit: '1 kg', inStock: true, featured: false },
          { name: 'Brown Rice Organic', price: 120, mrp: 140, category: categories[10]._id, imageUrl: 'https://picsum.photos/seed/rice3/400/400', unit: '1 kg', inStock: true, featured: false },
          { name: 'Poha Thick', price: 45, mrp: 55, category: categories[10]._id, imageUrl: 'https://picsum.photos/seed/poha/400/400', unit: '500 g', inStock: true, featured: false },
          { name: 'Idli Rice', price: 55, mrp: 65, category: categories[10]._id, imageUrl: 'https://picsum.photos/seed/idlirice/400/400', unit: '1 kg', inStock: true, featured: false },
          
          // Pulses & Dals (6 products)
          { name: 'Toor Dal', price: 130, mrp: 150, category: categories[11]._id, imageUrl: 'https://picsum.photos/seed/toordal/400/400', unit: '1 kg', inStock: true, featured: true },
          { name: 'Moong Dal', price: 120, mrp: 140, category: categories[11]._id, imageUrl: 'https://picsum.photos/seed/moongdal/400/400', unit: '1 kg', inStock: true, featured: false },
          { name: 'Chana Dal', price: 100, mrp: 120, category: categories[11]._id, imageUrl: 'https://picsum.photos/seed/chanadal/400/400', unit: '1 kg', inStock: true, featured: false },
          { name: 'Urad Dal', price: 110, mrp: 130, category: categories[11]._id, imageUrl: 'https://picsum.photos/seed/uraddal/400/400', unit: '1 kg', inStock: true, featured: false },
          { name: 'Masoor Dal', price: 95, mrp: 115, category: categories[11]._id, imageUrl: 'https://picsum.photos/seed/masoordal/400/400', unit: '1 kg', inStock: true, featured: false },
          { name: 'Rajma Red', price: 140, mrp: 160, category: categories[11]._id, imageUrl: 'https://picsum.photos/seed/rajma/400/400', unit: '1 kg', inStock: true, featured: false },
          
          // Snacks & Biscuits (8 products)
          { name: 'Parle-G Biscuits', price: 28, mrp: 32, category: categories[4]._id, imageUrl: 'https://picsum.photos/seed/parleg/400/400', unit: '200 g', inStock: true, featured: true },
          { name: 'Britannia Good Day', price: 35, mrp: 40, category: categories[4]._id, imageUrl: 'https://picsum.photos/seed/goodday/400/400', unit: '200 g', inStock: true, featured: false },
          { name: 'Lays Chips Classic', price: 20, mrp: 25, category: categories[4]._id, imageUrl: 'https://picsum.photos/seed/lays/400/400', unit: '90 g', inStock: true, featured: true },
          { name: 'Haldirams Bhujia', price: 45, mrp: 55, category: categories[4]._id, imageUrl: 'https://picsum.photos/seed/bhujia/400/400', unit: '200 g', inStock: true, featured: false },
          { name: 'Kurkure Masala Munch', price: 20, mrp: 25, category: categories[4]._id, imageUrl: 'https://picsum.photos/seed/kurkure/400/400', unit: '90 g', inStock: true, featured: false },
          { name: 'Hide & Seek Biscuits', price: 40, mrp: 45, category: categories[4]._id, imageUrl: 'https://picsum.photos/seed/hideseek/400/400', unit: '200 g', inStock: true, featured: false },
          { name: 'Bourbon Biscuits', price: 28, mrp: 32, category: categories[4]._id, imageUrl: 'https://picsum.photos/seed/bourbon/400/400', unit: '150 g', inStock: true, featured: false },
          { name: 'Monaco Biscuits', price: 25, mrp: 30, category: categories[4]._id, imageUrl: 'https://picsum.photos/seed/monaco/400/400', unit: '200 g', inStock: true, featured: false },
          
          // Beverages (6 products)
          { name: 'Tata Tea Gold', price: 135, mrp: 155, category: categories[5]._id, imageUrl: 'https://picsum.photos/seed/tea1/400/400', unit: '250 g', inStock: true, featured: true },
          { name: 'Nescafe Classic Coffee', price: 185, mrp: 210, category: categories[5]._id, imageUrl: 'https://picsum.photos/seed/coffee1/400/400', unit: '200 g', inStock: true, featured: true },
          { name: 'Real Juice Mango', price: 95, mrp: 115, category: categories[5]._id, imageUrl: 'https://picsum.photos/seed/juice1/400/400', unit: '1 L', inStock: true, featured: false },
          { name: 'Coca Cola', price: 40, mrp: 45, category: categories[5]._id, imageUrl: 'https://picsum.photos/seed/coke/400/400', unit: '750 ml', inStock: true, featured: false },
          { name: 'Red Bull Energy Drink', price: 115, mrp: 125, category: categories[5]._id, imageUrl: 'https://picsum.photos/seed/redbull/400/400', unit: '250 ml', inStock: true, featured: false },
          { name: 'Horlicks Health Drink', price: 295, mrp: 330, category: categories[5]._id, imageUrl: 'https://picsum.photos/seed/horlicks/400/400', unit: '500 g', inStock: true, featured: false },
          
          // Personal Care (8 products)
          { name: 'Dove Shampoo', price: 195, mrp: 225, category: categories[6]._id, imageUrl: 'https://picsum.photos/seed/shampoo1/400/400', unit: '340 ml', inStock: true, featured: true },
          { name: 'Lux Soap', price: 35, mrp: 42, category: categories[6]._id, imageUrl: 'https://picsum.photos/seed/soap1/400/400', unit: '125 g', inStock: true, featured: false },
          { name: 'Colgate Toothpaste', price: 85, mrp: 95, category: categories[6]._id, imageUrl: 'https://picsum.photos/seed/toothpaste1/400/400', unit: '200 g', inStock: true, featured: true },
          { name: 'Himalaya Face Wash', price: 125, mrp: 145, category: categories[6]._id, imageUrl: 'https://picsum.photos/seed/facewash1/400/400', unit: '150 ml', inStock: true, featured: false },
          { name: 'Parachute Coconut Oil', price: 155, mrp: 175, category: categories[6]._id, imageUrl: 'https://picsum.photos/seed/coil1/400/400', unit: '600 ml', inStock: true, featured: false },
          { name: 'Ponds Face Cream', price: 185, mrp: 215, category: categories[6]._id, imageUrl: 'https://picsum.photos/seed/cream1/400/400', unit: '100 g', inStock: true, featured: false },
          { name: 'Gillette Razor', price: 245, mrp: 280, category: categories[6]._id, imageUrl: 'https://picsum.photos/seed/razor1/400/400', unit: '1 pc', inStock: true, featured: false },
          { name: 'Dettol Hand Wash', price: 95, mrp: 110, category: categories[6]._id, imageUrl: 'https://picsum.photos/seed/handwash/400/400', unit: '200 ml', inStock: true, featured: false },
          
          // Home Care (6 products)
          { name: 'Surf Excel Detergent', price: 285, mrp: 320, category: categories[7]._id, imageUrl: 'https://picsum.photos/seed/detergent1/400/400', unit: '2 kg', inStock: true, featured: true },
          { name: 'Vim Dishwash Gel', price: 95, mrp: 110, category: categories[7]._id, imageUrl: 'https://picsum.photos/seed/dishwash1/400/400', unit: '500 ml', inStock: true, featured: false },
          { name: 'Lizol Floor Cleaner', price: 120, mrp: 140, category: categories[7]._id, imageUrl: 'https://picsum.photos/seed/lizol/400/400', unit: '975 ml', inStock: true, featured: false },
          { name: 'Harpic Toilet Cleaner', price: 95, mrp: 110, category: categories[7]._id, imageUrl: 'https://picsum.photos/seed/harpic/400/400', unit: '500 ml', inStock: true, featured: false },
          { name: 'Ambi Pur Air Freshener', price: 135, mrp: 155, category: categories[7]._id, imageUrl: 'https://picsum.photos/seed/airfresh/400/400', unit: '275 ml', inStock: true, featured: false },
          { name: 'Colin Glass Cleaner', price: 85, mrp: 100, category: categories[7]._id, imageUrl: 'https://picsum.photos/seed/colin/400/400', unit: '500 ml', inStock: true, featured: false },
          
          // Spices & Masalas (5 products)
          { name: 'MDH Garam Masala', price: 95, mrp: 110, category: categories[12]._id, imageUrl: 'https://picsum.photos/seed/mdh1/400/400', unit: '100 g', inStock: true, featured: false },
          { name: 'Everest Chilli Powder', price: 55, mrp: 65, category: categories[12]._id, imageUrl: 'https://picsum.photos/seed/chilli1/400/400', unit: '100 g', inStock: true, featured: false },
          { name: 'Everest Turmeric Powder', price: 48, mrp: 58, category: categories[12]._id, imageUrl: 'https://picsum.photos/seed/turmeric1/400/400', unit: '100 g', inStock: true, featured: false },
          { name: 'Shan Biryani Masala', price: 55, mrp: 65, category: categories[12]._id, imageUrl: 'https://picsum.photos/seed/biryani1/400/400', unit: '50 g', inStock: true, featured: false },
          { name: 'Kashmiri Red Chilli', price: 85, mrp: 100, category: categories[12]._id, imageUrl: 'https://picsum.photos/seed/kashmiri1/400/400', unit: '100 g', inStock: true, featured: false },
          
          // Dry Fruits & Nuts (5 products)
          { name: 'Almonds Premium', price: 595, mrp: 650, category: categories[14]._id, imageUrl: 'https://picsum.photos/seed/almond1/400/400', unit: '500 g', inStock: true, featured: true },
          { name: 'Cashew Whole', price: 695, mrp: 750, category: categories[14]._id, imageUrl: 'https://picsum.photos/seed/cashew1/400/400', unit: '500 g', inStock: true, featured: true },
          { name: 'Raisins Kishmish', price: 185, mrp: 215, category: categories[14]._id, imageUrl: 'https://picsum.photos/seed/raisin1/400/400', unit: '250 g', inStock: true, featured: false },
          { name: 'Walnuts Premium', price: 495, mrp: 550, category: categories[14]._id, imageUrl: 'https://picsum.photos/seed/walnut1/400/400', unit: '250 g', inStock: true, featured: false },
          { name: 'Dates Premium', price: 240, mrp: 280, category: categories[14]._id, imageUrl: 'https://picsum.photos/seed/dates1/400/400', unit: '500 g', inStock: true, featured: false },
          
          // Noodles & Pasta (4 products)
          { name: 'Maggi Masala Noodles', price: 48, mrp: 56, category: categories[17]._id, imageUrl: 'https://picsum.photos/seed/maggi1/400/400', unit: '280 g', inStock: true, featured: true },
          { name: 'Yippee Noodles', price: 42, mrp: 50, category: categories[17]._id, imageUrl: 'https://picsum.photos/seed/yippee1/400/400', unit: '240 g', inStock: true, featured: false },
          { name: 'Del Monte Pasta', price: 125, mrp: 145, category: categories[17]._id, imageUrl: 'https://picsum.photos/seed/pasta1/400/400', unit: '500 g', inStock: true, featured: false },
          { name: 'Top Ramen Noodles', price: 42, mrp: 48, category: categories[17]._id, imageUrl: 'https://picsum.photos/seed/topramen1/400/400', unit: '280 g', inStock: true, featured: false },
          
          // Sauces & Spreads (4 products)
          { name: 'Kissan Tomato Ketchup', price: 85, mrp: 100, category: categories[18]._id, imageUrl: 'https://picsum.photos/seed/ketchup1/400/400', unit: '500 g', inStock: true, featured: false },
          { name: 'Maggi Hot & Sweet', price: 75, mrp: 90, category: categories[18]._id, imageUrl: 'https://picsum.photos/seed/hotsweet1/400/400', unit: '400 g', inStock: true, featured: false },
          { name: 'Nutella Hazelnut Spread', price: 395, mrp: 450, category: categories[18]._id, imageUrl: 'https://picsum.photos/seed/nutella1/400/400', unit: '350 g', inStock: true, featured: true },
          { name: 'Veeba Mayo', price: 125, mrp: 145, category: categories[18]._id, imageUrl: 'https://picsum.photos/seed/mayo1/400/400', unit: '250 g', inStock: true, featured: false },
          
          // Baby Care (4 products)
          { name: 'Johnson Baby Soap', price: 55, mrp: 65, category: categories[19]._id, imageUrl: 'https://picsum.photos/seed/babysoap1/400/400', unit: '100 g', inStock: true, featured: false },
          { name: 'Pampers Diapers', price: 595, mrp: 650, category: categories[19]._id, imageUrl: 'https://picsum.photos/seed/diapers1/400/400', unit: '46 pcs', inStock: true, featured: true },
          { name: 'Cerelac Baby Food', price: 295, mrp: 330, category: categories[19]._id, imageUrl: 'https://picsum.photos/seed/cerelac1/400/400', unit: '300 g', inStock: true, featured: false },
          { name: 'Johnson Baby Powder', price: 185, mrp: 215, category: categories[19]._id, imageUrl: 'https://picsum.photos/seed/babypowder1/400/400', unit: '400 g', inStock: true, featured: false }
        ];

        await Product.insertMany(products);
        console.log('✅ 100 Products created');
      } else {
        console.log('ℹ️ Products already exist, skipping...');
      }
    } else {
      console.log('ℹ️ Categories already exist, skipping...');
    }

    console.log('\n✨ Database initialization complete!');
    console.log('\n📋 Admin Credentials:');
    console.log(`Email: ${process.env.ADMIN_EMAIL}`);
    console.log(`Password: ${process.env.ADMIN_PASSWORD}`);
    console.log('\n📊 Database Contents:');
    console.log(`✅ 20 Categories`);
    console.log(`✅ 100 Products`);
    console.log(`✅ Featured products across all categories`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization error:', error);
    process.exit(1);
  }
};

seedDatabase();
