import { useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to listen for real-time product updates
 * Automatically refreshes product data when products are created, updated, or deleted
 */
export const useProductUpdates = () => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!socket) return;

    const handleProductUpdate = (data: any) => {
      console.log('📦 Product update received:', data);
      
      // Invalidate products queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['products'] });
      
      // Show toast notification
      if (data.action === 'created') {
        toast({
          title: "New Product Added",
          description: `${data.product.name} is now available!`,
        });
      } else if (data.action === 'updated') {
        toast({
          title: "Product Updated",
          description: `${data.product.name} has been updated`,
        });
      } else if (data.action === 'deleted') {
        toast({
          title: "Product Removed",
          description: `${data.product.name} is no longer available`,
          variant: "destructive"
        });
      }
    };

    const handleInventoryUpdate = (data: any) => {
      console.log('📊 Inventory update received:', data);
      
      // Invalidate products queries
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', data.productId] });
    };

    socket.on('product-update', handleProductUpdate);
    socket.on('inventory-update', handleInventoryUpdate);

    return () => {
      socket.off('product-update', handleProductUpdate);
      socket.off('inventory-update', handleInventoryUpdate);
    };
  }, [socket, queryClient, toast]);
};

/**
 * Hook to listen for real-time order updates
 * Automatically refreshes order data when orders are created or updated
 */
export const useOrderUpdates = () => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!socket) return;

    const handleOrderUpdate = (data: any) => {
      console.log('📋 Order update received:', data);
      
      // Invalidate orders queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      
      // Show toast notification based on action
      if (data.action === 'created') {
        toast({
          title: "New Order Received",
          description: `Order #${data.order._id.slice(-6)} has been placed`,
        });
      } else if (data.action === 'status_updated') {
        toast({
          title: "Order Status Updated",
          description: `Order status changed to: ${data.order.status}`,
        });
      } else if (data.action === 'cancelled') {
        toast({
          title: "Order Cancelled",
          description: `Order #${data.order._id.slice(-6)} has been cancelled`,
          variant: "destructive"
        });
      } else if (data.action === 'returned') {
        toast({
          title: "Return Requested",
          description: `Return requested for order #${data.order._id.slice(-6)}`,
        });
      }
    };

    socket.on('order-update', handleOrderUpdate);

    return () => {
      socket.off('order-update', handleOrderUpdate);
    };
  }, [socket, queryClient, toast]);
};

/**
 * Hook to listen for real-time cart updates
 * Useful for syncing cart across multiple devices
 */
export const useCartUpdates = () => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleCartUpdate = (data: any) => {
      console.log('🛒 Cart update received:', data);
      
      // Invalidate cart query to refetch data
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    };

    socket.on('cart-update', handleCartUpdate);

    return () => {
      socket.off('cart-update', handleCartUpdate);
    };
  }, [socket, queryClient]);
};

/**
 * Hook to use all real-time updates
 * Convenience hook that enables all update listeners
 */
export const useRealTimeUpdates = () => {
  useProductUpdates();
  useOrderUpdates();
  useCartUpdates();
};
