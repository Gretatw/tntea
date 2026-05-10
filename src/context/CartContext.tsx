import { createContext, useContext, useState, ReactNode } from 'react';
import { MenuItem } from '../data/menu';

export interface CartItem {
  id: string; // unique for this cart item
  menuItem: MenuItem;
  sweetness: string;
  ice: string;
  addOns: { name: string; price: number }[];
  quantity: number;
  unitPrice: number; // total for one cup with add-ons
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (item: CartItem) => {
    setItems(prev => [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems(prev => 
      prev.map(i => {
        if (i.id === id) {
          const newQ = i.quantity + delta;
          return { ...i, quantity: Math.max(1, newQ) };
        }
        return i;
      })
    );
  };

  const clearCart = () => setItems([]);

  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalAmount }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
