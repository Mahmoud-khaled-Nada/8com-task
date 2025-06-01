import { Loader } from "@/components/ui/loader";
import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import Navbar from "@/components/Navbar";
import ProductGrid from "@/components/ProductGrid";
import Cart from "@/components/Cart";
import AdminDashboard from "@/components/AdminDashboard";
import SellerDashboard from "@/components/SellerDashboard";
import { CartProvider, useCart } from "@/contexts/CartContext";
import { ProductProvider } from "@/contexts/ProductContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { NotificationProvider, useNotifications } from "@/contexts/NotificationContext";
import { socket } from "@/lib/socket";
import { Notification } from "@/utils/types";
import { toast } from "@/hooks/use-toast";

const AppContent = () => {
  const [currentView, setCurrentView] = useState<"catalog" | "cart" | "admin" | "seller">("catalog");
  const { isLoading, hasRole, isAuthenticated } = useAuth();
  const { isLoading: cartLoading } = useCart();

  const { addNotification } = useNotifications();

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      console.log("✅ Socket connected");
    };

    const handleDisconnect = () => {
      console.log("❌ Socket disconnected");
    };

    const handleTestMessage = (data: any) => {
      console.log("📨 testMessage received:", data);
    };

    const handleNotificationOnSale = (data: Notification) => {
      addNotification(data);
      toast({
        title: data.title,
        description: data.message,
        variant: "default",
      });
    };

    const handleAdminNotificationCreateCheckout = (data: Notification) => {
      addNotification(data);
      toast({
        title: data.title,
        description: data.message,
        variant: "destructive",
      });
    };

    const handleAdminNotificationConfirmOrder = (data: Notification) => {
      addNotification(data);
      toast({
        title: data.title,
        description: data.message,
        variant: "destructive",
      });
    };

    //
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("testMessage", handleTestMessage);
    socket.on("notificationOnSale", handleNotificationOnSale);
    socket.on("adminNotificationCreateCheckout", handleAdminNotificationCreateCheckout);
    socket.on("adminNotificationConfirmOrder", handleAdminNotificationConfirmOrder);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("testMessage", handleTestMessage);
      socket.off("notificationOnSale", handleNotificationOnSale);
      socket.off("handleAdminNotificationCreateCheckout", handleAdminNotificationCreateCheckout);
      socket.off("adminNotificationConfirmOrder", handleAdminNotificationConfirmOrder);
    };
  }, [socket]);

  const handleViewChange = (view: "catalog" | "cart" | "admin" | "seller") => {
    if (view === "admin" && !hasRole("admin")) return;
    if (view === "seller" && !hasRole("seller")) return;
    if (view === "cart" && !isAuthenticated) return;
    setCurrentView(view);
  };

  if (isLoading || cartLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar currentView={currentView} setCurrentView={handleViewChange} />

      <main className="container mx-auto px-4 py-8">
        {currentView === "catalog" && <ProductGrid />}
        {currentView === "cart" && isAuthenticated && <Cart />}
        {currentView === "admin" && hasRole("admin") && <AdminDashboard />}
        {currentView === "seller" && hasRole("seller") && <SellerDashboard />}

        {/* Show message for unauthorized access */}
        {currentView === "cart" && !isAuthenticated && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Please log in to access your cart</h2>
            <p className="text-gray-600">You need to be logged in to view and manage your shopping cart.</p>
          </div>
        )}

        {currentView === "admin" && !hasRole("admin") && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You need admin privileges to access this section.</p>
          </div>
        )}

        {currentView === "seller" && !hasRole("seller") && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Access Denied</h2>
            <p className="text-gray-600">You need seller privileges to access this section.</p>
          </div>
        )}
      </main>

      <Toaster />
    </div>
  );
};

const Index = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ProductProvider>
          <CartProvider>
            <AppContent />
          </CartProvider>
        </ProductProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default Index;
