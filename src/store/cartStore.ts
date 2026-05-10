import { create } from 'zustand';
import { OrderItem } from '../lib/types';

interface CartState {
  items: OrderItem[];
  addItem: (item: OrderItem) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  removeItem: (index) => set((state) => ({
    items: state.items.filter((_, i) => i !== index)
  })),
  clearCart: () => set({ items: [] }),
  getTotal: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }
}));
