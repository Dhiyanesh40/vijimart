import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Product from '../models/Product.js';

dotenv.config();

// Mapping of product names to Unsplash images
const productImageMap = {
  // Groceries & Staples
  'Tata Salt': 'https://images.unsplash.com/photo-1523278957019-5e72dc46cd68?w=800',
  'Salt (1kg)': 'https://images.unsplash.com/photo-1523278957019-5e72dc46cd68?w=800',
  'Sugar White Premium': 'https://images.unsplash.com/photo-1518264954388-cca5f1c1588d?w=800',
  'Sugar (1kg)': 'https://images.unsplash.com/photo-1518264954388-cca5f1c1588d?w=800',
  'Refined Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800',
  'Ghee Pure': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800',
  'Wheat Flour Aashirvaad': 'https://images.unsplash.com/photo-1628289876753-35d8e6d7a85f?w=800',
  'Wheat Flour (5kg)': 'https://images.unsplash.com/photo-1628289876753-35d8e6d7a85f?w=800',
  'Rice (5kg)': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
  
  // Fresh Vegetables
  'Tomato Fresh': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800',
  'Tomato (1kg)': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800',
  'Onion': 'https://images.unsplash.com/photo-1552282077-2619f620b720?w=800',
  'Onion (1kg)': 'https://images.unsplash.com/photo-1552282077-2619f620b720?w=800',
  'Potato': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800',
  'Potato (1kg)': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800',
  'Carrot Fresh': 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=800',
  'Carrot (500g)': 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=800',
  'Beans Green': 'https://images.unsplash.com/photo-1597516664715-21b303c8fd2d?w=800',
  'Beans (500g)': 'https://images.unsplash.com/photo-1597516664715-21b303c8fd2d?w=800',
  'Cabbage': 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=800',
  'Cauliflower': 'https://images.unsplash.com/photo-1568584711271-7d93eabb39bb?w=800',
  'Brinjal': 'https://images.unsplash.com/photo-1659261200833-ec8761558af7?w=800',
  
  // Fresh Fruits
  'Banana': 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800',
  'Banana (1 dozen)': 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800',
  'Apple Shimla': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800',
  'Apple (1kg)': 'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800',
  'Orange Nagpur': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800',
  'Orange (1kg)': 'https://images.unsplash.com/photo-1547514701-42782101795e?w=800',
  'Grapes Green': 'https://images.unsplash.com/photo-1599819177841-6a6e29d660ea?w=800',
  'Grapes (500g)': 'https://images.unsplash.com/photo-1599819177841-6a6e29d660ea?w=800',
  'Mango Alphonso': 'https://images.unsplash.com/photo-1587411768941-672fde51ce3f?w=800',
  'Mango (1kg)': 'https://images.unsplash.com/photo-1587411768941-672fde51ce3f?w=800',
  'Papaya': 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=800',
  'Watermelon': 'https://images.unsplash.com/photo-1587049352846-4a222e784l52?w=800',
  'Pomegranate': 'https://images.unsplash.com/photo-1553279456-3a9241e8da85?w=800',
  
  // Dairy & Eggs
  'Amul Milk Full Cream': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
  'Milk (1L)': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
  'Milk': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800',
  'Curd Fresh': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800',
  'Curd (500g)': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800',
  'Curd': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=800',
  'Amul Butter Salted': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800',
  'Butter (100g)': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800',
  'Butter': 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800',
  'Cheese Slice Amul': 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=800',
  'Cheese (200g)': 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=800',
  'Cheese': 'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=800',
  'Paneer Fresh': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800',
  'Paneer (250g)': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800',
  'Paneer': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800',
  'Farm Eggs Brown': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800',
  
  // Rice & Rice Products
  'India Gate Basmati Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
  'Sona Masoori Rice': 'https://images.unsplash.com/photo-1516684732162-798a0062be99?w=800',
  'Brown Rice Organic': 'https://images.unsplash.com/photo-1585476734285-680c8e31d01f?w=800',
  'Poha Thick': 'https://images.unsplash.com/photo-1645177628172-a94c8f0a8c62?w=800',
  'Idli Rice': 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800',
  
  // Pulses & Dals
  'Toor Dal': 'https://images.unsplash.com/photo-1617484155660-f3c8905fb89f?w=800',
  'Moong Dal': 'https://images.unsplash.com/photo-1632485532365-6c79c7b4c668?w=800',
  'Chana Dal': 'https://images.unsplash.com/photo-1607969220038-e5286d72b7eb?w=800',
  'Urad Dal': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800',
  'Masoor Dal': 'https://images.unsplash.com/photo-1599487488174-04efe0ae24a6?w=800',
  'Rajma Red': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=800',
  
  // Snacks & Biscuits
  'Parle-G Biscuits': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800',
  'Biscuits (200g)': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800',
  'Biscuits': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800',
  'Britannia Good Day': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800',
  'Lays Chips Classic': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800',
  'Chips (100g)': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800',
  'Chips': 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=800',
  'Haldirams Bhujia': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800',
  'Namkeen (200g)': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800',
  'Namkeen': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=800',
  'Kurkure Masala Munch': 'https://images.unsplash.com/photo-1607013251379-e6eecfffe234?w=800',
  'Hide & Seek Biscuits': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800',
  'Cookies (150g)': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800',
  'Cookies': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800',
  'Bourbon Biscuits': 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800',
  'Monaco Biscuits': 'https://images.unsplash.com/photo-1576618148400-f54bed99fcfd?w=800',
  'Chocolate (50g)': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800',
  'Chocolate': 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=800',
  
  // Beverages
  'Tata Tea Gold': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800',
  'Tea (250g)': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800',
  'Tea': 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800',
  'Nescafe Classic Coffee': 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800',
  'Coffee (200g)': 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800',
  'Coffee': 'https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800',
  'Real Juice Mango': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800',
  'Juice (1L)': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800',
  'Juice': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800',
  'Coca Cola': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800',
  'Soft Drink (750ml)': 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800',
  'Red Bull Energy Drink': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800',
  'Energy Drink (250ml)': 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=800',
  'Horlicks Health Drink': 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=800',
  
  // Personal Care
  'Dove Shampoo': 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800',
  'Shampoo (200ml)': 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800',
  'Shampoo': 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=800',
  'Lux Soap': 'https://images.unsplash.com/photo-1585735386116-0e1b6bcd586e?w=800',
  'Soap (125g)': 'https://images.unsplash.com/photo-1585735386116-0e1b6bcd586e?w=800',
  'Soap': 'https://images.unsplash.com/photo-1585735386116-0e1b6bcd586e?w=800',
  'Colgate Toothpaste': 'https://images.unsplash.com/photo-1622207411460-368fe34b4a70?w=800',
  'Toothpaste (100g)': 'https://images.unsplash.com/photo-1622207411460-368fe34b4a70?w=800',
  'Toothpaste': 'https://images.unsplash.com/photo-1622207411460-368fe34b4a70?w=800',
  'Himalaya Face Wash': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
  'Face Wash (100ml)': 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800',
  'Parachute Coconut Oil': 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=800',
  'Hair Oil (200ml)': 'https://images.unsplash.com/photo-1580870069867-74c57ee1bb07?w=800',
  'Ponds Face Cream': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800',
  'Gillette Razor': 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800',
  'Dettol Hand Wash': 'https://images.unsplash.com/photo-1584305574647-0cc949a2bb9f?w=800',
  
  // Home Care
  'Surf Excel Detergent': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800',
  'Detergent (1kg)': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800',
  'Detergent': 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=800',
  'Vim Dishwash Gel': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800',
  'Dish Wash (500ml)': 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=800',
  'Lizol Floor Cleaner': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800',
  'Floor Cleaner (1L)': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=800',
  'Harpic Toilet Cleaner': 'https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=800',
  'Toilet Cleaner (500ml)': 'https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=800',
  'Ambi Pur Air Freshener': 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800',
  'Air Freshener (250ml)': 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800',
  'Colin Glass Cleaner': 'https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?w=800',
  
  // Spices & Masalas
  'MDH Garam Masala': 'https://images.unsplash.com/photo-1596040033229-a0b13f9e8b6e?w=800',
  'Everest Chilli Powder': 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800',
  'Everest Turmeric Powder': 'https://images.unsplash.com/photo-1615485500834-bc10199bc727?w=800',
  'Shan Biryani Masala': 'https://images.unsplash.com/photo-1631292784640-2b24be784d5d?w=800',
  'Kashmiri Red Chilli': 'https://images.unsplash.com/photo-1599639958043-c07d3c4a2f91?w=800',
  
  // Dry Fruits & Nuts
  'Almonds Premium': 'https://images.unsplash.com/photo-1508736793122-f516e3ba5569?w=800',
  'Cashew Whole': 'https://images.unsplash.com/photo-1585935350630-8fc03bf6fbb3?w=800',
  'Raisins Kishmish': 'https://images.unsplash.com/photo-1587374143093-f3f377e923c9?w=800',
  'Walnuts Premium': 'https://images.unsplash.com/photo-1622919858726-838697c58cd0?w=800',
  'Dates Premium': 'https://images.unsplash.com/photo-1587317062403-f37a02aef74c?w=800',
  
  // Noodles & Pasta
  'Maggi Masala Noodles': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=800',
  'Yippee Noodles': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800',
  'Del Monte Pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
  'Top Ramen Noodles': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800',
  
  // Sauces & Spreads
  'Kissan Tomato Ketchup': 'https://images.unsplash.com/photo-1621964183810-c5a05e2c0d5f?w=800',
  'Maggi Hot & Sweet': 'https://images.unsplash.com/photo-1472476443507-c7a5948772fc?w=800',
  'Nutella Hazelnut Spread': 'https://images.unsplash.com/photo-1481070555726-e2fe8357725c?w=800',
  'Veeba Mayo': 'https://images.unsplash.com/photo-1559181567-c3190ca9959b?w=800',
  
  // Baby Care
  'Johnson Baby Soap': 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800',
  'Pampers Diapers': 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800',
  'Cerelac Baby Food': 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?w=800',
  'Johnson Baby Powder': 'https://images.unsplash.com/photo-1584015278607-86b2b3297ebb?w=800',
  
  // Electronics (fallback)
  'Laptop': 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'
};

const updateProductImages = async () => {
  try {
    console.log('🖼️ Starting product image update...');
    
    await connectDB();

    const products = await Product.find();
    console.log(`Found ${products.length} products to update`);

    let updatedCount = 0;
    
    for (const product of products) {
      // Try exact match first
      let newImageUrl = productImageMap[product.name];
      
      // If no exact match, try partial match (search for keywords in product name)
      if (!newImageUrl) {
        const productNameLower = product.name.toLowerCase();
        for (const [key, value] of Object.entries(productImageMap)) {
          const keyLower = key.toLowerCase();
          // Check if the key contains main product identifier
          const mainKeyword = keyLower.split(' ')[0];
          if (productNameLower.includes(mainKeyword) || keyLower.includes(productNameLower.split(' ')[0])) {
            newImageUrl = value;
            break;
          }
        }
      }
      
      if (newImageUrl && product.imageUrl !== newImageUrl) {
        product.imageUrl = newImageUrl;
        await product.save();
        updatedCount++;
        console.log(`✅ Updated: ${product.name}`);
      } else if (!newImageUrl) {
        console.log(`⚠️ No image mapping found for: ${product.name}`);
      } else {
        console.log(`ℹ️ Already up to date: ${product.name}`);
      }
    }

    console.log(`\n✨ Update complete! ${updatedCount} products updated with new images.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating product images:', error);
    process.exit(1);
  }
};

updateProductImages();
