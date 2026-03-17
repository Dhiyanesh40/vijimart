import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CreditCard,
  Smartphone,
  Banknote,
  Building2,
  Wallet,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Loader2,
  ChevronRight,
  Sparkles,
  IndianRupee,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentMethod = "upi" | "card" | "netbanking" | "wallet" | "cod";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  amount: number;
  onPay: (method: PaymentMethod) => Promise<void>;
  loading: boolean;
}

const paymentMethods = [
  {
    id: "upi" as PaymentMethod,
    label: "UPI",
    description: "PhonePe, GPay, Paytm & more",
    icon: Smartphone,
    badge: "Instant",
    badgeColor: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20",
    gradient: "from-emerald-500/10 to-teal-500/10",
    borderActive: "border-emerald-500",
    iconColor: "text-emerald-600",
    popular: true,
  },
  {
    id: "card" as PaymentMethod,
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, RuPay",
    icon: CreditCard,
    badge: "Secure",
    badgeColor: "bg-blue-500/15 text-blue-600 border-blue-500/20",
    gradient: "from-blue-500/10 to-indigo-500/10",
    borderActive: "border-blue-500",
    iconColor: "text-blue-600",
    popular: false,
  },
  {
    id: "netbanking" as PaymentMethod,
    label: "Net Banking",
    description: "All major banks supported",
    icon: Building2,
    badge: "Reliable",
    badgeColor: "bg-violet-500/15 text-violet-600 border-violet-500/20",
    gradient: "from-violet-500/10 to-purple-500/10",
    borderActive: "border-violet-500",
    iconColor: "text-violet-600",
    popular: false,
  },
  {
    id: "wallet" as PaymentMethod,
    label: "Wallets",
    description: "Paytm, MobiKwik, Freecharge",
    icon: Wallet,
    badge: "Fast",
    badgeColor: "bg-orange-500/15 text-orange-600 border-orange-500/20",
    gradient: "from-orange-500/10 to-amber-500/10",
    borderActive: "border-orange-500",
    iconColor: "text-orange-600",
    popular: false,
  },
  {
    id: "cod" as PaymentMethod,
    label: "Cash on Delivery",
    description: "Pay when order arrives",
    icon: Banknote,
    badge: "No charges",
    badgeColor: "bg-slate-500/15 text-slate-600 border-slate-500/20",
    gradient: "from-slate-500/10 to-gray-500/10",
    borderActive: "border-slate-500",
    iconColor: "text-slate-600",
    popular: false,
  },
];

const PaymentModal: React.FC<PaymentModalProps> = ({
  open,
  onClose,
  amount,
  onPay,
  loading,
}) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<PaymentMethod>("upi");

  const selectedMethod = paymentMethods.find((m) => m.id === selected)!;
  const isCOD = selected === "cod";

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && !v && onClose()}>
      <DialogContent className="max-w-lg p-0 gap-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-primary via-primary/90 to-primary/80 px-6 py-5 text-white overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/5 rounded-full blur-xl pointer-events-none" />

          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Lock className="h-3.5 w-3.5 opacity-80" />
                <span className="text-xs font-medium opacity-80 tracking-wide uppercase">
                  Secure Checkout
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight">
                Complete Payment
              </h2>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-70 mb-0.5">Amount Due</p>
              <div className="flex items-center gap-1 text-2xl font-extrabold">
                <IndianRupee className="h-5 w-5" />
                <span>{amount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Security badges */}
          <div className="relative flex items-center gap-3 mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 opacity-80" />
              <span className="text-xs opacity-80">256-bit SSL</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 opacity-80" />
              <span className="text-xs opacity-80">Powered by Razorpay</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 opacity-80" />
              <span className="text-xs opacity-80">PCI DSS Compliant</span>
            </div>
          </div>
        </div>

        {/* Payment methods */}
        <div className="px-6 pt-5 pb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Select Payment Method
          </p>
          <div className="space-y-2.5">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              const isActive = selected === method.id;
              return (
                <button
                  key={method.id}
                  onClick={() => setSelected(method.id)}
                  disabled={loading}
                  className={cn(
                    "w-full flex items-center gap-4 p-3.5 rounded-xl border-2 transition-all duration-200 text-left group",
                    "hover:shadow-md hover:-translate-y-0.5",
                    isActive
                      ? cn(
                          "border-2 shadow-md -translate-y-0.5",
                          method.borderActive,
                          `bg-gradient-to-r ${method.gradient}`
                        )
                      : "border-border bg-card hover:border-muted-foreground/30"
                  )}
                >
                  {/* Radio ring */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      isActive
                        ? "border-primary"
                        : "border-muted-foreground/40 group-hover:border-muted-foreground/70"
                    )}
                  >
                    {isActive && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary animate-in zoom-in-50 duration-150" />
                    )}
                  </div>

                  {/* Icon */}
                  <div
                    className={cn(
                      "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                      isActive
                        ? `bg-gradient-to-br ${method.gradient} border border-current/20`
                        : "bg-muted"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4.5 w-4.5",
                        isActive ? method.iconColor : "text-muted-foreground"
                      )}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-semibold text-sm",
                          isActive ? "text-foreground" : "text-foreground/80"
                        )}
                      >
                        {method.label}
                      </span>
                      {method.popular && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/20">
                          Popular
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {method.description}
                    </p>
                  </div>

                  {/* Badge + arrow */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={cn(
                        "hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                        method.badgeColor
                      )}
                    >
                      {method.badge}
                    </span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        isActive
                          ? "text-primary translate-x-0.5"
                          : "text-muted-foreground/40"
                      )}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pt-4 pb-5">
          <Button
            className={cn(
              "w-full h-12 text-base font-bold rounded-xl transition-all duration-200",
              "shadow-lg hover:shadow-xl hover:-translate-y-0.5",
              isCOD
                ? "bg-slate-700 hover:bg-slate-800"
                : "bg-gradient-to-r from-primary to-primary/85 hover:from-primary/90 hover:to-primary"
            )}
            onClick={() => onPay(selected)}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing…
              </span>
            ) : isCOD ? (
              <span className="flex items-center gap-2">
                <Banknote className="h-4.5 w-4.5" />
                Place Order (COD)
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Pay ₹{amount.toFixed(2)} Securely
                <ChevronRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground mt-3">
            By proceeding you agree to our{" "}
            <span className="underline cursor-pointer hover:text-foreground transition-colors" onClick={() => navigate('/terms')}>Terms</span> &{" "}
            <span className="underline cursor-pointer hover:text-foreground transition-colors" onClick={() => navigate('/privacy')}>Privacy Policy</span>.
            Your payment is secured by Razorpay.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
