"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { CartItem } from "../type/product";

interface CartContextType {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, "quantity">, quantity?: number) => void;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error parsing cart data", e);
      }
    }
    setIsLoading(false);
  }, []);

  // ✅ Save cart to localStorage when it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  // ✅ Cart Calculations
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // ✅ Helpers
  const getItemQuantity = (productId: string) => {
    return cart.find((item) => item.$id === productId)?.quantity || 0;
  };

  const isInCart = (productId: string) => {
    return cart.some((item) => item.$id === productId);
  };

  // ✅ Add to cart
  const addToCart = (
  product: Omit<CartItem, "quantity">,
  quantity: number = 1
) => {
  setCart((prevCart) => {
    const existingItem = prevCart.find((i) => i.$id === product.$id);

    if (existingItem) {
      // If already exists, just update quantity
      return prevCart.map((i) =>
        i.$id === product.$id
          ? { ...i, quantity: i.quantity + quantity }
          : i
      );
    }

    // ✅ Cast new item explicitly as CartItem
    const newItem: CartItem = { ...product, quantity };

    return [...prevCart, newItem];
  });
};


  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) => (item.$id === id ? { ...item, quantity } : item))
    );
  };

  // ✅ Remove item
  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.$id !== id));
  };

  // ✅ Clear cart
  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems: cart,
        totalItems,
        totalPrice,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        getItemQuantity,
        isInCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
