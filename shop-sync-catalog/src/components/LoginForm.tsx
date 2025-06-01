import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginForm = ({ isOpen, onClose, onSwitchToRegister }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        toast({
          title: "Login successful",
          description: "Welcome back!",
        });
        onClose();
        setEmail("");
        setPassword("");
        window.location.reload();
      } else {
        toast({
          title: "Login failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => (window.location.href = import.meta.env.VITE_AUTH_GOOGLE);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Login to ShopFlow</DialogTitle>
        </DialogHeader>

        {/* Google Sign Up Button */}
        <div className="flex justify-center mb-4">
          <Button
            variant="outline"
            className="w-full max-w-xs flex items-center gap-2"
            onClick={handleGoogleLogin} // Add your handler
          >
            <img src="/google-icon.svg" alt="Google" className="w-4 h-4" />
            <span className="text-sm font-medium">Sign up with Google</span>
          </Button>
        </div>

        {/* Divider */}
        <div className="flex items-center mb-4 text-gray-500 text-sm">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="px-3">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg text-sm">
          <p className="font-semibold mb-2">Demo Accounts:</p>
          <div className="space-y-1 text-xs">
            <p>
              <strong>Admin:</strong> admin@shop.com / admin123
            </p>
            <p>
              <strong>Seller:</strong> seller@shop.com / seller123
            </p>
            <p>
              <strong>Customer:</strong> customer@shop.com / customer123
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </div>
        </form>

        <div className="text-center pt-4">
          <Button variant="link" onClick={onSwitchToRegister}>
            Don't have an account? Register
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoginForm;
