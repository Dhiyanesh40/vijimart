import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ShoppingBag } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { ordersAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { OrderCard } from "@/components/orders/OrderCard";

const Orders: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const response = await ordersAPI.getAll();
      const data = response.data || response;
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchOrders();
  }, [user, authLoading, navigate]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Package className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">My Orders</h1>
          {orders.length > 0 && (
            <span className="ml-auto text-sm text-muted-foreground">
              {orders.length} order{orders.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-muted h-40 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-card border border-border rounded-2xl">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="font-semibold text-foreground mb-2">No orders yet</h2>
            <p className="text-muted-foreground text-sm mb-5">
              Start shopping to see your orders here
            </p>
            <Button onClick={() => navigate("/products")}>Browse Products</Button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                variant="customer"
                onCancel={async (id) => {
                  try {
                    await ordersAPI.cancel(id);
                    fetchOrders();
                  } catch {}
                }}
                onReturn={async (id) => {
                  try {
                    await ordersAPI.return(id);
                    fetchOrders();
                  } catch {}
                }}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
