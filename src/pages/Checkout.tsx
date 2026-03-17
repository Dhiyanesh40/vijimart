import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { paymentAPI } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import PaymentModal, { PaymentMethod } from "@/components/payment/PaymentModal";
import {
  CheckCircle2,
  ShoppingBag,
  MapPin,
  Phone,
  User,
  ChevronRight,
  Package,
  Truck,
  ShieldCheck,
  Tag,
  Loader2,
  Star,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

type Step = "details" | "review" | "success";

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { items, cartTotal, clearCart, loading: cartLoading } = useCart();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>("details");
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [form, setForm] = useState({
    name: user?.fullName || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  // Redirect admin — admins cannot place orders
  useEffect(() => {
    if (authLoading) return;
    if (isAdmin) {
      navigate("/admin");
      return;
    }
    if (!user) {
      navigate("/auth");
      return;
    }
    if (!cartLoading && items.length === 0 && !orderPlaced) {
      navigate("/cart");
    }
  }, [user, isAdmin, authLoading, cartLoading, items.length, orderPlaced, navigate]);

  // Keep form in sync if user object updates after mount
  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        name: prev.name || user.fullName || "",
        phone: prev.phone || user.phone || "",
        address: prev.address || user.address || "",
      }));
    }
  }, [user]);

  // ─── Step 1 → Step 2 ─────────────────────────────────────────────────────
  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    setStep("review");
  };

  // ─── Launch payment flow ──────────────────────────────────────────────────
  const handleProceedToPayment = () => {
    setShowPaymentModal(true);
  };

  // ─── Handle payment method selection ─────────────────────────────────────
  const handlePay = async (method: PaymentMethod) => {
    setPaymentLoading(true);
    setShowPaymentModal(false);

    try {
      const backendMethod = method === "upi" || method === "card" || method === "netbanking" || method === "wallet"
        ? "razorpay"
        : "cod";

      const res = await paymentAPI.createOrder({
        customerName: form.name,
        phone: form.phone,
        address: form.address,
        paymentMethod: backendMethod,
      });

      const data = res.data;

      // ── COD path ──────────────────────────────────────────────────────────
      if (data.paymentMethod === "cod") {
        await clearCart();
        setPlacedOrderId(data.order?._id || data.order?.id || null);
        setOrderPlaced(true);
        setStep("success");
        toast({ title: "Order placed successfully!" });
        setPaymentLoading(false);
        return;
      }

      // ── Razorpay path ─────────────────────────────────────────────────────
      const {
        razorpayOrderId,
        razorpayKeyId,
        amount,
        currency,
        orderId: pendingOrderId,
      } = data;

      if (!window.Razorpay) {
        toast({
          title: "Payment library not loaded",
          description: "Please refresh the page and try again.",
          variant: "destructive",
        });
        setPaymentLoading(false);
        return;
      }

      const options = {
        key: razorpayKeyId,
        amount,
        currency,
        name: "VijiMart",
        description: "Order Payment",
        image: "/favicon.ico",
        order_id: razorpayOrderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            setPaymentLoading(true);
            const verifyRes = await paymentAPI.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: pendingOrderId,
            });

            await clearCart();
            const confirmedOrder = verifyRes.data?.order;
            setPlacedOrderId(confirmedOrder?._id || confirmedOrder?.id || pendingOrderId);
            setOrderPlaced(true);
            setStep("success");
            toast({ title: "Payment successful! Order confirmed." });
          } catch {
            toast({
              title: "Payment verification failed",
              description: "Please contact support if amount was debited.",
              variant: "destructive",
            });
          } finally {
            setPaymentLoading(false);
          }
        },
        prefill: {
          name: form.name,
          contact: form.phone,
          email: user?.email || "",
        },
        theme: {
          color: "#16a34a",
          backdrop_color: "rgba(0,0,0,0.6)",
        },
        modal: {
          ondismiss: async () => {
            // Mark as failed when user closes Razorpay modal
            try {
              await paymentAPI.reportFailure(pendingOrderId);
            } catch { /* ignore */ }
            toast({
              title: "Payment cancelled",
              description: "Your order was not placed.",
            });
            setPaymentLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      setPaymentLoading(false);
    } catch (error: any) {
      toast({
        title: "Failed to initiate payment",
        description: error.response?.data?.message || "Please try again.",
        variant: "destructive",
      });
      setPaymentLoading(false);
    }
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  if (cartLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Loading checkout…</p>
        </div>
      </Layout>
    );
  }

  // ─── Success screen ───────────────────────────────────────────────────────
  if (step === "success") {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-lg">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl text-center">
            {/* Animated success banner */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-500 px-8 py-10">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <CheckCircle2 className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-1">
                Order Confirmed!
              </h1>
              <p className="text-white/80 text-sm">
                Thank you for shopping with VijiMart
              </p>
            </div>

            <div className="px-8 py-6 space-y-5">
              {placedOrderId && (
                <div className="bg-muted/50 rounded-xl px-4 py-3 inline-block">
                  <p className="text-xs text-muted-foreground">Order ID</p>
                  <p className="font-mono font-semibold text-foreground text-sm">
                    #{placedOrderId.slice(0, 12).toUpperCase()}
                  </p>
                </div>
              )}

              {/* Steps */}
              <div className="flex items-center justify-center gap-2 text-sm">
                {[
                  { icon: Package, label: "Packing" },
                  { icon: Truck, label: "Shipping" },
                  { icon: CheckCircle2, label: "Delivered" },
                ].map((s, i) => (
                  <React.Fragment key={s.label}>
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <s.icon className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                    </div>
                    {i < 2 && (
                      <div className="h-px w-8 bg-border flex-shrink-0 mt-[-10px]" />
                    )}
                  </React.Fragment>
                ))}
              </div>

              <p className="text-sm text-muted-foreground">
                We'll notify you as your order progresses. Estimated delivery:{" "}
                <span className="font-semibold text-foreground">1–2 days</span>
              </p>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/orders")}
                >
                  <Package className="h-4 w-4 mr-2" />
                  My Orders
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => navigate("/products")}
                >
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Shop More
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // ─── Step progress indicator ──────────────────────────────────────────────
  const steps = [
    { id: "details", label: "Details" },
    { id: "review", label: "Review" },
    { id: "payment", label: "Payment" },
  ];
  const currentStepIdx = step === "details" ? 0 : step === "review" ? 1 : 2;

  return (
    <Layout>
      {/* Payment processing overlay */}
      {paymentLoading && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl p-8 text-center shadow-2xl">
            <Loader2 className="h-12 w-12 text-primary animate-spin mx-auto mb-4" />
            <p className="font-semibold text-foreground">Processing payment…</p>
            <p className="text-sm text-muted-foreground mt-1">Please don't close this window</p>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => step === "review" ? setStep("details") : navigate("/cart")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Checkout</h1>
        </div>

        {/* Step bar */}
        <div className="flex items-center justify-center gap-0 mb-8 max-w-sm mx-auto">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all",
                    i <= currentStepIdx
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border"
                  )}
                >
                  {i < currentStepIdx ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    i <= currentStepIdx ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mb-5 mx-1 transition-all",
                    i < currentStepIdx ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          {/* ── Left panel ── */}
          <div className="lg:col-span-3 space-y-4">

            {/* ── Step 1: Delivery details ─────────────────────────────── */}
            {step === "details" && (
              <form
                onSubmit={handleDetailsSubmit}
                className="bg-card border border-border rounded-2xl p-6 space-y-5"
              >
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold text-foreground text-lg">
                    Delivery Details
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="flex items-center gap-1.5 mb-1.5 text-sm font-medium">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your full name"
                      className="h-11"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="flex items-center gap-1.5 mb-1.5 text-sm font-medium">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="h-11"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="flex items-center gap-1.5 mb-1.5 text-sm font-medium">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      Delivery Address
                    </Label>
                    <Textarea
                      id="address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="House no., street, city, pincode"
                      rows={3}
                      className="resize-none"
                      required
                    />
                  </div>
                </div>

                {/* Trust badges */}
                <div className="flex items-center gap-4 pt-1 pb-1">
                  {[
                    { icon: ShieldCheck, text: "Secure" },
                    { icon: Truck, text: "Free Delivery" },
                    { icon: Star, text: "5★ Service" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Icon className="h-3.5 w-3.5 text-primary" />
                      {text}
                    </div>
                  ))}
                </div>

                <Button type="submit" size="lg" className="w-full h-12 text-base font-semibold rounded-xl">
                  Continue to Review
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </form>
            )}

            {/* ── Step 2: Review ───────────────────────────────────────── */}
            {step === "review" && (
              <div className="space-y-4">
                {/* Delivery info card */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <h3 className="font-semibold text-foreground">Delivering to</h3>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary h-7 text-xs"
                      onClick={() => setStep("details")}
                    >
                      Edit
                    </Button>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium text-foreground">{form.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{form.phone}</span>
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{form.address}</span>
                    </div>
                  </div>
                </div>

                {/* Items list */}
                <div className="bg-card border border-border rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-foreground">
                      {items.length} Item{items.length !== 1 ? "s" : ""} in Your Order
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => {
                      const product = item.product as any;
                      const productId = product?._id || product?.id;
                      const subtotal = (product?.price ?? 0) * item.quantity;
                      return (
                        <div
                          key={productId || Math.random()}
                          className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/40 transition-colors cursor-pointer"
                          onClick={() => productId && navigate(`/product/${productId}`)}
                        >
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden border border-border">
                            {product?.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product?.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">
                              {product?.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              ₹{product?.price} × {item.quantity}
                              {product?.unit ? ` (${product.unit})` : ""}
                            </p>
                          </div>
                          <p className="font-semibold text-sm text-foreground flex-shrink-0">
                            ₹{subtotal.toFixed(2)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full h-12 text-base font-semibold rounded-xl"
                  onClick={handleProceedToPayment}
                >
                  Proceed to Payment — ₹{cartTotal.toFixed(2)}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>

          {/* ── Right panel: Order Summary ── */}
          <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-2xl p-5 sticky top-20 space-y-4">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Order Summary
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>
                    Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)
                  </span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery Charges</span>
                  <span className="text-emerald-600 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Fee</span>
                  <span className="text-emerald-600 font-semibold">₹0.00</span>
                </div>
              </div>

              <div className="border-t border-border pt-3 flex justify-between font-bold text-foreground text-base">
                <span>Total Payable</span>
                <span className="text-lg text-primary">₹{cartTotal.toFixed(2)}</span>
              </div>

              {/* Savings highlight */}
              {items.some((i) => (i.product as any)?.mrp && (i.product as any).mrp > (i.product as any).price) && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
                  <p className="text-xs font-medium text-emerald-700">
                    You're saving ₹
                    {items
                      .reduce((s, i) => {
                        const p = i.product as any;
                        return s + ((p?.mrp || p?.price || 0) - (p?.price || 0)) * i.quantity;
                      }, 0)
                      .toFixed(2)}{" "}
                    on this order!
                  </p>
                </div>
              )}

              {/* Payment trust */}
              <div className="space-y-2 pt-1">
                {[
                  { icon: ShieldCheck, text: "100% Secure Payments" },
                  { icon: Truck, text: "Free delivery on all orders" },
                  { icon: Package, text: "Easy returns & exchanges" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        open={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={cartTotal}
        onPay={handlePay}
        loading={paymentLoading}
      />
    </Layout>
  );
};

export default Checkout;
