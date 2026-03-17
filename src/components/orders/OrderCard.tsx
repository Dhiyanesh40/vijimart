import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  CreditCard,
  Smartphone,
  Banknote,
  Building2,
  Wallet,
  IndianRupee,
  ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PaymentDetailModal } from "@/components/orders/PaymentDetailModal";

// ── Shared configs ────────────────────────────────────────────────────────────

export const statusConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType; bg: string }
> = {
  pending: {
    label: "Pending",
    color: "text-amber-600",
    bg: "bg-amber-500/10 border-amber-500/25",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    color: "text-blue-600",
    bg: "bg-blue-500/10 border-blue-500/25",
    icon: CheckCircle2,
  },
  processing: {
    label: "Processing",
    color: "text-violet-600",
    bg: "bg-violet-500/10 border-violet-500/25",
    icon: Package,
  },
  shipped: {
    label: "Shipped",
    color: "text-cyan-600",
    bg: "bg-cyan-500/10 border-cyan-500/25",
    icon: Truck,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "text-orange-600",
    bg: "bg-orange-500/10 border-orange-500/25",
    icon: Truck,
  },
  delivered: {
    label: "Delivered",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10 border-emerald-500/25",
    icon: CheckCircle2,
  },
  cancelled: {
    label: "Cancelled",
    color: "text-red-600",
    bg: "bg-red-500/10 border-red-500/25",
    icon: XCircle,
  },
  returned: {
    label: "Returned",
    color: "text-slate-600",
    bg: "bg-slate-500/10 border-slate-500/25",
    icon: RotateCcw,
  },
};

export const paymentMethodConfig: Record<
  string,
  { label: string; icon: React.ElementType; color: string }
> = {
  cod: { label: "Cash on Delivery", icon: Banknote, color: "text-slate-600" },
  razorpay: { label: "Online Payment", icon: CreditCard, color: "text-blue-600" },
  upi: { label: "UPI", icon: Smartphone, color: "text-emerald-600" },
  card: { label: "Card", icon: CreditCard, color: "text-blue-600" },
  netbanking: { label: "Net Banking", icon: Building2, color: "text-violet-600" },
  wallet: { label: "Wallet", icon: Wallet, color: "text-orange-600" },
};

export const paymentStatusConfig: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  pending: { label: "Payment Pending", color: "text-amber-700", bg: "bg-amber-500/10 border-amber-500/20" },
  paid: { label: "Paid", color: "text-emerald-700", bg: "bg-emerald-500/10 border-emerald-500/20" },
  failed: { label: "Payment Failed", color: "text-red-700", bg: "bg-red-500/10 border-red-500/20" },
  refunded: { label: "Refunded", color: "text-blue-700", bg: "bg-blue-500/10 border-blue-500/20" },
};

export const ORDER_PROGRESS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "out_for_delivery",
  "delivered",
];

// ── Progress bar ───────────────────────────────────────────────────────────────

export const OrderProgressBar: React.FC<{ status: string }> = ({ status }) => {
  if (status === "cancelled" || status === "returned") return null;

  const currentIdx = ORDER_PROGRESS.indexOf(status);

  return (
    <div className="flex items-center gap-0 mt-4">
      {ORDER_PROGRESS.map((s, i) => {
        const cfg = statusConfig[s];
        const Icon = cfg.icon;
        const done = i <= currentIdx;
        const active = i === currentIdx;

        return (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all",
                  done
                    ? active
                      ? "bg-primary border-primary text-primary-foreground shadow-md shadow-primary/30"
                      : "bg-primary/80 border-primary/80 text-primary-foreground"
                    : "bg-card border-border text-muted-foreground"
                )}
              >
                <Icon className="h-3 w-3" />
              </div>
              <span
                className={cn(
                  "text-[9px] font-medium hidden sm:block",
                  done ? "text-primary" : "text-muted-foreground"
                )}
              >
                {cfg.label.split(" ")[0]}
              </span>
            </div>
            {i < ORDER_PROGRESS.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mb-4 mx-0.5 transition-all",
                  i < currentIdx ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ── Valid next statuses (for admin) ───────────────────────────────────────────

export const getValidNextStatuses = (currentStatus: string): string[] => {
  const stateMachine: Record<string, string[]> = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["processing", "cancelled"],
    processing: ["shipped"],
    shipped: ["out_for_delivery"],
    out_for_delivery: ["delivered"],
    delivered: ["returned"],
    cancelled: [],
    returned: [],
  };
  return stateMachine[currentStatus] || [];
};

export const isTerminalStatus = (status: string): boolean =>
  ["cancelled", "returned"].includes(status);

// ── Prop types ─────────────────────────────────────────────────────────────────

interface OrderCardProps {
  order: any;
  /** "customer" = show cancel/return buttons; "admin" = show status dropdown */
  variant: "customer" | "admin";
  /** Admin only: called when status dropdown changes */
  onStatusChange?: (orderId: string, newStatus: string) => void;
  /** Customer only: called on cancel confirm */
  onCancel?: (orderId: string) => void;
  /** Customer only: called on return confirm */
  onReturn?: (orderId: string) => void;
  /** Admin only: called after marking a refund as done */
  onRefundMarked?: (updatedOrder: any) => void;
}

// ── OrderCard ─────────────────────────────────────────────────────────────────

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  variant,
  onStatusChange,
  onCancel,
  onReturn,
  onRefundMarked,
}) => {
  const navigate = useNavigate();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  const statusCfg = statusConfig[order.status] || statusConfig.pending;
  const StatusIcon = statusCfg.icon;
  const pmCfg =
    paymentMethodConfig[order.paymentMethod || "cod"] || paymentMethodConfig.cod;
  const PayIcon = pmCfg.icon;
  const psCfg =
    paymentStatusConfig[order.paymentStatus || "pending"] ||
    paymentStatusConfig.pending;

  const validNextStatuses = getValidNextStatuses(order.status);
  const isTerminal = isTerminalStatus(order.status);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* ── Order header ── */}
      <div className="px-5 py-4 flex flex-wrap items-start gap-3 border-b border-border bg-muted/30">
        <div className="flex-shrink-0">
          <p className="text-xs text-muted-foreground mb-0.5">Order ID</p>
          <p className="font-mono font-semibold text-sm text-foreground">
            #{order._id?.slice(0, 12).toUpperCase()}
          </p>
        </div>

        {/* Admin: customer name, phone, address */}
        {variant === "admin" && (
          <div className="flex-1 min-w-[160px]">
            <p className="text-xs text-muted-foreground mb-0.5">Customer</p>
            <p className="text-sm font-semibold text-foreground">{order.customerName}</p>
            {order.phone && (
              <p className="text-xs text-muted-foreground mt-0.5">{order.phone}</p>
            )}
            {order.address && (
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                {order.address}
              </p>
            )}
          </div>
        )}

        <div className="flex-shrink-0 text-right ml-auto">
          <p className="text-xs text-muted-foreground mb-0.5">Placed on</p>
          <p className="text-xs font-medium text-foreground">
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className="text-xs text-muted-foreground">
            {new Date(order.createdAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        {/* Status badge (customer) or dropdown (admin) */}
        <div className="flex items-center gap-2 flex-shrink-0 self-start">
          {variant === "customer" || isTerminal ? (
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold",
                statusCfg.bg,
                statusCfg.color
              )}
            >
              <StatusIcon className="h-3 w-3" />
              {statusCfg.label}
            </div>
          ) : (
            <Select
              value={order.status}
              onValueChange={(v) => onStatusChange?.(order._id, v)}
            >
              <SelectTrigger className="w-40 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={order.status} disabled>
                  {statusCfg.label} (current)
                </SelectItem>
                {validNextStatuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {statusConfig[s]?.label || s}
                  </SelectItem>
                ))}
                {validNextStatuses.length === 0 && (
                  <SelectItem value="_none" disabled>
                    No transitions available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* ── Progress bar ── */}
      <div className="px-5 pt-1 pb-2">
        <OrderProgressBar status={order.status} />
      </div>

      {/* ── Items ── */}
      <div className="px-5 py-3 space-y-2">
        {order.items?.map((item: any) => {
          const productImage =
            item.product?.imageUrl ||
            item.product?.image_url ||
            item.product?.image ||
            item.imageUrl;
          return (
            <div
              key={item._id || item.id}
              className="flex items-center gap-3 p-2 rounded-xl hover:bg-accent/40 transition-colors cursor-pointer"
              onClick={() =>
                item.product?._id && navigate(`/product/${item.product._id}`)
              }
            >
              <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-muted border border-border">
                {productImage ? (
                  <img
                    src={productImage}
                    alt={item.productName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ImageOff className="h-5 w-5" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate">
                  {item.productName || item.product?.name || "Product"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  ₹{item.price} × {item.quantity}{" "}
                  {item.product?.unit || "pc"}
                </p>
              </div>
              <p className="text-sm font-semibold text-foreground flex-shrink-0">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Cancellation / Return reason (if present) ── */}
      {(order.cancellationReason || order.returnReason) && (
        <div className="mx-5 mb-3 px-3 py-2 bg-muted/60 rounded-xl border border-border text-xs">
          <span className="font-medium text-foreground">Reason: </span>
          <span className="text-muted-foreground">
            {order.cancellationReason || order.returnReason}
          </span>
        </div>
      )}

      {/* ── Footer ── */}
      <div className="px-5 py-4 border-t border-border bg-muted/20 flex flex-wrap items-center gap-3">
        {/* Payment info — clickable to open detail modal */}
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <button
            type="button"
            onClick={() => setPaymentModalOpen(true)}
            className={cn(
              "flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-opacity hover:opacity-80 cursor-pointer",
              psCfg.bg,
              psCfg.color
            )}
            title="View payment details"
          >
            <PayIcon className={cn("h-3 w-3", pmCfg.color)} />
            {pmCfg.label}
          </button>
          <button
            type="button"
            onClick={() => setPaymentModalOpen(true)}
            className={cn(
              "text-xs font-semibold px-2.5 py-1 rounded-full border transition-opacity hover:opacity-80 cursor-pointer",
              psCfg.bg,
              psCfg.color
            )}
            title="View payment details"
          >
            {psCfg.label}
          </button>
        </div>

        {/* Total */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-sm text-muted-foreground font-medium">Total:</span>
          <span className="flex items-center gap-0.5 text-lg font-bold text-primary">
            <IndianRupee className="h-4 w-4" />
            {Number(order.total).toFixed(2)}
          </span>
        </div>

        {/* Customer action buttons */}
        {variant === "customer" && (
          <div className="flex gap-2 flex-shrink-0">
            {["pending", "confirmed"].includes(order.status) && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="h-8 text-xs">
                    <XCircle className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to cancel this order? This cannot be
                      undone. Orders can only be cancelled before processing starts.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep Order</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onCancel?.(order._id)}>
                      Yes, Cancel
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {order.status === "delivered" && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    Return
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Request Return?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Our team will review your return request and process it
                      accordingly.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onReturn?.(order._id)}>
                      Yes, Request Return
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </div>
      {/* ── Payment detail modal ── */}
      <PaymentDetailModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        order={order}
        isAdmin={variant === "admin"}
        onRefundMarked={(updatedOrder) => {
          setPaymentModalOpen(false);
          onRefundMarked?.(updatedOrder);
        }}
      />
    </div>
  );
};

export default OrderCard;
