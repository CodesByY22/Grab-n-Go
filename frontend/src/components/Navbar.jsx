import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import RoleSwitcher from './RoleSwitcher';
import Logo from './Logo';
import { notificationAPI, orderAPI } from '../services/api';
import { 
  ShoppingBag, 
  Bell, 
  Clock, 
  LogOut, 
  Sparkles,
  CheckCircle,
  LayoutDashboard,
  ChefHat,
  Shield,
  Sun,
  Moon
} from 'lucide-react';

export default function Navbar({ cartCount = 0 }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [activeOrder, setActiveOrder] = useState(null);

  const currentRole = user?.role || 'STUDENT';

  useEffect(() => {
    if (user && user.role === 'STUDENT') {
      orderAPI.getMyOrders()
        .then(res => {
          const active = res.data.find(o => ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
          setActiveOrder(active || null);
        })
        .catch(() => {});

      notificationAPI.getNotifications()
        .then(res => setNotifications(res.data))
        .catch(() => {});
    }
  }, [user, location.pathname]);

  const unreadNotifs = notifications.filter(n => !n.is_read);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0b0f17]/90 backdrop-blur-md border-b border-gray-200/80 dark:border-slate-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to={currentRole === 'VENDOR' ? '/vendor' : currentRole === 'ADMIN' ? '/admin' : '/dashboard'}>
          <Logo size="md" />
        </Link>

        {/* DYNAMIC ROLE-BASED NAVIGATION LINKS */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-gray-200/60 dark:border-slate-800">
          
          {/* STUDENT ROLE NAVIGATION */}
          {currentRole === 'STUDENT' && (
            <>
              <Link
                to="/"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/') 
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary'
                }`}
              >
                Home
              </Link>
              
              <Link
                to="/dashboard"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive('/dashboard') 
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Student Hub</span>
              </Link>

              <Link
                to="/menu"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive('/menu') 
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary'
                }`}
              >
                Cafeterias & Menu
              </Link>

              <Link
                to="/orders"
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isActive('/orders') 
                    ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary'
                }`}
              >
                <span>My Orders</span>
                {activeOrder && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </Link>
            </>
          )}

          {/* VENDOR ROLE NAVIGATION */}
          {currentRole === 'VENDOR' && (
            <>
              <Link
                to="/vendor"
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  isActive('/vendor') 
                    ? 'bg-primary text-white shadow-md' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-slate-800'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span>Kitchen Kanban</span>
              </Link>
            </>
          )}

          {/* ADMIN ROLE NAVIGATION */}
          {currentRole === 'ADMIN' && (
            <>
              <Link
                to="/admin"
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                  isActive('/admin') 
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Command Center</span>
              </Link>
            </>
          )}

        </nav>

        {/* Right Action Cluster */}
        <div className="flex items-center gap-3">
          
          {/* Quick Role Switcher */}
          <div className="hidden sm:block">
            <RoleSwitcher />
          </div>

          {/* Student Active Order Queue Pill */}
          {currentRole === 'STUDENT' && activeOrder && activeOrder.queueInfo && (
            <Link
              to="/orders"
              className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-all shadow-sm animate-bounce"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>
                {activeOrder.queueInfo.status === 'READY'
                  ? 'Ready for Pickup! 🎉'
                  : `#${activeOrder.queueInfo.queuePosition} in Queue (~${activeOrder.queueInfo.estimatedWaitMins}m)`}
              </span>
            </Link>
          )}

          {/* Theme Mode Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all hover:scale-105"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>

          {/* Notification Bell (For Student & Vendor) */}
          <div className="relative">
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="p-2.5 rounded-2xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-secondary text-white text-[10px] font-black flex items-center justify-center shadow-md">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifs && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-3">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100 dark:border-slate-800">
                  <h4 className="font-headline font-bold text-sm text-gray-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>Campus Alerts</span>
                  </h4>
                  <span className="text-xs text-gray-400">{notifications.length} recent</span>
                </div>
                
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-4">No recent notifications</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs flex items-start gap-2.5">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white">{n.title}</p>
                          <p className="text-gray-600 dark:text-gray-400 text-[11px] mt-0.5">{n.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Cart Icon (Only for Student) */}
          {currentRole === 'STUDENT' && (
            <Link
              to="/cart"
              className="p-2.5 rounded-2xl bg-primary text-white hover:bg-orange-600 transition-transform active:scale-95 relative shadow-lg shadow-orange-500/25 flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {/* User Profile / Logout */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200 dark:border-slate-800">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                <p className="text-[10px] font-black text-primary uppercase">{user.role}</p>
              </div>
              <button
                onClick={logout}
                className="p-2 rounded-xl text-gray-400 hover:text-secondary hover:bg-red-50 dark:hover:bg-slate-800 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : null}

        </div>

      </div>
    </header>
  );
}
