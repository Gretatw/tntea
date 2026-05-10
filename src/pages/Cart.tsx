import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { createOrder } from '../lib/db';
import { useAuth } from '../hooks/useAuth';
import { loginWithGoogle } from '../lib/firebase';
import { Trash2, ChevronLeft } from 'lucide-react';

export default function Cart() {
  const { items, removeItem, getTotal, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      alert("請先登入");
      loginWithGoogle();
      return;
    }
    
    if (items.length === 0) return;

    setIsSubmitting(true);
    const orderId = await createOrder({
      userId: user.uid,
      status: 'pending',
      total: getTotal(),
      items: items,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    
    setIsSubmitting(false);

    if (orderId) {
      clearCart();
      navigate('/orders');
    } else {
      alert("結帳失敗，請稍後再試");
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-20 text-center animate-in fade-in slide-in-from-bottom-4">
        <div className="bg-white p-12 rounded-3xl shadow-sm border border-stone-100">
          <h2 className="text-2xl font-bold text-stone-800 mb-4">購物車是空的</h2>
          <p className="text-stone-500 mb-8">快去看看有什麼好喝的吧！</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-green-700 text-white px-8 py-3 rounded-full font-medium hover:bg-green-800 transition-colors"
          >
            返回菜單
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-stone-200 rounded-full transition-colors text-stone-600">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-serif font-bold text-stone-800">購物車</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
        <ul className="divide-y divide-stone-100">
          {items.map((item, index) => (
            <li key={index} className="p-6 flex justify-between items-start hover:bg-stone-50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-stone-800">{item.name} <span className="text-stone-400 text-sm ml-2">x {item.quantity}</span></h3>
                  <span className="font-bold text-stone-700">${item.price * item.quantity}</span>
                </div>
                <div className="mt-2 text-sm text-stone-500 space-y-1">
                  <p>甜度：{item.sugar} | 冰量：{item.ice}</p>
                  {item.toppings.length > 0 && <p>加料：{item.toppings.join(', ')}</p>}
                </div>
              </div>
              <button 
                onClick={() => removeItem(index)}
                className="ml-6 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </li>
          ))}
        </ul>

        <div className="bg-stone-50 p-6 border-t border-stone-100">
          <div className="flex justify-between items-center mb-6 text-xl">
            <span className="font-medium text-stone-600">總計</span>
            <span className="font-bold text-stone-900">${getTotal()}</span>
          </div>

          <button 
            onClick={handleCheckout}
            disabled={isSubmitting}
            className="w-full bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-orange-600/20 text-lg"
          >
            {isSubmitting ? '送出訂單中...' : '確認結帳'}
          </button>
        </div>
      </div>
    </div>
  );
}
