# 🚀 Quick Setup Guide - Viji Mart MERN Stack

## ✨ What Changed
- ✅ Complete MERN stack (MongoDB Atlas + Express + React + Node.js)
- ✅ Removed all Supabase dependencies
- ✅ Simplified database setup (admin + categories only)
- ✅ Products managed via Admin Dashboard (no sample data)
- ✅ Admin credentials: `dhiyaneshb439@gmail.com` / `Admin@123`
- ✅ Frontend uses Axios for API calls

---

## 📋 Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account (free tier)
- npm or yarn package manager

---

## 🔧 Backend Setup

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup MongoDB Atlas

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and login
3. Create a new cluster:
   - Click "Create" or "Build a Database"
   - Choose **M0 Free Tier**
   - Select your preferred cloud provider and region
   - Click "Create Cluster" (wait 1-3 minutes for cluster to provision)

4. Setup Database Access:
   - Click "Database Access" in left sidebar
   - Click "Add New Database User"
   - **Authentication Method:** Choose "Password"
   - Username: `vijimart`
   - Password: Create a strong password **WITHOUT special characters** (use letters and numbers only)
     - ❌ Avoid: `@`, `:`, `/`, `?`, `#`, `[`, `]`, `&`
     - ✅ Good: `Vijimart123`, `MyPassword2024`
   - **Database User Privileges:** Select "Read and write to any database"
   - Click "Add User"

5. Setup Network Access:
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere"
   - IP Address: `0.0.0.0/0`
   - Click "Confirm"

6. Get Connection String:
   - Go back to "Database" in left sidebar
   - Click "Connect" button on your cluster
   - Choose connection method: **"Drivers"**
   - Select: **Driver:** Node.js, **Version:** 5.5 or later
   - Copy the connection string (looks like: `mongodb+srv://vijimart:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)
   - **Important:** 
     - Replace `<password>` with your actual database user password
     - Add database name: Change `/?retryWrites` to `/vijimart?retryWrites`
     - Final format: `mongodb+srv://vijimart:YourPassword123@cluster0.xxxxx.mongodb.net/vijimart?retryWrites=true&w=majority`

### 4. Create backend .env file

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# MongoDB Atlas - Replace with your connection string
# Example: mongodb+srv://vijimart:MyPassword123@cluster0.abc12.mongodb.net/vijimart?retryWrites=true&w=majority
MONGODB_URI=mongodb+srv://vijimart:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/vijimart?retryWrites=true&w=majority

# JWT Secret - Use any long random string
JWT_SECRET=your_super_secret_jwt_key_min_32_characters_long

# Server
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

**Important Notes:**
- Replace `YOUR_PASSWORD` with your MongoDB database user password
- Replace `cluster0.xxxxx.mongodb.net` with your actual cluster URL
- Ensure `/vijimart` is in the connection string (this is your database name)
- **Password must not contain special characters** like `@`, `:`, `/` etc.
- Keep the `?retryWrites=true&w=majority` at the end

### 5. Initialize the database

```bash
npm run init
```

This creates:
- **Hardcoded Admin:** `dhiyaneshb439@gmail.com` / `Admin@123`
- **8 basic categories** (Groceries, Vegetables, Fruits, Dairy, etc.)

**Note:** No sample products are created. Admin will add products via the Admin Dashboard.

### 6. Start backend server

```bash
npm run dev
```

✅ Backend running on: **http://localhost:5000**

---

## 🎨 Frontend Setup

### 1. Navigate to project root
```bash
cd ..
```

### 2. Install dependencies
```bash
npm install
```

This will install:
- All existing dependencies
- **Axios** (for API calls)

### 3. Verify .env file

The `.env` file should already exist with:

```env
VITE_API_URL=http://localhost:5000/api
```

### 4. Start frontend server

```bash
npm run dev
```

✅ Frontend running on: **http://localhost:5173**

---

## 🎯 Login Credentials

### Admin Account (Hardcoded)
- **Email:** `dhiyaneshb439@gmail.com`
- **Password:** `Admin@123`
- **Access:** Full admin dashboard, analytics, product & category management
- **Note:** This is the ONLY admin account. Create it once using `npm run init`

### Customer Accounts
- Customers can register themselves via the website
- No test customer account is pre-created
- Register at: [http://localhost:5173/auth](http://localhost:5173/auth)

---

## 🧪 Test the Setup

### Backend Health Check
Open browser: [http://localhost:5000/health](http://localhost:5000/health)

Should see: `{"status":"OK","message":"Server is running"}`

### Frontend
Open browser: [http://localhost:5173](http://localhost:5173)

Try logging in with either admin or customer credentials.

---

## 🛠️ Troubleshooting

### Backend won't start

**Error: "connect ECONNREFUSED"**
- Check MongoDB URI in `.env`
- Verify IP whitelist in MongoDB Atlas (use `0.0.0.0/0` for dev)
- Ensure MongoDB cluster is running

**Error: "Port 5000 already in use"**
```bash
# Windows
npx kill-port 5000

# Or change port in backend/.env
PORT=5001
```

### Frontend API errors

**Error: "Network Error" or CORS**
- Ensure backend is running on port 5000
- Check `VITE_API_URL` in `.env`
- Clear browser cache and reload

**Error: "Cannot find module axios"**
```bash
npm install axios
```

### Database issues

**Can't connect to MongoDB Atlas**

**Error: "SSL routines" or "tlsv1 alert"**
- This means SSL/TLS connection issue
- Solution 1: Make sure your password has NO special characters (`@`, `:`, `/`, etc.)
- Solution 2: Update your database user password in MongoDB Atlas to a simple one (letters + numbers only)
- Solution 3: After changing password, update it in your `.env` file

**Other connection issues:**
1. Check username/password in connection string is correct
2. Verify IP address `0.0.0.0/0` is whitelisted in Network Access
3. Ensure database user has "Read and write to any database" permissions
4. Make sure your cluster is active (not paused)
5. Connection string format: `mongodb+srv://user:pass@cluster.net/vijimart?retryWrites=true&w=majority`

**Need to re-initialize database**
```bash
cd backend
npm run init
```

**Note:** This will NOT delete existing data. It only creates admin and categories if they don't exist.

---

## 📁 Project Structure

```
vijimart/
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── models/          # Mongoose models
│   │   ├── routes/          # API endpoints
│   │   ├── middleware/      # Auth middleware
│   │   ├── config/          # Database config
│   │   └── server.js        # Entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
├── src/                     # React frontend
│   ├── services/
│   │   └── api.ts          # Axios API client
│   ├── contexts/
│   │   └── AuthContext.tsx # MERN auth
│   ├── hooks/
│   │   └── useCart.ts      # Cart management
│   ├── pages/              # All pages
│   └── components/         # Reusable components
│
├── .env                    # Frontend environment
└── package.json
```

---

## 🎉 You're All Set!

Your MERN stack e-commerce platform is ready!

### Next Steps:

1. **Start Backend:** `cd backend && npm run dev`
2. **Start Frontend:** `npm run dev` (in root folder)
3. **Login as Admin:** Use `dhiyaneshb439@gmail.com` / `Admin@123`
4. **Add Products:** Go to Admin Dashboard → Products → Add Product
5. **Add Categories:** (Optional) Add more categories in Admin Dashboard
6. **Test Shopping:** Register as customer and start shopping!

### What works:
- ✅ Authentication (login/register)
- ✅ Admin dashboard with analytics
- ✅ Product CRUD via Admin Dashboard
- ✅ Category management
- ✅ Shopping cart
- ✅ Order placement and tracking
- ✅ Favorites/wishlist
- ✅ Customer dashboard
- ✅ Role-based access control

### Customer Features:
- Browse products
- Add to cart
- Place orders
- Track order status
- Manage favorites
- Update profile

---

## 📞 Need Help?

If you encounter any issues:
1. Check both backend and frontend are running
2. Verify MongoDB Atlas connection
3. Clear browser cache
4. Check browser console for errors
5. Restart both servers

Happy coding! 🚀
