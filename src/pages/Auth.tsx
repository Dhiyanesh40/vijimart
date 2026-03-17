import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Leaf, ShieldCheck, Truck, Star, ArrowRight, Eye, EyeOff, Apple, Wheat, Carrot } from "lucide-react";

// Inline SVG Logo
const SvLogo: React.FC = () => (
  <svg width="52" height="52" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="authLogoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#16a34a" />
        <stop offset="100%" stopColor="#15803d" />
      </linearGradient>
    </defs>
    <circle cx="20" cy="20" r="19" fill="url(#authLogoGrad)" />
    <path d="M20 28 C20 28 12 22 12 15 C12 10 16 8 20 8 C24 8 28 10 28 15 C28 22 20 28 20 28Z" fill="rgba(255,255,255,0.2)" />
    <text x="20" y="23" textAnchor="middle" fontFamily="Syne, sans-serif" fontWeight="800" fontSize="10" fill="white" letterSpacing="-0.5">SV</text>
    <circle cx="28" cy="13" r="3.5" fill="#f97316" />
    <circle cx="28" cy="13" r="2" fill="#fb923c" />
  </svg>
);

const TRUST_ITEMS = [
  { icon: <ShieldCheck className="h-5 w-5" />, text: "100% Secure Checkout" },
  { icon: <Truck className="h-5 w-5" />, text: "Same Day Delivery" },
  { icon: <Leaf className="h-5 w-5" />, text: "Farm Fresh Products" },
  { icon: <Star className="h-5 w-5" />, text: "10,000+ Happy Customers" },
];

const Auth: React.FC = () => {
  const navigate = useNavigate();
  const { user, signIn, signUp, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    address: "",
    interests: ""
  });

  useEffect(() => {
    if (authLoading) return;
    if (user) navigate("/");
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(form.email, form.password);
      if (error) {
        toast({ title: "Login failed", description: error.message, variant: "destructive" });
      } else {
        navigate("/");
      }
    } else {
      const { error } = await signUp(form.email, form.password, form.fullName, form.phone, form.address, form.interests);
      if (error) {
        toast({ title: "Signup failed", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Account created!", description: "Welcome to Sri Vijiyalaxmi Super Mart." });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-1/2 gradient-banner relative flex-col items-center justify-center p-12 overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute top-0 left-0 w-80 h-80 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
        <div className="absolute inset-0 bg-dots-pattern opacity-10" />

        {/* Floating icon decorations */}
        <div className="absolute top-[15%] right-[10%] p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 animate-float" style={{ animationDelay: "0s" }}>
          <Carrot className="h-8 w-8 text-white/80" />
        </div>
        <div className="absolute top-[40%] right-[6%] p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 animate-float" style={{ animationDelay: "1.4s" }}>
          <Apple className="h-6 w-6 text-white/80" />
        </div>
        <div className="absolute bottom-[20%] right-[14%] p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 animate-float" style={{ animationDelay: "0.7s" }}>
          <Leaf className="h-5 w-5 text-white/80" />
        </div>
        <div className="absolute top-[25%] left-[8%] p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 animate-float" style={{ animationDelay: "2s" }}>
          <Wheat className="h-5 w-5 text-white/80" />
        </div>
        <div className="absolute bottom-[30%] left-[10%] p-2.5 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 animate-float" style={{ animationDelay: "0.4s" }}>
          <Leaf className="h-6 w-6 text-white/80" />
        </div>

        {/* Main content */}
        <div className="relative text-center text-white max-w-sm">
          <div className="mb-8 flex justify-center">
            <div className="p-4 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-strong">
              <SvLogo />
            </div>
          </div>
          <h2 className="text-3xl font-display font-extrabold text-white mb-3 leading-tight">
            Sri Vijiyalaxmi<br />Super Mart
          </h2>
          <p className="text-white/70 text-sm leading-relaxed mb-10">
            Your trusted local supermarket in Chennimalai. Fresh groceries, household essentials & more.
          </p>

          <div className="space-y-3">
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/15 backdrop-blur-sm text-left">
                <div className="text-green-300">{item.icon}</div>
                <span className="text-white/85 text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-background relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-dots-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-primary/5 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center mb-8">
            <SvLogo />
            <div>
              <p className="font-display font-extrabold text-lg text-foreground leading-none">Sri Vijiyalaxmi</p>
              <p className="text-xs text-muted-foreground tracking-wider uppercase">Super Mart</p>
            </div>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-muted rounded-2xl p-1.5 mb-8">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${isLogin
                  ? "bg-card text-primary shadow-medium"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${!isLogin
                  ? "bg-card text-primary shadow-medium"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              Create Account
            </button>
          </div>

          {/* Title */}
          <div className="mb-7">
            <h1 className="text-3xl font-display font-extrabold text-foreground">
              {isLogin ? "Welcome Back!" : "Join VijiMart Today"}
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {isLogin
                ? "Sign in to your account to continue shopping"
                : "Create an account and start shopping smarter"}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <Label htmlFor="fullName" className="text-sm font-semibold text-foreground mb-1.5 block">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    placeholder="Your full name"
                    required={!isLogin}
                    className="h-12 rounded-xl border-2 border-border focus:border-primary/60 text-sm font-medium"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-sm font-semibold text-foreground mb-1.5 block">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      required={!isLogin}
                      className="h-12 rounded-xl border-2 border-border focus:border-primary/60 text-sm font-medium"
                    />
                  </div>
                  <div>
                    <Label htmlFor="interests" className="text-sm font-semibold text-foreground mb-1.5 block">
                      Interests
                    </Label>
                    <Input
                      id="interests"
                      value={form.interests}
                      onChange={(e) => setForm({ ...form, interests: e.target.value })}
                      placeholder="Snacks, Organic…"
                      className="h-12 rounded-xl border-2 border-border focus:border-primary/60 text-sm font-medium"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="address" className="text-sm font-semibold text-foreground mb-1.5 block">
                    Delivery Address
                  </Label>
                  <Input
                    id="address"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Your delivery address"
                    className="h-12 rounded-xl border-2 border-border focus:border-primary/60 text-sm font-medium"
                  />
                </div>
              </>
            )}

            <div>
              <Label htmlFor="email" className="text-sm font-semibold text-foreground mb-1.5 block">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                required
                className="h-12 rounded-xl border-2 border-border focus:border-primary/60 text-sm font-medium"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-semibold text-foreground mb-1.5 block">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="h-12 rounded-xl border-2 border-border focus:border-primary/60 text-sm font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-13 rounded-2xl gradient-primary text-white font-bold text-base shadow-glow-green hover:shadow-glow-green hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 mt-2 py-3.5"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {isLogin ? "New to Sri Vijiyalaxmi?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="text-primary font-bold hover:underline transition-colors"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? "Create Account" : "Sign In"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
