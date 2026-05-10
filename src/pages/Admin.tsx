import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { subscribeToAllOrders, updateOrderStatus } from '../lib/db';
import { Order, OrderStatus } from '../lib/types';
import { Navigate } from 'react-router-dom';
import clsx from 'clsx';
import { UserCircle, Clock } from 'lucide-react';

const STATUS_OPTIONS: { value: OrderStatus, label: string }[] = [
  { value: 'pending', label: '待處理' },
  { value: 'preparing', label: '製作中' },
  { value: 'ready', label: '待取餐' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' }
];

export default function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    if (isAdmin) {
      const unsubscribe = subscribeToAllOrders(setOrders);
      return () => unsubscribe();
    }
  }, [isAdmin]);

  if (loading) return null;
  if (!user || !isAdmin) return <Navigate to="/" />;

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus, Date.now());
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-serif font-bold text-stone-800">後台訂單管理</h1>
        
        <div className="flex gap-2 bg-white p-1 rounded-xl shadow-sm border border-stone-200 overflow-x-auto max-w-full">
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
              filter === 'all' ? "bg-stone-800 text-white" : "text-stone-600 hover:bg-stone-100"
            )}
          >
            全部
          </button>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={clsx(
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                filter === opt.value ? "bg-green-700 text-white" : "text-stone-600 hover:bg-stone-100"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
            <p className="text-stone-500">沒有符合條件的訂單</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 flex flex-col lg:flex-row gap-6">
              
              <div className="flex-1 space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs text-stone-400 bg-stone-100 px-2 py-1 rounded">#{order.id.slice(-6).toUpperCase()}</span>
                  <span className="text-stone-500 text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {new Date(order.createdAt).toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <ul className="divide-y divide-stone-50 space-y-2">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="pt-2">
                      <div className="font-bold text-stone-800 text-lg">
                        {item.name} <span className="text-stone-500 font-normal">x{item.quantity}</span>
                      </div>
                      <div className="text-sm text-stone-600 mt-1 pl-4 border-l-2 border-stone-200">
                        {item.sugar} | {item.ice} {item.toppings.length > 0 && `| +${item.toppings.join(', ')}`}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full lg:w-64 shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-stone-100 pt-4 lg:pt-0 lg:pl-6">
                <div>
                  <div className="text-sm text-stone-500 mb-1">訂單狀態</div>
                  <select 
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                    className={clsx(
                      "w-full text-base border-2 rounded-xl px-3 py-2 font-bold focus:ring-0 cursor-pointer outline-none transition-colors",
                      order.status === 'pending' ? 'border-yellow-300 bg-yellow-50 text-yellow-800' :
                      order.status === 'preparing' ? 'border-blue-300 bg-blue-50 text-blue-800' :
                      order.status === 'ready' ? 'border-orange-300 bg-orange-50 text-orange-800' :
                      order.status === 'completed' ? 'border-green-300 bg-green-50 text-green-800' :
                      'border-red-300 bg-red-50 text-red-800'
                    )}
                  >
                    {STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mt-6">
                  <div className="text-sm text-stone-500 mb-1">總計金額</div>
                  <div className="text-3xl font-bold text-stone-900">${order.total}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
