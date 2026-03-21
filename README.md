# Sri Vijiyalaxmi Super Mart - Online Shopping Platform

A complete MERN stack e-commerce solution for Sri Vijiyalaxmi Super Mart in Chennimalai, Tamil Nadu.

## 🚀 Quick Start

### Backend Setup

1. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Setup MongoDB Atlas:**
   - Create account at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create new cluster (free tier available)
   - Get connection string

3. **Setup Gmail for email verification:**
   - Enable 2-Step Verification on Gmail
   - Generate App Password for email service

4. **Configure environment:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your MongoDB URI, Gmail credentials, and JWT secret
   ```

5. **Seed database:**
   ```bash
   npm run seed
   ```
   This creates admin user (`admin@vijimart.com` / `Admin@123`) and sample products.

6. **Start backend server:**
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000` (development)

### Frontend Setup

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   Create `.env` in root directory:
   ```env
   # Development
   VITE_API_URL=http://localhost:5000/api

   # Production (for Vercel/Railway)
   VITE_API_URL=https://your-railway-backend-url/api
   ```

3. **Start frontend:**
   ```bash
   npm run dev
   ```
   App runs on `http://localhost:5173`

## 📖 Full Documentation

- [Backend API Documentation](backend/README.md) - Complete API endpoints and setup
- [PROJECT_SETUP.md](PROJECT_SETUP.md) - Detailed project documentation

## ✨ Key Features

- 🛍️ Public product browsing
- 🔐 Role-based authentication (Admin & Customer)
- 📊 Decision support analytics dashboard
- 🛒 Shopping cart and checkout
- 📦 Order tracking system
- ❤️ Favorites/wishlist
- 📱 Responsive DMart-style UI
- 🎯 Advanced search and filtering

## 🏪 Store Information

**Sri Vijiyalaxmi Super Mart**  
Chennimalai to Kangayam Main Road  
E Raja Street, Chennimalai  
Tamil Nadu - 638051

---

**Admin Login:** admin@vijimart.com / Admin@123  
**Tech Stack:** React + TypeScript + Supabase + Tailwind CSS

