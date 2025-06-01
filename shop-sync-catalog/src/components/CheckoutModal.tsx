import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { isAuthenticated, orderAPI } from "../lib/api";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

const CheckoutModal = ({ isOpen, onClose, total }: CheckoutModalProps) => {
  const { items, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [step, setStep] = useState<"form" | "confirmation">("form");
  const [orderNumber] = useState(() => `ORD-${Date.now()}`);
  const [isLoading, setIsLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    name: "",
    firstName: "",
    lastName: "",
    email: user?.email || "",
    address: "",
    city: "",
    zipCode: "",
  });

  if (!isAuthenticated && !user) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <h2 className="text-lg font-semibold mb-4">Please Log In</h2>
            <p className="text-gray-600 mb-6">You need to be logged in to complete your order.</p>
            <Button onClick={onClose} className="w-full bg-blue-600 hover:bg-blue-700">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const handleSubmitOrder = async (e: React.FormEvent) => {
    setIsLoading(true);
    e.preventDefault();

    try {
      const newOrderItems = items.products.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      shippingAddress.name = `${shippingAddress.firstName} ${shippingAddress.lastName}`;
      const response = await orderAPI.createCheckoutSession({
        userId: user?.id,
        totalPrice: items.totalPrice,
        items: newOrderItems,
        shippingAddress: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          addressLine: shippingAddress.address,
          city: shippingAddress.city,
          postalCode: shippingAddress.zipCode,
        },
      });

      if (response.success) {
        setIsLoading(true);
        setTimeout(() => {
          window.location.href = response.sessionUrl;
        }, 1000);
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error creating order:", error);
      setIsLoading(false);
      toast({
        title: "Order Failed",
        description: "An error occurred while processing your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setStep("form");
    onClose();
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <p className="text-lg font-semibold">Processing your order...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Complete Order</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Shipping Form */}
          <div>
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        required
                        onChange={(e: any) =>
                          setShippingAddress({ ...shippingAddress, firstName: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        required
                        onChange={(e: any) =>
                          setShippingAddress({ ...shippingAddress, lastName: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      onChange={(e: any) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                      value={user?.email || ""}
                      disabled={isAuthenticated}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      required
                      onChange={(e: any) =>
                        setShippingAddress({ ...shippingAddress, address: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        required
                        onChange={(e: any) =>
                          setShippingAddress({ ...shippingAddress, city: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        required
                        onChange={(e: any) =>
                          setShippingAddress({ ...shippingAddress, zipCode: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 h-12">
                Place Order - ${total.toFixed(2)}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  {items.products.map((item) => (
                    <div key={item.productId} className="flex justify-between text-sm">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${(total / 1.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${(total - total / 1.08).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-emerald-600">Free</span>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal;
