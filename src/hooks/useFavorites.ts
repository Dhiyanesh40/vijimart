import { useState, useEffect, useCallback } from "react";
import { favoritesAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }
    
    try {
      const response = await favoritesAPI.getAll();
      const data = response.data || response;
      const favArray = Array.isArray(data) ? data : [];
      setFavorites(favArray.map((f: any) => f.product?._id || f.product));
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
      setFavorites([]);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const toggleFavorite = async (productId: string) => {
    if (!user) {
      toast({ 
        title: "Login required", 
        description: "Please login to add favorites", 
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    const isFavorite = favorites.includes(productId);

    try {
      if (isFavorite) {
        // Remove from favorites
        await favoritesAPI.remove(productId);
        setFavorites(favorites.filter(id => id !== productId));
        toast({ title: "Removed from favorites" });
      } else {
        // Add to favorites
        await favoritesAPI.add(productId);
        setFavorites([...favorites, productId]);
        toast({ title: "Added to favorites" });
      }
    } catch (error: any) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to update favorites", 
        variant: "destructive" 
      });
    }

    setLoading(false);
  };

  const isFavorite = (productId: string) => favorites.includes(productId);

  return { favorites, loading, toggleFavorite, isFavorite };
};
