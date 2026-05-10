import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { subscribeToUserOrders, updateOrderStatus } from '../lib/db';
import { Order } from '../lib/types';
import { Navigate } from 'react-router-dom';
import clsx from 'clsx';
import { Clock, CheckCircle2, XCircle, Coffee } from 'lucide-react';

export default function Orders() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToUserOrders(user.uid, setOrders);
      return () => unsubscribe();
    }
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/" />;

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'pending': return { text: '已收到訂單', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock };
      case 'preparing': return { text: '製作中', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Coffee };
      case 'ready': return { text: '請取餐', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: CheckCircle2 };
      case 'completed': return { text: '已完成', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 };
      case 'cancelled': return { text: '已取消', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle };
      default: return { text: status, color: 'bg-stone-100 text-stone-800', icon: Clock };
    }
  };

  const handleCancel = async (orderId: string) => {
    if (window.confirm("確定要取消這筆訂單嗎？")) {
      await updateOrderStatus(orderId, 'cancelled', Date.now());
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
      <h1 className="text-3xl font-serif font-bold text-stone-800 mb-8">我的訂單</h1>
      
      {orders.length === 0 ? (
         <div className="text-center py-20 bg-white rounded-3xl border border-stone-100 shadow-sm">
           <p className="text-stone-500">目前沒有訂單紀錄</p>
         </div>
      ) : (
        <div className="grid gap-6">
          {orders.map(order => {
            const statusInfo = getStatusDisplay(order.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
                <div className="bg-stone-50 p-4 border-b border-stone-100 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <span className={clsx("px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1.5", statusInfo.color)}>
                      <StatusIcon className="w-4 h-4" />
                      {statusInfo.text}
                    </span>
                    <span className="text-stone-500 text-sm">
                      {new Date(order.createdAt).toLocaleString('zh-TW')}
                    </span>
                  </div>
                  
                  {order.status === 'pending' && (
                    <button 
                      onClick={() => handleCancel(order.id)}
                      className="text-sm text-red-500 hover:text-red-700 font-medium"
                    >
                      取消訂單
                    </button>
                  )}
                </div>
                
                <div className="p-6">
                  <ul className="divide-y divide-stone-50">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="py-3 flex justify-between">
                        <div>
                          <span className="font-bold text-stone-800">{item.name} <span className="font-normal text-stone-500">x{item.quantity}</span></span>
                          <div className="text-xs text-stone-500 mt-1">
                            {item.sugar} | {item.ice} {item.toppings.length > 0 && `| ${item.toppings.join(', ')}`}
                          </div>
                        </div>
                        <span className="font-medium text-stone-700">${item.price * item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 pt-4 border-t border-stone-100 flex justify-between items-center">
                    <span className="font-medium text-stone-500">總計</span>
                    <span className="font-bold text-xl text-stone-900">${order.total}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
