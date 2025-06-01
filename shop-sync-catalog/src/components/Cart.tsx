import { useState } from "react";
import { Trash2, Plus, Minus, ShoppingBag, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/contexts/CartContext";
import CheckoutModal from "./CheckoutModal";
import { Loading } from "./ui/loader";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, txt, isLoading } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);

  const taxDetails = txt.split(",").map((line) => line.trim());

  if (isLoading) return <Loading />;

  if (!items.products || items.products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ShoppingBag className="h-24 w-24 text-gray-300 mb-6" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Start shopping to add items to your cart</p>
        <Button className="bg-emerald-600 hover:bg-emerald-700">Continue Shopping</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <Button variant="outline" onClick={clearCart} className="text-red-600 hover:text-red-700">
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items?.products.map((item) => (
            <Card key={item.productId} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-gray-900 truncate">{item.name}</h3>
                    <p className="text-emerald-600 font-semibold">${item.price}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="h-8 w-8"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <span className="w-12 text-center font-semibold">{item.quantity}</span>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      // disabled={item.quantity >= item.maxStock}
                      className="h-8 w-8"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold text-lg">${(item.price * item.quantity).toFixed(2)}</div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-600 hover:text-red-700 p-0 h-auto"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Items ({totalItems})</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              {taxDetails.length >= 4 && (
                <>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-red-600">
                      {taxDetails[0] ? taxDetails[0]?.split("$")[1] : "Free"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-red-600">
                      {taxDetails[2] ? taxDetails[2]?.split("$")[1] : "Free"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span className="text-red-600">
                      {taxDetails[1] ? taxDetails[1]?.split("$")[1] : "Free"}
                    </span>
                  </div>
                </>
              )}

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              <Button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-lg"
              >
                <CreditCard className="h-5 w-5 mr-2" />
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <CheckoutModal isOpen={showCheckout} onClose={() => setShowCheckout(false)} total={totalPrice} />
    </div>
  );
};

export default Cart;
