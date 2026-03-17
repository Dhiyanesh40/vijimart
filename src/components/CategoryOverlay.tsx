import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, ChevronRight, ShoppingCart, Cookie, Coffee, Home, Sparkles, Milk, Apple, Leaf, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { categoriesAPI } from "@/services/api";

interface CategoryOverlayProps {
  open: boolean;
  onClose: () => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  groceries:       <ShoppingCart className="h-8 w-8" />,
  snacks:          <Cookie className="h-8 w-8" />,
  beverages:       <Coffee className="h-8 w-8" />,
  household:       <Home className="h-8 w-8" />,
  "personal-care": <Sparkles className="h-8 w-8" />,
  dairy:           <Milk className="h-8 w-8" />,
  fruits:          <Apple className="h-8 w-8" />,
  vegetables:      <Leaf className="h-8 w-8" />,
};

const getCategoryIcon = (slug: string): React.ReactNode =>
  CATEGORY_ICONS[slug] ?? <Package className="h-8 w-8" />;

const CategoryOverlay: React.FC<CategoryOverlayProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoriesAPI.getAll();
        const data = response.data || response;
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryClick = (slug: string) => {
    navigate(`/products?category=${slug}`);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-background animate-fade-in overflow-auto">
      <div className="container mx-auto px-6 py-8 min-h-screen">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Shop by Category</h2>
            <p className="text-muted-foreground mt-2">Discover our wide range of quality products</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-xl hover:bg-muted h-12 w-12"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {/* All Products */}
          <button
            onClick={() => {
              navigate("/products");
              onClose();
            }}
            className="bg-gradient-to-br from-primary/5 to-primary/10 border-2 border-primary/20 rounded-2xl p-8 hover:border-primary hover:shadow-strong transition-all text-left group hover:scale-[1.02] duration-300"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <ShoppingCart className="h-8 w-8" />
              </div>
              <ChevronRight className="h-6 w-6 text-primary group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="font-display font-bold text-foreground text-xl mb-2">All Products</h3>
            <p className="text-sm text-muted-foreground">Browse everything we offer</p>
          </button>

          {/* Categories */}
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.slug)}
              className="bg-card border-2 border-border rounded-2xl p-8 hover:border-primary hover:shadow-strong transition-all text-left group hover:scale-[1.02] duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {getCategoryIcon(category.slug)}
                </div>
                <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-display font-bold text-foreground text-xl mb-2">{category.name}</h3>
              <p className="text-sm text-muted-foreground">Explore {category.name.toLowerCase()}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryOverlay;
