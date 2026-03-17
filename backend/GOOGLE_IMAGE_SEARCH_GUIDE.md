# Google Image Search Setup Guide

## 🎯 Overview

This system automatically searches Google Images for product photos and uses the first result. It works for:
- ✅ All existing products (bulk assignment)
- ✅ New products added by admin (automatic)
- ✅ Products updated without image URLs

## 🔑 Getting API Keys

### Option 1: Google Custom Search API (Recommended)

**Step 1: Get Google API Key**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable "Custom Search API"
4. Go to **Credentials** → Create Credentials → API Key
5. Copy the API key

**Step 2: Create Custom Search Engine**
1. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. Click "Add" to create new search engine
3. In "Sites to search": Add `google.com` (or leave empty to search entire web)
4. Under "Settings" → "Basic":
   - Turn ON "Image search"
   - Turn ON "Search the entire web"
5. Copy the "Search engine ID" (CX)

**Step 3: Update .env file**
```env
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_CX=your_search_engine_id_here
```

**Limits**: 100 queries/day (free tier)

---

### Option 2: Bing Image Search API (Alternative)

**Step 1: Get Bing API Key**
1. Go to [Azure Portal](https://portal.azure.com/)
2. Create "Bing Search v7" resource
3. Get API key from "Keys and Endpoint" section

**Step 2: Update .env file**
```env
BING_API_KEY=your_bing_api_key_here
```

**Limits**: 1000 queries/month (free tier)

---

### Option 3: No API Key (Unsplash Fallback)

If you don't set up any API keys, the system will automatically use Unsplash images (free, no limits, but less specific to product names).

## 📋 How to Use

### First Time Setup: Clear and Reassign All Images

**Step 1: Clear existing images**
```bash
cd backend
node src/scripts/clearAllImages.js
```

This removes all current image URLs from the database.

**Step 2: Search Google and assign new images**
```bash
node src/scripts/assignImagesFromGoogle.js
```

This will:
- Search Google Images for each product name
- Pick the first result  
- Assign it to the product
- Show progress in real-time

**Expected Output:**
```
🔍 Starting Google Image Search for all products...
✅ Google Custom Search API configured
✅ MongoDB Connected: ...
📦 Database: vijimart

Found 41 products without images

[1/41] Processing: Rice (5kg)
🔍 Searching image for: Rice (5kg)
✅ Found Google image for: Rice (5kg)
✅ Assigned image: https://...

[2/41] Processing: Wheat Flour (5kg)
🔍 Searching image for: Wheat Flour (5kg)
✅ Found Google image for: Wheat Flour (5kg)
✅ Assigned image: https://...

...

✨ Assignment complete!
✅ Successfully updated: 41 products
```

### For Future Products: Automatic Assignment

When creating a new product in the Admin Dashboard:

**Without Image URL**
```javascript
{
  "name": "Fresh Mango (1kg)",
  "price": 150,
  "category": "..."
  // Don't provide imageUrl
}
```
→ System automatically searches Google and assigns first image result! 🎉

**With Image URL**
```javascript
{
  "name": "Fresh Mango (1kg)",
  "price": 150,
  "imageUrl": "https://your-custom-image.com/mango.jpg"
}
```
→ Uses your provided URL (no Google search)

## 🔍 How It Works

### Search Priority

1. **Google Custom Search** (if API key provided)
   - Most accurate results
   - High quality images
   - Best match for product names

2. **Bing Image Search** (if API key provided)
   - Good alternative
   - Easier to set up
   - Good results

3. **Unsplash Fallback** (always available)
   - Free, no API key needed
   - Professional photography
   - Generic product images

### Search Algorithm

For a product named "Fresh Tomato (1kg)":

1. **Clean the name**: "tomato"
2. **Add keywords**: "tomato product food grocery"
3. **Search Google Images** with this query
4. **Pick first result** from search
5. **Assign to product**

### Smart Name Cleaning

The system automatically removes:
- Size info: `(1kg)`, `(500g)`, `(1L)`
- Measurements: `kg`, `g`, `ml`, `l`, `pc`, `dozen`
- Generic words: `fresh`, `premium`, `pure`, `organic`

Example:
- Input: `"Premium Fresh Tomato (1kg)"`
- Cleaned: `"tomato"`
- Search: `"tomato product food grocery"`

## 🛠️ Technical Details

### Files Modified

1. **backend/src/utils/googleImageSearch.js**
   - Core search logic
   - Google/Bing API integration
   - Unsplash fallback

2. **backend/src/models/Product.js**
   - Pre-save hook for automatic assignment
   - Calls Google search if no imageUrl

3. **backend/src/routes/products.js**
   - PUT endpoint handles updates
   - Searches if imageUrl is empty

4. **backend/src/scripts/clearAllImages.js**
   - Clears all existing images

5. **backend/src/scripts/assignImagesFromGoogle.js**
   - Bulk assignment from Google search

### Rate Limiting Protection

The script processes products with 1-second delays to avoid:
- API rate limits
- Getting blocked by Google/Bing
- Overloading the APIs

## 📊 API Costs & Limits

| Service | Free Tier | Cost After |
|---------|-----------|------------|
| Google Custom Search | 100 queries/day | $5 per 1000 queries |
| Bing Image Search | 1000 queries/month | $3 per 1000 queries |
| Unsplash | Unlimited | Free |

**For 41 products**: Free with any option!

## 🧪 Testing

### Test New Product Creation

1. Go to Admin Dashboard
2. Create new product without imageUrl
3. Check console: Should show "🖼️ Auto-assigned image for: [Product Name]"
4. Verify product has image in database
5. Refresh frontend to see image

### Test Image Search

```bash
# Clear all images
node src/scripts/clearAllImages.js

# Reassign from Google
node src/scripts/assignImagesFromGoogle.js
```

Watch the console output to see Google search results!

## ⚠️ Troubleshooting

### "No API keys found"
- Solution: Add GOOGLE_API_KEY and GOOGLE_CX to .env file
- Or: Add BING_API_KEY to .env file
- Fallback: Will use Unsplash automatically

### "Google API error: 403"
- Issue: API key invalid or API not enabled
- Solution: Check API key, enable Custom Search API in Google Cloud

### "Google API error: 429"  
- Issue: Rate limit exceeded (100/day)
- Solution: Wait 24 hours or upgrade to paid tier
- Alternative: Use Bing API or Unsplash fallback

### "No Google results for product"
- Issue: Product name too generic or unusual
- Solution: System automatically falls back to Unsplash
- Manual: Provide custom imageUrl when creating product

### Images not loading in frontend
- Hard refresh browser: `Ctrl + Shift + R`
- Check if image URLs are valid in database
- Check browser console for CORS errors

## 🎉 Benefits

✅ **Fully Automatic**: No manual image searching  
✅ **Google Search**: Uses actual Google Images results  
✅ **First Result**: Picks the most relevant image  
✅ **Future Proof**: Works for all new products  
✅ **Fallback Safe**: Uses Unsplash if APIs unavailable  
✅ **Legal**: Proper API usage (not web scraping)  

## 📈 Results

After running the scripts:
- All 41 existing products get Google Images
- Future products auto-get images
- Admin doesn't need to search for images manually
- Consistent, high-quality product photos

---

## Quick Command Reference

```bash
# Clear all product images
node src/scripts/clearAllImages.js

# Assign images from Google search
node src/scripts/assignImagesFromGoogle.js

# Check products without images
mongo vijimart --eval "db.products.count({imageUrl: ''})"

# View first product's image
mongo vijimart --eval "db.products.findOne({}, {name:1, imageUrl:1})"
```

## 🔗 Useful Links

- [Google Cloud Console](https://console.cloud.google.com/)
- [Programmable Search Engine](https://programmablesearchengine.google.com/)
- [Azure Portal (Bing API)](https://portal.azure.com/)
- [Unsplash](https://unsplash.com/)

---

**Ready to go!** 🚀 Just get your API keys and run the scripts!
