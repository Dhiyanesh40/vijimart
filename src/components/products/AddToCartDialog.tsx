import React, { useState } from "react";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AddToCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  productPrice: number;
  productUnit?: string;
  onConfirm: (quantity: number) => void;
}

const AddToCartDialog: React.FC<AddToCartDialogProps> = ({
  open,
  onOpenChange,
  productName,
  productPrice,
  productUnit,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleConfirm = () => {
    onConfirm(quantity);
    setQuantity(1);
    onOpenChange(false);
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm rounded-2xl border-border shadow-strong">
        <DialogHeader className="pb-2">
          <DialogTitle className="font-display text-lg text-foreground">Add to Cart</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Select quantity for <span className="font-semibold text-foreground">{productName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {productUnit && (
            <div className="flex items-center justify-between py-2 border-b border-border">
              <span className="text-sm text-muted-foreground font-medium">Unit</span>
              <span className="text-sm font-semibold text-foreground">{productUnit}</span>
            </div>
          )}

          <div className="flex items-center justify-between py-2 border-b border-border">
            <span className="text-sm text-muted-foreground font-medium">Price per item</span>
            <span className="text-base font-bold text-primary">₹{productPrice.toFixed(2)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">Quantity</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                className="w-9 h-9 rounded-xl border-2 border-border flex items-center justify-center hover:border-primary hover:bg-primary/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-xl font-bold text-foreground w-10 text-center">{quantity}</span>
              <button
                type="button"
                onClick={incrementQuantity}
                className="w-9 h-9 rounded-xl border-2 border-border flex items-center justify-center hover:border-primary hover:bg-primary/5 transition-all"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-primary/5 border border-primary/15 px-4 py-4 mt-1">
            <span className="text-sm font-semibold text-foreground">Total</span>
            <span className="text-2xl font-extrabold text-primary font-display">
              ₹{(productPrice * quantity).toFixed(2)}
            </span>
          </div>
        </div>

        <DialogFooter className="flex gap-2 mt-1">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl border-2 font-semibold"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="flex-1 rounded-xl gradient-primary text-white font-bold gap-2 shadow-glow-green hover:shadow-glow-green hover:scale-[1.02] transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCartDialog;
