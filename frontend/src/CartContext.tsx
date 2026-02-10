import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

// ===== TYPES PANIER =====
export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  game?: string;
};

type CartContextValue = {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  clearCart: () => void;
  getTotal: () => number;
};

const CART_STORAGE_KEY = "nexy_cart";

const readStoredCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const storeCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors
  }
};

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // ===== ETAT GLOBAL DU PANIER =====
  const [items, setItems] = useState<CartItem[]>(() => readStoredCart());

  useEffect(() => {
    storeCart(items);
  }, [items]);

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setItems((prev) => {
      const existing = prev.find((entry) => entry.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.id === item.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((entry) => entry.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((entry) =>
        entry.id === id
          ? { ...entry, quantity: Math.max(1, entry.quantity + delta) }
          : entry
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotal = () =>
    items.reduce((total, item) => total + item.price * item.quantity, 0);

  const value = useMemo(
    () => ({ items, addToCart, removeFromCart, updateQty, clearCart, getTotal }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart doit etre utilise dans CartProvider");
  }
  return context;
};
