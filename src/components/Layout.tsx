import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { loginWithGoogle, logout } from '../lib/firebase';
import { useCartStore } from '../store/cartStore';
import { ShoppingBag, Coffee, LogOut, LogIn, UserCircle, Settings } from 'lucide-react';
import clsx from 'clsx';

export default function Layout() {
  const { user, isAdmin, loading } = useAuth();
  const cartItems = useCartStore(state => state.items);

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans text-stone-800">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2">
              <Coffee className="h-6 w-6 text-green-700" />
              <span className="font-serif text-xl font-bold tracking-wider text-green-800">一沐日</span>
            </Link>

            <div className="flex items-center gap-4">
              {isAdmin && (
                <Link to="/admin" className="text-stone-500 hover:text-stone-800 flex items-center gap-1 text-sm font-medium">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">後台管理</span>
                </Link>
              )}
              
              <Link to="/cart" className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors">
                <ShoppingBag className="h-6 w-6" />
                {cartItems.length > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-orange-600 rounded-full">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {loading ? (
                <div className="w-8 h-8 rounded-full bg-stone-200 animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-3 ml-2 border-l border-stone-200 pl-4">
                  <Link to="/orders" className="text-sm font-medium text-stone-600 hover:text-stone-900 hidden sm:block">
                    我的訂單
                  </Link>
                  <button 
                    onClick={logout}
                    className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">登出</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={loginWithGoogle}
                  className="flex items-center gap-2 ml-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span>登入</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
