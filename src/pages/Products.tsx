import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/products/ProductCard";
import { productsAPI, categoriesAPI } from "@/services/api";
import { useCart } from "@/hooks/useCart";
import { useProductUpdates } from "@/hooks/useRealTimeUpdates";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

const Products: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Enable real-time product updates
  useProductUpdates();

  const categorySlug = searchParams.get("category");
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const categoriesResponse = await categoriesAPI.getAll();
        const categoriesData = categoriesResponse.data || categoriesResponse;
        setCategories(categoriesData);

        let productsData;
        if (categorySlug) {
          const cat = categoriesData.find((c: any) => c.slug === categorySlug);
          if (cat) {
            const response = await productsAPI.getByCategory(cat._id || cat.id);
            productsData = response.data || response;
          } else {
            const response = await productsAPI.getAll();
            productsData = response.data || response;
          }
        } else if (searchQuery) {
          // Search in products
          const response = await productsAPI.search(searchQuery);
          productsData = response.data || response;
          
          // Also filter categories that match the search query
          const matchingCategories = categoriesData.filter((cat: any) => 
            cat.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          
          // Get products from matching categories
          if (matchingCategories.length > 0) {
            const categoryProducts = await Promise.all(
              matchingCategories.map(async (cat: any) => {
                const resp = await productsAPI.getByCategory(cat._id || cat.id);
                return resp.data || resp;
              })
            );
            
            // Combine and deduplicate products
            const allProducts = [...productsData, ...categoryProducts.flat()];
            const uniqueProducts = allProducts.filter((product, index, self) =>
              index === self.findIndex((p) => (p._id || p.id) === (product._id || product.id))
            );
            productsData = uniqueProducts;
          }
        } else {
          const response = await productsAPI.getAll();
          productsData = response.data || response;
        }

        setProducts(productsData || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        setProducts([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [categorySlug, searchQuery]);

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row gap-10">
            {/* Sidebar with Enhanced Design */}
            <aside className="w-full md:w-64 flex-shrink-0">
              <div className="bg-card rounded-2xl shadow-soft border border-border overflow-hidden sticky top-4">
                <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-4">
                  <h3 className="font-display font-bold text-white text-lg">Categories</h3>
                </div>
                <div className="p-4 space-y-2">
                  <Button
                    variant={!categorySlug ? "default" : "ghost"}
                    size="sm"
                    className={`w-full justify-start text-sm rounded-xl transition-all ${
                      !categorySlug 
                        ? "gradient-primary text-white shadow-soft" 
                        : "hover:bg-primary/10 hover:translate-x-1"
                    }`}
                    onClick={() => navigate("/products")}
                  >
                    All Products
                  </Button>
                  {categories.map((cat) => (
                    <Button
                      key={cat.id}
                      variant={categorySlug === cat.slug ? "default" : "ghost"}
                      size="sm"
                      className={`w-full justify-start text-sm rounded-xl transition-all ${
                        categorySlug === cat.slug 
                          ? "gradient-primary text-white shadow-soft" 
                          : "hover:bg-primary/10 hover:translate-x-1"
                      }`}
                      onClick={() => navigate(`/products?category=${cat.slug}`)}
                    >
                      {cat.name}
                    </Button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Products Grid with Enhanced Design */}
            <div className="flex-1">
              {/* Header Section */}
              <div className="bg-card rounded-2xl shadow-soft border border-border px-6 py-5 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-1">
                      {searchQuery ? `Search Results: "${searchQuery}"` : categorySlug ? categories.find(c => c.slug === categorySlug)?.name || "Products" : "All Products"}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                      Discover our quality products at great prices
                    </p>
                  </div>
                  <div className="bg-primary/10 rounded-xl px-4 py-2">
                    <span className="text-sm font-semibold text-primary">{products.length} products</span>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-card rounded-xl h-72 animate-pulse shadow-soft" />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-card rounded-2xl shadow-soft border border-border text-center py-20">
                  <div className="flex justify-center mb-4">
                    <Package className="h-16 w-16 text-muted-foreground/40" />
                  </div>
                  <p className="text-muted-foreground text-lg mb-2">No products found</p>
                  <p className="text-sm text-muted-foreground mb-6">Try adjusting your search or browse all products</p>
                  <Button 
                    variant="outline" 
                    className="rounded-xl border-2 hover:border-primary hover:bg-primary/5" 
                    onClick={() => navigate("/products")}
                  >
                    View All Products
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-8">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id || product._id}
                      id={product.id || product._id}
                      name={product.name}
                      price={product.price}
                      mrp={product.mrp}
                      imageUrl={product.imageUrl}
                      unit={product.unit}
                      onAddToCart={addToCart}
                      onClick={() => navigate(`/product/${product.id || product._id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
