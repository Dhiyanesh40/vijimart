import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Truck, ShieldCheck, Tag, Star, ChevronLeft, ChevronRight,
  Users, Package, Leaf, Apple, Coffee, Home, Sparkles, Zap, Lock,
  Recycle, Headphones, Target, TrendingUp, BadgeCheck, Clock, FlameKindling,
  Wheat, Milk, Refrigerator, ShoppingBag, Sun, MapPin, Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import ProductCard from "@/components/products/ProductCard";
import { productsAPI, categoriesAPI, statsAPI } from "@/services/api";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  groceries: <ShoppingBag className="h-6 w-6" />,
  snacks: <FlameKindling className="h-6 w-6" />,
  beverages: <Coffee className="h-6 w-6" />,
  household: <Home className="h-6 w-6" />,
  "personal-care": <Sparkles className="h-6 w-6" />,
  dairy: <Milk className="h-6 w-6" />,
  fruits: <Apple className="h-6 w-6" />,
  vegetables: <Leaf className="h-6 w-6" />,
  bakery: <Wheat className="h-6 w-6" />,
  frozen: <Refrigerator className="h-6 w-6" />,
};

const CATEGORY_IMAGES: Record<string, string> = {
  groceries: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop",
  snacks: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=300&fit=crop",
  beverages: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=300&fit=crop",
  household: "https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400&h=300&fit=crop",
  "personal-care": "https://images.unsplash.com/photo-1556228578-626e1b5c3c32?w=400&h=300&fit=crop",
  dairy: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop",
  fruits: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop",
  vegetables: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
  bakery: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
  frozen: "https://images.unsplash.com/photo-1484980972926-edee96e0960d?w=400&h=300&fit=crop",
  stationery: "https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=400&h=300&fit=crop",
  electronics: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
};

/* ─── Hero slide data ──────────────────────────────────────────── */
interface HeroSlide {
  id: number;
  tag: string;
  title: string;
  titleAccent: string;
  desc: string;
  cta: string;
  ctaSecondary: string;
  accentColor: string;       // tailwind bg class for left strip
  tagColor: string;          // badge bg + text
  imageUrl: string;
  imageAlt: string;
  pills: string[];           // small trust/feature pills under desc
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    tag: "Farm Fresh Daily",
    title: "Freshest Groceries",
    titleAccent: "in Chennimalai",
    desc: "Handpicked vegetables, fruits and daily essentials delivered straight from local farms to your doorstep every morning.",
    cta: "Shop Fresh Now",
    ctaSecondary: "Browse Categories",
    accentColor: "bg-primary",
    tagColor: "bg-primary/10 text-primary",
    imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=900&h=700&fit=crop",
    imageAlt: "Fresh vegetables and groceries",
    pills: ["Same-day delivery", "Farm to table", "100% fresh"],
  },
  {
    id: 2,
    tag: "Best Deals Today",
    title: "Huge Savings on",
    titleAccent: "Every Purchase",
    desc: "Unbeatable prices on household essentials, cleaning supplies, snacks and everything you shop for every week.",
    cta: "Explore Deals",
    ctaSecondary: "View All Products",
    accentColor: "bg-accent",
    tagColor: "bg-accent/10 text-accent",
    imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&h=700&fit=crop",
    imageAlt: "Supermarket deals and discounts",
    pills: ["Up to 30% off", "Daily offers", "Price match"],
  },
  {
    id: 3,
    tag: "Premium Quality",
    title: "Pure Dairy &",
    titleAccent: "Organic Produce",
    desc: "Start every day right — fresh milk, curd, paneer, eggs and certified organic fruits & vegetables you can trust.",
    cta: "Shop Dairy & Organic",
    ctaSecondary: "Learn More",
    accentColor: "bg-primary",
    tagColor: "bg-primary/10 text-primary",
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=900&h=700&fit=crop",
    imageAlt: "Fresh dairy products",
    pills: ["Quality certified", "No preservatives", "Direct from dairy"],
  },
  {
    id: 4,
    tag: "Snacks & Beverages",
    title: "Crispy Snacks &",
    titleAccent: "Refreshing Drinks",
    desc: "From your favourite namkeen and biscuits to juices, soft drinks and hot beverages — everything stocked up for you.",
    cta: "Browse Snacks",
    ctaSecondary: "See Beverages",
    accentColor: "bg-accent",
    tagColor: "bg-accent/10 text-accent",
    imageUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=900&h=700&fit=crop",
    imageAlt: "Snacks and beverages",
    pills: ["500+ varieties", "Top brands", "New arrivals"],
  },
];

const FEATURES = [
  {
    icon: <Truck className="h-6 w-6" />,
    title: "Express Delivery",
    desc: "Quick & reliable doorstep delivery",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    border: "hover:border-primary/25",
  },
  {
    icon: <ShieldCheck className="h-6 w-6" />,
    title: "Quality Assured",
    desc: "100% fresh & genuine products",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    border: "hover:border-accent/25",
  },
  {
    icon: <Tag className="h-6 w-6" />,
    title: "Best Prices",
    desc: "Unbeatable deals every day",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    border: "hover:border-primary/25",
  },
  {
    icon: <Leaf className="h-6 w-6" />,
    title: "Farm Fresh",
    desc: "Direct from farm to your table",
    iconBg: "bg-accent/10",
    iconColor: "text-accent",
    border: "hover:border-accent/25",
  },
];

const TRUST_BADGES = [
  { icon: <Lock className="h-4 w-4" />, label: "100% Secure Payments" },
  { icon: <Recycle className="h-4 w-4" />, label: "Eco-friendly Packaging" },
  { icon: <Headphones className="h-4 w-4" />, label: "24/7 Customer Support" },
  { icon: <BadgeCheck className="h-4 w-4" />, label: "Fresh Guarantee" },
  { icon: <Target className="h-4 w-4" />, label: "Accurate Orders" },
];

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [realStats, setRealStats] = useState({ users: 0, products: 0 });

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setCurrentSlide(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          categoriesAPI.getAll(),
          productsAPI.getAll(),
        ]);
        const categoriesData = categoriesResponse.data || categoriesResponse;
        const productsData = productsResponse.data || productsResponse;
        setCategories(categoriesData);
        setFeaturedProducts(productsData.filter((p: any) => p.featured && p.inStock).slice(0, 8));
        try {
          const statsRes = await statsAPI.get();
          const statsData = statsRes.data || statsRes;
          setRealStats({
            users: statsData.users || 0,
            products: statsData.products || productsData.length,
          });
        } catch {
          setRealStats({ users: 0, products: productsData.length });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <Layout>

      {/* ═══════════════════════════════════════════════════════════
          HERO CAROUSEL  —  split layout: text left / photo right
      ════════════════════════════════════════════════════════════ */}
      <section className="relative bg-background overflow-hidden">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {HERO_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className="flex-none w-full min-h-[calc(100vh-80px)] flex flex-col md:flex-row"
              >
                {/* ── Left: text panel ─────────────────────────── */}
                <div className="relative flex flex-col justify-center bg-background px-8 md:px-14 lg:px-20 py-12 md:py-0 md:w-[52%] lg:w-[50%] flex-shrink-0 overflow-hidden">
                  {/* Subtle dot pattern */}
                  <div className="absolute inset-0 bg-dots-pattern opacity-30 pointer-events-none" />

                  {/* Content */}
                  <div className="relative z-10 max-w-xl">
                    {/* Tag pill */}
                    <div
                      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 ${slide.tagColor}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${slide.accentColor}`} />
                      {slide.tag}
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-display font-black text-foreground leading-[1.05] tracking-tight mb-2">
                      {slide.title}
                    </h1>
                    <h1 className={`text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-display font-black leading-[1.05] tracking-tight mb-5 ${
                      slide.accentColor === "bg-primary" ? "text-primary" : "text-accent"
                    }`}>
                      {slide.titleAccent}
                    </h1>

                    {/* Description */}
                    <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-7 max-w-md">
                      {slide.desc}
                    </p>

                    {/* Pills */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {slide.pills.map((pill, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold border border-border"
                        >
                          <BadgeCheck className="h-3 w-3 text-primary" />
                          {pill}
                        </span>
                      ))}
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-wrap gap-3">
                      <Button
                        size="lg"
                        className={`font-bold text-sm px-8 py-6 rounded-xl text-white hover:scale-105 transition-all duration-300 gap-2 shadow-md ${
                          slide.accentColor === "bg-primary"
                            ? "bg-primary hover:bg-primary/90 shadow-glow-green"
                            : "bg-accent hover:bg-accent/90 shadow-glow-orange"
                        }`}
                        onClick={() => navigate("/products")}
                      >
                        {slide.cta}
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        className="font-bold text-sm px-8 py-6 rounded-xl border-2 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
                        onClick={handleCategoriesClick}
                      >
                        {slide.ctaSecondary}
                      </Button>
                    </div>
                </div>
                </div>

                {/* ── Right: photo panel ───────────────────────── */}
                <div className="relative flex-1 min-h-[260px] md:min-h-0 overflow-hidden">
                  <img
                    src={slide.imageUrl}
                    alt={slide.imageAlt}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading={idx === 0 ? "eager" : "lazy"}
                  />
                  {/* Gradient bleed left into text panel */}
                  <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent pointer-events-none hidden md:block" />
                  {/* Subtle dark bottom scrim */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Prev/Next controls ────────────────────────────────── */}
        <button
          onClick={scrollPrev}
          className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background shadow-medium border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary/40 transition-all duration-200"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={scrollNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background shadow-medium border border-border flex items-center justify-center text-foreground hover:text-primary hover:border-primary/40 transition-all duration-200"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* ── Dot indicators ────────────────────────────────────── */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 md:left-[26%]">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentSlide
                  ? "w-6 h-2 bg-primary"
                  : "w-2 h-2 bg-border hover:bg-muted-foreground"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════════════════════ */}
      <section className="bg-background border-y border-border shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: <Users className="h-5 w-5" />, value: realStats.users > 0 ? `${realStats.users.toLocaleString()}+` : "10,000+", label: "Happy Customers", bg: "bg-primary/8 text-primary", color: "text-primary" },
              { icon: <Package className="h-5 w-5" />, value: realStats.products > 0 ? `${realStats.products}+` : "500+", label: "Products", bg: "bg-accent/8 text-accent", color: "text-accent" },
              { icon: <Truck className="h-5 w-5" />, value: "Same Day", label: "Delivery", bg: "bg-primary/8 text-primary", color: "text-primary" },
              { icon: <Star className="h-5 w-5" />, value: "4.9 / 5", label: "Customer Rating", bg: "bg-accent/8 text-accent", color: "text-accent" },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-4 rounded-xl hover:bg-muted/40 transition-all group">
                <div className={`p-2.5 rounded-lg ${stat.bg} group-hover:scale-110 transition-transform flex-shrink-0`}>
                  {stat.icon}
                </div>
                <div>
                  <p className={`text-xl font-display font-extrabold ${stat.color} leading-none`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium mt-1">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FEATURES STRIP
      ════════════════════════════════════════════════════════════ */}
      <section className="bg-gradient-to-r from-primary/4 via-background to-accent/4 border-b border-border">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-5 rounded-xl bg-card border border-border ${f.border} hover:shadow-soft transition-all group animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.08}s` }}
              >
                <div className={`p-2.5 rounded-lg ${f.iconBg} ${f.iconColor} flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-display font-bold text-foreground text-sm leading-tight">{f.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          CATEGORIES
      ════════════════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <section id="categories-section" className="container mx-auto px-4 py-20 scroll-mt-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 text-primary text-[11px] font-bold mb-3 tracking-widest uppercase">
                <Leaf className="h-3 w-3" />
                All Categories
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground tracking-tight">
                Shop by <span className="text-gradient-green">Category</span>
              </h2>
              <p className="text-muted-foreground text-base mt-2">Explore our wide range of fresh products</p>
            </div>
            <Link
              to="/products"
              className="hidden sm:flex items-center gap-2 text-primary font-bold text-sm hover:gap-3 transition-all group"
            >
              View All
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {categories.slice(0, 12).map((category, index) => (
              <Link
                key={category._id || category.id}
                to={`/products?category=${category.slug}`}
                className="relative rounded-xl overflow-hidden border border-border hover:border-primary/40 hover:shadow-medium transition-all duration-300 group hover:-translate-y-1 animate-fade-in-up"
                style={{ animationDelay: `${index * 50}ms`, aspectRatio: "4/3" }}
              >
                <img
                  src={CATEGORY_IMAGES[category.slug] || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop"}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute inset-0 flex flex-col items-center justify-end pb-4 px-2">
                  <span className="text-white text-sm font-bold text-center leading-tight drop-shadow-lg">{category.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          FEATURED PRODUCTS
      ════════════════════════════════════════════════════════════ */}
      {featuredProducts.length > 0 && (
        <section className="relative bg-gradient-to-b from-background via-green-50/30 to-background py-20 overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/4 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-accent/4 rounded-full blur-3xl pointer-events-none" />
          <div className="container mx-auto px-4 relative">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/8 text-accent text-[11px] font-bold mb-3 tracking-widest uppercase">
                  <Star className="h-3 w-3" />
                  Featured
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-extrabold text-foreground tracking-tight">
                  Handpicked <span className="text-gradient-orange">For You</span>
                </h2>
                <p className="text-muted-foreground text-base mt-2">Curated selection of our finest products</p>
              </div>
              <Link
                to="/products"
                className="hidden sm:flex items-center gap-2 text-accent font-bold text-sm hover:gap-3 transition-all group"
              >
                View All Products
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {featuredProducts.map((product, index) => (
                <div
                  key={product.id || product._id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 70}ms` }}
                >
                  <ProductCard
                    id={product.id || product._id}
                    name={product.name}
                    price={product.price}
                    mrp={product.mrp}
                    imageUrl={product.imageUrl}
                    unit={product.unit}
                    onAddToCart={addToCart}
                    onClick={() => navigate(`/product/${product.id || product._id}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          PROMO BANNER
      ════════════════════════════════════════════════════════════ */}
      <section className="container mx-auto px-4 py-16">
        <div className="gradient-banner rounded-2xl p-10 md:p-14 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(to right, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="absolute top-8 right-[14%] opacity-20 hidden md:block animate-float" style={{ animationDelay: "0s" }}>
            <ShoppingBag className="h-12 w-12 text-white" />
          </div>
          <div className="absolute bottom-8 right-[28%] opacity-15 hidden md:block animate-float" style={{ animationDelay: "1.2s" }}>
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div className="absolute top-10 right-[34%] opacity-10 hidden md:block animate-float" style={{ animationDelay: "0.6s" }}>
            <Tag className="h-6 w-6 text-white" />
          </div>

          <div className="relative text-center md:text-left max-w-lg mx-auto md:mx-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/12 border border-white/20 mb-5 text-sm font-bold text-white/90">
              <Zap className="h-3.5 w-3.5 text-yellow-300" />
              Limited Time Offer
            </div>
            <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white mb-4 leading-tight">
              Great Savings <br />Every Single Day!
            </h2>
            <p className="text-white/80 mb-8 max-w-sm leading-relaxed text-base">
              Fresh deals on groceries, snacks, and household essentials. Save more on every visit to VijiMart.
            </p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <Button
                size="lg"
                className="bg-white text-primary hover:bg-white/95 font-bold px-8 py-6 rounded-xl text-sm hover:scale-105 transition-all duration-300 shadow-strong"
                onClick={() => navigate("/products")}
              >
                Browse Deals <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {!user && (
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/40 text-white bg-white/10 hover:bg-white/20 font-bold px-8 py-6 rounded-xl transition-all duration-300 backdrop-blur-sm hover:border-white/60"
                  onClick={() => navigate("/auth")}
                >
                  Sign Up & Save
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TRUST BADGES
      ════════════════════════════════════════════════════════════ */}
      <section className="bg-primary/4 border-t border-border py-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {TRUST_BADGES.map((badge, i) => (
              <div key={i} className="flex items-center gap-2.5 text-muted-foreground text-sm font-semibold group hover:text-primary transition-colors">
                <div className="w-8 h-8 rounded-lg bg-primary/8 group-hover:bg-primary/15 flex items-center justify-center text-primary transition-colors flex-shrink-0">
                  {badge.icon}
                </div>
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

    </Layout>
  );
};

function handleCategoriesClick() {
  const section = document.getElementById("categories-section");
  if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default Index;
