import { useState } from 'react';
import { Product, SUGAR_LEVELS, ICE_LEVELS, TOPPINGS } from '../lib/types';
import { useCartStore } from '../store/cartStore';
import { X } from 'lucide-react';
import clsx from 'clsx';

export default function ProductModal({ product, onClose }: { product: Product, onClose: () => void }) {
  const [sugar, setSugar] = useState(SUGAR_LEVELS[0]);
  const [ice, setIce] = useState(ICE_LEVELS[0]);
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore(state => state.addItem);

  const toggleTopping = (toppingName: string) => {
    setSelectedToppings(prev => 
      prev.includes(toppingName) 
        ? prev.filter(t => t !== toppingName)
        : [...prev, toppingName]
    );
  };

  const calculateTotal = () => {
    let total = product.price;
    selectedToppings.forEach(tName => {
      const t = TOPPINGS.find(topp => topp.name === tName);
      if (t) total += t.price;
    });
    return total * quantity;
  };

  const handleAddToCart = () => {
    const unitPrice = calculateTotal() / quantity;
    addItem({
      productId: product.id,
      name: product.name,
      price: unitPrice,
      quantity,
      sugar,
      ice,
      toppings: selectedToppings
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <h2 className="text-2xl font-bold text-stone-800">{product.name}</h2>
          <button onClick={onClose} className="p-2 bg-stone-200 rounded-full hover:bg-stone-300 transition-colors text-stone-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Sugar Options */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wider">甜度</h3>
            <div className="flex flex-wrap gap-2">
              {SUGAR_LEVELS.map(level => (
                <button
                  key={level}
                  onClick={() => setSugar(level)}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                    sugar === level 
                      ? "border-green-700 bg-green-50 text-green-800" 
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Ice Options */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wider">冰量</h3>
            <div className="flex flex-wrap gap-2">
              {ICE_LEVELS.map(level => (
                <button
                  key={level}
                  onClick={() => setIce(level)}
                  className={clsx(
                    "px-4 py-2 rounded-xl text-sm font-medium transition-colors border",
                    ice === level 
                      ? "border-blue-500 bg-blue-50 text-blue-800" 
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Toppings */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wider">加好料</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TOPPINGS.map(topping => (
                <button
                  key={topping.name}
                  onClick={() => toggleTopping(topping.name)}
                  className={clsx(
                    "px-3 py-2 rounded-xl text-sm font-medium transition-colors border flex justify-between items-center",
                    selectedToppings.includes(topping.name)
                      ? "border-orange-500 bg-orange-50 text-orange-800" 
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  )}
                >
                  <span>{topping.name}</span>
                  <span className="opacity-70 text-xs">+${topping.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div>
            <h3 className="text-sm font-bold text-stone-900 mb-3 uppercase tracking-wider">數量</h3>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
              >-</button>
              <span className="font-bold text-lg w-8 text-center">{quantity}</span>
              <button 
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50"
              >+</button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-stone-100 bg-white">
          <button 
            onClick={handleAddToCart}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-green-700/20 flex justify-between px-6 items-center"
          >
            <span>加入購物車</span>
            <span className="text-lg">${calculateTotal()}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
