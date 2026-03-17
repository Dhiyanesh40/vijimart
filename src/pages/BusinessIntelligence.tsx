import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/layout/Layout';
import {
  BarChart2, AlertTriangle, Bot, Download,
  TrendingUp, TrendingDown, Minus,
  Crown, PieChart, Clock
} from 'lucide-react';

const BusinessIntelligence = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [dateRange, setDateRange] = useState(30);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!isAdmin) {
      navigate('/');
      return;
    }
    loadBusinessReport();
  }, [user, isAdmin, authLoading, navigate, dateRange]);

  const loadBusinessReport = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/ai/business-intelligence?days=${dateRange}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setReport(response.data.data);
      }
    } catch (error) {
      console.error('Error loading report:', error);
      toast.error('Failed to load business intelligence report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (type) => {
    try {
      const token = localStorage.getItem('token');
      let url = '';
      
      if (type === 'sales') {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        url = `${import.meta.env.VITE_API_URL}/ai/reports/sales?startDate=${startDate}&endDate=${endDate}`;
      } else if (type === 'inventory') {
        url = `${import.meta.env.VITE_API_URL}/ai/reports/inventory`;
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Convert to JSON and download
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url2 = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url2;
      link.download = `${type}-report-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      
      toast.success(`${type} report downloaded!`);
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('Failed to download report');
    }
  };

  if (loading) {
    return (
      <Layout>
      <div className="min-h-screen bg-background py-10 flex items-center justify-center">
        <div className="text-center">
          <BarChart2 className="h-12 w-12 text-primary mx-auto mb-4" />
          <div className="text-xl font-semibold">Loading Business Intelligence...</div>
        </div>
      </div>
      </Layout>
    );
  }

  if (!report) {
    return (
      <Layout>
      <div className="min-h-screen bg-background py-10 flex items-center justify-center">
        <Card className="p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
          <div className="text-xl font-semibold mb-2">No Data Available</div>
          <p className="text-muted-foreground">Unable to generate business intelligence report</p>
        </Card>
      </div>
      </Layout>
    );
  }

  return (
    <Layout>
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
              <BarChart2 className="h-9 w-9 text-primary" /> Business Intelligence
            </h1>
            <p className="text-muted-foreground">AI-powered insights and analytics</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setDateRange(7)}
              variant={dateRange === 7 ? 'default' : 'outline'}
              size="sm"
            >
              7 Days
            </Button>
            <Button
              onClick={() => setDateRange(30)}
              variant={dateRange === 30 ? 'default' : 'outline'}
              size="sm"
            >
              30 Days
            </Button>
            <Button
              onClick={() => setDateRange(90)}
              variant={dateRange === 90 ? 'default' : 'outline'}
              size="sm"
            >
              90 Days
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary/8 to-primary/15 shadow-soft">
            <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-primary">₹{report.sales.totalRevenue}</div>
            <div className="text-xs text-muted-foreground mt-2">
              Growth: {report.sales.growthRate > 0 ? '+' : ''}{report.sales.growthRate}%
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/8 to-blue-500/15 shadow-soft">
            <div className="text-sm text-muted-foreground mb-1">Total Orders</div>
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{report.sales.totalOrders}</div>
            <div className="text-xs text-muted-foreground mt-2">
              Avg: ₹{report.sales.avgOrderValue}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-violet-500/8 to-violet-500/15 shadow-soft">
            <div className="text-sm text-muted-foreground mb-1">Active Customers</div>
            <div className="text-3xl font-bold text-violet-600 dark:text-violet-400">{report.customers.activeCustomers}</div>
            <div className="text-xs text-muted-foreground mt-2">
              Repeat: {report.customers.repeatRate}%
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-accent/8 to-accent/15 shadow-soft">
            <div className="text-sm text-muted-foreground mb-1">Products</div>
            <div className="text-3xl font-bold text-accent">{report.inventory.totalProducts}</div>
            <div className="text-xs text-muted-foreground mt-2">
              Low stock: {report.inventory.lowStockCount}
            </div>
          </Card>
        </div>

        {/* AI Recommendations */}
        {report.recommendations && report.recommendations.length > 0 && (
          <Card className="p-6 mb-8 shadow-soft">
            <h2 className="text-2xl font-display font-bold mb-4 flex items-center gap-2">
              <Bot className="h-6 w-6 text-primary" /> AI Recommendations
            </h2>
            <div className="space-y-3">
              {report.recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-lg border-l-4 ${
                    rec.priority === 'critical'
                      ? 'bg-destructive/8 border-destructive'
                      : rec.priority === 'high'
                      ? 'bg-accent/8 border-accent'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-500/8 border-yellow-500'
                      : 'bg-blue-500/8 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 text-muted-foreground">{rec.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{rec.title}</h3>
                        <Badge
                          variant={rec.priority === 'critical' ? 'destructive' : 'secondary'}
                          className="text-xs"
                        >
                          {rec.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-foreground mb-1">{rec.message}</p>
                      <p className="text-xs text-muted-foreground italic">{rec.action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Detailed Tabs */}
        <Tabs defaultValue="sales" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales">Sales</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          {/* Sales Tab */}
          <TabsContent value="sales">
            <Card className="p-6 shadow-soft">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-display font-bold">Sales Performance</h3>
                <Button size="sm" onClick={() => downloadReport('sales')} className="flex items-center gap-1.5">
                  <Download className="h-4 w-4" /> Download Report
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Order Status</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Completed:</span>
                      <span className="font-bold">{report.sales.completedOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pending:</span>
                      <span className="font-bold">{report.sales.pendingOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Conversion Rate:</span>
                      <span className="font-bold text-primary">{report.sales.conversionRate}%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Predictions</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Next Week Orders:</span>
                      <span className="font-bold">{report.predictions.nextWeek.expectedOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expected Revenue:</span>
                      <span className="font-bold">₹{report.predictions.nextWeek.expectedRevenue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Trend:</span>
                      <Badge variant={
                        report.predictions.trend === 'up' ? 'default' :
                        report.predictions.trend === 'down' ? 'destructive' : 'secondary'
                      } className="flex items-center gap-1">
                        {report.predictions.trend === 'up' ? <TrendingUp className="h-3 w-3" /> : report.predictions.trend === 'down' ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />} {report.predictions.trend}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card className="p-6 shadow-soft">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-display font-bold">Inventory Management</h3>
                <Button size="sm" onClick={() => downloadReport('inventory')} className="flex items-center gap-1.5">
                  <Download className="h-4 w-4" /> Download Report
                </Button>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-destructive flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> Low Stock Products
                  </h4>
                  <div className="space-y-2">
                    {report.inventory.lowStockProducts.map((product, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-destructive/8 rounded">
                        <span className="text-sm">{product.name}</span>
                        <Badge variant="destructive">{product.stock} left</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 text-primary flex items-center gap-1.5">
                    <TrendingUp className="h-4 w-4" /> Fast-Moving Products
                  </h4>
                  <div className="space-y-2">
                    {report.inventory.fastMoving.map((product, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-primary/8 rounded">
                        <span className="text-sm">{product.name}</span>
                        <Badge variant="default">{product.sales} sold</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="p-6 shadow-soft">
              <h3 className="text-xl font-display font-bold mb-4">Customer Analytics</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-muted-foreground mb-3">Customer Metrics</div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted rounded">
                      <span>Total Customers</span>
                      <span className="font-bold text-xl">{report.customers.totalCustomers}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded">
                      <span>Repeat Customers</span>
                      <span className="font-bold text-xl">{report.customers.repeatCustomers}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-muted rounded">
                      <span>Avg Lifetime Value</span>
                      <span className="font-bold text-xl">₹{report.customers.avgLifetimeValue}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-1.5">
                    <Crown className="h-4 w-4 text-yellow-500" /> Top Customers
                  </h4>
                  <div className="space-y-2">
                    {report.customers.topCustomers.map((customer, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-violet-500/8 rounded">
                        <span className="text-sm">Customer #{idx + 1}</span>
                        <div className="text-right">
                          <div className="font-bold">₹{customer.value}</div>
                          <div className="text-xs text-muted-foreground">{customer.orders} orders</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Trends Tab */}
          <TabsContent value="trends">
            <Card className="p-6 shadow-soft">
              <h3 className="text-xl font-display font-bold mb-4">Market Trends</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-1.5">
                    <PieChart className="h-4 w-4 text-primary" /> Top Categories
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {report.trends.topCategories.map((cat, idx) => (
                      <div key={idx} className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary">{cat.count}</div>
                        <div className="text-sm text-foreground">{cat.category}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-muted-foreground" /> Order Distribution
                  </h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 bg-yellow-500/8 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{report.trends.orderDistribution.morning}</div>
                      <div className="text-sm text-foreground">Morning (6-12)</div>
                    </div>
                    <div className="p-4 bg-accent/8 rounded-lg text-center">
                      <div className="text-2xl font-bold text-accent">{report.trends.orderDistribution.afternoon}</div>
                      <div className="text-sm text-foreground">Afternoon (12-18)</div>
                    </div>
                    <div className="p-4 bg-blue-500/8 rounded-lg text-center">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{report.trends.orderDistribution.evening}</div>
                      <div className="text-sm text-foreground">Evening (18-24)</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </Layout>
  );
};

export default BusinessIntelligence;
