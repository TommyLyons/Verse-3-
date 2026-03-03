'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/lib/products';
import { useToast } from '@/hooks/use-toast';

export interface CartItem extends Product {
  quantity: number;
  size?: string;
  cartId: string; // Unique identifier for each cart item instance
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string) => void;
  removeFromCart: (cartId: string) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load cart from local storage on initial render (client side only)
    try {
      const storedCart = localStorage.getItem('verse3-cart');
      if (storedCart) {
        setCart(JSON.parse(storedCart));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
  }, []);

  useEffect(() => {
    // Save cart to local storage whenever it changes (client side only)
    if (typeof window !== 'undefined') {
      localStorage.setItem('verse3-cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (product: Product, quantity: number = 1, size?: string) => {
    setCart((prevCart) => {
      // For merch with sizes, treat each size as a unique item.
      const hasSize = product.sizes && product.sizes.length > 0;
      const existingItem = prevCart.find((item) => 
        item.id === product.id && (!hasSize || item.size === size)
      );

      if (existingItem) {
        // Increase quantity of existing item
        return prevCart.map((item) =>
          item.cartId === existingItem.cartId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Add new item to cart
        const cartId = `${product.id}-${size || ''}-${Date.now()}`;
        const newItem: CartItem = { ...product, quantity, size: size || undefined, cartId };
        return [...prevCart, newItem];
      }
    });
    toast({
      title: "Added to Cart",
      description: `${product.name}${size ? ` (${size})` : ''} has been added to your cart.`,
    });
  };

  const removeFromCart = (cartId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.cartId !== cartId));
  };

  const updateQuantity = (cartId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.cartId === cartId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
