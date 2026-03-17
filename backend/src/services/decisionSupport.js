/**
 * Decision Support System
 * Provides intelligent business insights and analytics
 * SDG Alignment: Decent Work and Economic Growth (SDG 8)
 */

class DecisionSupportSystem {
  /**
   * Generate comprehensive business intelligence report
   */
  static async generateBusinessReport(orders, products, users, dateRange = 30) {
    const insights = {
      sales: this.analyzeSales(orders, dateRange),
      inventory: this.analyzeInventory(products, orders),
      customers: this.analyzeCustomers(users, orders),
      trends: this.analyzeTrends(orders, dateRange),
      predictions: this.generatePredictions(orders, dateRange),
      recommendations: []
    };

    // Generate AI-powered recommendations
    insights.recommendations = this.generateRecommendations(insights);

    return insights;
  }

  /**
   * Analyze sales performance
   */
  static analyzeSales(orders, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentOrders = orders.filter(order => 
      new Date(order.createdAt) >= cutoffDate
    );

    const totalRevenue = recentOrders.reduce((sum, order) =>
      sum + (order.total || 0), 0
    );

    const completedOrders = recentOrders.filter(o => o.status === 'delivered');
    const pendingOrders = recentOrders.filter(o => 
      ['pending', 'confirmed', 'processing'].includes(o.status)
    );

    const avgOrderValue = completedOrders.length > 0 ? 
      totalRevenue / completedOrders.length : 0;

    // Calculate growth rate
    const midPoint = new Date(cutoffDate.getTime() + (Date.now() - cutoffDate.getTime()) / 2);
    const firstHalf = recentOrders.filter(o => new Date(o.createdAt) < midPoint);
    const secondHalf = recentOrders.filter(o => new Date(o.createdAt) >= midPoint);
    
    const firstHalfRevenue = firstHalf.reduce((sum, o) => sum + (o.total || 0), 0);
    const secondHalfRevenue = secondHalf.reduce((sum, o) => sum + (o.total || 0), 0);
    
    const growthRate = firstHalfRevenue > 0 ? 
      ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue * 100).toFixed(1) : 0;

    return {
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders: recentOrders.length,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      avgOrderValue: avgOrderValue.toFixed(2),
      growthRate: parseFloat(growthRate),
      conversionRate: ((completedOrders.length / recentOrders.length) * 100).toFixed(1)
    };
  }

  /**
   * Analyze inventory status and stock levels
   */
  static analyzeInventory(products, orders) {
    // Filter products based on inStock status
    const inStockProducts = products.filter(p => p.inStock === true);
    const outOfStockProducts = products.filter(p => p.inStock === false);

    // Calculate product velocity (sales rate)
    const productSales = {};
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const productId = item.product?._id || item.product;
          if (productId) {
            productSales[productId] = (productSales[productId] || 0) + (item.quantity || 0);
          }
        });
      }
    });

    // Find fast-moving products
    const fastMovingProducts = products
      .map(p => ({
        ...p,
        salesCount: productSales[p._id] || 0
      }))
      .filter(p => p.salesCount > 0)
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 10);

    // Find slow-moving products
    const slowMovingProducts = products
      .filter(p => p.inStock === true)
      .map(p => ({
        ...p,
        salesCount: productSales[p._id] || 0
      }))
      .sort((a, b) => a.salesCount - b.salesCount)
      .slice(0, 10);

    return {
      totalProducts: products.length,
      lowStockCount: outOfStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      lowStockProducts: outOfStockProducts.slice(0, 5).map(p => ({
        id: p._id,
        name: p.name,
        category: p.category
      })),
      outOfStockProducts: outOfStockProducts.slice(0, 5).map(p => ({
        id: p._id,
        name: p.name,
        category: p.category
      })),
      fastMoving: fastMovingProducts.slice(0, 5).map(p => ({
        id: p._id,
        name: p.name,
        sales: p.salesCount
      })),
      slowMoving: slowMovingProducts.slice(0, 5).map(p => ({
        id: p._id,
        name: p.name,
        sales: p.salesCount
      }))
    };
  }

  /**
   * Analyze customer behavior patterns
   */
  static analyzeCustomers(users, orders) {
    const customers = users.filter(u => u.role !== 'admin');
    
    // Calculate customer lifetime value
    const customerOrders = {};
    orders.forEach(order => {
      const customerId = order.user?._id || order.user || order.customer?._id || order.customer;
      if (customerId) {
        if (!customerOrders[customerId]) {
          customerOrders[customerId] = [];
        }
        customerOrders[customerId].push(order);
      }
    });

    const customerValues = Object.entries(customerOrders).map(([customerId, orders]) => ({
      customerId,
      orderCount: orders.length,
      totalValue: orders.reduce((sum, o) => sum + (o.total || 0), 0)
    })).sort((a, b) => b.totalValue - a.totalValue);

    const topCustomers = customerValues.slice(0, 5);
    const avgCustomerValue = customerValues.length > 0 ? 
      customerValues.reduce((sum, c) => sum + c.totalValue, 0) / customerValues.length : 0;

    // Calculate repeat customer rate
    const repeatCustomers = customerValues.filter(c => c.orderCount > 1).length;
    const repeatRate = customers.length > 0 ? 
      (repeatCustomers / customers.length * 100).toFixed(1) : 0;

    return {
      totalCustomers: customers.length,
      activeCustomers: Object.keys(customerOrders).length,
      repeatCustomers,
      repeatRate: parseFloat(repeatRate),
      avgLifetimeValue: avgCustomerValue.toFixed(2),
      topCustomers: topCustomers.map(c => ({
        customerId: c.customerId,
        orders: c.orderCount,
        value: c.totalValue.toFixed(2)
      }))
    };
  }

  /**
   * Analyze trends and patterns
   */
  static analyzeTrends(orders, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentOrders = orders.filter(order => 
      new Date(order.createdAt) >= cutoffDate
    );

    // Daily sales trend
    const dailySales = {};
    recentOrders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + (order.total || 0);
    });

    // Category popularity
    const categoryStats = {};
    recentOrders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const category = item.product?.categoryName || 'Other';
          categoryStats[category] = (categoryStats[category] || 0) + (item.quantity || 0);
        });
      }
    });

    const topCategories = Object.entries(categoryStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([category, count]) => ({ category, count }));

    // Peak hours (if timestamps available)
    const hourlyOrders = new Array(24).fill(0);
    recentOrders.forEach(order => {
      const hour = new Date(order.createdAt).getHours();
      hourlyOrders[hour]++;
    });

    const peakHour = hourlyOrders.indexOf(Math.max(...hourlyOrders));

    return {
      dailySales: Object.entries(dailySales).map(([date, amount]) => ({
        date,
        amount: parseFloat(amount.toFixed(2))
      })),
      topCategories,
      peakHour,
      orderDistribution: {
        morning: hourlyOrders.slice(6, 12).reduce((a, b) => a + b, 0),
        afternoon: hourlyOrders.slice(12, 18).reduce((a, b) => a + b, 0),
        evening: hourlyOrders.slice(18, 24).reduce((a, b) => a + b, 0)
      }
    };
  }

  /**
   * Generate predictions and forecasts
   */
  static generatePredictions(orders, days) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentOrders = orders.filter(order => 
      new Date(order.createdAt) >= cutoffDate
    );

    const avgDailyOrders = recentOrders.length / days;
    const avgDailyRevenue = recentOrders.reduce((sum, o) =>
      sum + (o.total || 0), 0) / days;

    // Simple linear prediction for next 7 days
    const predictedOrders = Math.round(avgDailyOrders * 7);
    const predictedRevenue = (avgDailyRevenue * 7).toFixed(2);

    // Calculate trend direction
    const midPoint = days / 2;
    const firstHalf = recentOrders.filter(o => {
      const daysAgo = (Date.now() - new Date(o.createdAt)) / (1000 * 60 * 60 * 24);
      return daysAgo >= midPoint;
    });
    const secondHalf = recentOrders.filter(o => {
      const daysAgo = (Date.now() - new Date(o.createdAt)) / (1000 * 60 * 60 * 24);
      return daysAgo < midPoint;
    });

    const trend = secondHalf.length > firstHalf.length ? 'up' : 
                  secondHalf.length < firstHalf.length ? 'down' : 'stable';

    return {
      nextWeek: {
        expectedOrders: predictedOrders,
        expectedRevenue: predictedRevenue
      },
      trend,
      confidence: 'medium',
      avgDailyOrders: avgDailyOrders.toFixed(1),
      avgDailyRevenue: avgDailyRevenue.toFixed(2)
    };
  }

  /**
   * Generate AI-powered business recommendations
   */
  static generateRecommendations(insights) {
    const recommendations = [];

    // Inventory recommendations
    if (insights.inventory.lowStockCount > 0) {
      recommendations.push({
        priority: 'high',
        category: 'inventory',
        icon: '📦',
        title: 'Low Stock Alert',
        message: `${insights.inventory.lowStockCount} products are running low on stock`,
        action: 'Restock these items to avoid stockouts',
        products: insights.inventory.lowStockProducts
      });
    }

    if (insights.inventory.outOfStockCount > 0) {
      recommendations.push({
        priority: 'critical',
        category: 'inventory',
        icon: '⚠️',
        title: 'Out of Stock',
        message: `${insights.inventory.outOfStockCount} products are currently unavailable`,
        action: 'Immediate restocking required',
        products: insights.inventory.outOfStockProducts
      });
    }

    // Sales recommendations
    if (insights.sales.growthRate < 0) {
      recommendations.push({
        priority: 'medium',
        category: 'sales',
        icon: '📉',
        title: 'Sales Decline Detected',
        message: `Sales have decreased by ${Math.abs(insights.sales.growthRate)}% recently`,
        action: 'Consider promotional campaigns or discounts'
      });
    } else if (insights.sales.growthRate > 10) {
      recommendations.push({
        priority: 'low',
        category: 'sales',
        icon: '📈',
        title: 'Strong Growth',
        message: `Sales are growing at ${insights.sales.growthRate}%`,
        action: 'Maintain current strategies and scale inventory'
      });
    }

    // Customer retention recommendations
    if (insights.customers.repeatRate < 30) {
      recommendations.push({
        priority: 'medium',
        category: 'customer',
        icon: '👥',
        title: 'Low Customer Retention',
        message: `Only ${insights.customers.repeatRate}% of customers make repeat purchases`,
        action: 'Implement loyalty programs and follow-up campaigns'
      });
    }

    // Product recommendations
    if (insights.inventory.slowMoving.length > 0) {
      recommendations.push({
        priority: 'low',
        category: 'product',
        icon: '🏷️',
        title: 'Slow-Moving Products',
        message: 'Some products have low sales velocity',
        action: 'Consider discounts or bundling strategies',
        products: insights.inventory.slowMoving.slice(0, 3)
      });
    }

    return recommendations;
  }

  /**
   * Generate automated sales report
   */
  static generateSalesReport(orders, startDate, endDate) {
    const ordersInRange = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });

    const totalRevenue = ordersInRange.reduce((sum, order) =>
      sum + (order.total || 0), 0
    );

    const byStatus = ordersInRange.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    const byDate = ordersInRange.reduce((acc, order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { orders: 0, revenue: 0 };
      }
      acc[date].orders++;
      acc[date].revenue += order.total || 0;
      return acc;
    }, {});

    return {
      period: { startDate, endDate },
      summary: {
        totalOrders: ordersInRange.length,
        totalRevenue: totalRevenue.toFixed(2),
        avgOrderValue: (totalRevenue / ordersInRange.length || 0).toFixed(2)
      },
      byStatus,
      dailyBreakdown: Object.entries(byDate).map(([date, data]) => ({
        date,
        orders: data.orders,
        revenue: data.revenue.toFixed(2)
      }))
    };
  }

  /**
   * Generate inventory report
   */
  static generateInventoryReport(products) {
    const byCategory = products.reduce((acc, product) => {
      const category = product.categoryName || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalStock: 0,
          totalValue: 0
        };
      }
      acc[category].count++;
      acc[category].totalStock += product.stock || 0;
      acc[category].totalValue += (product.price * (product.stock || 0));
      return acc;
    }, {});

    const totalValue = products.reduce((sum, p) => 
      sum + (p.price * (p.stock || 0)), 0
    );

    return {
      summary: {
        totalProducts: products.length,
        totalStockUnits: products.reduce((sum, p) => sum + (p.stock || 0), 0),
        totalInventoryValue: totalValue.toFixed(2)
      },
      byCategory: Object.entries(byCategory).map(([category, data]) => ({
        category,
        products: data.count,
        stock: data.totalStock,
        value: data.totalValue.toFixed(2)
      })),
      alerts: {
        lowStock: products.filter(p => p.stock > 0 && p.stock <= 10).length,
        outOfStock: products.filter(p => p.stock === 0).length
      }
    };
  }
}

export default DecisionSupportSystem;
