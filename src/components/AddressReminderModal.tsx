import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { MapPin } from "lucide-react";

const AddressReminderModal: React.FC = () => {
  const { user, updateProfile, isAdmin } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Show modal only once per session for customers (not admin) who don't have an address after login
    const hasShownModal = sessionStorage.getItem('addressModalShown');
    
    if (user && !isAdmin && !user.address && !hasShownModal) {
      // Show modal after a short delay
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem('addressModalShown', 'true');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, isAdmin]);

  const handleSave = async () => {
    if (!address.trim()) {
      toast({ title: "Address required", description: "Please enter your delivery address", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await updateProfile({ address, phone });
    setLoading(false);

    if (error) {
      toast({ title: "Error", description: "Failed to save address", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Delivery address saved!" });
      setOpen(false);
    }
  };

  const handleSkip = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <DialogTitle>Add Delivery Address</DialogTitle>
          </div>
          <DialogDescription>
            To place orders online, please add your delivery address. This is required for order processing.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter your phone number"
            />
          </div>
          <div>
            <Label htmlFor="address">Delivery Address *</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter your complete delivery address"
              rows={4}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSkip} className="flex-1">
            Skip for now
          </Button>
          <Button onClick={handleSave} disabled={loading} className="flex-1">
            {loading ? "Saving..." : "Save Address"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddressReminderModal;
