import React, { useState, useEffect } from 'react';
import { orderAPI } from '../services/api';
import QRCodeDisplay from '../components/QRCodeDisplay';
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  RotateCcw, 
  XCircle,
  Flame,
  ChefHat,
  Sparkles,
  ShoppingBag
} from 'lucide-react';

const STAGES = [
  { key: 'PLACED', label: 'Placed', icon: Clock },
  { key: 'ACCEPTED', label: 'Accepted', icon: ChefHat },
  { key: 'PREPARING', label: 'Preparing', icon: Flame },
  { key: 'READY', label: 'Ready for Pickup', icon: QrCode },
  { key: 'PICKED_UP', label: 'Picked Up', icon: CheckCircle2 }
];

export default function OrderTracking() {
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 4000); // 4-second polling auto-refresh
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = () => {
    orderAPI.getMyOrders()
      .then(res => {
        setOrders(res.data);
        if (res.data.length > 0) {
          if (!selectedOrderId) {
            const active = res.data.find(o => ['PLACED', 'ACCEPTED', 'PREPARING', 'READY'].includes(o.status));
            setSelectedOrderId(active ? active.id : res.data[0].id);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (selectedOrderId) {
      orderAPI.getOrderById(selectedOrderId)
        .then(res => setOrderDetails(res.data))
        .catch(() => {});
    }
  }, [selectedOrderId]);

  const handleCancel = async () => {
    if (!orderDetails) return;
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      await orderAPI.cancelOrder(orderDetails.id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/70 dark:bg-[#0b0f17] py-20 text-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-gray-500 font-bold text-sm">Loading Live Order Tracking...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/70 dark:bg-[#0b0f17] py-20 text-center">
        <div className="max-w-md mx-auto px-4">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="font-headline font-black text-3xl text-gray-900 dark:text-white mb-2">
            No Orders Found
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            You haven't placed any food pre-orders yet.
          </p>
        </div>
      </div>
    );
  }

  const order = orderDetails || orders.find(o => o.id === selectedOrderId) || orders[0];
  const currentStageIndex = STAGES.findIndex(s => s.key === order.status);
  const isCancelled = order.status === 'CANCELLED';
  const queueInfo = order.queueInfo || { queuePosition: 1, estimatedWaitMins: 10 };

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-[#0b0f17] py-10 text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* HEADER & SELECTOR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black text-primary uppercase tracking-widest block mb-1">
              Live Campus Queue Tracker
            </span>
            <h1 className="font-headline font-black text-3xl sm:text-4xl text-gray-900 dark:text-white">
              Order #{order.order_number}
            </h1>
          </div>

          {orders.length > 1 && (
            <div className="shrink-0">
              <label className="text-xs font-bold text-gray-400 block mb-1">Select Order:</label>
              <select
                value={order.id}
                onChange={(e) => setSelectedOrderId(e.target.value)}
                className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer"
              >
                {orders.map(o => (
                  <option key={o.id} value={o.id}>
                    #{o.order_number} - {o.cafeteria_name} ({o.status})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* SMART QUEUE HERO CARD */}
        {!isCancelled && order.status !== 'PICKED_UP' && (
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden glow-orange border border-orange-500/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
              
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs font-black uppercase tracking-wider text-orange-400">
                    Smart Queue Real-Time Estimation
                  </span>
                </div>
                
                <h2 className="font-headline font-black text-3xl sm:text-5xl tracking-tight leading-tight">
                  {order.status === 'READY' ? (
                    <span className="text-emerald-400 animate-pulse">Ready for Pickup! 🎉</span>
                  ) : (
                    <span>You are <strong className="text-primary font-black">#{queueInfo.queuePosition}</strong> in pickup queue</span>
                  )}
                </h2>
                
                <p className="text-xs sm:text-sm text-gray-300 mt-3 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{order.cafeteria_name} • {order.cafeteria_location}</span>
                </p>
              </div>

              {/* Estimated Wait Box */}
              <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-2xl text-center shrink-0 min-w-[170px] shadow-xl">
                <p className="text-[11px] text-gray-400 uppercase font-black tracking-wider">Est. Preparation</p>
                <p className="font-headline font-black text-4xl text-emerald-400 mt-1">
                  ~{queueInfo.estimatedWaitMins} <span className="text-xs font-normal text-gray-300">min</span>
                </p>
              </div>

            </div>
          </div>
        )}

        {/* 5-STAGE PROGRESS TRACKER */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-200/80 dark:border-slate-800 shadow-xl">
          <h3 className="font-headline font-black text-xl text-gray-900 dark:text-white mb-8">
            Kitchen Preparation Stage
          </h3>

          {isCancelled ? (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm font-bold flex items-center gap-2 border border-red-200">
              <XCircle className="w-5 h-5 text-red-600" />
              <span>This order has been CANCELLED.</span>
            </div>
          ) : (
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-8 right-8 h-1 bg-gray-200 dark:bg-slate-800 -z-0" />
              
              <div className="grid grid-cols-5 gap-2 relative z-10">
                {STAGES.map((s, idx) => {
                  const Icon = s.icon;
                  const isCompleted = currentStageIndex >= idx;
                  const isCurrent = currentStageIndex === idx;

                  return (
                    <div key={s.key} className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        isCurrent 
                          ? 'bg-primary text-white shadow-lg shadow-orange-500/40 scale-110 ring-4 ring-orange-100 dark:ring-orange-950' 
                          : isCompleted 
                          ? 'bg-emerald-500 text-white shadow-md' 
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-400'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      
                      <span className={`text-xs font-bold mt-3 leading-tight ${
                        isCurrent ? 'text-primary font-black' : isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* QR PICKUP PASS BOX */}
        {!isCancelled && (
          <QRCodeDisplay
            pickupCode={order.pickup_code}
            status={order.status}
            orderNumber={order.order_number}
          />
        )}

        {/* ORDER ITEMS RECEIPT BREAKDOWN */}
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-200/80 dark:border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
            <h3 className="font-headline font-black text-xl text-gray-900 dark:text-white">
              Order Receipt
            </h3>
            <span className="text-xs font-bold text-gray-400">
              Type: {order.order_type} {order.scheduled_time ? `(${order.scheduled_time})` : ''}
            </span>
          </div>

          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm font-semibold">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white">{item.quantity}x {item.item_name}</span>
                  <span className="text-xs text-gray-400 block font-normal">₹{item.unit_price} each</span>
                </div>
                <span className="font-black text-gray-900 dark:text-white">₹{item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
            <span className="font-headline font-bold text-gray-900 dark:text-white">Total Amount Paid</span>
            <span className="font-headline font-black text-3xl text-primary">₹{order.total_amount}</span>
          </div>

          {['PLACED', 'ACCEPTED'].includes(order.status) && (
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 text-center">
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="px-6 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs transition-colors"
              >
                {cancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
