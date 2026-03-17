# 🛒 Sri Vijiyalaxmi Super Mart - MERN Stack E-Commerce Platform

A complete MERN stack e-commerce solution for Sri Vijiyalaxmi Super Mart in Chennimalai, Tamil Nadu, featuring email verification, decision support analytics, and comprehensive shopping functionality.

## 📋 Project Overview

**Store Name:** Sri Vijiyalaxmi Super Mart  
**Location:** Chennimalai to Kangayam Main Road, E Raja Street, Chennimalai, Tamil Nadu - 638051  
**Type:** Local Supermarket with Online Ordering System

### 🛠️ Technology Stack

#### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS + ShadCN UI components
- React Router for navigation
- Axios for API calls
- Context API for state management

#### Backend
- Node.js with Express.js
- MongoDB Atlas (cloud database)
- Mongoose ODM
- JWT for authentication
- Nodemailer for email verification
- bcryptjs for password hashing

### ✨ Features Implemented

#### 🛍️ Customer Features
- ✅ **Authentication with Email Verification**
  - Email-based registration
  - Email verification required before first login
  - Resend verification email option
  - Secure JWT token authentication
  - Password hashing with bcryptjs
  
- ✅ **Product Browsing**
  - Browse products without login (public access)
  - Search products by name/description
  - Filter by category
  - Filter by stock availability
  - View featured products
  - Product detail pages with pricing (MRP vs Sale Price)

- ✅ **Shopping Experience**
  - Add products to cart
  - Update quantities
  - Remove items from cart
  - Real-time cart total calculation
  - Stock availability check

- ✅ **Favorites/Wishlist**
  - Save favorite products
  - Quick access to favorites
  - Heart icon toggle on product cards
  - Manage favorites from dashboard

- ✅ **Order Management**
  - Place orders with delivery details
  - View order history
  - Track order status
  - Order details with item breakdown
  - Multiple order status states

- ✅ **Customer Dashboard**
  - Profile tab: View and update profile
  - Orders tab: Complete order history
  - Favorites tab: Saved products
  - Settings tab: Account management
  - Update contact details and address
  - Delete account option

- ✅ **UI/UX Features**
  - DMart-inspired design theme
  - Responsive layout for all devices
  - Full-page category overlay menu
  - Address reminder modal for new users
  - Toast notifications for all actions
  - Clean, modern interface

#### 👨‍💼 Admin Features
- ✅ **Decision Support Dashboard**
  - Today's orders and revenue
  - Monthly orders and revenue
  - Total users count
  - Product inventory statistics
  - Best-selling products analysis (top 5)
  - Recent orders overview (latest 10)
  - Orders by status breakdown
  - Revenue analytics

- ✅ **Product Management**
  - Add new products with all details
  - Edit existing products
  - Delete products
  - Manage stock availability
  - Set featured products
  - Search and filter products

- ✅ **Category Management**
  - Create new categories
  - Edit category details
  - Delete categories
  - Set category icons
  - Manage sort order

- ✅ **Order Management**
  - View all customer orders
  - Filter by status
  - Update order status
  - Order status flow: pending → confirmed → processing → shipped → delivered
  - Cancel orders
  - Search orders

- ✅ **User Management**
  - View all registered users
  - User details with role information
  - Registration statistics

#### 🔐 Authentication & Security
- **Email Verification System**
  - Required for all customers (admin bypasses)
  - HTML email templates with branding
  - 24-hour token expiry
  - Resend functionality
  - Welcome email after verification

- **Role-Based Access**
  - Customer role: Shopping, orders, favorites
  - Admin role: Full management access
  - Hardcoded admin email: `admin@vijimart.com`
  - JWT token with 30-day expiry

- **Security Features**
  - bcryptjs password hashing (10 salt rounds)
  - JWT token validation on protected routes
  - Authorization headers
  - Input validation with express-validator
  - Error handling middleware

## 🚀 Setup Instructions

### Prerequisites
- Node.js v18 or higher
- npm package manager
- MongoDB Atlas account (free tier available)
- Gmail account with App Password

### Backend Setup

#### 1. Navigate to backend directory
```bash
cd backend
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Create MongoDB Atlas database

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or login
3. Create new cluster (M0 Free Tier)
4. Create database user:
   - Click "Database Access"
   - Add new database user
   - Set username and strong password
5. Whitelist IP address:
   - Click "Network Access"
   - Add IP Address
   - Use `0.0.0.0/0` for development (allow from anywhere)
6. Get connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `vijimart`

#### 4. Setup Gmail App Password for email verification

1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Navigate to Security
3. Enable 2-Step Verification (if not enabled)
4. Go to "App passwords"
5. Select:
   - App: "Mail"
   - Device: "Other (Custom name)"
   - Name it: "Vijimart Backend"
6. Click "Generate"
7. Copy the 16-character password

#### 5. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` file with your values:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vijimart?retryWrites=true&w=majority

# JWT Secret (Generate strong random string)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=30d

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM="Sri Vijiyalaxmi Super Mart <noreply@vijimart.com>"

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for email verification links and CORS)
FRONTEND_URL=http://localhost:5173
```

#### 6. Seed the database

```bash
npm run seed
```

This creates:
- **Admin user:** `admin@vijimart.com` / `Admin@123` (email verified)
- **Test customer:** `customer@example.com` / `Customer@123` (email verified)
- **8 categories:** Groceries, Vegetables, Fruits, Dairy, Snacks, Beverages, Personal Care, Home Care
- **40 sample products:** Various products across all categories

#### 7. Start the backend server

Development mode (with nodemon auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

Server will run on: **http://localhost:5000**

Test health check:
```bash
curl http://localhost:5000/health
```

### Frontend Setup

#### 1. Navigate to project root
```bash
cd ..
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Configure environment

Create `.env` file in root directory:

```env
VITE_API_URL=http://localhost:5000/api
```

#### 4. Start development server
```bash
npm run dev
```

App will run on: **http://localhost:5173**

## 👥 Login Credentials

After seeding the database, use these credentials:

### Admin Access
- **Email:** admin@vijimart.com
- **Password:** Admin@123
- **Features:** Full admin dashboard, product management, order management, analytics

### Test Customer
- **Email:** customer@example.com
- **Password:** Customer@123
- **Features:** Shopping, cart, orders, favorites

**Note:** Admin account bypasses email verification requirement.

## 📁 Project Structure

```
vijimart/
├── backend/                         # Express.js backend
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection
│   │   ├── models/                 # Mongoose models
│   │   │   ├── User.js             # User with email verification
│   │   │   ├── Product.js          # Product catalog
│   │   │   ├── Category.js         # Product categories
│   │   │   ├── Cart.js             # Shopping cart
│   │   │   ├── Order.js            # Orders
│   │   │   └── Favorite.js         # Wishlist
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT authentication & authorization
│   │   ├── routes/                 # API endpoints
│   │   │   ├── auth.js             # Registration, login, email verification
│   │   │   ├── categories.js       # Category CRUD
│   │   │   ├── products.js         # Product CRUD
│   │   │   ├── cart.js             # Cart operations
│   │   │   ├── orders.js           # Order management
│   │   │   ├── favorites.js        # Wishlist operations
│   │   │   └── admin.js            # Analytics and admin functions
│   │   ├── scripts/
│   │   │   └── seed.js             # Database seeding
│   │   ├── utils/
│   │   │   └── email.js            # Email service with templates
│   │   └── server.js               # Express app entry point
│   ├── .env.example                # Environment template
│   ├── package.json
│   └── README.md                   # Backend documentation
│
├── src/                             # React frontend
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Navigation
│   │   │   ├── Footer.tsx          # Store info
│   │   │   └── Layout.tsx          # Main layout wrapper
│   │   ├── products/
│   │   │   └── ProductCard.tsx     # Product display with favorites
│   │   └── ui/                     # ShadCN components (40+ files)
│   ├── contexts/
│   │   └── AuthContext.tsx         # Authentication state
│   ├── hooks/
│   │   ├── useCart.ts              # Cart management
│   │   ├── use-toast.ts            # Toast notifications
│   │   └── use-mobile.tsx          # Mobile responsiveness
│   ├── pages/
│   │   ├── Index.tsx               # Homepage
│   │   ├── Products.tsx            # Product listing with filters
│   │   ├── ProductDetail.tsx       # Product details page
│   │   ├── Cart.tsx                # Shopping cart
│   │   ├── Checkout.tsx            # Checkout process
│   │   ├── Orders.tsx              # Order history
│   │   ├── Auth.tsx                # Login/Signup with email verification UI
│   │   ├── AdminDashboard.tsx      # Admin panel with analytics
│   │   └── NotFound.tsx            # 404 page
│   ├── services/
│   │   └── api.js                  # Axios API client
│   ├── lib/
│   │   └── utils.ts                # Utility functions
│   ├── App.tsx                     # App component with routes
│   └── main.tsx                    # React entry point
│
├── .env                             # Frontend environment
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── README.md                        # Quick start guide
└── PROJECT_SETUP.md                # This file
```

## 🗄️ Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  fullName: String (required),
  role: String (enum: 'customer', 'admin', default: 'customer'),
  phone: String,
  address: String,
  interests: [String],
  isEmailVerified: Boolean (default: false),
  emailVerificationToken: String,
  emailVerificationExpires: Date
}
```

### Product Model
```javascript
{
  name: String (required),
  description: String,
  price: Number (required),
  mrp: Number,
  category: ObjectId (ref: Category, required),
  imageUrl: String,
  inStock: Boolean (default: true),
  featured: Boolean (default: false),
  // Text index on name and description for search
}
```

### Category Model
```javascript
{
  name: String (unique, required),
  slug: String (unique, required),
  icon: String,
  sortOrder: Number (default: 0)
}
```

### Cart Model
```javascript
{
  user: ObjectId (ref: User, unique, required),
  items: [{
    product: ObjectId (ref: Product, required),
    quantity: Number (default: 1, min: 1)
  }]
}
```

### Order Model
```javascript
{
  user: ObjectId (ref: User, required),
  customerName: String (required),
  phone: String (required),
  address: String (required),
  items: [{
    product: ObjectId (ref: Product, required),
    quantity: Number (required),
    price: Number (required)
  }],
  total: Number (required),
  status: String (enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending'),
  createdAt: Date,
  updatedAt: Date
}
```

### Favorite Model
```javascript
{
  user: ObjectId (ref: User, required),
  product: ObjectId (ref: Product, required),
  // Compound unique index on (user, product)
}
```

## 🔌 API Endpoints

See [backend/README.md](backend/README.md) for complete API documentation.

### Quick Reference

**Authentication:** `/api/auth/*`
- POST `/register` - Register with email verification
- POST `/login` - Login (checks email verified)
- GET `/verify-email?token=xxx` - Verify email
- POST `/resend-verification` - Resend email
- GET `/profile` - Get user (protected)
- PUT `/profile` - Update user (protected)
- DELETE `/account` - Delete account (protected)

**Products:** `/api/products/*`
- GET `/` - List products (public, with filters)
- GET `/:id` - Get product (public)
- POST `/` - Create (admin)
- PUT `/:id` - Update (admin)
- DELETE `/:id` - Delete (admin)

**Cart:** `/api/cart/*` (all protected)
- GET `/` - Get cart
- POST `/add` - Add item
- PUT `/update` - Update quantity
- DELETE `/remove/:productId` - Remove item
- DELETE `/clear` - Clear cart

**Orders:** `/api/orders/*` (all protected)
- POST `/` - Create order
- GET `/` - Get user's orders
- GET `/:id` - Get order by ID
- GET `/admin/all` - Get all orders (admin)
- PUT `/:id/status` - Update status (admin)

**Favorites:** `/api/favorites/*` (all protected)
- GET `/` - Get favorites
- POST `/` - Add favorite
- DELETE `/:productId` - Remove favorite
- GET `/check/:productId` - Check if favorited

**Admin:** `/api/admin/*` (all admin)
- GET `/analytics` - Dashboard analytics
- GET `/users` - All users

**Categories:** `/api/categories/*`
- GET `/` - List categories (public)
- POST `/` - Create (admin)
- PUT `/:id` - Update (admin)
- DELETE `/:id` - Delete (admin)

## 📧 Email Verification System

### Registration Flow
1. User submits registration form (email, password, full name)
2. Backend creates user with `isEmailVerified: false`
3. Generates verification token (crypto.randomBytes)
4. Sets token expiry to 24 hours
5. Sends HTML email with verification link
6. Returns success message

### Verification Email Template
- **From:** Sri Vijiyalaxmi Super Mart <noreply@vijimart.com>
- **Subject:** Verify your email address
- **Content:** Styled HTML with:
  - Store logo/name
  - Personalized greeting
  - Verification button with link
  - Alternative plain link
  -Token expiry notice
  - Store contact information

### Verification Flow
1. User clicks link in email: `http://localhost:5173/verify-email?token=xxxxx`
2. Frontend sends token to backend: `GET /api/auth/verify-email?token=xxxxx`
3. Backend validates:
   - Token exists
   - Token not expired
   - Marks `isEmailVerified: true`
   - Clears token and expiry
4. Sends welcome email
5. Returns success
6. Frontend shows success message and redirects to login

### Login Check
- Customer users: Must have `isEmailVerified: true` to login
- Admin user (`admin@vijimart.com`): Bypasses email verification requirement
- Unverified users get error: "Please verify your email before logging in"

### Resend Functionality
- User can request new verification email
- Generates new token
- Updates expiry to 24 hours from now
- Sends new email
- Works even if previous token expired

### Admin Exception
- Admin email hardcoded: `admin@vijimart.com`
- Detected in User model: `isHardcodedAdmin()` method
- Login bypasses email verification check
- Admin created with `isEmailVerified: true` in seed script

## 🎯 Key Features for Presentation

### 1. Email Verification System
- **Real-world authentication** with secure email verification
- Professional HTML email templates
- Token expiry and resend functionality
- Admin bypass for system access

### 2. Decision Support Dashboard
- **Real-time analytics** for business insights
- Today's and monthly performance metrics
- Best-selling products analysis
- Revenue tracking
- Order status breakdown
- Recent activity monitoring

### 3. Complete E-Commerce Flow
- **Browse → Search → Cart → Checkout → Track**
- Stock availability management
- Order status progression
- Customer order history

### 4. Role-Based Access Control
- Customer and Admin roles
- Protected routes with JWT
- Middleware authorization
- Hardcoded admin for security

### 5. Modern Tech Stack
- **MERN Stack**: Industry-standard full-stack development
- MongoDB Atlas: Scalable cloud database
- JWT Authentication: Secure token-based auth
- RESTful API: Standard API design

## 🧪 Testing

### Backend Testing

Test health endpoint:
```bash
curl http://localhost:5000/health
```

Test registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123","fullName":"Test User"}'
```

Test login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vijimart.com","password":"Admin@123"}'
```

Test products (public):
```bash
curl http://localhost:5000/api/products
```

### Frontend Testing
```bash
npm run test
```

## 🚀 Deployment

### Backend Deployment (Render, Railway, Heroku)

1. **Create account** on hosting platform
2. **Connect GitHub repository**
3. **Set environment variables:**
   ```env
   MONGODB_URI=<your_mongodb_atlas_uri>
   JWT_SECRET=<strong_secret>
   EMAIL_USER=<gmail>
   EMAIL_PASSWORD=<app_password>
   FRONTEND_URL=<your_frontend_url>
   NODE_ENV=production
   PORT=5000
   ```
4. **Build settings:**
   - Build command: `cd backend && npm install`
   - Start command: `npm start` or `node backend/src/server.js`
5. **Deploy**

### Frontend Deployment (Vercel, Netlify)

1. **Create account** on hosting platform
2. **Import GitHub repository**
3. **Set environment variable:**
   ```env
   VITE_API_URL=https://your-backend-url.com/api
   ```
4. **Build settings:**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
5. **Deploy**

### MongoDB Atlas Production

1. **IP Whitelist:**
   - Add your backend server's IP
   - Or use `0.0.0.0/0` (allow all - less secure but works for demo)
2. **Connection String:**
   - Use your production connection string
   - Ensure database name is correct (`vijimart`)
3. **Database Users:**
   - Verify user has read/write permissions

## 🔒 Security Best Practices

### ✅ Implemented
- Password hashing with bcryptjs (10 salt rounds)
- JWT token authentication
- Email verification for new accounts
- Role-based authorization middleware
- Input validation with express-validator
- CORS configuration
- MongoDB injection prevention (Mongoose)
- Error handling middleware

### 🚧 Production Recommendations
- Use HTTPS in production
- Implement rate limiting (express-rate-limit)
- Add request throttling
- Use secure cookies for tokens (instead of localStorage)
- Implement CSRF protection
- Add Content Security Policy headers
- Use environment-specific JWT secrets
- Enable MongoDB Atlas IP whitelist
- Implement password strength requirements
- Add account lockout after failed attempts
- Log security events

## 🐛 Troubleshooting

### Backend Issues

**MongoDB Connection Error:**
```
Error: connect ECONNREFUSED
```
- Check MONGODB_URI in .env
- Verify IP whitelist in MongoDB Atlas (0.0.0.0/0 for dev)
- Ensure database user has correct permissions
- Check connection string format

**Email Not Sending:**
```
Error: Invalid login
```
- Verify EMAIL_USER is correct Gmail address
- Check EMAIL_PASSWORD is 16-char App Password (not regular password)
- Ensure 2-Step Verification enabled on Gmail
- Try generating new App Password
- Check Gmail "Less secure app access" (should be off, use App Password instead)

**JWT Error:**
```
JsonWebTokenError: invalid signature
```
- Ensure JWT_SECRET is set in .env
- Check token format in Authorization header: `Bearer <token>`
- Verify token hasn't expired
- Clear localStorage and login again

**Port Already in Use:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
- Kill process on port 5000: `npx kill-port 5000`
- Or change PORT in .env

### Frontend Issues

**API Calls Failing:**
```
Network Error or CORS Error
```
- Verify backend is running on port 5000
- Check VITE_API_URL in .env: `http://localhost:5000/api`
- Check browser console for actual error
- Verify CORS is enabled in backend

**Email Verification Not Working:**
- Check spam/junk folder for verification email
- Verify EMAIL_USER and EMAIL_PASSWORD in backend .env
- Check backend console for email sending errors
- Try resending verification email

**Can't Login After Registration:**
```
"Please verify your email before logging in"
```
- This is expected behavior for customers
- Check email inbox for verification link
- Click link to verify email
- Then try logging in again
- **Note:** Admin account bypasses this check

**Components Not Rendering:**
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console for React errors
- Verify all dependencies installed: `npm install`
- Try deleting node_modules and reinstalling

## 📱 Pages & Routes

- `/` - Homepage with featured products
- `/products` - All products with search and filters
- `/products?category=groceries` - Filter by category
- `/products?search=milk` - Search results
- `/product/:id` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout with delivery address
- `/auth` - Login/Signup with email verification UI
- `/verify-email?token=xxx` - Email verification page
- `/dashboard` - Customer dashboard (Profile, Orders, Favorites, Settings)
- `/admin` - Admin dashboard (Analytics, Products, Orders, Users)
- `/orders` - Order history
- `*` - 404 Not Found page

## ✅ Feature Checklist

- [x] MERN Stack Architecture
- [x] MongoDB Atlas integration
- [x] Email verification system
- [x] JWT authentication
- [x] Role-based authorization
- [x] Customer registration with email verification
- [x] Admin login (bypasses verification)
- [x] Public product browsing
- [x] Product search and filters
- [x] Shopping cart management
- [x] Order placement and tracking
- [x] Decision support analytics dashboard
- [x] Best-selling products analysis
- [x] Revenue tracking
- [x] Order status management
- [x] Favorites/wishlist functionality
- [x] Customer dashboard with 4 tabs
- [x] Profile management
- [x] Address management
- [x] Account deletion
- [x] Product CRUD (admin)
- [x] Category CRUD (admin)
- [x] Order management (admin)
- [x] User management (admin)
- [x] DMart-style UI
- [x] Full-page category overlay
- [x] Responsive design
- [x] Toast notifications
- [x] Error handling
- [x] API documentation
- [x] Database seeding script
- [x] Environment configuration
- [x] Security best practices

## 🎓 For Academic Presentation

This project demonstrates:

1. **Full-Stack MERN Development**
   - MongoDB database design
   - Express.js RESTful API
   - React with TypeScript frontend
   - Node.js backend server

2. **Authentication & Security**
   - Email verification system
   - JWT token authentication
   - Password hashing
   - Role-based access control

3. **E-Commerce Functionality**
   - Product catalog management
   - Shopping cart system
   - Order processing
   - Payment-ready checkout

4. **Decision Support System**
   - Real-time analytics
   - Sales tracking
   - Performance metrics
   - Best-seller analysis

5. **Professional Development Practices**
   - RESTful API design
   - Environment configuration
   - Error handling
   - Code organization
   - Documentation

6. **Real-World Application**
   - Actual supermarket digitization
   - Customer and admin workflows
   - Business intelligence features
   - Scalable architecture

Perfect for college project demonstrations showcasing modern web development! 🎉

## 📞 Support & Contact

**Sri Vijiyalaxmi Super Mart**  
Chennimalai to Kangayam Main Road  
E Raja Street, Chennimalai  
Tamil Nadu - 638051

---

**Developed with ❤️ using MERN Stack**
