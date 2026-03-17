import { useState, useEffect, useCallback } from "react";
import { cartAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface CartItem {
  _id?: string;
  id?: string;
  product: {
    _id: string;
    id?: string;
    name: string;
    price: number;
    mrp?: number;
    imageUrl?: string;
    image_url?: string;
    unit?: string;
  };
  quantity: number;
}

export const useCart = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true); // Start as true to prevent premature redirects

  const fetchCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await cartAPI.get();
      const data = response.data || response;
      setItems(data.items || data || []);
    } catch (error: any) {
      console.error('Error fetching cart:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!user) {
      toast({ title: "Please login", description: "You need to login to add items to cart", variant: "destructive" });
      return;
    }

    try {
      await cartAPI.add({ productId, quantity });
      await fetchCart();
      toast({ title: "Added to cart" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to add item to cart", 
        variant: "destructive" 
      });
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    try {
      await cartAPI.update({ productId, quantity });
      await fetchCart();
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to update quantity", 
        variant: "destructive" 
      });
    }
  };

  const removeItem = async (productId: string) => {
    try {
      await cartAPI.remove(productId);
      await fetchCart();
      toast({ title: "Removed from cart" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to remove item", 
        variant: "destructive" 
      });
    }
  };

  const clearCart = async () => {
    if (!user) return;
    
    try {
      await cartAPI.clear();
      await fetchCart();
      toast({ title: "Cart cleared" });
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to clear cart", 
        variant: "destructive" 
      });
    }
  };

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + (i.product?.price ?? 0) * i.quantity, 0);

  return { items, loading, cartCount, cartTotal, addToCart, updateQuantity, removeItem, clearCart, fetchCart };
};
