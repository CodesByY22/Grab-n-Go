import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { 
  ShoppingBag, 
  Trash2, 
  Clock, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function CartPage({ cart = [], clearCart }) {
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState('ASAP'); // 'ASAP' | 'SCHEDULED'
  const [scheduledTime, setScheduledTime] = useState('13:15');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-16 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-4">
          <div className="w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-950 text-primary flex items-center justify-center mx-auto mb-6 shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="font-headline font-black text-3xl text-gray-900 dark:text-white mb-2">
            Your Cart is Empty
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Select a campus cafeteria and add delicious meals to your cart before proceeding.
          </p>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary hover:bg-orange-600 text-white font-bold text-base shadow-xl shadow-orange-500/25 transition-transform hover:scale-105"
          >
            <span>Explore Menu</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    );
  }

  // Calculate totals
  const cafeteriaName = cart[0]?.vendorName || 'Campus Cafeteria';
  const cafeteriaId = cart[0]?.vendorId;

  // Group items by ID
  const groupedMap = {};
  cart.forEach(item => {
    if (groupedMap[item.id]) {
      groupedMap[item.id].quantity += 1;
    } else {
      groupedMap[item.id] = { ...item, quantity: 1 };
    }
  });
  const itemsList = Object.values(groupedMap);

  const subtotal = itemsList.reduce((acc, i) => acc + parseFloat(i.price) * i.quantity, 0);
  const taxes = 0; // Tax-free campus food
  const total = subtotal + taxes;
  const maxPrepMins = Math.max(...itemsList.map(i => i.prep_time_mins || 10));

  const handleCheckout = async () => {
    setPlacing(true);
    setError('');

    try {
      const payload = {
        cafeteriaId,
        items: itemsList.map(i => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity
        })),
        orderType,
        scheduledTime: orderType === 'SCHEDULED' ? scheduledTime : null,
        notes
      };

      const res = await orderAPI.createOrder(payload);
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-10 text-on-surface">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <h1 className="font-headline font-black text-3xl sm:text-4xl text-gray-900 dark:text-white mb-2">
          Order Summary & Checkout
        </h1>
        <p className="text-gray-500 text-sm mb-8">
          Review your items, choose ASAP or Scheduled pickup time, and confirm.
        </p>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-100 text-red-800 text-sm font-bold flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: ORDER ITEMS LIST */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cafeteria Badge */}
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-100 text-primary">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase">Pickup Location</span>
                  <p className="font-headline font-bold text-gray-900 dark:text-white text-base">{cafeteriaName}</p>
                </div>
              </div>
              <button
                onClick={clearCart}
                className="text-xs text-red-500 hover:underline font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear Cart
              </button>
            </div>

            {/* Items */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-md divide-y divide-gray-100 dark:divide-gray-800">
              {itemsList.map(item => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div>
                      <h4 className="font-bold text-sm text-gray-900 dark:text-white">{item.name}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">₹{item.price} each • ~{item.prep_time_mins} min prep</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-headline font-black text-base text-gray-900 dark:text-white">
                      ₹{parseFloat(item.price) * item.quantity}
                    </span>
                    <span className="block text-xs font-bold text-primary">Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ORDER TIMING OPTIONS */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-md">
              <h3 className="font-headline font-bold text-lg text-gray-900 dark:text-white mb-4">
                Pickup Preference
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  onClick={() => setOrderType('ASAP')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    orderType === 'ASAP'
                      ? 'border-primary bg-orange-50/50 dark:bg-orange-950/40 text-primary font-bold shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-5 h-5 text-primary" />
                    <span className="font-headline font-bold text-sm">ASAP Pickup</span>
                  </div>
                  <p className="text-xs text-gray-500 font-normal">
                    Kitchen starts preparing immediately (~{maxPrepMins} min).
                  </p>
                </button>

                <button
                  onClick={() => setOrderType('SCHEDULED')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    orderType === 'SCHEDULED'
                      ? 'border-primary bg-orange-50/50 dark:bg-orange-950/40 text-primary font-bold shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-5 h-5 text-primary" />
                    <span className="font-headline font-bold text-sm">Schedule for Later</span>
                  </div>
                  <p className="text-xs text-gray-500 font-normal">
                    Reserve a specific pickup time slot during break.
                  </p>
                </button>
              </div>

              {orderType === 'SCHEDULED' && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">
                    Select Target Pickup Time (Between 08:00 AM - 08:30 PM):
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              <div className="mt-4">
                <label className="text-xs font-bold text-gray-500 block mb-1">Kitchen Instructions / Allergy Notes (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Extra spicy, less oil, no onion..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

            </div>

          </div>

          {/* RIGHT: CHECKOUT BILL SUMMARY */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6 shadow-xl sticky top-28">
              <h3 className="font-headline font-black text-xl text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                Payment Details
              </h3>

              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span>Campus Subsidy / Tax</span>
                  <span className="text-emerald-500 font-bold">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Prep Duration</span>
                  <span className="font-bold text-gray-900 dark:text-white">~{maxPrepMins} mins</span>
                </div>

                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between text-base">
                  <span className="font-headline font-bold text-gray-900 dark:text-white">Total Amount</span>
                  <span className="font-headline font-black text-2xl text-primary">₹{total}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={placing}
                className="w-full py-4 rounded-2xl bg-primary hover:bg-orange-600 text-white font-black text-base shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                {placing ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>Confirm & Place Order</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-gray-400 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Verified Campus Digital Token</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
