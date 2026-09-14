import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderAPI, cafeteriaAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { 
  Clock, 
  MapPin, 
  ArrowRight, 
  RotateCcw, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  ChevronRight,
  QrCode,
  ShoppingBag,
  TrendingUp,
  Award
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [cafeterias, setCafeterias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showQRModal, setShowQRModal] = useState(false);

  useEffect(() => {
    Promise.all([
      orderAPI.getMyOrders(),
      cafeteriaAPI.getAll()
    ])
      .then(([ordersRes, cafeRes]) => {
        setOrders(ordersRes.data);
        setCafeterias(cafeRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const activeOrder = orders.find(o => ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
  const pastOrders = orders.filter(o => ['PICKED_UP', 'CANCELLED'].includes(o.status));

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-[#0b0f17] text-gray-900 dark:text-gray-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* PERSONALIZED GREETING BANNER */}
        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 rounded-[2.5rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden glow-orange">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider">
                🎓 Campus Student Hub
              </span>
              <span className="text-xs font-bold text-orange-100">
                {orders.length} total orders placed
              </span>
            </div>
            
            <h1 className="font-headline font-black text-3xl sm:text-5xl tracking-tight leading-tight">
              Good afternoon, {user?.name || 'Alex'} 👋
            </h1>
            <p className="text-orange-100 text-sm sm:text-base font-medium mt-2 mb-6">
              Beat the break-time rush! Check cafeteria wait times and pre-order your favorite meals.
            </p>

            <Link
              to="/menu"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-gray-900 font-black text-sm shadow-xl hover:bg-orange-50 transition-all hover:scale-105"
            >
              <span>Order Food Now</span>
              <ArrowRight className="w-4 h-4 text-primary" />
            </Link>
          </div>
        </div>

        {/* ACTIVE ORDER HERO CARD (HIGH CONTRAST & SLEEK) */}
        {activeOrder && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl relative border-2 border-orange-500/40 glow-orange">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200/80 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-primary">Live Active Order</span>
                </div>
                <h2 className="font-headline font-black text-3xl sm:text-4xl text-gray-900 dark:text-white">
                  Order #{activeOrder.order_number}
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5 mt-1.5 font-bold">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span>{activeOrder.cafeteria_name} • {activeOrder.cafeteria_location}</span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${
                  activeOrder.status === 'READY' ? 'bg-emerald-500 text-white animate-bounce' :
                  activeOrder.status === 'PREPARING' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                }`}>
                  {activeOrder.status}
                </span>

                <button
                  onClick={() => setShowQRModal(true)}
                  className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black text-xs flex items-center gap-2 hover:scale-105 transition-transform shadow-lg"
                >
                  <QrCode className="w-4 h-4 text-primary" />
                  <span>View QR Pass</span>
                </button>
              </div>
            </div>

            {/* Smart Queue Metrics */}
            {activeOrder.queueInfo && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8">
                <div className="bg-orange-50/80 dark:bg-slate-800/80 p-6 rounded-2xl border border-orange-200/80 dark:border-slate-700/80">
                  <p className="text-xs font-black text-orange-700 dark:text-orange-300 uppercase tracking-wider">Queue Position</p>
                  <p className="font-headline font-black text-4xl text-gray-900 dark:text-white mt-1">
                    #{activeOrder.queueInfo.queuePosition}{' '}
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-300">orders ahead</span>
                  </p>
                </div>

                <div className="bg-emerald-50/80 dark:bg-slate-800/80 p-6 rounded-2xl border border-emerald-200/80 dark:border-slate-700/80">
                  <p className="text-xs font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Est. Preparation Time</p>
                  <p className="font-headline font-black text-4xl text-emerald-600 dark:text-emerald-400 mt-1">
                    ~{activeOrder.queueInfo.estimatedWaitMins} mins
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-gray-600 dark:text-gray-400 font-bold">
                Ordered at {new Date(activeOrder.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <Link
                to={`/orders`}
                className="text-xs font-black text-primary hover:underline flex items-center gap-1"
              >
                <span>Track Full Timeline</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}

        {/* QR MODAL */}
        {showQRModal && activeOrder && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-sm w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 relative shadow-2xl border border-gray-200 dark:border-slate-800">
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 text-2xl font-bold"
              >
                &times;
              </button>
              <QRCodeDisplay
                pickupCode={activeOrder.pickup_code}
                status={activeOrder.status}
                orderNumber={activeOrder.order_number}
              />
            </div>
          </div>
        )}

        {/* CAFETERIA RUSH RADAR */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <span className="text-xs font-black text-primary uppercase tracking-widest block mb-1">Live Campus Radar</span>
              <h2 className="font-headline font-black text-3xl text-gray-900 dark:text-white">
                Cafeteria Rush Status
              </h2>
            </div>
            <Link to="/menu" className="text-xs font-bold text-primary hover:underline">
              View All Menus →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {cafeterias.map(c => {
              const rush = c.rush || { rushLabel: 'Low Rush', estimatedWaitAvg: '5-10 min' };
              return (
                <Link
                  key={c.id}
                  to={`/menu?cafeteria=${c.id}`}
                  className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-gray-200/80 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 group flex flex-col justify-between hover:-translate-y-1"
                >
                  <div>
                    <div className="relative h-36 rounded-2xl overflow-hidden mb-4">
                      <img src={c.image_url} alt={c.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black text-emerald-600 shadow-md">
                        🟢 {rush.rushLabel}
                      </div>
                    </div>
                    <h3 className="font-headline font-black text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {c.name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-1 font-medium">{c.location}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-gray-400">Wait: <strong className="text-gray-700 dark:text-gray-300">{rush.estimatedWaitAvg}</strong></span>
                    <span className="font-bold text-primary">Order Now →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* PAST ORDERS & RE-ORDER */}
        <div>
          <h2 className="font-headline font-black text-2xl text-gray-900 dark:text-white mb-6">
            Past Order History
          </h2>

          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-200/80 dark:border-slate-800 shadow-xl divide-y divide-gray-100 dark:divide-slate-800">
            {pastOrders.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-12">No past orders yet. Place your first order!</p>
            ) : (
              pastOrders.slice(0, 5).map(o => (
                <div key={o.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-headline font-bold text-base text-gray-900 dark:text-white">Order #{o.order_number}</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold">
                        {o.cafeteria_name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      {o.items?.map(i => `${i.quantity}x ${i.item_name}`).join(', ')} • Total: ₹{o.total_amount}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{o.status}</span>
                    </span>
                    <Link
                      to={`/menu?cafeteria=${o.cafeteria_id}`}
                      className="px-4 py-2 rounded-xl bg-orange-500/10 text-primary font-bold text-xs flex items-center gap-1.5 hover:bg-primary hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-order</span>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
