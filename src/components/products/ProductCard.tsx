import React, { useState } from "react";
import { ShoppingCart, Heart, ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useFavorites } from "@/hooks/useFavorites";
import { useAuth } from "@/contexts/AuthContext";
import AddToCartDialog from "./AddToCartDialog";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  mrp?: number | null;
  image_url?: string | null;
  imageUrl?: string | null;
  unit?: string | null;
  inStock?: boolean;
  featured?: boolean;
  onAddToCart?: (productId: string, quantity: number) => void;
  onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  price,
  mrp,
  image_url,
  imageUrl,
  unit,
  inStock = true,
  featured = false,
  onAddToCart,
  onClick,
}) => {
  const { user, isAdmin } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showCartDialog, setShowCartDialog] = useState(false);
  const [imgError, setImgError] = useState(false);

  const finalImage = imageUrl || image_url;
  const discount = mrp && mrp > price ? Math.round(((mrp - price) / mrp) * 100) : null;
  const favorite = isFavorite(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToCart) setShowCartDialog(true);
  };

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (user) toggleFavorite(id);
  };

  return (
    <>
      <div
        className={`relative group rounded-xl border border-border bg-card overflow-hidden cursor-pointer
          transition-all duration-300 hover:-translate-y-1 hover:shadow-medium hover:border-primary/25
          flex flex-col h-[320px]
          ${!inStock ? "opacity-60" : ""}
        `}
        onClick={onClick}
      >
        {/* Discount ribbon */}
        {discount && inStock && (
          <div className="absolute top-2.5 left-0 z-20">
            <div className="ribbon">{discount}% OFF</div>
          </div>
        )}

        {/* Featured badge */}
        {featured && !discount && (
          <div className="absolute top-2.5 left-0 z-20">
            <div className="ribbon ribbon-orange">FEATURED</div>
          </div>
        )}

        {/* Favorite button */}
        {user && !isAdmin && (
          <button
            onClick={handleFavorite}
            className={`absolute top-2.5 right-2.5 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-soft ${
              favorite
                ? "bg-red-500 text-white scale-110"
                : "bg-background/90 text-muted-foreground hover:bg-red-50 hover:text-red-500 hover:scale-110"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${favorite ? "fill-current" : ""}`} />
          </button>
        )}

        {/* Product image */}
        <div className="relative flex-shrink-0 bg-gradient-to-br from-green-50 to-emerald-50 overflow-hidden" style={{ height: '160px' }}>
          {finalImage && !imgError ? (
            <img
              src={finalImage}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/4 to-accent/4">
              <ImageOff className="h-8 w-8 text-muted-foreground/30" />
              <span className="text-[10px] text-muted-foreground/40 font-medium">No image</span>
            </div>
          )}

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
              <Badge variant="secondary" className="bg-muted text-muted-foreground font-semibold text-xs px-3 py-1 rounded-full">
                Out of Stock
              </Badge>
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="p-3.5 flex flex-col flex-1 min-h-0">
          {/* Name */}
          <h3 className="text-[13px] font-bold text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-200 mb-1">
            {name}
          </h3>

          {/* Unit */}
          {unit && (
            <p className="text-[11px] text-muted-foreground font-medium mb-auto">{unit}</p>
          )}

          {/* Price row */}
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-border/60">
            <div className="min-w-0">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-sm font-extrabold text-primary font-display">
                  ₹{price.toFixed(2)}
                </span>
                {mrp && mrp > price && (
                  <span className="text-[11px] text-muted-foreground line-through font-medium">
                    ₹{mrp.toFixed(2)}
                  </span>
                )}
              </div>
              {discount && (
                <span className="text-[10px] font-bold text-accent">Save ₹{(mrp! - price).toFixed(2)}</span>
              )}
            </div>

            {/* Add to Cart */}
            {inStock && !isAdmin && (
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-[11px] font-bold rounded-lg hover:bg-primary/90 hover:shadow-glow-green transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
              >
                <ShoppingCart className="h-3 w-3 flex-shrink-0" />
                Add
              </button>
            )}
          </div>
        </div>
      </div>

      {showCartDialog && (
        <AddToCartDialog
          open={showCartDialog}
          onOpenChange={setShowCartDialog}
          productName={name}
          productPrice={price}
          productUnit={unit || undefined}
          onConfirm={(qty) => {
            if (onAddToCart) onAddToCart(id, qty);
          }}
        />
      )}
    </>
  );
};

export default ProductCard;
