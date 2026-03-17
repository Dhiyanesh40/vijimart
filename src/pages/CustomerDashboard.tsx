import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, MapPin, ShoppingBag, Heart, LogOut, Trash2, Package, Minus, Plus, Settings, ShoppingCart } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/contexts/AuthContext";
import { ordersAPI, favoritesAPI, authAPI } from "@/services/api";
import { useCart } from "@/hooks/useCart";
import { useOrderUpdates, useProductUpdates, useCartUpdates } from "@/hooks/useRealTimeUpdates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { OrderCard } from "@/components/orders/OrderCard";

const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAdmin, signOut, updateProfile, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { items: cartItems, loading: cartLoading, cartTotal, updateQuantity, removeItem, addToCart } = useCart();
  
  // Enable real-time updates for orders, products, and cart
  useOrderUpdates();
  useProductUpdates();
  useCartUpdates();
  
  // Get active tab from URL or default to 'profile'
  const activeTab = searchParams.get('tab') || 'profile';

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };
  
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    phone: "",
    address: "",
  });
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    if (isAdmin) {
      navigate("/admin");
      return;
    }
    
    fetchData();
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        fullName: user.fullName || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      const [ordersResponse, favoritesResponse] = await Promise.all([
        ordersAPI.getAll(),
        favoritesAPI.getAll(),
      ]);
      const ordersData = ordersResponse.data || ordersResponse;
      const favoritesData = favoritesResponse.data || favoritesResponse;

      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setFavorites(Array.isArray(favoritesData) ? favoritesData : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setOrders([]);
      setFavorites([]);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    const { error } = await updateProfile(profileForm);
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Profile updated successfully!" });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await authAPI.deleteAccount();
      await signOut();
      navigate('/');
      toast({ title: "Account Deleted", description: "Your account has been deleted successfully." });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to delete account", 
        variant: "destructive" 
      });
    }
  };

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      await favoritesAPI.remove(favoriteId);
      await fetchData();
      toast({ title: "Removed", description: "Item removed from favorites" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to remove favorite", 
        variant: "destructive" 
      });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await ordersAPI.cancel(orderId);
      toast({ title: "Order cancelled successfully", description: "Your order has been cancelled" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Cannot Cancel Order", description: error.response?.data?.message || "Failed to cancel order", variant: "destructive" });
    }
  };

  const handleReturnOrder = async (orderId: string) => {
    try {
      await ordersAPI.return(orderId);
      toast({ title: "Return request submitted", description: "Your return request has been submitted successfully" });
      fetchData();
    } catch (error: any) {
      toast({ title: "Cannot Return Order", description: error.response?.data?.message || "Failed to submit return request", variant: "destructive" });
    }
  };

  if (authLoading || !user || isAdmin) return null;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome, {user.fullName || "User"}!
          </h1>
          <p className="text-muted-foreground">Manage your profile, orders, and favorites</p>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="cart">
              <ShoppingBag className="h-4 w-4 mr-2" />
              Cart
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="favorites">
              <Heart className="h-4 w-4 mr-2" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  {editMode ? "Update your personal details" : "View your profile information"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={profileForm.fullName}
                    onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled className="bg-muted" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    placeholder="Enter your phone number"
                    disabled={!editMode}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Delivery Address</Label>
                  <Textarea
                    id="address"
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    rows={3}
                    placeholder="Enter your full delivery address"
                    disabled={!editMode}
                  />
                </div>
                <div className="flex gap-2">
                  {editMode ? (
                    <>
                      <Button onClick={handleUpdateProfile} disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                      </Button>
                      <Button variant="outline" onClick={() => setEditMode(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setEditMode(true)}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cart Tab */}
          <TabsContent value="cart">
            <Card>
              <CardHeader>
                <CardTitle>Shopping Cart</CardTitle>
                <CardDescription>Review and manage items in your cart</CardDescription>
              </CardHeader>
              <CardContent>
                {cartLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="bg-muted h-24 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">Your cart is empty</p>
                    <Button variant="outline" className="mt-4" onClick={() => navigate("/products")}>
                      Start Shopping
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item: any) => (
                      <div key={item.id || item._id} className="bg-background border border-border rounded-lg p-4 flex items-center gap-4">
                        <div 
                          className="h-16 w-16 bg-muted rounded flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            const productId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
                            navigate(`/product/${productId}`);
                          }}
                        >
                          {item.product?.imageUrl || item.product?.image_url ? (
                            <img src={item.product.imageUrl || item.product.image_url} alt={item.product.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="text-xs text-muted-foreground">No img</span>
                          )}
                        </div>
                        <div 
                          className="flex-1 min-w-0 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => {
                            const productId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
                            navigate(`/product/${productId}`);
                          }}
                        >
                          <h3 className="font-medium text-foreground text-sm truncate">{item.product?.name}</h3>
                          <p className="text-xs text-muted-foreground">{item.product?.unit || "1 pc"}</p>
                          <p className="font-semibold text-foreground mt-1">₹{item.product?.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                            const productId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
                            updateQuantity(productId, item.quantity - 1);
                          }}>
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => {
                            const productId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
                            updateQuantity(productId, item.quantity + 1);
                          }}>
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">₹{((item.product?.price ?? 0) * item.quantity).toFixed(2)}</p>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive mt-1" onClick={() => {
                            const productId = typeof item.product === 'string' ? item.product : (item.product?._id || item.product?.id);
                            removeItem(productId);
                          }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    <div className="border-t border-border pt-4 flex items-center justify-between">
                      <div>
                        <p className="text-lg font-bold text-foreground">Total: ₹{cartTotal.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{cartItems.reduce((s: number, i: any) => s + i.quantity, 0)} items</p>
                      </div>
                      <Button size="lg" onClick={() => navigate("/checkout")}>
                        Proceed to Checkout
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="mb-4 flex items-center gap-3">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Order History</h2>
              {orders.length > 0 && (
                <span className="ml-auto text-sm text-muted-foreground">
                  {orders.length} order{orders.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
            {orders.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">No orders yet</h3>
                <p className="text-muted-foreground text-sm mb-5">
                  Start shopping to see your orders here
                </p>
                <Button onClick={() => navigate("/products")}>Browse Products</Button>
              </div>
            ) : (
              <div className="space-y-5">
                {orders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    variant="customer"
                    onCancel={handleCancelOrder}
                    onReturn={handleReturnOrder}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Items</CardTitle>
                <CardDescription>Your saved products</CardDescription>
              </CardHeader>
              <CardContent>
                {favorites.length === 0 ? (
                  <div className="text-center py-8">
                    <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No favorites yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {favorites.map((fav) => (
                      <div key={fav.id || fav._id} className="border border-border rounded-lg p-4 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => handleRemoveFavorite(fav.product?._id || fav.product?.id || fav.product)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        {fav.product?.imageUrl && (
                          <img
                            src={fav.product.imageUrl}
                            alt={fav.product.name || "Product"}
                            className="w-full h-32 object-cover rounded mb-3"
                          />
                        )}
                        <h3 className="font-medium text-foreground">{fav.product?.name || "Unknown Product"}</h3>
                        <p className="text-sm text-primary font-semibold mt-1">
                          ₹{fav.product?.price || 0}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              const productId = fav.product?._id || fav.product?.id || fav.product;
                              navigate(`/product/${productId}`);
                            }}
                          >
                            View Product
                          </Button>
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              const productId = fav.product?._id || fav.product?.id || fav.product;
                              if (productId) addToCart(String(productId));
                            }}
                          >
                            <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                            Add to Cart
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground mb-2">Sign Out</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Sign out of your account on this device
                  </p>
                  <Button variant="outline" onClick={signOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Permanently delete your account and all associated data
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account
                          and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount}>
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CustomerDashboard;
