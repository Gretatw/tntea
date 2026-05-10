import React, { useState, useEffect, ReactNode } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { format } from 'date-fns';
import { Store, LogOut, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react';

export default function Backend() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      setError(err.message || '登入失敗');
    }
  };

  const handleLogout = () => signOut(auth);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-100">載入中...</div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f5f5f0] flex items-center justify-center p-4 font-serif">
        <form onSubmit={handleLogin} className="bg-white p-10 rounded-[32px] shadow-sm border border-gray-100 w-full max-w-sm space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#E8E4D9] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#5A5A40]">
              <Store size={32} />
            </div>
            <h1 className="text-2xl font-bold text-[#5A5A40] tracking-tight">茶聚軒 後台</h1>
            <p className="text-xs font-sans text-gray-400 uppercase tracking-widest mt-2">Manager Login</p>
          </div>
          {error && <p className="text-red-500 bg-red-50 p-4 rounded-[16px] text-sm font-sans text-center">{error}</p>}
          <div className="space-y-4 font-sans">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2 pl-2">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-5 py-3.5 bg-[#f5f5f0] rounded-[16px] focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-sm border-none" />
            </div>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-2 pl-2">密碼</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-5 py-3.5 bg-[#f5f5f0] rounded-[16px] focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-sm border-none" />
            </div>
          </div>
          <button type="submit" className="w-full bg-[#5A5A40] text-white font-sans font-bold tracking-widest uppercase py-4 rounded-full hover:opacity-90 transition shadow-lg">登入</button>
        </form>
      </div>
    );
  }

  return <OrderDashboard onLogout={handleLogout} />;
}

// Ensure interface matches what we save
interface OrderData {
  id: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  createdAt: any;
  items: {
    name: string;
    sweetness: string;
    ice: string;
    addOns: {name: string, price: number}[];
    quantity: number;
    unitPrice: number;
  }[];
}

function OrderDashboard({ onLogout }: { onLogout: () => void }) {
  const [orders, setOrders] = useState<OrderData[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      const results: OrderData[] = [];
      snap.forEach(d => {
        results.push({ id: d.id, ...d.data() } as OrderData);
      });
      setOrders(results);
    });
    return unsub;
  }, []);

  const updateStatus = async (id: string, status: OrderData['status']) => {
    try {
      await updateDoc(doc(db, 'orders', id), { status });
    } catch(e) {
      console.error(e);
      alert('更新失敗');
    }
  };

  const deleteOrder = async (id: string) => {
    if(!confirm('確定刪除此訂單記錄嗎？')) return;
    try {
      await deleteDoc(doc(db, 'orders', id));
    } catch(e) {
      console.error(e);
      alert('刪除失敗');
    }
  };

  // Group orders for kanban board
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const finishedOrders = orders.filter(o => ['completed', 'cancelled'].includes(o.status));

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f5f5f0] text-[#333] font-serif">
      <nav className="w-20 hidden md:flex flex-col items-center py-8 bg-[#5A5A40] text-white border-r border-[#4A4A35]">
        <div className="mb-12 font-bold text-xl italic"><Store size={28}/></div>
        <div className="flex flex-col space-y-10">
          <button className="p-3 bg-[#f5f5f0]/20 rounded-2xl flex flex-col items-center space-y-1">
             <Store size={20}/>
            <span className="text-[10px] font-sans uppercase tracking-widest font-bold mt-1">後台</span>
          </button>
          <button onClick={onLogout} className="p-3 hover:bg-[#f5f5f0]/10 rounded-2xl flex flex-col items-center space-y-1 transition text-white/70 hover:text-white">
             <LogOut size={20}/>
             <span className="text-[10px] font-sans uppercase tracking-widest mt-1">登出</span>
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-20 flex items-center justify-between px-6 md:px-10 bg-white/50 backdrop-blur-sm border-b border-gray-200 shrink-0">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#5A5A40]">一沐日 <span className="text-sm font-normal text-gray-500 italic ml-2">後台管理</span></h1>
          </div>
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-sans text-gray-400 uppercase tracking-tighter">Firebase 即時同步</p>
              <p className="text-xs font-sans text-green-600 flex items-center font-semibold justify-end mt-0.5"><span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>已連線</p>
            </div>
             <button onClick={onLogout} className="md:hidden w-10 h-10 rounded-full bg-[#E8E4D9] flex items-center justify-center text-[#5A5A40]"><LogOut size={16}/></button>
          </div>
        </header>

        <div className="flex-1 p-6 md:p-8 overflow-x-auto">
          <div className="flex space-x-6 min-w-max h-full">
          
          {/* Pending Column */}
          <Column title={`未處理 (${pendingOrders.length})`}>
            {pendingOrders.map(o => (
              <OrderCard key={o.id} order={o} 
                actions={
                  <button onClick={() => updateStatus(o.id, 'preparing')} className="w-full bg-[#5A5A40] text-white font-bold p-3 text-sm rounded-[12px] hover:opacity-90 font-sans tracking-widest uppercase transition">
                    開始製作
                  </button>
                }
              />
            ))}
            {pendingOrders.length === 0 && <p className="text-gray-400 text-center text-sm py-4 font-sans">無新訂單</p>}
          </Column>

          {/* Preparing Column */}
          <Column title={`製作中 (${preparingOrders.length})`}>
            {preparingOrders.map(o => (
              <OrderCard key={o.id} order={o} 
                actions={
                  <div className="flex space-x-2">
                    <button onClick={() => updateStatus(o.id, 'completed')} className="flex-1 bg-[#E8E4D9] text-[#5A5A40] font-bold p-3 text-sm rounded-[12px] hover:bg-[#d8d4c9] transition flex items-center justify-center font-sans">
                      <CheckCircle size={16} className="mr-2" /> 完成
                    </button>
                    <button onClick={() => updateStatus(o.id, 'cancelled')} className="px-4 border border-gray-200 text-gray-500 font-bold py-3 text-sm rounded-[12px] hover:bg-gray-50 transition font-sans">
                      取消
                    </button>
                  </div>
                }
              />
            ))}
          </Column>

          {/* Finished/Cancelled Column */}
          <Column title="已結單/取消">
             {finishedOrders.map(o => (
              <OrderCard key={o.id} order={o} isDimmed={true}
                actions={
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-gray-200">
                     <span className={`text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full font-sans ${o.status === 'completed' ? 'bg-[#E8E4D9] text-[#5A5A40]' : 'bg-gray-100 text-gray-500'}`}>
                        {o.status === 'completed' ? '已完成' : '已取消'}
                     </span>
                     <button onClick={() => deleteOrder(o.id)} className="text-gray-400 hover:text-red-500 p-2 transition"><Trash2 size={16} /></button>
                  </div>
                }
              />
            ))}
          </Column>

        </div>
        </div>
      </main>
    </div>
  );
}

function Column({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="w-[340px] flex-shrink-0 bg-white/60 rounded-[32px] p-4 flex flex-col h-full ring-1 ring-gray-200/50">
      <h2 className="text-[10px] uppercase tracking-widest font-bold text-gray-400 mb-4 px-2 font-sans">{title}</h2>
      <div className="space-y-4 overflow-y-auto pr-2 pb-2">
        {children}
      </div>
    </div>
  );
}

function OrderCard({ order, actions, isDimmed = false }: { order: OrderData, actions: ReactNode, isDimmed?: boolean, key?: React.Key }) {
  const timeInfo = order.createdAt ? format(order.createdAt.toDate(), 'HH:mm') : '';
  const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');
  return (
    <div className={cn("bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 transition", isDimmed && "opacity-50 grayscale")}>
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-100">
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{order.customerName}</h3>
          <p className="text-xs font-sans text-gray-400 tracking-wider mt-1">{order.customerPhone}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-xs font-sans bg-[#f5f5f0] px-2 py-1 rounded-full text-gray-500 flex items-center"><Clock size={12} className="mr-1"/> {timeInfo}</span>
          <span className="font-bold text-[#5A5A40] font-sans mt-2">NT$ {order.totalPrice}</span>
        </div>
      </div>
      
      <div className="space-y-3 mb-5 text-sm font-sans">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex flex-col">
            <div className="flex font-bold text-[#333]">
              <span className="w-6 text-gray-400">{item.quantity}x</span> 
              <span>{item.name}</span>
            </div>
            <p className="text-xs text-gray-400 pl-6 mt-0.5">{item.sweetness} / {item.ice}</p>
            {item.addOns.length > 0 && <p className="text-xs text-[#5A5A40] pl-6 mt-0.5 font-bold">+ {item.addOns.map(a => a.name).join(', ')}</p>}
          </div>
        ))}
      </div>
      
      {actions}
    </div>
  );
}
