import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/hooks/useCart';
import Layout from '@/components/layout/Layout';
import { Bot, Wallet, Users, CalendarDays, Leaf, Sparkles, ShoppingCart } from 'lucide-react';

const AIGroceryPlanner = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Form state
  const [budget, setBudget] = useState(5000);
  const [householdSize, setHouseholdSize] = useState(1);
  const [shoppingDays, setShoppingDays] = useState(7);
  const [preferences, setPreferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // Results state
  const [groceryList, setGroceryList] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    if (isAdmin) {
      navigate('/admin');
      return;
    }
    loadUserPreferences();
  }, [user, isAdmin, authLoading, navigate]);

  const loadUserPreferences = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/ai/grocery-planner/preferences`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        const { budget: userBudget, preferences: userPrefs, householdSize: userHousehold, defaultShoppingDays } = response.data.data;
        setBudget(userBudget || 5000);
        setPreferences(userPrefs || []);
        setHouseholdSize(userHousehold || 1);
        setShoppingDays(defaultShoppingDays || 7);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const savePreferences = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.put(
        `${import.meta.env.VITE_API_URL}/ai/grocery-planner/preferences`,
        {
          budget,
          preferences,
          householdSize,
          defaultShoppingDays: shoppingDays
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      toast.success('Preferences saved successfully!');
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('Failed to save preferences');
    } finally {
      setLoading(false);
    }
  };

  const generateGroceryList = async () => {
    try {
      setGenerating(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/ai/grocery-planner/generate`,
        {
          budget,
          preferences,
          householdSize,
          daysToShop: shoppingDays
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setGroceryList(response.data.data);
        toast.success('AI-powered grocery list generated!');
      }
    } catch (error) {
      console.error('Error generating list:', error);
      toast.error('Failed to generate grocery list');
    } finally {
      setGenerating(false);
    }
  };

  const togglePreference = (pref) => {
    setPreferences(prev =>
      prev.includes(pref)
        ? prev.filter(p => p !== pref)
        : [...prev, pref]
    );
  };

  const addAllToCart = async () => {
    if (!groceryList?.groceryList) return;

    try {
      let addedCount = 0;

      // Add items sequentially with delay to avoid overwhelming the server
      for (const item of groceryList.groceryList) {
        if (item.productId) {
          try {
            await addToCart(item.productId, item.quantity || 1);
            addedCount++;
            // Small delay between requests to prevent server overload
            await new Promise(resolve => setTimeout(resolve, 100));
          } catch (err) {
            console.error(`Failed to add ${item.name}:`, err);
          }
        }
      }

      toast.success(`${addedCount} items added to cart!`);
      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add items to cart');
    }
  };

  return (
    <Layout>
    <div className="min-h-screen bg-background py-10">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground mb-4 flex items-center justify-center gap-3">
            <Bot className="h-10 w-10 text-primary" /> AI Smart Grocery Planner
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Let AI optimize your grocery shopping based on your budget, household size, and dietary preferences.
            Save money and reduce waste!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Configuration Panel */}
          <div className="space-y-6">
            {/* Budget */}
            <Card className="p-6 shadow-soft">
              <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" /> Budget
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Total Budget</span>
                  <span className="text-2xl font-bold text-primary">₹{budget}</span>
                </div>
                <Slider
                  value={[budget]}
                  onValueChange={(val) => setBudget(val[0])}
                  min={500}
                  max={20000}
                  step={100}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                   <span>₹500</span>
                   <span>₹20,000</span>
                </div>
              </div>
            </Card>

            {/* Household */}
            <Card className="p-6 shadow-soft">
              <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Household Size
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Number of People</span>
                  <span className="text-2xl font-bold text-primary">{householdSize}</span>
                </div>
                <Slider
                  value={[householdSize]}
                  onValueChange={(val) => setHouseholdSize(val[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                   <span>1 person</span>
                   <span>10 people</span>
                </div>
              </div>
            </Card>

            {/* Shopping Duration */}
            <Card className="p-6 shadow-soft">
              <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" /> Days to Shop For
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Number of Days</span>
                  <span className="text-2xl font-bold text-primary">{shoppingDays} days</span>
                </div>
                <Slider
                  value={[shoppingDays]}
                  onValueChange={(val) => setShoppingDays(val[0])}
                  min={1}
                  max={30}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                   <span>1 day</span>
                   <span>30 days</span>
                </div>
              </div>
            </Card>

            {/* Dietary Preferences */}
            <Card className="p-6 shadow-soft">
              <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                <Leaf className="h-5 w-5 text-primary" /> Dietary Preferences
              </h3>
              <div className="space-y-3">
                {['vegetarian', 'vegan', 'gluten-free', 'dairy-free'].map((pref) => (
                  <div key={pref} className="flex items-center space-x-3">
                    <Checkbox
                      id={pref}
                      checked={preferences.includes(pref)}
                      onCheckedChange={() => togglePreference(pref)}
                    />
                    <label
                      htmlFor={pref}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                    >
                      {pref.replace('-', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={savePreferences}
                variant="outline"
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </Button>
              <Button
                onClick={generateGroceryList}
                className="flex-1 bg-gradient-to-r from-primary to-primary/80"
                disabled={generating}
              >
                {generating ? (
                  <><Bot className="h-4 w-4 animate-spin" /> Generating...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Generate Smart List</>
                )}
              </Button>
            </div>
          </div>

          {/* Right: Results Panel */}
          <div>
            {!groceryList ? (
              <Card className="p-12 text-center shadow-soft">
                <div className="flex justify-center mb-4">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-display font-bold mb-2">Ready to Plan?</h3>
                  <p className="text-muted-foreground">
                  Configure your preferences and click "Generate Smart List" to get your AI-optimized grocery list!
                </p>
              </Card>
            ) : (
              <div className="space-y-6">
                {/* Budget Overview */}
                <Card className="p-6 bg-gradient-to-r from-primary/8 to-accent/8 shadow-soft">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Budget</div>
                      <div className="text-xl font-bold">₹{groceryList.budgetUtilization.spent}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Remaining</div>
                      <div className="text-xl font-bold text-green-600">₹{groceryList.budgetUtilization.remaining}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Savings</div>
                      <div className="text-xl font-bold text-primary">₹{groceryList.savings.amount}</div>
                    </div>
                  </div>
                </Card>

                {/* Insights */}
                {groceryList.insights && groceryList.insights.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {groceryList.insights.map((insight, idx) => (
                      <Card key={idx} className="p-4 shadow-soft">
                        <div className="text-2xl mb-2">{insight.icon}</div>
                        <div className="text-xs text-muted-foreground mb-1">{insight.type}</div>
                        <div className="text-sm font-semibold">{insight.message}</div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Grocery List */}
                <Card className="p-6 shadow-soft">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-display font-bold">
                      Your Smart List ({groceryList.groceryList.length} items)
                    </h3>
                    <Button onClick={addAllToCart} size="sm">
                      Add All to Cart
                    </Button>
                  </div>
                  
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {groceryList.groceryList.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/70 transition"
                      >
                        <div>
                          <div className="font-semibold">{item.name}</div>
                           <div className="text-sm text-muted-foreground">
                             Qty: {item.quantity} • ₹{item.price} each
                           </div>
                          {item.recommendation && (
                            <Badge variant="secondary" className="mt-1 text-xs">
                              {item.recommendation}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">₹{item.totalPrice}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Nutrition Balance */}
                {groceryList.nutritionBalance && (
                  <Card className="p-6 shadow-soft">
                    <h3 className="text-lg font-display font-bold mb-3">Nutrition Balance</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold text-primary">
                        {groceryList.nutritionBalance.score}/100
                      </div>
                      <div className="flex-1 text-sm text-muted-foreground">
                        {groceryList.nutritionBalance.message}
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </Layout>
  );
};

export default AIGroceryPlanner;
