import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Orders from "./pages/Orders";
import AdminDashboard from "./pages/AdminDashboard";
import CustomerDashboard from "./pages/CustomerDashboard";
import AIGroceryPlanner from "./pages/AIGroceryPlanner";
import BusinessIntelligence from "./pages/BusinessIntelligence";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SocketProvider>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/dashboard" element={<CustomerDashboard />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/ai-grocery-planner" element={<AIGroceryPlanner />} />
                <Route path="/business-intelligence" element={<BusinessIntelligence />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SocketProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
