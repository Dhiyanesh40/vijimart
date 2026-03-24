/**
 * AI Smart Grocery Planner Module
 * Generates optimized grocery lists based on user budget and preferences
 * SDG Alignment: Responsible Consumption and Production (SDG 12)
 */

class AIGroceryPlanner {
  /**
   * Generate optimized grocery list based on budget and preferences
   * @param {Object} params - Planning parameters
   * @param {Number} params.budget - User's budget
   * @param {Array} params.preferences - Dietary preferences (vegetarian, vegan, etc.)
   * @param {Array} params.favoriteCategories - Preferred product categories
   * @param {Number} params.householdSize - Number of people
   * @param {Number} params.daysToShop - Shopping duration in days
   * @param {Array} products - Available products from database
   * @param {Array} userHistory - User's purchase history
   * @returns {Object} Optimized grocery list with recommendations
   */
  static generateGroceryList({ 
    budget, 
    preferences = [], 
    favoriteCategories = [], 
    householdSize = 1,
    daysToShop = 7 
  }, products, userHistory = []) {
    
    // Step 1: Filter products based on preferences
    let eligibleProducts = this.filterByPreferences(products, preferences);
    
    // Step 2: Score products based on multiple factors
    const scoredProducts = this.scoreProducts(
      eligibleProducts, 
      favoriteCategories, 
      userHistory
    );
    
    // Step 3: Optimize selection within budget
    const optimizedList = this.optimizeSelection(
      scoredProducts, 
      budget, 
      householdSize, 
      daysToShop
    );
    
    // Step 4: Generate insights and recommendations
    const insights = this.generateInsights(optimizedList, budget);
    
    return {
      success: true,
      groceryList: optimizedList,
      insights,
      budgetUtilization: this.calculateBudgetUtilization(optimizedList, budget),
      nutritionBalance: this.calculateNutritionScore(optimizedList),
      savings: this.calculateSavings(optimizedList)
    };
  }

  /**
   * Filter products based on dietary preferences
   */
  static filterByPreferences(products, preferences) {
    if (!preferences || preferences.length === 0) {
      return products;
    }

    return products.filter(product => {
      // If vegetarian preference, exclude meat products
      if (preferences.includes('vegetarian')) {
        const meatKeywords = ['chicken', 'mutton', 'fish', 'meat', 'egg'];
        const isMeat = meatKeywords.some(keyword => 
          product.name.toLowerCase().includes(keyword)
        );
        if (isMeat) return false;
      }

      // If vegan preference, exclude all animal products
      if (preferences.includes('vegan')) {
        const animalKeywords = ['milk', 'cheese', 'butter', 'yogurt', 'paneer', 'ghee', 'meat', 'chicken', 'egg', 'fish'];
        const isAnimal = animalKeywords.some(keyword => 
          product.name.toLowerCase().includes(keyword)
        );
        if (isAnimal) return false;
      }

      // If gluten-free preference
      if (preferences.includes('gluten-free')) {
        const glutenKeywords = ['wheat', 'bread', 'pasta', 'noodles', 'maida'];
        const hasGluten = glutenKeywords.some(keyword => 
          product.name.toLowerCase().includes(keyword)
        );
        if (hasGluten) return false;
      }

      return true;
    });
  }

  /**
   * Score products based on various factors
   */
  static scoreProducts(products, favoriteCategories, userHistory) {
    return products.map(product => {
      let score = 50; // Base score

      // Factor 1: Discount/Value score (0-30 points)
      if (product.mrp && product.price < product.mrp) {
        const discountPercent = ((product.mrp - product.price) / product.mrp) * 100;
        score += Math.min(discountPercent, 30);
      }

      // Factor 2: Category preference (0-20 points)
      if (favoriteCategories && favoriteCategories.length > 0) {
        const categoryMatch = favoriteCategories.some(cat => 
          product.category && product.category.toString() === cat.toString()
        );
        if (categoryMatch) {
          score += 20;
        }
      }

      // Factor 3: Purchase history (0-30 points)
      if (userHistory && userHistory.length > 0) {
        const purchaseCount = userHistory.filter(item => 
          item.product && item.product.toString() === product._id.toString()
        ).length;
        score += Math.min(purchaseCount * 5, 30);
      }

      // Factor 4: Essential items priority (0-20 points)
      const essentialCategories = ['groceries', 'dairy', 'vegetables', 'fruits'];
      if (product.categorySlug && essentialCategories.includes(product.categorySlug)) {
        score += 20;
      }

      return {
        ...product,
        aiScore: score,
        recommendation: this.getRecommendationReason(score, product)
      };
    }).sort((a, b) => b.aiScore - a.aiScore);
  }

  /**
   * Optimize product selection within budget using knapsack-like algorithm
   */
  static optimizeSelection(scoredProducts, budget, householdSize, daysToShop) {
    const selectedProducts = [];
    let remainingBudget = budget;
    
    // Define essential categories and their budget allocation
    const categoryBudget = {
      'groceries': budget * 0.30,      // 30% for groceries
      'vegetables': budget * 0.20,     // 20% for vegetables
      'fruits': budget * 0.15,         // 15% for fruits
      'dairy': budget * 0.15,          // 15% for dairy
      'snacks': budget * 0.10,         // 10% for snacks
      'beverages': budget * 0.10       // 10% for beverages
    };

    // Group products by category
    const productsByCategory = {};
    scoredProducts.forEach(product => {
      const cat = product.categorySlug || 'other';
      if (!productsByCategory[cat]) {
        productsByCategory[cat] = [];
      }
      productsByCategory[cat].push(product);
    });

    // Select products from each category within allocated budget
    for (const [category, allocation] of Object.entries(categoryBudget)) {
      const categoryProducts = productsByCategory[category] || [];
      let categorySpent = 0;

      for (const product of categoryProducts) {
        if (categorySpent + product.price <= allocation && remainingBudget >= product.price) {
          const quantity = this.calculateOptimalQuantity(
            product, 
            householdSize, 
            daysToShop
          );
          
          const totalPrice = product.price * quantity;
          
          if (remainingBudget >= totalPrice) {
            selectedProducts.push({
              productId: product._id,
              name: product.name,
              price: product.price,
              mrp: product.mrp,
              unit: product.unit,
              quantity,
              totalPrice,
              aiScore: product.aiScore,
              recommendation: product.recommendation,
              category: product.categoryName || category,
              imageUrl: product.imageUrl
            });
            
            categorySpent += totalPrice;
            remainingBudget -= totalPrice;
          }
        }
      }
    }

    // Fill remaining budget with high-scoring products
    const unselectedProducts = scoredProducts.filter(p => 
      !selectedProducts.some(s => s.productId.toString() === p._id.toString())
    );

    for (const product of unselectedProducts) {
      if (remainingBudget >= product.price) {
        const quantity = 1;
        const totalPrice = product.price * quantity;
        
        if (remainingBudget >= totalPrice) {
          selectedProducts.push({
            productId: product._id,
            name: product.name,
            price: product.price,
            mrp: product.mrp,
            unit: product.unit,
            quantity,
            totalPrice,
            aiScore: product.aiScore,
            recommendation: product.recommendation,
            category: product.categoryName || 'Other',
            imageUrl: product.imageUrl
          });
          
          remainingBudget -= totalPrice;
        }
      }
    }

    return selectedProducts;
  }

  /**
   * Calculate optimal quantity based on household size and duration
   */
  static calculateOptimalQuantity(product, householdSize, daysToShop) {
    const category = product.categorySlug || '';
    
    // Base quantity per person per week
    const baseQuantities = {
      'groceries': 1,    // Rice, flour, etc.
      'dairy': 2,        // Milk, curd, etc.
      'vegetables': 3,   // Fresh vegetables
      'fruits': 2,       // Fresh fruits
      'snacks': 1,       // Snacks
      'beverages': 2     // Drinks
    };

    const baseQty = baseQuantities[category] || 1;
    const weeksFactor = daysToShop / 7;
    
    return Math.max(1, Math.ceil(baseQty * householdSize * weeksFactor));
  }

  /**
   * Generate insights and recommendations
   */
  static generateInsights(groceryList, budget) {
    const insights = [];
    
    const totalSpent = groceryList.reduce((sum, item) => sum + item.totalPrice, 0);
    const totalSavings = groceryList.reduce((sum, item) => {
      if (item.mrp && item.mrp > item.price) {
        return sum + ((item.mrp - item.price) * item.quantity);
      }
      return sum;
    }, 0);

    // Budget utilization insight
    const utilizationPercent = (totalSpent / budget * 100).toFixed(1);
    insights.push({
      type: 'budget',
      icon: '💰',
      message: `${utilizationPercent}% of your budget utilized efficiently`,
      detail: `You're spending ₹${totalSpent.toFixed(2)} out of ₹${budget}`
    });

    // Savings insight
    if (totalSavings > 0) {
      insights.push({
        type: 'savings',
        icon: '🎉',
        message: `You're saving ₹${totalSavings.toFixed(2)} with discounts!`,
        detail: `Smart choices on discounted products`
      });
    }

    // Category balance insight
    const categories = [...new Set(groceryList.map(item => item.category))];
    insights.push({
      type: 'variety',
      icon: '🛒',
      message: `Balanced shopping across ${categories.length} categories`,
      detail: `Essentials covered: ${categories.join(', ')}`
    });

    // Optimization insight
    const avgScore = groceryList.reduce((sum, item) => sum + item.aiScore, 0) / groceryList.length;
    if (avgScore > 70) {
      insights.push({
        type: 'optimization',
        icon: '⭐',
        message: 'Highly optimized grocery list!',
        detail: 'Selected products match your preferences and offer great value'
      });
    }

    return insights;
  }

  /**
   * Calculate budget utilization percentage
   */
  static calculateBudgetUtilization(groceryList, budget) {
    const totalSpent = groceryList.reduce((sum, item) => sum + item.totalPrice, 0);
    return {
      spent: totalSpent.toFixed(2),
      remaining: (budget - totalSpent).toFixed(2),
      percentage: ((totalSpent / budget) * 100).toFixed(1)
    };
  }

  /**
   * Calculate nutrition balance score based on dietary variety
   */
  static calculateNutritionScore(groceryList) {
    if (!groceryList || groceryList.length === 0) {
      return {
        score: 0,
        message: 'Add items to your list to see nutritional balance',
        coveredCategories: []
      };
    }

    // Define nutritional groups and keywords to look for
    const nutritionGroups = {
      'vegetables': ['vegetable', 'brinjal', 'tomato', 'onion', 'carrot', 'spinach', 'lettuce', 'cabbage', 'bell pepper', 'okra', 'pumpkin', 'bitter gourd'],
      'fruits': ['fruit', 'apple', 'banana', 'orange', 'mango', 'guava', 'papaya', 'grape', 'pomegranate', 'watermelon', 'kiwi', 'berries'],
      'proteins': ['dal', 'lentil', 'bean', 'egg', 'meat', 'chicken', 'fish', 'paneer', 'tofu', 'chickpea'],
      'dairy': ['milk', 'yogurt', 'cheese', 'ghee', 'butter', 'cream', 'paneer', 'curd'],
      'grains': ['rice', 'wheat', 'flour', 'bread', 'pasta', 'noodles', 'cereal', 'oats'],
      'fats & oils': ['oil', 'ghee', 'butter', 'coconut', 'sesame'],
      'spices & condiments': ['salt', 'sugar', 'spice', 'sauce', 'masala', 'chutney']
    };

    const productNames = groceryList.map(item => item.name.toLowerCase());
    const coveredGroups = {};
    let totalGroupsCovered = 0;

    // Check which nutritional groups are covered
    for (const [group, keywords] of Object.entries(nutritionGroups)) {
      const hasCoverage = keywords.some(keyword =>
        productNames.some(name => name.includes(keyword))
      );

      if (hasCoverage) {
        coveredGroups[group] = true;
        totalGroupsCovered++;
      }
    }

    // Calculate score based on covered groups (each group worth ~14%)
    const score = Math.round((totalGroupsCovered / Object.keys(nutritionGroups).length) * 100);

    const message =
      score >= 85 ? '🌟 Excellent nutritional balance! Well-rounded diet with all food groups.' :
      score >= 70 ? '✓ Good nutritional variety! Missing a few food groups.' :
      score >= 50 ? '⚠ Consider adding more variety for better nutrition.' :
      score >= 25 ? '📌 Try to include vegetables, fruits, and proteins.' :
      '🍽️ Add more diverse food items for balanced nutrition';

    return {
      score,
      message,
      coveredCategories: Object.keys(coveredGroups)
    };
  }

  /**
   * Calculate total savings from discounts
   */
  static calculateSavings(groceryList) {
    const totalSavings = groceryList.reduce((sum, item) => {
      if (item.mrp && item.mrp > item.price) {
        return sum + ((item.mrp - item.price) * item.quantity);
      }
      return sum;
    }, 0);

    return {
      amount: totalSavings.toFixed(2),
      percentage: groceryList.length > 0 ? 
        ((totalSavings / groceryList.reduce((sum, item) => sum + (item.mrp || item.price) * item.quantity, 0)) * 100).toFixed(1) : 0
    };
  }

  /**
   * Get recommendation reason based on score
   */
  static getRecommendationReason(score, product) {
    if (score >= 90) return 'Highly recommended - Great value and matches your preferences';
    if (score >= 75) return 'Recommended - Good discount and quality';
    if (score >= 60) return 'Popular choice - Frequently purchased';
    return 'Available option';
  }
}

export default AIGroceryPlanner;
