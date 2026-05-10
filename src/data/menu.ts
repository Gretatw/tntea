export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  isHotAvailable?: boolean;
}

export const menuCategories = [
  "內行必喝推薦",
  "一沐日-本味茶",
  "芝士奶蓋茶",
  "手調風味茶",
  "鮮顆茶",
  "鮮奶茶",
  "口感茶",
  "冬瓜系列"
];

export const menuItems: MenuItem[] = [
  // 內行必喝推薦
  { id: 't1', name: '招牌紅茶', price: 30, category: '內行必喝推薦', isHotAvailable: true },
  { id: 't2', name: '波霸奶茶', price: 50, category: '內行必喝推薦', isHotAvailable: true },
  { id: 't3', name: '招牌紅拿鐵', price: 60, category: '內行必喝推薦', isHotAvailable: true },
  { id: 't4', name: '冬瓜鐵觀音', price: 40, category: '內行必喝推薦', isHotAvailable: false },
  { id: 't5', name: '荔枝烏龍', price: 50, category: '內行必喝推薦', isHotAvailable: false },
  { id: 't6', name: '翡翠檸檬茶', price: 50, category: '內行必喝推薦', isHotAvailable: false },

  // 本味茶
  { id: 't7', name: '茉莉綠茶', price: 30, category: '一沐日-本味茶', isHotAvailable: true },
  { id: 't8', name: '日月潭紅茶(台茶12號)', price: 40, category: '一沐日-本味茶', isHotAvailable: true },
  { id: 't9', name: '鐵觀音', price: 35, category: '一沐日-本味茶', isHotAvailable: true },
  { id: 't10', name: '碳焙烏龍', price: 35, category: '一沐日-本味茶', isHotAvailable: true },
  { id: 't11', name: '油切蕎麥茶(無糖)', price: 30, category: '一沐日-本味茶', isHotAvailable: true },
  { id: 't12', name: '手採高山青', price: 35, category: '一沐日-本味茶', isHotAvailable: true },

  // 芝士奶蓋茶
  { id: 't13', name: '奶蓋招牌紅', price: 50, category: '芝士奶蓋茶', isHotAvailable: false },
  { id: 't14', name: '奶蓋烏龍', price: 50, category: '芝士奶蓋茶', isHotAvailable: false },
  { id: 't15', name: '奶蓋綠茶', price: 50, category: '芝士奶蓋茶', isHotAvailable: false },
  { id: 't16', name: '奶蓋鐵觀音', price: 50, category: '芝士奶蓋茶', isHotAvailable: false }
];

export const sweetnessOptions = ['標準甜', '七分甜', '五分甜', '三分甜', '原味'];
export const iceOptions = ['正常', '少冰', '微冰', '去冰', '熱'];

export const addOns = [
  { name: '波霸', price: 5 },
  { name: '蘆薈', price: 10 },
  { name: '嫩仙草', price: 10 },
  { name: '胚芽', price: 10 },
  { name: '愛玉', price: 10 },
  { name: '可可豆', price: 10 }
];
