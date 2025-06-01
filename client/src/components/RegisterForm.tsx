import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { authAPI } from "@/lib/api";

interface RegisterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterForm = ({ isOpen, onClose, onSwitchToLogin }: RegisterFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>("customer");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await register(email, password, name, role);
      if (success) {
        toast({ title: "Registration successful", description: "Welcome to ShopFlow!" });
        onClose();
        setEmail("");
        setPassword("");
        setName("");
        setRole(role);
        onSwitchToLogin();
        window.location.reload(); // Reload to update user state
      } else {
        toast({
          title: "Registration failed",
          description: "User with this email already exists",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () =>  window.location.href = import.meta.env.VITE_AUTH_GOOGLE;



  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Register for ShopFlow</DialogTitle>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

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
              minLength={6}
            />
          </div>

          <div>
            <Label htmlFor="role">Account Type</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex space-x-4 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </div>
        </form>

        <div className="text-center pt-4">
          <Button variant="link" onClick={onSwitchToLogin}>
            Already have an account? Login
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterForm;
