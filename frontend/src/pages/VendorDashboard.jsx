import React, { useState, useEffect } from 'react';
import { orderAPI, menuAPI, analyticsAPI, cafeteriaAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Store, 
  Clock, 
  CheckCircle2, 
  QrCode, 
  Plus, 
  Flame, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign, 
  Search, 
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
  ChefHat
} from 'lucide-react';

export default function VendorDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('KANBAN'); // 'KANBAN' | 'MENU' | 'ANALYTICS'
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // QR Code Verification State
  const [pickupCodeInput, setPickupCodeInput] = useState('');
  const [verifyStatus, setVerifyStatus] = useState(null);

  // Add Item Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: '',
    prep_time_mins: '10',
    is_veg: true,
    category_id: '',
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'
  });

  const cafeteriaId = user?.cafeteria?.id;

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 4000); // 4-second polling auto-refresh
    return () => clearInterval(interval);
  }, [cafeteriaId]);

  const fetchData = () => {
    orderAPI.getVendorOrders(cafeteriaId)
      .then(res => setOrders(res.data))
      .catch(() => {});

    if (cafeteriaId) {
      menuAPI.getMenuByCafeteria(cafeteriaId)
        .then(res => setMenuItems(res.data))
        .catch(() => {});

      analyticsAPI.getVendorAnalytics(cafeteriaId)
        .then(res => setAnalytics(res.data))
        .catch(() => {});
    }

    menuAPI.getCategories()
      .then(res => setCategories(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update order status');
    }
  };

  const handleVerifyPickup = async (e) => {
    e.preventDefault();
    if (!pickupCodeInput.trim()) return;

    setVerifyStatus(null);
    try {
      const res = await orderAPI.verifyPickup(pickupCodeInput);
      setVerifyStatus({ success: true, message: res.data.message });
      setPickupCodeInput('');
      fetchData();
    } catch (err) {
      setVerifyStatus({ success: false, message: err.response?.data?.error || 'Invalid code' });
    }
  };

  const handleToggleAvailability = async (item) => {
    try {
      await menuAPI.toggleAvailability(item.id, !item.is_available);
      fetchData();
    } catch (err) {
      alert('Failed to update availability');
    }
  };

  const handleCreateMenuItem = async (e) => {
    e.preventDefault();
    try {
      await menuAPI.createItem({
        ...newItem,
        cafeteria_id: cafeteriaId || (menuItems[0]?.cafeteria_id),
        price: parseFloat(newItem.price),
        prep_time_mins: parseInt(newItem.prep_time_mins, 10)
      });
      setShowAddModal(false);
      setNewItem({
        name: '',
        description: '',
        price: '',
        prep_time_mins: '10',
        is_veg: true,
        category_id: '',
        image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600'
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add menu item');
    }
  };

  const newOrders = orders.filter(o => ['PLACED', 'ACCEPTED'].includes(o.status));
  const preparingOrders = orders.filter(o => o.status === 'PREPARING');
  const readyOrders = orders.filter(o => o.status === 'READY');
  const completedOrders = orders.filter(o => o.status === 'PICKED_UP');

  const stats = analytics?.stats || {
    total_orders: orders.length,
    pending_orders: newOrders.length,
    preparing_orders: preparingOrders.length,
    ready_orders: readyOrders.length,
    completed_orders: completedOrders.length,
    total_revenue: orders.filter(o => o.status === 'PICKED_UP').reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
  };

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-[#0b0f17] py-8 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* HEADER & METRICS ROW */}
        <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 border border-slate-800 shadow-2xl relative overflow-hidden glow-orange">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            
            <div>
              <span className="text-xs font-black text-primary uppercase tracking-widest block mb-1">
                Vendor Kitchen Terminal
              </span>
              <h1 className="font-headline font-black text-3xl text-white flex items-center gap-2">
                <span>{user?.cafeteria?.name || 'Main Campus Cafeteria'}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </h1>
            </div>

            {/* QR Verification Bar */}
            <form onSubmit={handleVerifyPickup} className="flex items-center gap-2 bg-slate-800/90 p-2.5 rounded-2xl border border-slate-700">
              <QrCode className="w-5 h-5 text-primary ml-2 shrink-0" />
              <input
                type="text"
                placeholder="Enter Code (e.g. GN-8942)..."
                value={pickupCodeInput}
                onChange={(e) => setPickupCodeInput(e.target.value)}
                className="bg-transparent text-sm font-bold text-white uppercase focus:outline-none w-44"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-primary hover:bg-orange-600 text-white font-bold text-xs shadow-md transition-colors"
              >
                Verify Pickup
              </button>
            </form>

          </div>

          {verifyStatus && (
            <div className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              verifyStatus.success ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {verifyStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
              <span>{verifyStatus.message}</span>
            </div>
          )}

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            <div className="bg-orange-500/10 p-4 rounded-2xl border border-orange-500/20">
              <p className="text-xs text-orange-400 font-bold">New Orders</p>
              <p className="font-headline font-black text-3xl text-white mt-1">{stats.pending_orders}</p>
            </div>

            <div className="bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
              <p className="text-xs text-amber-400 font-bold">Cooking Now</p>
              <p className="font-headline font-black text-3xl text-white mt-1">{stats.preparing_orders}</p>
            </div>

            <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
              <p className="text-xs text-emerald-400 font-bold">Ready at Counter</p>
              <p className="font-headline font-black text-3xl text-white mt-1">{stats.ready_orders}</p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80">
              <p className="text-xs text-gray-400 font-bold">Completed</p>
              <p className="font-headline font-black text-3xl text-white mt-1">{stats.completed_orders}</p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/80 col-span-2 md:col-span-1">
              <p className="text-xs text-gray-400 font-bold">Today's Revenue</p>
              <p className="font-headline font-black text-3xl text-primary mt-1">₹{stats.total_revenue}</p>
            </div>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-gray-200 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('KANBAN')}
            className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'KANBAN'
                ? 'bg-primary text-white shadow-lg shadow-orange-500/25'
                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:bg-orange-50'
            }`}
          >
            Live Kitchen Kanban
          </button>

          <button
            onClick={() => setActiveTab('MENU')}
            className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'MENU'
                ? 'bg-primary text-white shadow-lg shadow-orange-500/25'
                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:bg-orange-50'
            }`}
          >
            Manage Menu Items ({menuItems.length})
          </button>

          <button
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${
              activeTab === 'ANALYTICS'
                ? 'bg-primary text-white shadow-lg shadow-orange-500/25'
                : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300 hover:bg-orange-50'
            }`}
          >
            Sales Analytics
          </button>
        </div>

        {/* TAB 1: KANBAN BOARD */}
        {activeTab === 'KANBAN' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* COLUMN 1: NEW */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-200/80 dark:border-slate-800 shadow-xl flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-headline font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span>NEW ORDERS</span>
                </h3>
                <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 text-xs font-black flex items-center justify-center">
                  {newOrders.length}
                </span>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px]">
                {newOrders.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-10">No incoming orders</p>
                ) : (
                  newOrders.map(o => (
                    <div key={o.id} className="bg-orange-50/60 dark:bg-slate-800/90 p-4 rounded-2xl border border-orange-200/50 dark:border-slate-700/60 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-headline font-black text-base text-primary">#{o.order_number}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 text-gray-600 dark:text-gray-300">
                          {o.order_type} {o.scheduled_time ? `@ ${o.scheduled_time}` : ''}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-gray-900 dark:text-white">{o.student_name}</p>
                      
                      <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                        {o.items?.map((i, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{i.quantity}x {i.item_name}</span>
                            <span className="font-bold">₹{i.subtotal}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleUpdateStatus(o.id, 'PREPARING')}
                        className="w-full py-2.5 rounded-xl bg-primary hover:bg-orange-600 text-white font-black text-xs shadow transition-colors flex items-center justify-center gap-1.5"
                      >
                        <ChefHat className="w-4 h-4" />
                        <span>Start Cooking</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 2: PREPARING */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-200/80 dark:border-slate-800 shadow-xl flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-headline font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>PREPARING</span>
                </h3>
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-black flex items-center justify-center">
                  {preparingOrders.length}
                </span>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px]">
                {preparingOrders.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-10">No orders cooking</p>
                ) : (
                  preparingOrders.map(o => (
                    <div key={o.id} className="bg-amber-50/60 dark:bg-slate-800/90 p-4 rounded-2xl border border-amber-200/50 dark:border-slate-700/60 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-headline font-black text-base text-amber-600 dark:text-amber-400">#{o.order_number}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200 text-amber-900">
                          Prep ~{o.estimated_prep_mins}m
                        </span>
                      </div>

                      <p className="text-xs font-bold text-gray-900 dark:text-white">{o.student_name}</p>

                      <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                        {o.items?.map((i, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{i.quantity}x {i.item_name}</span>
                            <span className="font-bold">₹{i.subtotal}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleUpdateStatus(o.id, 'READY')}
                        className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow transition-colors flex items-center justify-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4" />
                        <span>Mark Ready for Pickup</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 3: READY FOR PICKUP */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-200/80 dark:border-slate-800 shadow-xl flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-headline font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-bounce" />
                  <span>READY AT COUNTER</span>
                </h3>
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black flex items-center justify-center">
                  {readyOrders.length}
                </span>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px]">
                {readyOrders.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-10">No orders awaiting pickup</p>
                ) : (
                  readyOrders.map(o => (
                    <div key={o.id} className="bg-emerald-50/60 dark:bg-slate-800/90 p-4 rounded-2xl border border-emerald-200/50 dark:border-slate-700/60 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-headline font-black text-base text-emerald-600 dark:text-emerald-400">#{o.order_number}</span>
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-200 text-emerald-900">
                          {o.pickup_code}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-gray-900 dark:text-white">{o.student_name}</p>

                      <button
                        onClick={() => handleUpdateStatus(o.id, 'PICKED_UP')}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow transition-colors flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Confirm Picked Up</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* COLUMN 4: COMPLETED */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-200/80 dark:border-slate-800 shadow-xl flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100 dark:border-slate-800">
                <h3 className="font-headline font-black text-sm text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-gray-400" />
                  <span>COMPLETED</span>
                </h3>
                <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs font-black flex items-center justify-center">
                  {completedOrders.length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                {completedOrders.length === 0 ? (
                  <p className="text-xs text-gray-400 text-center py-10">No completed orders yet</p>
                ) : (
                  completedOrders.slice(0, 8).map(o => (
                    <div key={o.id} className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 text-xs flex justify-between items-center font-bold">
                      <div>
                        <span className="text-gray-900 dark:text-white">#{o.order_number}</span>
                        <span className="text-gray-400 block text-[10px]">{o.student_name}</span>
                      </div>
                      <span className="text-emerald-500">₹{o.total_amount}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MENU MANAGEMENT */}
        {activeTab === 'MENU' && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-200/80 dark:border-slate-800 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-headline font-black text-2xl text-gray-900 dark:text-white">
                  Menu Items Management
                </h2>
                <p className="text-xs text-gray-500 font-medium">Toggle item availability or add new dishes.</p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="px-5 py-3 rounded-2xl bg-primary hover:bg-orange-600 text-white font-black text-xs shadow-lg shadow-orange-500/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Food Item</span>
              </button>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {menuItems.map(item => (
                <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-2xl object-cover" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-base text-gray-900 dark:text-white">{item.name}</h4>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded ${
                          item.is_veg ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {item.is_veg ? 'VEG' : 'NON-VEG'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">₹{item.price} • ~{item.prep_time_mins} min prep</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-colors ${
                        item.is_available 
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' 
                          : 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300'
                      }`}
                    >
                      {item.is_available ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-red-600" />}
                      <span>{item.is_available ? 'In Stock' : 'Sold Out'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: SALES & ANALYTICS */}
        {activeTab === 'ANALYTICS' && (
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-200/80 dark:border-slate-800 shadow-xl space-y-6">
            <h2 className="font-headline font-black text-2xl text-gray-900 dark:text-white">
              Vendor Analytics & Throughput
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-gray-200/60 dark:border-slate-700/60">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-4">Top Ordered Dishes</h4>
                <div className="space-y-3">
                  {analytics?.topItems?.map((ti, idx) => (
                    <div key={idx} className="flex justify-between text-xs font-bold">
                      <span className="text-gray-700 dark:text-gray-300">{idx + 1}. {ti.item_name}</span>
                      <span className="text-primary">{ti.total_qty} ordered (₹{ti.total_sales})</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800/60 p-6 rounded-2xl border border-gray-200/60 dark:border-slate-700/60">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-4">Peak Demand Periods</h4>
                <p className="text-xs text-gray-500 mb-3">Highest kitchen order volume occurs at:</p>
                <div className="space-y-2 text-xs font-bold">
                  <div className="p-3 rounded-xl bg-orange-500/10 text-primary border border-orange-500/20">
                    🔥 12:30 PM - 02:00 PM (Lunch Break Peak)
                  </div>
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    ⚡ 04:30 PM - 05:30 PM (Evening Snacks Peak)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ADD MENU ITEM MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 relative border border-gray-200 dark:border-slate-800 shadow-2xl">
              <h3 className="font-headline font-black text-xl text-gray-900 dark:text-white mb-4">
                Add New Menu Item
              </h3>

              <form onSubmit={handleCreateMenuItem} className="space-y-4 text-xs font-bold">
                <div>
                  <label className="text-gray-500 block mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cold Coffee"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-500 block mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Brief description..."
                    value={newItem.description}
                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-500 block mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="80"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="text-gray-500 block mb-1">Prep Time (mins)</label>
                    <input
                      type="number"
                      required
                      placeholder="10"
                      value={newItem.prep_time_mins}
                      onChange={(e) => setNewItem({ ...newItem, prep_time_mins: e.target.value })}
                      className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="veg-check"
                    checked={newItem.is_veg}
                    onChange={(e) => setNewItem({ ...newItem, is_veg: e.target.checked })}
                    className="w-4 h-4 accent-primary"
                  />
                  <label htmlFor="veg-check" className="text-gray-700 dark:text-gray-300">Pure Vegetarian Item</label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-primary text-white font-bold"
                  >
                    Save Dish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
