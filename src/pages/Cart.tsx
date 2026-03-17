import React from "react";
import { useNavigate } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, loading, cartTotal, updateQuantity, removeItem } = useCart();

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Your Cart</h1>
          <p className="text-muted-foreground mb-6">Please login to view your cart</p>
          <Button onClick={() => navigate("/auth")}>Login</Button>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted h-24 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">Shopping Cart</h1>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg mb-4">Your cart is empty</p>
            <Button onClick={() => navigate("/products")}>Start Shopping</Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              {items.map((item) => (
                <div key={item.id || item._id} className="bg-card border border-border rounded-lg p-4 flex items-center gap-4">
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
            </div>

            {/* Order Summary */}
            <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-20">
              <h3 className="font-semibold text-foreground mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery</span>
                  <span className="text-primary font-medium">Free</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground text-base">
                  <span>Total</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full mt-4" size="lg" onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Cart;
