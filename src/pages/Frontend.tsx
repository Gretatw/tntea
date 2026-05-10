import { useState } from 'react';
import { useCart, CartItem } from '../context/CartContext';
import { menuItems, menuCategories, sweetnessOptions, iceOptions, addOns, MenuItem } from '../data/menu';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ShoppingCart, Plus, Minus, X, CheckCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

export default function Frontend() {
  const [activeCategory, setActiveCategory] = useState(menuCategories[0]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items, totalAmount } = useCart();

  const filteredItems = menuItems.filter(i => i.category === activeCategory);

  return (
    <div className="min-h-screen bg-[#f5f5f0] pb-24 font-serif text-[#333]">
      <header className="bg-white/80 backdrop-blur-md text-[#5A5A40] border-b border-gray-200 p-4 sticky top-0 z-10 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-bold tracking-tight">一沐日 線上點單</h1>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 bg-[#E8E4D9] text-[#5A5A40] rounded-full hover:bg-[#d8d4c9] transition"
        >
          <ShoppingCart size={24} />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-400 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-bold">
              {items.length}
            </span>
          )}
        </button>
      </header>

      {/* Categories Horizontal Scroll */}
      <div className="bg-[#f5f5f0] overflow-x-auto whitespace-nowrap py-4 px-4 flex space-x-3">
        {menuCategories.map(cat => {
          const hasItems = menuItems.some(item => item.category === cat);
          if (!hasItems) return null; // hide empty categories
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-5 py-2.5 rounded-full text-sm font-sans tracking-wide transition-colors shadow-sm",
                activeCategory === cat ? "bg-[#5A5A40] text-white" : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-100"
              )}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {/* Menu List */}
      <main className="p-4 max-w-2xl mx-auto space-y-4">
        {filteredItems.map(item => (
          <div key={item.id} className="bg-white p-5 rounded-[24px] shadow-sm flex items-center justify-between border border-gray-100 cursor-pointer hover:shadow-md transition" onClick={() => setSelectedItem(item)}>
            <div>
              <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
              <p className="text-gray-500 text-sm mt-1 italic font-sans">NT$ {item.price}</p>
            </div>
            <button className="bg-[#E8E4D9] text-[#5A5A40] p-3 rounded-full hover:bg-[#d8d4c9] transition-colors">
              <Plus size={20} />
            </button>
          </div>
        ))}
        {filteredItems.length === 0 && (
          <p className="text-center text-gray-500 py-10 font-sans tracking-widest text-sm">此分類暫無商品</p>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-gray-200 z-10 flex justify-between items-center max-w-2xl mx-auto rounded-t-[32px] shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="pl-4">
            <p className="text-xs text-gray-500 font-sans tracking-widest uppercase">總計 {items.length} 杯</p>
            <p className="font-bold text-xl text-[#5A5A40] font-sans">NT$ {totalAmount}</p>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="bg-[#5A5A40] text-white px-8 py-3.5 rounded-full font-sans font-bold shadow-lg hover:opacity-90 transition tracking-widest"
          >
            查看購物車
          </button>
        </div>
      )}

      {/* Item Config Modal */}
      {selectedItem && (
        <ItemConfigModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}

      {/* Cart Drawer/Modal */}
      {isCartOpen && (
        <CartModal onClose={() => setIsCartOpen(false)} />
      )}
      
      {/* Admin Link */}
      <div className="text-center py-8">
         <Link to="/admin" className="text-xs font-sans tracking-widest uppercase text-gray-400 hover:text-[#5A5A40] transition">管理後台 &rarr;</Link>
      </div>
    </div>
  );
}

function ItemConfigModal({ item, onClose }: { item: MenuItem, onClose: () => void }) {
  const { addItem } = useCart();
  const [sweetness, setSweetness] = useState(sweetnessOptions[0]);
  const [ice, setIce] = useState(iceOptions[0]);
  const [selectedAddOns, setSelectedAddOns] = useState<typeof addOns>([]);
  const [quantity, setQuantity] = useState(1);

  const toggleAddOn = (addon: typeof addOns[0]) => {
    setSelectedAddOns(prev => 
      prev.some(a => a.name === addon.name) 
        ? prev.filter(a => a.name !== addon.name)
        : [...prev, addon]
    );
  };

  const unitPrice = item.price + selectedAddOns.reduce((sum, a) => sum + a.price, 0);

  const handleAdd = () => {
    addItem({
      id: Math.random().toString(36).substring(7),
      menuItem: item,
      sweetness,
      ice,
      addOns: selectedAddOns,
      quantity,
      unitPrice
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in font-serif">
      <div className="bg-[#f5f5f0] w-full max-w-md rounded-t-[32px] sm:rounded-[32px] max-h-[90vh] flex flex-col slide-in-from-bottom shadow-2xl">
        <div className="p-6 border-b border-gray-200/50 flex justify-between items-center bg-white sm:rounded-t-[32px] rounded-t-[32px]">
          <h2 className="font-bold text-2xl text-[#333]">{item.name}</h2>
          <button onClick={onClose} className="p-2 bg-[#E8E4D9] rounded-full text-[#5A5A40] hover:bg-[#d8d4c9] transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 flex-1">
          {/* Sweetness */}
          <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
            <h3 className="text-sm font-sans font-bold tracking-widest uppercase text-gray-400 mb-4">甜度</h3>
            <div className="flex flex-wrap gap-2">
              {sweetnessOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => setSweetness(opt)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-sans transition",
                    sweetness === opt ? "bg-[#5A5A40] text-white" : "bg-[#f5f5f0] text-gray-600 hover:bg-[#E8E4D9]"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Ice */}
          <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
            <h3 className="text-sm font-sans font-bold tracking-widest uppercase text-gray-400 mb-4">溫度/冰塊</h3>
            <div className="flex flex-wrap gap-2">
              {iceOptions.map(opt => (
                <button
                  key={opt}
                  disabled={opt === '熱' && !item.isHotAvailable}
                  onClick={() => setIce(opt)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-sans transition disabled:opacity-30 disabled:cursor-not-allowed",
                    ice === opt ? "bg-[#5A5A40] text-white" : "bg-[#f5f5f0] text-gray-600 hover:bg-[#E8E4D9]"
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
            <h3 className="text-sm font-sans font-bold tracking-widest uppercase text-gray-400 mb-4">加好料</h3>
            <div className="grid grid-cols-2 gap-3">
              {addOns.map(addon => {
                const isSelected = selectedAddOns.some(a => a.name === addon.name);
                return (
                  <button
                    key={addon.name}
                    onClick={() => toggleAddOn(addon)}
                    className={cn(
                      "px-4 py-3 rounded-[16px] text-sm font-sans flex justify-between items-center transition",
                      isSelected ? "bg-[#5A5A40] text-white shadow-md" : "bg-[#f5f5f0] text-gray-600 hover:bg-[#E8E4D9]"
                    )}
                  >
                    <span>{addon.name}</span>
                    <span className={cn("text-xs", isSelected ? "text-white/70" : "text-gray-400 font-bold")}>+${addon.price}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="flex justify-between items-center bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
            <span className="text-sm font-sans font-bold tracking-widest uppercase text-gray-400">數量</span>
            <div className="flex items-center space-x-4 bg-[#f5f5f0] p-1.5 rounded-full">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-2 bg-white rounded-full shadow-sm text-gray-600"><Minus size={16} /></button>
              <span className="font-bold w-6 text-center font-sans">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="p-2 bg-white rounded-full shadow-sm text-gray-600"><Plus size={16} /></button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white rounded-b-[32px] sm:rounded-b-[32px] border-t border-gray-100 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)]">
          <button onClick={handleAdd} className="w-full bg-[#5A5A40] text-white p-4 rounded-full font-sans font-bold tracking-widest flex justify-between items-center hover:opacity-90 transition shadow-xl">
            <span>加入購物車</span>
            <span>NT$ {unitPrice * quantity}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function CartModal({ onClose }: { onClose: () => void }) {
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!name || !phone) {
      alert('請填寫姓名與電話');
      return;
    }
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderData = {
        customerName: name,
        customerPhone: phone,
        items: items.map(i => ({
          name: i.menuItem.name,
          sweetness: i.sweetness,
          ice: i.ice,
          addOns: i.addOns,
          quantity: i.quantity,
          unitPrice: i.unitPrice
        })),
        totalPrice: totalAmount,
        status: 'pending',
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, 'orders'), orderData);
      setIsSuccess(true);
      clearCart();
    } catch (e) {
      console.error(e);
      alert('送出訂單失敗，請稍後再試。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-serif">
        <div className="bg-white w-full max-w-sm rounded-[32px] p-8 text-center space-y-4 shadow-2xl border border-gray-100">
          <div className="w-20 h-20 bg-[#E8E4D9] text-[#5A5A40] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-[#333]">訂單已送出!</h2>
          <p className="text-gray-500 font-sans text-sm leading-loose">我們已收到您的訂單，<br/>店舖正為您準備中。</p>
          <button onClick={onClose} className="mt-8 w-full bg-[#5A5A40] text-white p-4 rounded-full font-sans font-bold tracking-widest hover:opacity-90 transition">
            好的，返回點餐
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col justify-end sm:items-end p-0 sm:p-4 font-serif">
      <div className="bg-[#f5f5f0] w-full sm:w-[400px] sm:rounded-[32px] rounded-t-[32px] h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col slide-in-from-right shadow-2xl">
        <div className="p-6 border-b border-gray-200/50 flex justify-between items-center bg-white sm:rounded-t-[32px] rounded-t-[32px]">
          <h2 className="font-bold text-xl flex items-center text-[#5A5A40]">
            <ShoppingCart className="mr-3" /> 購物車
          </h2>
          <button onClick={onClose} className="p-2 bg-[#E8E4D9] rounded-full text-[#5A5A40] hover:bg-[#d8d4c9] transition">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <ShoppingCart size={40} className="mb-4 opacity-30 text-[#5A5A40]" />
              <p className="font-sans text-sm tracking-widest">購物車是空的</p>
            </div>
          ) : (
            <div className="space-y-4">
            {items.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-[24px] shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between font-bold text-gray-800 text-lg">
                  <span>{item.menuItem.name}</span>
                  <span className="font-sans text-[#5A5A40]">NT$ {item.unitPrice * item.quantity}</span>
                </div>
                <div className="text-sm text-gray-500 mt-2 space-y-1 font-sans italic">
                  <p>{item.sweetness} / {item.ice}</p>
                  {item.addOns.length > 0 && <p>加料: {item.addOns.map(a => a.name).join(', ')}</p>}
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-gray-200">
                  <button onClick={() => removeItem(item.id)} className="text-sm text-red-400 hover:text-red-600 font-sans tracking-widest uppercase transition">移除</button>
                  <div className="flex items-center space-x-2 bg-[#f5f5f0] rounded-full p-1 border border-gray-200">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-gray-600 bg-white rounded-full shadow-sm"><Minus size={14}/></button>
                    <span className="font-bold text-sm w-6 text-center font-sans text-gray-700">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-gray-600 bg-white rounded-full shadow-sm"><Plus size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}

          {items.length > 0 && (
            <div className="pt-6">
              <h3 className="text-[10px] font-sans font-bold tracking-widest uppercase text-gray-400 mb-4">取餐聯絡資料</h3>
              <div className="space-y-3 bg-white p-5 rounded-[24px] shadow-sm border border-gray-100">
                <input 
                  type="text" 
                  placeholder="稱呼 (例如：王先生)" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-[#f5f5f0] border-none rounded-[16px] focus:outline-none focus:ring-2 focus:ring-[#5A5A40] font-sans text-sm"
                />
                <input 
                  type="tel" 
                  placeholder="聯絡電話" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-5 py-3.5 bg-[#f5f5f0] border-none rounded-[16px] focus:outline-none focus:ring-2 focus:ring-[#5A5A40] font-sans text-sm"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white sm:rounded-b-[32px] rounded-b-none border-t border-gray-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col space-y-4">
          <div className="flex justify-between items-center text-[#5A5A40]">
            <span className="text-sm font-sans font-bold tracking-widest">合計</span>
            <span className="font-bold text-2xl font-sans">NT$ {totalAmount}</span>
          </div>
          <button 
            disabled={items.length === 0 || isSubmitting}
            onClick={handleSubmit} 
            className="w-full bg-[#5A5A40] text-white px-8 py-4 rounded-full font-sans font-bold tracking-widest hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-xl"
          >
            {isSubmitting ? '送出中...' : '確認結帳'}
          </button>
        </div>
      </div>
    </div>
  );
}
