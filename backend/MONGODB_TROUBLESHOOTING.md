# 🔧 MongoDB Atlas Connection Troubleshooting

## SSL/TLS Error: "tlsv1 alert internal error"

This is the most common error when connecting to MongoDB Atlas. Here's how to fix it:

### ✅ Quick Fix (Most Common)

**Problem:** Your database password contains special characters that cause SSL issues.

**Solution:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **"Database Access"** (left sidebar)
3. Find your user (`vijimart`) and click **"Edit"**
4. Click **"Edit Password"**
5. Set a new password with **ONLY letters and numbers**
   - ✅ Good: `Vijimart123`, `MyPassword2024`, `Test1234`
   - ❌ Bad: `Pass@123`, `Test#456`, `My:Pass/word`
6. Click **"Update User"**
7. Update your `backend/.env` file with the new password:
   ```env
   MONGODB_URI=mongodb+srv://vijimart:Vijimart123@cluster0.xxxxx.mongodb.net/vijimart?retryWrites=true&w=majority
   ```

### Other Common Issues

#### 1. IP Address Not Whitelisted

**Error:** `getaddrinfo ENOTFOUND` or `connection timeout`

**Solution:**
1. Go to **"Network Access"** in MongoDB Atlas
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. Enter: `0.0.0.0/0`
5. Click **"Confirm"**
6. Wait 1-2 minutes for changes to apply

#### 2. Wrong Connection String Format

**Check your connection string has:**
- ✅ `mongodb+srv://` (not `mongodb://`)
- ✅ Database name after domain: `/vijimart?`
- ✅ Parameters: `?retryWrites=true&w=majority`

**Correct format:**
```
mongodb+srv://vijimart:YourPassword@cluster0.abc12.mongodb.net/vijimart?retryWrites=true&w=majority
```

**Wrong formats:**
```
❌ mongodb+srv://vijimart:YourPassword@cluster0.abc12.mongodb.net/?retryWrites=true
   (Missing database name - no /vijimart before ?)

❌ mongodb+srv://vijimart@cluster0.abc12.mongodb.net/vijimart
   (Missing password)

❌ mongodb://vijimart:Pass@cluster0.mongodb.net/vijimart
   (Using mongodb:// instead of mongodb+srv://)
```

#### 3. Cluster Not Active

**Solution:**
1. Go to **"Database"** in MongoDB Atlas
2. Check if cluster shows **"Paused"**
3. If paused, click **"Resume"** and wait for it to start

#### 4. Wrong Database User Permissions

**Solution:**
1. Go to **"Database Access"**
2. Find your user and click **"Edit"**
3. Under **"Database User Privileges"**, select:
   - **"Read and write to any database"** (Built-in Role)
4. Click **"Update User"**

## Test Your Connection

After fixing, test with:

```bash
cd backend
npm run seed
```

**Success looks like:**
```
🌱 Starting database seeding...
✅ MongoDB Connected: cluster0.abc12.mongodb.net
📦 Database: vijimart
👤 Creating admin user...
📦 Creating categories...
🛍️ Creating products...
✅ Database seeded successfully!
```

**Still having issues?**

1. **Check your .env file:**
   ```bash
   # View your .env (Windows)
   type backend\.env
   
   # Check if MONGODB_URI is set correctly
   ```

2. **Verify cluster URL:**
   - Go to MongoDB Atlas → Database → Connect
   - Copy the connection string again
   - Make sure cluster name matches

3. **Create new database user:**
   - Delete old user in "Database Access"
   - Create new user with simple username/password
   - Update `.env` with new credentials

4. **Try different region:**
   - If nothing works, create a new cluster
   - Choose different cloud provider/region
   - Some networks block certain regions

## Still Stuck?

Common checklist:
- [ ] Password has NO special characters
- [ ] IP address `0.0.0.0/0` whitelisted
- [ ] Connection string has `/vijimart?` in it
- [ ] Cluster is active (not paused)
- [ ] Database user has "Read and write" permissions
- [ ] Using `mongodb+srv://` (not `mongodb://`)
- [ ] Node.js v18+ installed
- [ ] `.env` file exists in `backend/` folder
- [ ] No extra spaces in connection string

If all checked and still failing, try creating a completely new MongoDB cluster and user from scratch.
