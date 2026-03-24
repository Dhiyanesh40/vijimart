import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Package, ShoppingCart, Users, FolderOpen, Plus, Pencil, Trash2, TrendingUp, Search, BarChart2, ImageOff } from "lucide-react";
import { OrderCard } from "@/components/orders/OrderCard";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { adminAPI, productsAPI, categoriesAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { toast } = useToast();

  // Enable real-time updates for all data
  useRealTimeUpdates();

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get active tab from URL or default to 'analytics'
  const activeTab = searchParams.get('tab') || 'analytics';

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  // Filters for orders
  const [orderFilter, setOrderFilter] = useState({
    search: "",
    status: "all",
    sortBy: "date-desc",
  });

  // Product form
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "", description: "", price: "", mrp: "", image_url: "", category_id: "", unit: "1 pc", in_stock: true, featured: false,
  });

  // Category form
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", slug: "", icon: "", imageUrl: "" });

  // Edit category state
  const [editCategoryDialog, setEditCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editCategoryForm, setEditCategoryForm] = useState({ name: "", slug: "", icon: "", imageUrl: "" });

  // Delete confirmation state
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);

  // Expanded orders state for Recent Orders section
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate("/");
      return;
    }
    if (!authLoading && user && isAdmin) fetchAll();
  }, [user, isAdmin, authLoading]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [productsResponse, categoriesResponse, ordersResponse] = await Promise.all([
        productsAPI.getAll(),
        categoriesAPI.getAll(),
        adminAPI.getOrders(),
      ]);
      
      const productsData = productsResponse.data || productsResponse;
      const categoriesData = categoriesResponse.data || categoriesResponse;
      const ordersData = ordersResponse.data || ordersResponse;
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error fetching data",
        description: error instanceof Error ? error.message : "Please check your database connection",
        variant: "destructive"
      });
    }
    setLoading(false);
  };

  const resetProductForm = () => {
    setProductForm({ name: "", description: "", price: "", mrp: "", image_url: "", category_id: "", unit: "1 pc", in_stock: true, featured: false });
  };

  const handleSaveProduct = async () => {
    try {
      const data = {
        name: productForm.name,
        description: productForm.description || null,
        price: parseFloat(productForm.price),
        mrp: productForm.mrp ? parseFloat(productForm.mrp) : null,
        imageUrl: productForm.image_url || null,
        category: productForm.category_id || null,
        unit: productForm.unit || "1 pc",
        inStock: productForm.in_stock,
        featured: productForm.featured,
      };

      if (editingProduct) {
        await adminAPI.updateProduct(editingProduct._id, data);
        toast({ title: "Product updated" });
      } else {
        await adminAPI.createProduct(data);
        toast({ title: "Product added" });
      }
      setProductDialog(false);
      resetProductForm();
      fetchAll();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to save product",
        variant: "destructive" 
      });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await adminAPI.deleteProduct(id);
      toast({ title: "Product deleted" });
      fetchAll();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to delete product",
        variant: "destructive" 
      });
    }
  };

  const handleSaveCategory = async () => {
    try {
      await adminAPI.createCategory({
        name: categoryForm.name,
        slug: categoryForm.slug,
        icon: categoryForm.icon || null,
        imageUrl: categoryForm.imageUrl || null,
      });
      toast({ title: "Category added" });
      setCategoryDialog(false);
      setCategoryForm({ name: "", slug: "", icon: "", imageUrl: "" });
      fetchAll();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to save category",
        variant: "destructive" 
      });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    try {
      await adminAPI.updateCategory(editingCategory._id || editingCategory.id, {
        name: editCategoryForm.name,
        slug: editCategoryForm.slug,
        icon: editCategoryForm.icon || null,
        imageUrl: editCategoryForm.imageUrl || null,
      });
      toast({ title: "Category updated" });
      setEditCategoryDialog(false);
      setEditingCategory(null);
      fetchAll();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update category",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await adminAPI.deleteCategory(id);
      toast({ title: "Category deleted" });
      fetchAll();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to delete category",
        variant: "destructive" 
      });
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status);
      toast({ title: "Order status updated successfully", description: `Order moved to ${status}` });
      fetchAll();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Failed to update order";
      const currentStatus = error.response?.data?.currentStatus;
      const validNext = error.response?.data?.validNextStatuses;
      
      let description = errorMsg;
      if (validNext && validNext.length > 0) {
        description += `\n\nValid transitions: ${validNext.join(', ')}`;
      }
      
      toast({ 
        title: "Cannot Update Order", 
        description: description,
        variant: "destructive" 
      });
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="bg-muted h-8 w-48 rounded" />
            <div className="bg-muted h-64 rounded-lg" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-accent/40 hover:shadow-md transition-all" onClick={() => handleTabChange('analytics')}>
            <Users className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold text-foreground">₹{orders.reduce((s, o) => s + Number(o.total), 0).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all" onClick={() => handleTabChange('products')}>
            <Package className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{products.length}</p>
            <p className="text-xs text-muted-foreground">Products</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-accent/40 hover:shadow-md transition-all" onClick={() => handleTabChange('categories')}>
            <FolderOpen className="h-5 w-5 text-accent mb-2" />
            <p className="text-2xl font-bold text-foreground">{categories.length}</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-4 cursor-pointer hover:border-primary/40 hover:shadow-md transition-all" onClick={() => handleTabChange('orders')}>
            <ShoppingCart className="h-5 w-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{orders.length}</p>
            <p className="text-xs text-muted-foreground">Orders</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="mb-4">
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          {/* Analytics Tab (Decision Support) */}
          <TabsContent value="analytics">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">Decision Support Dashboard</h2>
              <Button
                size="sm"
                variant="outline"
                className="flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary hover:text-white transition-all"
                onClick={() => navigate('/business-intelligence')}
              >
                <BarChart2 className="h-3.5 w-3.5" />
                Business Intelligence
              </Button>
            </div>
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Today's Orders</p>
                <p className="text-3xl font-bold text-foreground">
                  {orders.filter(o => {
                    const orderDate = o.createdAt || o.created_at;
                    return orderDate && new Date(orderDate).toDateString() === new Date().toDateString();
                  }).length}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Pending Orders</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">
                  ₹{orders.reduce((s, o) => s + Number(o.total), 0).toFixed(0)}
                </p>
              </div>
            </div>

            {/* Sales Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Daily Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend (Last 7 Days)</CardTitle>
                  <CardDescription>Daily sales revenue</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const last7Days = Array.from({ length: 7 }, (_, i) => {
                      const date = new Date();
                      date.setDate(date.getDate() - (6 - i));
                      return date.toISOString().split('T')[0];
                    });
                    
                    const dailyRevenue = last7Days.map(date => {
                      const dayOrders = orders.filter(o => {
                        const orderDate = o.createdAt || o.created_at;
                        return orderDate && new Date(orderDate).toISOString().split('T')[0] === date;
                      });
                      const revenue = dayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
                      return {
                        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        revenue: revenue,
                        orders: dayOrders.length
                      };
                    });

                    const chartConfig = {
                      revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                    };

                    return (
                      <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <AreaChart data={dailyRevenue}>
                          <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis 
                            dataKey="date" 
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <YAxis 
                            className="text-xs"
                            tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          />
                          <ChartTooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">Revenue</span>
                                        <span className="font-bold text-foreground">₹{payload[0].value}</span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">Orders</span>
                                        <span className="font-bold text-foreground">{payload[0].payload.orders}</span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="hsl(var(--chart-1))" 
                            fillOpacity={1} 
                            fill="url(#colorRevenue)" 
                          />
                        </AreaChart>
                      </ChartContainer>
                    );
                  })()}
                </CardContent>
              </Card>

              {/* Order Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                  <CardDescription>Current order statuses</CardDescription>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const statusCounts: Record<string, number> = {};
                    orders.forEach(order => {
                      const status = order.status || 'unknown';
                      statusCounts[status] = (statusCounts[status] || 0) + 1;
                    });

                    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
                      name: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
                      value: count,
                      fill: status === 'delivered' ? 'hsl(var(--chart-2))' :
                            status === 'pending' ? 'hsl(var(--chart-3))' :
                            status === 'processing' ? 'hsl(var(--chart-4))' :
                            status === 'shipped' ? 'hsl(var(--chart-5))' :
                            status === 'cancelled' ? 'hsl(var(--destructive))' :
                            status === 'returned' ? 'hsl(142 71% 45%)' :
                            'hsl(var(--chart-1))'
                    }));

                    const chartConfig = {
                      value: { label: "Orders" },
                    };

                    return statusData.length > 0 ? (
                      <ChartContainer config={chartConfig} className="h-[300px] w-full">
                        <PieChart>
                          <ChartTooltip
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="flex flex-col">
                                      <span className="text-[0.70rem] uppercase text-muted-foreground">{payload[0].name}</span>
                                      <span className="font-bold text-foreground">{payload[0].value} orders</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Pie
                            data={statusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          />
                        </PieChart>
                      </ChartContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                        No order data available
                      </div>
                    );
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Sales by Category Chart */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Sales by Category</CardTitle>
                <CardDescription>Revenue breakdown by product category</CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  // Create category and product lookup maps for O(1) access
                  const categoryMap: Record<string, string> = {};
                  const categoryIdMap: Record<string, string> = {};
                  categories.forEach(cat => {
                    const catId = cat._id?.toString() || cat.id;
                    if (catId) {
                      categoryMap[catId] = cat.name;
                      categoryIdMap[cat.name] = cat.name;
                    }
                  });

                  const productMap: Record<string, any> = {};
                  products.forEach(p => {
                    if (p._id) productMap[p._id.toString()] = p;
                    if (p.name) productMap[p.name] = p;
                  });

                  const categorySales: Record<string, number> = {};

                  orders.forEach(order => {
                    order.items?.forEach((item: any) => {
                      let categoryName = 'Uncategorized';

                      // Method 1: Check if item has category directly stored
                      if (item.category) {
                        const catId = typeof item.category === 'object' ? item.category?._id?.toString() : item.category?.toString();
                        categoryName = categoryMap[catId] || (typeof item.category === 'string' ? item.category : 'Uncategorized');
                      }

                      // Method 2: Find product and get its category
                      if (categoryName === 'Uncategorized') {
                        let product = null;

                        // Try different ways to find the product
                        if (typeof item.product === 'object' && item.product?._id) {
                          product = productMap[item.product._id.toString()];
                        } else if (typeof item.product === 'string') {
                          product = productMap[item.product];
                        }

                        // Fallback: search by product name
                        if (!product && (item.productName || item.name)) {
                          const searchName = item.productName || item.name;
                          product = productMap[searchName];
                        }

                        // Extract category from found product
                        if (product?.category) {
                          const categoryId = typeof product.category === 'object' ? product.category._id?.toString() : product.category?.toString();
                          categoryName = categoryMap[categoryId] || 'Uncategorized';
                        }
                      }

                      // Accumulate sales by category
                      if (categoryName && categoryName !== 'Uncategorized') {
                        categorySales[categoryName] = (categorySales[categoryName] || 0) + (item.price * item.quantity);
                      } else if (categoryName === 'Uncategorized') {
                        categorySales['Uncategorized'] = (categorySales['Uncategorized'] || 0) + (item.price * item.quantity);
                      }
                    });
                  });

                  const categoryData = Object.entries(categorySales)
                    .map(([category, revenue]) => ({
                      category,
                      revenue: Math.round(revenue)
                    }))
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 8);

                  // Color palette for different categories
                  const colors = [
                    'hsl(var(--chart-1))',
                    'hsl(var(--chart-2))',
                    'hsl(var(--chart-3))',
                    'hsl(var(--chart-4))',
                    'hsl(var(--chart-5))',
                    'hsl(142 71% 45%)',   // green
                    'hsl(262 80% 50%)',   // purple
                    'hsl(39 100% 50%)'    // orange
                  ];

                  const chartConfig = {
                    revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
                  };

                  return categoryData.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[300px] w-full">
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis
                          dataKey="category"
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis
                          className="text-xs"
                          tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        />
                        <ChartTooltip
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                  <div className="flex flex-col">
                                    <span className="text-[0.70rem] uppercase text-muted-foreground">{payload[0].payload.category}</span>
                                    <span className="font-bold text-foreground">₹{payload[0].value}</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No sales data available
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Best Selling Products */}
            <div className="bg-card border border-border rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3">Best Selling Products</h3>
              <div className="space-y-2">
                {(() => {
                  const productSales: Record<string, { name: string; count: number; revenue: number }> = {};
                  orders.forEach(order => {
                    order.items?.forEach((item: any) => {
                      const productName = item.productName || item.product?.name;
                      if (!productSales[productName]) {
                        productSales[productName] = { name: productName, count: 0, revenue: 0 };
                      }
                      productSales[productName].count += item.quantity;
                      productSales[productName].revenue += item.price * item.quantity;
                    });
                  });
                  return Object.values(productSales)
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5)
                    .map((p, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.count} units sold</p>
                        </div>
                        <p className="font-semibold text-primary">₹{p.revenue.toFixed(0)}</p>
                      </div>
                    ));
                })()}
                {orders.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No sales data yet</p>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Recent Orders</h3>
              <div className="space-y-2">
                {orders.slice(0, 5).map((order) => {
                  const isExpanded = expandedOrders.has(order._id);
                  return (
                    <div key={order._id} className="border-b border-border last:border-0 pb-2">
                      <div 
                        className="flex items-center justify-between py-2 cursor-pointer hover:bg-accent/50 rounded px-2 -mx-2"
                        onClick={() => toggleOrderExpand(order._id)}
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{order.customerName}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">₹{order.total}</p>
                          <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                      {isExpanded && order.items && (
                        <div className="mt-2 ml-2 space-y-2">
                          {order.items.map((item: any) => {
                            const productImage = item.product?.imageUrl || item.product?.image || item.imageUrl;
                            return (
                            <div key={item._id || item.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent/50 transition-colors">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden bg-muted border border-border">
                                {productImage ? (
                                  <img
                                    src={productImage}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    <ImageOff className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    item.product?._id && navigate(`/product/${item.product._id}`);
                                  }}
                                  className="text-xs font-medium text-foreground hover:text-primary transition-colors text-left w-full truncate block"
                                  disabled={!item.product?._id}
                                >
                                  {item.productName || item.product?.name || 'Product'}
                                </button>
                                <p className="text-xs text-muted-foreground">₹{item.price} × {item.quantity}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-xs font-semibold text-foreground">₹{(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {orders.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-foreground">Manage Products</h2>
              <Dialog open={productDialog} onOpenChange={(open) => { setProductDialog(open); if (!open) resetProductForm(); }}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Name</Label>
                      <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={2} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label>Price (₹)</Label>
                        <Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} />
                      </div>
                      <div>
                        <Label>MRP (₹)</Label>
                        <Input type="number" value={productForm.mrp} onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })} />
                      </div>
                    </div>
                    {productForm.price && productForm.mrp && parseFloat(productForm.mrp) > parseFloat(productForm.price) && (
                      <div className="bg-primary/8 border border-primary/20 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-primary">Discount:</span>
                          <Badge className="bg-primary text-white font-bold">
                            {Math.round(((parseFloat(productForm.mrp) - parseFloat(productForm.price)) / parseFloat(productForm.mrp)) * 100)}% OFF
                          </Badge>
                        </div>
                        <div className="text-xs text-primary/70 mt-1">
                          Customer saves ₹{(parseFloat(productForm.mrp) - parseFloat(productForm.price)).toFixed(2)}
                        </div>
                      </div>
                    )}
                    <div>
                      <Label>Image URL (Optional)</Label>
                      <Input value={productForm.image_url} onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })} placeholder="https://..." />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty to auto-generate image from product name using AI
                      </p>
                    </div>
                    <div>
                      <Label>Category</Label>
                      <Select value={productForm.category_id} onValueChange={(v) => setProductForm({ ...productForm, category_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id || c._id} value={c.id || c._id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Unit</Label>
                      <Input value={productForm.unit} onChange={(e) => setProductForm({ ...productForm, unit: e.target.value })} placeholder="1 kg, 500 ml, etc." />
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Switch checked={productForm.in_stock} onCheckedChange={(v) => setProductForm({ ...productForm, in_stock: v })} />
                        <Label>In Stock</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={productForm.featured} onCheckedChange={(v) => setProductForm({ ...productForm, featured: v })} />
                        <Label>Featured</Label>
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleSaveProduct} disabled={!productForm.name || !productForm.price}>
                      {editingProduct ? "Update Product" : "Add Product"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 text-muted-foreground font-medium">Product</th>
                      <th className="text-left p-3 text-muted-foreground font-medium">Category</th>
                      <th className="text-right p-3 text-muted-foreground font-medium">Price</th>
                      <th className="text-center p-3 text-muted-foreground font-medium">Status</th>
                      <th className="text-right p-3 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id || p._id} className="border-t border-border">
                        <td className="p-3 text-foreground">{p.name}</td>
                        <td className="p-3 text-muted-foreground">{p.category?.name || "—"}</td>
                        <td className="p-3 text-right text-foreground">₹{p.price}</td>
                        <td className="p-3 text-center">
                          <Badge variant={(p.inStock ?? p.in_stock) ? "default" : "destructive"} className="text-xs">
                            {(p.inStock ?? p.in_stock) ? "In Stock" : "Out"}
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <Button variant="ghost" size="sm" onClick={() => {
                            setEditingProduct(p);
                            setProductForm({
                              name: p.name, description: p.description || "", price: String(p.price),
                              mrp: p.mrp ? String(p.mrp) : "", image_url: p.imageUrl || p.image_url || "",
                              category_id: p.category?._id || p.category?.id || p.category_id || "", unit: p.unit || "1 pc",
                              in_stock: p.inStock ?? p.in_stock ?? true, featured: p.featured ?? false,
                            });
                            setProductDialog(true);
                          }}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteProductId(p.id || p._id)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No products yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-foreground">Manage Categories</h2>
              <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
                <DialogTrigger asChild>
                  <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Category</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
                  <div className="space-y-3">
                    <div>
                      <Label>Name</Label>
                      <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Slug</Label>
                      <Input value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })} placeholder="e.g. groceries" />
                    </div>
                    <div>
                      <Label>Image URL (Optional)</Label>
                      <Input value={categoryForm.imageUrl} onChange={(e) => setCategoryForm({ ...categoryForm, imageUrl: e.target.value })} placeholder="https://..." />
                      <p className="text-xs text-muted-foreground mt-1">
                        Leave empty to auto-generate image from category name using AI
                      </p>
                    </div>
                    <Button className="w-full" onClick={handleSaveCategory} disabled={!categoryForm.name || !categoryForm.slug}>
                      Add Category
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-3">
              {categories.map((c) => (
                <div key={c.id || c._id} className="bg-card border border-border rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.slug}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingCategory(c);
                      setEditCategoryForm({ name: c.name, slug: c.slug, icon: c.icon || "", imageUrl: c.imageUrl || "" });
                      setEditCategoryDialog(true);
                    }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteCategoryId(c.id || c._id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No categories yet</p>
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="mb-4">
              <div className="flex items-center gap-3 mb-4">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-foreground">Customer Orders</h2>
                {orders.length > 0 && (
                  <span className="ml-auto text-sm text-muted-foreground">
                    {orders.length} total
                  </span>
                )}
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    className="pl-9"
                    placeholder="Search by customer, phone or product..."
                    value={orderFilter.search}
                    onChange={(e) => setOrderFilter({ ...orderFilter, search: e.target.value })}
                  />
                </div>
                <Select value={orderFilter.status} onValueChange={(v) => setOrderFilter({ ...orderFilter, status: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={orderFilter.sortBy} onValueChange={(v) => setOrderFilter({ ...orderFilter, sortBy: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date-desc">Latest First</SelectItem>
                    <SelectItem value="date-asc">Oldest First</SelectItem>
                    <SelectItem value="amount-desc">Highest Amount</SelectItem>
                    <SelectItem value="amount-asc">Lowest Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-5">
              {(() => {
                let filtered = orders;

                if (orderFilter.status !== "all") {
                  filtered = filtered.filter((o) => o.status === orderFilter.status);
                }

                if (orderFilter.search) {
                  const search = orderFilter.search.toLowerCase();
                  filtered = filtered.filter(
                    (o) =>
                      (o.customerName || "").toLowerCase().includes(search) ||
                      (o.phone || "").includes(search) ||
                      o.items?.some((item: any) =>
                        (item.productName || item.product?.name || "").toLowerCase().includes(search)
                      )
                  );
                }

                filtered = [...filtered].sort((a, b) => {
                  switch (orderFilter.sortBy) {
                    case "date-desc":
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    case "date-asc":
                      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    case "amount-desc":
                      return Number(b.total) - Number(a.total);
                    case "amount-asc":
                      return Number(a.total) - Number(b.total);
                    default:
                      return 0;
                  }
                });

                if (filtered.length === 0) {
                  return (
                    <div className="text-center py-16 bg-card border border-border rounded-2xl">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="font-semibold text-foreground mb-1">No orders found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                  );
                }

                return filtered.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    variant="admin"
                    onStatusChange={handleUpdateOrderStatus}
                    onRefundMarked={(updatedOrder) => {
                      // Replace the order in local state so UI refreshes without a full reload
                      setOrders((prev) =>
                        prev.map((o) =>
                          o._id === updatedOrder._id ? updatedOrder : o
                        )
                      );
                    }}
                  />
                ));
              })()}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Product Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={(open) => !open && setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { if (deleteProductId) { handleDeleteProduct(deleteProductId); setDeleteProductId(null); } }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!deleteCategoryId} onOpenChange={(open) => !open && setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Products in this category will become uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => { if (deleteCategoryId) { handleDeleteCategory(deleteCategoryId); setDeleteCategoryId(null); } }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Category Dialog */}
      <Dialog open={editCategoryDialog} onOpenChange={(open) => { setEditCategoryDialog(open); if (!open) setEditingCategory(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Category</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Name</Label>
              <Input value={editCategoryForm.name} onChange={(e) => setEditCategoryForm({ ...editCategoryForm, name: e.target.value })} />
            </div>
            <div>
              <Label>Slug</Label>
              <Input value={editCategoryForm.slug} onChange={(e) => setEditCategoryForm({ ...editCategoryForm, slug: e.target.value })} placeholder="e.g. groceries" />
            </div>
            <Button className="w-full" onClick={handleUpdateCategory} disabled={!editCategoryForm.name || !editCategoryForm.slug}>
              Update Category
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default AdminDashboard;
