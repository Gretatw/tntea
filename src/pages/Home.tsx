import { useState, useEffect } from 'react';
import { getProducts, addProduct } from '../lib/db';
import { Product, CATEGORIES } from '../lib/types';
import { useAuth } from '../hooks/useAuth';
import clsx from 'clsx';
import { Plus } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import ProductModal from '../components/ProductModal';

// Temporary fixed data to seed the DB 
const SEED_DATA = [
  { name: "招牌紅茶", price: 30, category: "內行必喝推薦" },
  { name: "波霸奶茶", price: 50, category: "內行必喝推薦" },
  { name: "招牌紅拿鐵", price: 60, category: "內行必喝推薦" },
  { name: "冬瓜鐵觀音", price: 40, category: "內行必喝推薦" },
  { name: "奶蓋招牌紅", price: 50, category: "芝士奶蓋茶" },
  { name: "奶蓋烏龍", price: 50, category: "芝士奶蓋茶" },
  { name: "波霸紅/綠", price: 35, category: "口感茶" },
  { name: "嫩仙草奶茶", price: 50, category: "口感茶" },
  { name: "招牌冬瓜紅茶", price: 40, category: "冬瓜系列" },
  { name: "冬瓜檸檬", price: 45, category: "冬瓜系列" },
  { name: "茉莉綠茶", price: 30, category: "一沐日 - 本味茶" },
  { name: "鐵觀音", price: 35, category: "一沐日 - 本味茶" },
  { name: "蜂蜜檸檬", price: 50, category: "鮮果茶" },
  { name: "鮮桔茶", price: 55, category: "鮮果茶" },
];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);
  const { isAdmin } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await getProducts();
    setProducts(data);
    setLoading(false);
  };

  const seedDatabase = async () => {
    for (const item of SEED_DATA) {
      await addProduct({
        ...item,
        createdAt: Date.now()
      });
    }
    loadProducts();
  };

  const filteredProducts = products.filter(p => p.category === selectedCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-green-900 text-white p-10 flex flex-col items-center text-center">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80')] bg-cover bg-center" />
        <h1 className="relative z-10 font-serif text-4xl sm:text-5xl font-bold mb-4 tracking-wider">一沐日本味茶</h1>
        <p className="relative z-10 text-green-100 text-lg max-w-lg mb-6">傳承好茶風味，堅持原始天然，每一口都是回甘的感動。</p>
        
        {isAdmin && products.length === 0 && !loading && (
          <button 
            onClick={seedDatabase}
            className="relative z-10 bg-white text-green-900 px-6 py-2 rounded-full font-bold shadow-lg hover:bg-stone-100"
          >
            初始化菜單資料 (管理員)
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Categories Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <div className="sticky top-24 bg-white rounded-2xl p-4 shadow-sm border border-stone-100 flex flex-row overflow-x-auto md:flex-col gap-1">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={clsx(
                  "px-4 py-3 rounded-xl text-sm font-medium text-left transition-colors whitespace-nowrap",
                  selectedCategory === category 
                    ? "bg-green-700 text-white shadow-sm" 
                    : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-stone-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div 
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className="group bg-white rounded-2xl p-5 border border-stone-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <h3 className="font-bold text-lg text-stone-800 group-hover:text-green-700 transition-colors">{product.name}</h3>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-medium text-stone-600">${product.price}</span>
                    <button className="bg-stone-100 p-2 rounded-full text-stone-600 group-hover:bg-green-700 group-hover:text-white transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-20 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
               <p className="text-stone-500">此分類目前沒有飲品</p>
             </div>
          )}
        </div>
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </div>
  );
}
