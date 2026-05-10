export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  createdAt: number;
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  sugar: string;
  ice: string;
  toppings: string[];
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  createdAt: number;
  updatedAt: number;
}

export interface UserRole {
  isAdmin: boolean;
  email: string;
}

// Fixed constants
export const CATEGORIES = [
  "內行必喝推薦", "芝士奶蓋茶", "口感茶", "奶茶", "冬瓜系列", "一沐日 - 本味茶", "手調風味茶", "鮮果茶", "鮮奶茶 (禾香鮮奶)", "季節限定"
];

export const SUGAR_LEVELS = ["標準甜", "七分甜", "五分甜", "三分甜", "原味"];
export const ICE_LEVELS = ["正常冰", "少冰", "微冰", "去冰", "溫", "熱"];

export const TOPPINGS = [
  { name: "波霸", price: 5 },
  { name: "蘆薈", price: 10 },
  { name: "嫩仙草", price: 10 },
  { name: "胚芽", price: 10 },
  { name: "愛玉", price: 10 },
  { name: "可可豆", price: 10 }
];
