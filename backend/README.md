# Backend Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Gmail account (for email verification)

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. MongoDB Atlas Setup

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new account or login
3. Create a new cluster (Free tier is sufficient)
4. Click "Connect" and choose "Connect your application"
5. Copy the connection string
6. Replace `<password>` with your database user password
7. Replace `<dbname>` with `vijimart`

### 3. Gmail App Password Setup

For email verification to work, you need to create a Gmail App Password:

1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification (if not already enabled)
4. Go to "App passwords"
5. Select "Mail" and "Other (Custom name)"
6. Name it "Vijimart Backend"
7. Copy the 16-character password generated

### 4. Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit the `.env` file with your values:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vijimart?retryWrites=true&w=majority

# JWT Secret (Generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_char_app_password
EMAIL_FROM="Sri Vijiyalaxmi Super Mart <noreply@vijimart.com>"

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS and email links)
# Development
FRONTEND_URL=http://localhost:5173

# Production (when deployed to Vercel)
# FRONTEND_URL=https://vijimart.vercel.app
```

### 5. Seed the Database

Run the seed script to populate the database with initial data:

```bash
npm run seed
```

This will create:
- Admin user: `admin@vijimart.com` / `Admin@123`
- Test customer: `customer@example.com` / `Customer@123`
- 8 categories
- 40 sample products

### 6. Start the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000` (development)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify-email?token=xxx` - Verify email
- `POST /api/auth/resend-verification` - Resend verification email
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `DELETE /api/auth/account` - Delete account (protected)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/:id` - Update category (admin)
- `DELETE /api/categories/:id` - Delete category (admin)

### Products
- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Cart
- `GET /api/cart` - Get user's cart (protected)
- `POST /api/cart/add` - Add item to cart (protected)
- `PUT /api/cart/update` - Update item quantity (protected)
- `DELETE /api/cart/remove/:productId` - Remove item (protected)
- `DELETE /api/cart/clear` - Clear cart (protected)

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders` - Get user's orders (protected)
- `GET /api/orders/:id` - Get order by ID (protected)
- `GET /api/orders/admin/all` - Get all orders (admin)
- `PUT /api/orders/:id/status` - Update order status (admin)

### Favorites
- `GET /api/favorites` - Get user's favorites (protected)
- `POST /api/favorites` - Add to favorites (protected)
- `DELETE /api/favorites/:productId` - Remove from favorites (protected)
- `GET /api/favorites/check/:productId` - Check if favorited (protected)

### Admin
- `GET /api/admin/analytics` - Get dashboard analytics (admin)
- `GET /api/admin/users` - Get all users (admin)

## Testing

Health check:
```bash
curl http://localhost:5000/health
```

Test registration:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123","fullName":"Test User"}'
```

## Email Verification Flow

1. User registers with email and password
2. System sends verification email with token
3. User clicks link in email
4. Token is verified and email is marked as verified
5. User can now login

**Note:** Admin account (`admin@vijimart.com`) bypasses email verification requirement.

## Troubleshooting

### Email not sending
- Check Gmail App Password is correct
- Ensure 2FA is enabled on Gmail account
- Check EMAIL_USER and EMAIL_PASSWORD in .env

### MongoDB connection error
- Verify MONGODB_URI is correct
- Check IP whitelist in MongoDB Atlas (allow access from anywhere: 0.0.0.0/0)
- Ensure database user has read/write permissions

### JWT errors
- Ensure JWT_SECRET is set in .env
- Check token is being sent in Authorization header

## Production Deployment

1. Set `NODE_ENV=production` in .env
2. Use a strong JWT_SECRET
3. Configure MongoDB Atlas IP whitelist appropriately
4. Use environment variables on hosting platform
5. Enable HTTPS
6. Update FRONTEND_URL to production domain
