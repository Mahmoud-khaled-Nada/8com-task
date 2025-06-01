import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { CartItem, CartParams } from "@/utils/types";
import { cartAPI } from "@/lib/api";

interface CartContextType {
  items: CartItem | undefined;
  isLoading: boolean;
  addToCart: (product: any) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  txt: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    cartAPI
      .get()
      .then((data) => {
        setItems(data);
      })
      .catch((error: any) => {
        console.error("Failed to fetch cart items:", error);
        setItems({} as CartItem);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const addToCart = async ({ productId, quantity = 1 }: CartParams) => {
    try {
      const updatedCart = await cartAPI.add({ productId, quantity });
      setItems(updatedCart);
    } catch (error: any) {
      toast({
        title: "Cart Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = (id: string) => {
    cartAPI
      .remove(id)
      .then((data) => {
        setItems(data);
        toast({
          title: "Removed from Cart",
          description: `item has been removed from your cart.`,
        });
      })
      .catch((error: any) => {
        console.error(`Failed to remove item with id ${id}:`, error);
        toast({
          title: "Cart Error",
          description: error.message || "Failed to remove item from cart",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }

    try {
      const updatedCart = await cartAPI.updateQuantity({ productId: id, quantity });

      if (!updatedCart) return;

      setItems(updatedCart);
      toast({
        title: "Cart Updated",
        description: `Quantity for item ${id} updated to ${quantity}.`,
      });
    } catch (error: any) {
      toast({
        title: "Stock Limit Reached",
        description: error?.message || "Unable to update quantity.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    cartAPI
      .empty()
      .then(() => {
        setItems({} as CartItem);
        toast({
          title: "Cart Cleared",
          description: "All items have been removed from your cart.",
        });
      })
      .catch((error: any) => {
        toast({
          title: "Cart Error",
          description: error.message || "Failed to clear cart",
          variant: "destructive",
        });
      });
  };

  const totalItems = items?.totalQuantity || 0;
  const totalPrice = items?.totalPrice || 0;
  const txt = items?.txt || "";

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        txt: txt,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
