import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingCart, User, Search, Menu, X, LogOut, Shield,
  Grid3x3, Sparkles, BarChart2, Truck, Star, Leaf,
  Package, CheckCircle2, Sun, Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { useTheme } from "@/contexts/ThemeContext";

/* ─── Logo mark ──────────────────────────────────────────────────── */
const LogoMark: React.FC = () => (
  <div className="relative w-12 h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-primary to-green-700 flex items-center justify-center shadow-glow-green">
    <svg width="26" height="26" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11 19 C11 19 4.5 14 4.5 8.5 C4.5 5.2 7.5 3 11 3 C14.5 3 17.5 5.2 17.5 8.5 C17.5 14 11 19 11 19Z"
        fill="rgba(255,255,255,0.22)"
      />
      <line x1="11" y1="3" x2="11" y2="19" stroke="white" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11 8.5 C11 8.5 8 6.8 5.8 7.8" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M11 12 C11 12 14.2 10.2 16.2 11.2" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-accent border-2 border-white shadow-sm" />
  </div>
);

/* ─── Wordmark ───────────────────────────────────────────────────── */
const Wordmark: React.FC = () => (
  <div className="flex flex-col select-none leading-none">
    {/* First line — store proper name */}
    <div className="flex items-baseline gap-1">
      <span
        className="font-display font-black text-[28px] tracking-tight text-primary leading-none"
        style={{ letterSpacing: "-0.03em" }}
      >
        Sri Vijiyalaxmi
      </span>
    </div>
    {/* Second line — category tag */}
    <span className="text-[12px] font-bold text-accent tracking-[0.30em] uppercase mt-1">
      Super&nbsp;Mart
    </span>
  </div>
);

const Header: React.FC = () => {
  const { user, isAdmin, signOut } = useAuth();
  const { cartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const handleCategoriesClick = () => {
    if (location.pathname === "/") {
      const section = document.getElementById("categories-section");
      if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById("categories-section");
        if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-lg shadow-medium border-b border-border/60"
          : "bg-background shadow-soft border-b border-border/40"
      }`}
    >
      {/* ── Announcement bar ────────────────────────────────────── */}
      <div className="gradient-primary overflow-hidden">
        <div className="flex items-center justify-center py-1.5 px-4">
          <div className="flex overflow-hidden relative w-full max-w-3xl mx-auto">
            <div className="flex animate-marquee whitespace-nowrap gap-14 text-white/90 text-xs font-medium">
              <span className="flex items-center gap-1.5"><Leaf className="h-3 w-3 flex-shrink-0" /> Fresh Arrivals Every Morning</span>
              <span className="flex items-center gap-1.5"><Truck className="h-3 w-3 flex-shrink-0" /> Fast Delivery in Chennimalai</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 flex-shrink-0" /> Quality Assured Products</span>
              <span className="flex items-center gap-1.5"><Star className="h-3 w-3 flex-shrink-0" /> Best Prices Guaranteed</span>
              <span className="flex items-center gap-1.5"><Package className="h-3 w-3 flex-shrink-0" /> Free Delivery on Orders Above ₹500</span>
              <span className="flex items-center gap-1.5"><Star className="h-3 w-3 flex-shrink-0" /> 10,000+ Happy Customers</span>
            </div>
            <div className="flex absolute top-0 animate-marquee2 whitespace-nowrap gap-14 text-white/90 text-xs font-medium">
              <span className="flex items-center gap-1.5"><Leaf className="h-3 w-3 flex-shrink-0" /> Fresh Arrivals Every Morning</span>
              <span className="flex items-center gap-1.5"><Truck className="h-3 w-3 flex-shrink-0" /> Fast Delivery in Chennimalai</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 flex-shrink-0" /> Quality Assured Products</span>
              <span className="flex items-center gap-1.5"><Star className="h-3 w-3 flex-shrink-0" /> Best Prices Guaranteed</span>
              <span className="flex items-center gap-1.5"><Package className="h-3 w-3 flex-shrink-0" /> Free Delivery on Orders Above ₹500</span>
              <span className="flex items-center gap-1.5"><Star className="h-3 w-3 flex-shrink-0" /> 10,000+ Happy Customers</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main navbar ─────────────────────────────────────────── */}
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4 py-3.5">

          {/* Brand */}
          <Link to="/" className="flex items-center gap-3 group flex-shrink-0">
            <div className="group-hover:scale-105 transition-transform duration-300">
              <LogoMark />
            </div>
            <div className="hidden sm:block">
              <Wordmark />
            </div>
          </Link>

          {/* Divider */}
          <div className="hidden lg:block w-px h-8 bg-border/60 mx-1 flex-shrink-0" />

          {/* Categories */}
          <button
            onClick={handleCategoriesClick}
            className="hidden md:flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary/8 hover:bg-primary hover:text-white text-primary font-semibold text-sm transition-all duration-200 border border-primary/15 hover:border-primary group"
          >
            <Grid3x3 className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
            Categories
          </button>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl mx-2">
            <div className={`relative w-full transition-all duration-300 ${searchFocused ? "scale-[1.01]" : ""}`}>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search groceries, snacks, household essentials…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className={`w-full pl-10 pr-4 h-11 rounded-2xl border-2 bg-muted/50 text-foreground placeholder:text-muted-foreground/60 transition-all duration-300 text-sm font-medium ${
                  searchFocused
                    ? "border-primary/60 shadow-glow-green bg-background"
                    : "border-border hover:border-primary/30"
                }`}
              />
            </div>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            {user ? (
              <>
                {isAdmin ? (
                  <>
                    <button
                      onClick={() => navigate("/business-intelligence")}
                      className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400 font-semibold text-sm transition-all duration-200 border border-violet-500/20 hover:border-violet-500/40 group"
                    >
                      <BarChart2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                      <span className="hidden lg:inline">BI</span>
                    </button>
                    <button
                      onClick={() => navigate("/admin")}
                      className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold text-sm transition-all duration-200 border border-amber-500/20 hover:border-amber-500/40 group"
                    >
                      <Shield className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                      Admin
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/ai-grocery-planner")}
                      className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary/8 hover:bg-primary/15 text-primary font-semibold text-sm transition-all duration-200 border border-primary/15 hover:border-primary/30 group"
                    >
                      <Sparkles className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                      <span className="hidden lg:inline">AI Planner</span>
                    </button>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl hover:bg-primary/8 text-foreground font-semibold text-sm transition-all duration-200 hover:text-primary group"
                    >
                      <User className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                      <span className="hidden lg:inline">{user.fullName?.split(" ")[0] || "Dashboard"}</span>
                    </button>
                  </>
                )}
                <button
                  onClick={signOut}
                  className="flex items-center gap-1 px-2.5 py-2 rounded-xl hover:bg-red-500/10 hover:text-red-600 text-muted-foreground font-medium text-sm transition-all duration-200 group"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary/8 hover:bg-primary hover:text-white text-primary font-semibold text-sm transition-all duration-300 border border-primary/20 hover:border-primary group"
              >
                <User className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                Login
              </button>
            )}

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-all duration-200 text-muted-foreground hover:text-foreground"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark"
                ? <Sun className="h-5 w-5" />
                : <Moon className="h-5 w-5" />}
            </button>

            {/* Cart */}
            {!isAdmin && (
              <button
                onClick={() => navigate("/cart")}
                className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-primary hover:bg-primary/90 transition-all duration-300 shadow-glow-green hover:scale-105 group"
              >
                <ShoppingCart className="h-5 w-5 text-white group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-accent text-white text-[10px] rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-glow-orange border-2 border-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              className="flex md:hidden items-center justify-center w-10 h-10 rounded-xl hover:bg-muted transition-all duration-200 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ─────────────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background border-t border-border animate-slide-in shadow-medium">
          <form onSubmit={handleSearch} className="px-4 pt-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rounded-xl h-11 border-2 border-border focus:border-primary/60"
              />
            </div>
          </form>
          <div className="px-4 pb-4 space-y-1">
            <button
              onClick={() => { handleCategoriesClick(); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-primary/8 text-foreground font-medium text-sm transition-all"
            >
              <Grid3x3 className="h-4 w-4 text-primary" />
              Categories
            </button>
            {user && !isAdmin && (
              <button
                onClick={() => { navigate("/ai-grocery-planner"); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-primary/8 text-foreground font-medium text-sm transition-all"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                AI Grocery Planner
              </button>
            )}
            {user && !isAdmin && (
              <button
                onClick={() => { navigate("/dashboard"); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-primary/8 text-foreground font-medium text-sm transition-all"
              >
                <User className="h-4 w-4 text-primary" />
                My Dashboard
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => { navigate("/business-intelligence"); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-violet-500/10 text-violet-600 dark:text-violet-400 font-medium text-sm transition-all"
              >
                <BarChart2 className="h-4 w-4" />
                Business Intelligence
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium text-sm transition-all"
              >
                <Shield className="h-4 w-4" />
                Admin Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
