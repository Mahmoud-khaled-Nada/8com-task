import { ShoppingCart, User, Search, Package, LogOut, LogIn, Settings, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getFallbackAvatar, formatString } from "@/utils/helpers";
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import NotificationDropdown from './NotificationDropdown';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  currentView: "catalog" | "cart" | "admin" | "seller";
  setCurrentView: (view: "catalog" | "cart" | "admin" | "seller") => void;
}

const Navbar = ({ currentView, setCurrentView }: NavbarProps) => {
  const { user, logout, isAuthenticated, isLoading, hasRole } = useAuth();
  const { totalItems } = useCart();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const navigate = useNavigate();
  const [avatarSrc, setAvatarSrc] = useState(user?.avatar || getFallbackAvatar());
  const handleSwitchToRegister = () => {
    setShowLogin(false);
    setShowRegister(true);
  };

  const handleSwitchToLogin = () => {
    setShowRegister(false);
    setShowLogin(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "seller":
        return "bg-blue-100 text-blue-800";
      case "customer":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              ShopFlow
            </h1>
            {user && <span className="text-sm text-gray-600">Welcome, {user.name}</span>}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant={currentView === "catalog" ? "default" : "ghost"}
              onClick={() => setCurrentView("catalog")}
              className="flex items-center space-x-2"
            >
              <Search className="h-4 w-4" />
              <span>Catalog</span>
            </Button>

            {isAuthenticated && (
              <Button
                variant={currentView === "cart" ? "default" : "ghost"}
                onClick={() => setCurrentView("cart")}
                className="flex items-center space-x-2 relative"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Cart</span>
                {totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-emerald-500 text-white text-xs">
                    {totalItems}
                  </Badge>
                )}
              </Button>
            )}

            {hasRole("seller") && (
              <Button
                variant={currentView === "seller" ? "default" : "ghost"}
                onClick={() => setCurrentView("seller")}
                className="flex items-center space-x-2"
              >
                <Package className="h-4 w-4" />
                <span>My Store</span>
              </Button>
            )}

            {hasRole("admin") && (
              <Button
                variant={currentView === "admin" ? "default" : "ghost"}
                onClick={() => setCurrentView("admin")}
                className="flex items-center space-x-2"
              >
                <Package className="h-4 w-4" />
                <span>Admin</span>
              </Button>
            )}

            {isAuthenticated && <NotificationDropdown />}

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {user?.avatar ? (
                      <img
                        src={avatarSrc}
                        alt={user.name}
                        onError={() => setAvatarSrc(getFallbackAvatar())}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {formatString(user?.email)}
                      </p>
                      <div className="pt-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                            user?.role || ""
                          )}`}
                        >
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setShowLogin(true)}
                className="flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <LoginForm
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToRegister={handleSwitchToRegister}
      />

      <RegisterForm
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onSwitchToLogin={handleSwitchToLogin}
      />
    </nav>
  );
};

export default Navbar;
