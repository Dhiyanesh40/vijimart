import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, Check, Heart } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { productsAPI } from "@/services/api";
import { useCart } from "@/hooks/useCart";
import { useFavorites } from "@/hooks/useFavorites";
import AddToCartDialog from "@/components/products/AddToCartDialog";

const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite, loading: favLoading } = useFavorites();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);

  const handleAddToCart = (quantity: number) => {
    addToCart(product.id || product._id, quantity);
  };

  useEffect(() => {
    const fetch = async () => {
      if (!id) return;
      try {
        const response = await productsAPI.getById(id);
        const data = response.data || response;
        setProduct(data);
      } catch (error) {
        console.error('Failed to fetch product:', error);
        setProduct(null);
      }
      setLoading(false);
    };
    fetch();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse grid md:grid-cols-2 gap-8">
            <div className="bg-muted h-96 rounded-lg" />
            <div className="space-y-4">
              <div className="bg-muted h-8 w-3/4 rounded" />
              <div className="bg-muted h-6 w-1/4 rounded" />
              <div className="bg-muted h-20 rounded" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground text-lg">Product not found</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/products")}>
            Back to Products
          </Button>
        </div>
      </Layout>
    );
  }

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : 0;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-card rounded-lg border border-border p-8 flex items-center justify-center">
            {(product.imageUrl || product.image_url) ? (
              <img src={product.imageUrl || product.image_url} alt={product.name} className="max-h-80 max-w-full object-contain" />
            ) : (
              <div className="text-muted-foreground h-80 flex items-center justify-center">No image available</div>
            )}
          </div>

          <div>
            {product.category && (
              <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded">
                {product.category.name}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mt-3 mb-2">{product.name}</h1>
            <p className="text-muted-foreground text-sm mb-4">{product.unit || "1 pc"}</p>

            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-3xl font-bold text-foreground">₹{product.price}</span>
              {product.mrp && product.mrp > product.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">₹{product.mrp}</span>
                  <span className="text-sm font-semibold text-accent">{discount}% OFF</span>
                </>
              )}
            </div>

            {(product.inStock ?? product.in_stock ?? true) ? (
              <div className="flex items-center gap-2 text-primary text-sm mb-6">
                <Check className="h-4 w-4" /> In Stock
              </div>
            ) : (
              <p className="text-destructive text-sm mb-6">Out of Stock</p>
            )}

            {product.description && (
              <div className="mb-6">
                <h3 className="font-semibold text-foreground mb-2">Description</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                size="lg"
                variant="outline"
                className="w-12 h-12 p-0"
                onClick={() => toggleFavorite(product.id || product._id)}
                disabled={favLoading}
              >
                <Heart className={`h-5 w-5 ${isFavorite(product.id || product._id) ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button
                size="lg"
                className="flex-1"
                disabled={!(product.inStock ?? product.in_stock ?? true)}
                onClick={() => setShowQuantityDialog(true)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>

            <AddToCartDialog
              open={showQuantityDialog}
              onOpenChange={setShowQuantityDialog}
              productName={product.name}
              productPrice={product.price}
              productUnit={product.unit}
              onConfirm={handleAddToCart}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetail;
