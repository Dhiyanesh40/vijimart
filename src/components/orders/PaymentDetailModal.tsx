import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Wallet,
  Copy,
  CheckCheck,
  IndianRupee,
  CalendarDays,
  RefreshCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { paymentAPI } from "@/services/api";
import { toast } from "@/hooks/use-toast";

// ── helpers ────────────────────────────────────────────────────────────────────

const pmIcon: Record<string, React.ElementType> = {
  cod: Banknote,
  razorpay: CreditCard,
  upi: Smartphone,
  card: CreditCard,
  netbanking: Building2,
  wallet: Wallet,
};

const pmLabel: Record<string, string> = {
  cod: "Cash on Delivery",
  razorpay: "Online Payment (Razorpay)",
  upi: "UPI",
  card: "Card",
  netbanking: "Net Banking",
  wallet: "Wallet",
};

const pmColor: Record<string, string> = {
  cod: "text-slate-600",
  razorpay: "text-blue-600",
  upi: "text-emerald-600",
  card: "text-blue-600",
  netbanking: "text-violet-600",
  wallet: "text-orange-600",
};

// Wallet display names (Razorpay returns lowercase keys)
const walletLabel: Record<string, string> = {
  paytm: "Paytm",
  mobikwik: "MobiKwik",
  freecharge: "FreeCharge",
  olamoney: "Ola Money",
  jiomoney: "Jio Money",
  airtel: "Airtel Money",
  phonepe: "PhonePe Wallet",
};

// Bank code → display name (common ones)
const bankLabel: Record<string, string> = {
  HDFC: "HDFC Bank",
  SBIN: "State Bank of India",
  ICIC: "ICICI Bank",
  UTIB: "Axis Bank",
  KKBK: "Kotak Mahindra Bank",
  YESB: "Yes Bank",
  IOBA: "Indian Overseas Bank",
  PUNB: "Punjab National Bank",
  BKID: "Bank of India",
  BARB: "Bank of Baroda",
};

function formatDate(dateStr?: string | Date | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 text-muted-foreground hover:text-foreground transition-colors"
      title="Copy"
    >
      {copied ? (
        <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

// ── prop types ─────────────────────────────────────────────────────────────────

interface PaymentDetailModalProps {
  open: boolean;
  onClose: () => void;
  order: any;
  /** true = admin view (can mark refund, sees extra details) */
  isAdmin?: boolean;
  /** called after admin marks refund — parent should refresh orders */
  onRefundMarked?: (updatedOrder: any) => void;
}

// ── component ──────────────────────────────────────────────────────────────────

export const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  open,
  onClose,
  order,
  isAdmin = false,
  onRefundMarked,
}) => {
  const [refundNotes, setRefundNotes] = useState("");
  const [marking, setMarking] = useState(false);

  if (!order) return null;

  const method = order.paymentMethod || "cod";
  const PayIcon = pmIcon[method] || CreditCard;
  const isCod = method === "cod";

  const payStatus: string = order.paymentStatus || "pending";
  const refundStatus: string = order.refundStatus || "not_applicable";

  const isPendingRefund = refundStatus === "pending_refund";
  const isRefunded = refundStatus === "refunded" || payStatus === "refunded";

  const instrument = order.paymentInstrument; // may be null for old orders

  const handleMarkRefunded = async () => {
    setMarking(true);
    try {
      const res = await paymentAPI.markRefunded(
        order._id,
        refundNotes,
        order.refundAmount
      );
      toast({ title: "Refund marked as done", variant: "default" });
      onRefundMarked?.(res.data.order);
      onClose();
    } catch (err: any) {
      toast({
        title: "Failed to mark refund",
        description: err?.response?.data?.message || err.message,
        variant: "destructive",
      });
    } finally {
      setMarking(false);
    }
  };

  // ── payment status badge ───────────────────────────────────────────────────

  const payStatusBadge = () => {
    if (payStatus === "paid")
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
          <CheckCircle2 className="h-3 w-3" /> Paid
        </span>
      );
    if (payStatus === "refunded")
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 border border-blue-500/20">
          <RefreshCcw className="h-3 w-3" /> Refunded
        </span>
      );
    if (payStatus === "failed")
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-700 border border-red-500/20">
          <AlertCircle className="h-3 w-3" /> Failed
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 border border-amber-500/20">
        <Clock className="h-3 w-3" /> Pending
      </span>
    );
  };

  // ── instrument sub-label (e.g. "PhonePe · user@ybl") ─────────────────────

  const instrumentLabel = (): React.ReactNode => {
    if (!instrument) return null;
    const m = instrument.method;

    if (m === "upi") {
      const parts: string[] = [];
      if (instrument.upiApp) parts.push(instrument.upiApp);
      if (instrument.vpa) parts.push(instrument.vpa);
      if (parts.length === 0) return null;
      return (
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Smartphone className="h-3 w-3 shrink-0" />
          {parts.join(" · ")}
        </span>
      );
    }

    if (m === "card") {
      const parts: string[] = [];
      if (instrument.network) parts.push(instrument.network);
      if (instrument.issuer) parts.push(instrument.issuer);
      if (instrument.cardType)
        parts.push(
          instrument.cardType.charAt(0).toUpperCase() +
            instrument.cardType.slice(1)
        );
      if (instrument.last4) parts.push(`····${instrument.last4}`);
      if (instrument.international) parts.push("International");
      if (parts.length === 0) return null;
      return (
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <CreditCard className="h-3 w-3 shrink-0" />
          {parts.join(" · ")}
        </span>
      );
    }

    if (m === "netbanking") {
      const name =
        instrument.bankName ||
        bankLabel[instrument.bank] ||
        instrument.bank ||
        null;
      if (!name) return null;
      return (
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Building2 className="h-3 w-3 shrink-0" />
          {name}
        </span>
      );
    }

    if (m === "wallet") {
      const name =
        walletLabel[instrument.wallet?.toLowerCase()] ||
        instrument.wallet ||
        null;
      if (!name) return null;
      return (
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Wallet className="h-3 w-3 shrink-0" />
          {name}
        </span>
      );
    }

    return null;
  };

  // ── row helper ──────────────────────────────────────────────────────────────

  const Row = ({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border/50 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0 w-36">{label}</span>
      <span className="text-xs font-medium text-foreground text-right flex items-center gap-1 min-w-0 flex-wrap justify-end">
        {children}
      </span>
    </div>
  );

  const subLabel = instrumentLabel();

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md w-full p-0 gap-0 overflow-hidden rounded-2xl">
        {/* ── gradient header ── */}
        <div className="px-6 py-5 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-b border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <div
                className={cn(
                  "w-8 h-8 rounded-xl flex items-center justify-center bg-background shadow-sm border border-border",
                  pmColor[method]
                )}
              >
                <PayIcon className="h-4 w-4" />
              </div>
              Payment Details
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground mt-1">
            Order #{order._id?.slice(0, 12).toUpperCase()}
          </p>
        </div>

        <div className="px-6 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* ── COD notice ── */}
          {isCod ? (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-500/5 border border-slate-500/15">
              <Banknote className="h-5 w-5 text-slate-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Cash on Delivery
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Payment is collected in cash at the time of delivery. No
                  online transaction details available.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* ── Transaction details ── */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Transaction
                </p>
                <div className="bg-muted/40 rounded-xl px-4 divide-y divide-border/50">
                  {/* Payment mode row */}
                  <Row label="Payment Mode">
                    <span className="flex flex-col items-end gap-0.5">
                      <span className="flex items-center gap-1">
                        <PayIcon className={cn("h-3.5 w-3.5 shrink-0", pmColor[method])} />
                        {pmLabel[method] || method}
                      </span>
                      {subLabel}
                    </span>
                  </Row>

                  <Row label="Payment Status">{payStatusBadge()}</Row>

                  {order.razorpayPaymentId && (
                    <Row label="Transaction ID">
                      <span className="font-mono text-[11px] truncate max-w-[160px]">
                        {order.razorpayPaymentId}
                      </span>
                      <CopyButton value={order.razorpayPaymentId} />
                    </Row>
                  )}

                  {order.razorpayOrderId && (
                    <Row label="Razorpay Order ID">
                      <span className="font-mono text-[11px] truncate max-w-[160px]">
                        {order.razorpayOrderId}
                      </span>
                      <CopyButton value={order.razorpayOrderId} />
                    </Row>
                  )}

                  <Row label="Amount Paid">
                    <span className="flex items-center gap-0.5 text-primary font-bold text-sm">
                      <IndianRupee className="h-3.5 w-3.5" />
                      {Number(order.total).toFixed(2)}
                    </span>
                  </Row>

                  <Row label="Payment Date & Time">
                    {order.paymentPaidAt ? (
                      <span className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {formatDate(order.paymentPaidAt)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic text-[11px]">
                        Not recorded (pre-update order)
                      </span>
                    )}
                  </Row>
                </div>
              </div>

              {/* ── Refund section ── */}
              {(isPendingRefund || isRefunded) && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    Refund
                  </p>

                  {/* Pending refund banner — customer sees encouraging message, admin sees status only */}
                  {isPendingRefund && !isRefunded && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-3">
                      <Clock className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-700">
                          Refund Pending
                        </p>
                        {!isAdmin && (
                          <p className="text-xs text-amber-700/80 mt-0.5 leading-relaxed">
                            Your refund of{" "}
                            <span className="font-bold">
                              ₹{Number(order.refundAmount ?? order.total).toFixed(2)}
                            </span>{" "}
                            will be credited to your account within{" "}
                            <span className="font-semibold">5–7 business days</span>.
                            Admin will process this manually.
                          </p>
                        )}
                        {isAdmin && (
                          <p className="text-xs text-amber-700/80 mt-0.5">
                            Refund of{" "}
                            <span className="font-bold">
                              ₹{Number(order.refundAmount ?? order.total).toFixed(2)}
                            </span>{" "}
                            is awaiting manual processing.
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Refunded banner */}
                  {isRefunded && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mb-3">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-emerald-700">
                          Refund Processed
                        </p>
                        <p className="text-xs text-emerald-700/80">
                          Amount:{" "}
                          <span className="font-bold">
                            ₹{Number(order.refundAmount ?? order.total).toFixed(2)}
                          </span>
                        </p>
                        {order.refundedAt && (
                          <p className="text-xs text-muted-foreground">
                            Date: {formatDate(order.refundedAt)}
                          </p>
                        )}
                        {isAdmin && order.refundedBy && (
                          <p className="text-xs text-muted-foreground">
                            Processed by: {order.refundedBy}
                          </p>
                        )}
                        {order.refundNotes && (
                          <p className="text-xs text-muted-foreground">
                            Notes: {order.refundNotes}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Admin: mark as refunded form */}
                  {isAdmin && isPendingRefund && !isRefunded && (
                    <div className="space-y-3 p-4 rounded-xl bg-muted/40 border border-border">
                      <p className="text-xs font-semibold text-foreground">
                        Mark Refund as Done
                      </p>
                      <p className="text-xs text-muted-foreground">
                        After transferring ₹
                        {Number(order.refundAmount ?? order.total).toFixed(2)}{" "}
                        to the customer outside the app, record the details
                        below.
                      </p>
                      <Textarea
                        placeholder='e.g. "Transferred via UPI to 98XXXXXX on 10 Mar 2026"'
                        value={refundNotes}
                        onChange={(e) => setRefundNotes(e.target.value)}
                        className="text-xs min-h-[80px] resize-none"
                      />
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={handleMarkRefunded}
                        disabled={marking}
                      >
                        {marking ? (
                          <>
                            <RefreshCcw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                            Mark as Refunded
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* ── close footer ── */}
        <div className="px-6 py-4 border-t border-border bg-muted/20 flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailModal;
