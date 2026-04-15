import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import SocketContext from '../context/SocketContext';
import { FaPlus, FaTrash, FaToggleOn, FaToggleOff, FaClipboardList, FaUtensils, FaCog, FaStore, FaClock, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const VendorDashboard = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('orders'); // orders, menu, settings

  // Create Shop State
  const [shopName, setShopName] = useState('');
  const [shopDesc, setShopDesc] = useState('');

  // Add Item State
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemDesc, setItemDesc] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      navigate('/');
      return;
    }
    fetchMyShop();
  }, [user]);

  useEffect(() => {
    if (shop && socket) {
      socket.emit('join', shop._id);
      const handleNewOrder = (newOrder) => {
        setOrders((prev) => [newOrder, ...prev]);
        toast.info('New order received! 🔔');
      };
      socket.on('newOrder', handleNewOrder);
      return () => socket.off('newOrder', handleNewOrder);
    }
  }, [shop, socket]);

  const fetchMyShop = async () => {
    if (!user?.token) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/shops/myshop', config);
      setShop(data);
      fetchShopOrders();
    } catch (error) {
      console.log('No shop found, create one.');
    } finally {
      setLoading(false);
    }
  };

  const fetchShopOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/orders/shoporders', config);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/orders/${orderId}/status`, { status }, config);
      setOrders((prev) => prev.map((order) => order._id === orderId ? data : order));
      toast.success(`Order status: ${status}`);
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleCreateShop = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/shops', { name: shopName, description: shopDesc }, config);
      setShop(data);
      toast.success('Shop registered! 🏪');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating shop');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.post('/api/shops/menu', {
        name: itemName,
        price: Number(itemPrice),
        description: itemDesc
      }, config);
      setShop({ ...shop, menu: data });
      setItemName(''); setItemPrice(''); setItemDesc('');
      toast.success('Menu item added! 🔥');
    } catch (error) {
      toast.error('Failed to add item');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.delete(`/api/shops/menu/${itemId}`, config);
      setShop({ ...shop, menu: data });
      toast.success('Item removed');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const handleToggleAvailability = async (itemId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put(`/api/shops/menu/${itemId}/toggle`, {}, config);
      setShop({ ...shop, menu: data });
      toast.success('Item status updated');
    } catch (error) {
      toast.error('Failed to update item availability');
    }
  };

  const handleToggleShop = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.put('/api/shops/toggle', {}, config);
      setShop(data);
      toast.success(data.isOpen ? 'Shop is now OPEN' : 'Shop is now CLOSED');
    } catch (error) {
      toast.error('Failed to toggle shop status');
    }
  };

  const completedOrders = orders.filter(o => o.status === 'Completed');

  if (loading) return (
    <div className="flex items-center justify-center min-h-[80vh]">
        <FaSpinner className="text-4xl text-brand animate-spin" />
    </div>
  );

  if (!shop) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-xl mx-auto mt-24 px-4">
        <div className="glass p-10 rounded-[2.5rem] border border-white/5 text-center">
          <div className="text-7xl mb-6">🏪</div>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Your Storefront</h2>
          <p className="text-gray-500 mb-10 font-medium">Ready to serve the campus? Setting up your shop takes less than a minute.</p>
          <form onSubmit={handleCreateShop} className="space-y-5 text-left">
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-brand ml-2 mb-2 block">Shop Name</label>
              <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full glass bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-brand/50 transition-all font-bold" placeholder="e.g. Skyline Cafe" required />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black tracking-widest text-brand ml-2 mb-2 block">Description</label>
              <textarea value={shopDesc} onChange={(e) => setShopDesc(e.target.value)} className="w-full glass bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-brand/50 transition-all h-32 resize-none font-medium" placeholder="Describe your cuisine or specialty..." required />
            </div>
            <button type="submit" className="w-full bg-brand text-white font-black py-4 rounded-2xl hover:bg-brand-hover transition-all shadow-xl shadow-brand/20 active:scale-95">Complete Setup</button>
          </form>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="page-fade-in pb-20 pt-32 px-4 max-w-7xl mx-auto">
      {/* Premium Dashboard Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <div className="flex items-center gap-4 mb-3">
             <h1 className="text-5xl font-black text-white tracking-tighter">{shop.name}</h1>
             <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border backdrop-blur-md ${shop.isOpen ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                {shop.isOpen ? 'Active' : 'Offline'}
             </div>
          </div>
          <p className="text-gray-500 font-medium max-w-xl">{shop.description}</p>
        </div>

        <div className="flex gap-2 glass p-1.5 rounded-2xl border border-white/5 shadow-xl">
           {[
             { id: 'orders', icon: <FaClipboardList />, label: 'Orders' },
             { id: 'menu', icon: <FaUtensils />, label: 'Menu' },
             { id: 'settings', icon: <FaCog />, label: 'Settings' }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all ${activeTab === tab.id ? 'bg-brand text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
             >
               {tab.icon} {tab.label}
             </button>
           ))}
        </div>
      </header>

      {/* Main Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'orders' && (
          <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Active Orders List */}
            <div className="lg:col-span-8 space-y-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-black text-white tracking-tight">Active Live Feed</h2>
                    <span className="bg-brand/10 text-brand text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">{orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length} Orders</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length === 0 ? (
                        <div className="col-span-2 glass py-24 rounded-[2.5rem] border border-white/5 text-center">
                            <div className="text-5xl mb-4 opacity-30">🔔</div>
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Waiting for new orders...</p>
                        </div>
                    ) : (
                        orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).map(order => (
                            <div key={order._id} className={`glass p-6 rounded-[2rem] border border-white/5 hover:border-brand/20 transition-all ${order.status === 'Placed' ? 'ring-2 ring-brand/10' : ''}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <p className="text-[10px] font-black tracking-widest text-brand uppercase mb-1">Order #{order._id.slice(-6)}</p>
                                        <h3 className="text-xl font-bold text-white">{order.user?.name || 'Student'}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 font-black tracking-tighter">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                        <div className="text-brand font-black">₹{order.totalPrice}</div>
                                    </div>
                                </div>
                                
                                <div className="space-y-2 mb-6 max-h-32 overflow-y-auto pr-2 bg-white/5 rounded-xl p-3">
                                    {order.orderItems.map((item, i) => (
                                        <div key={i} className="flex justify-between text-xs font-medium text-gray-400">
                                            <span>{item.qty}x {item.name}</span>
                                            <span className="text-white">₹{item.price * item.qty}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2">
                                    {order.status === 'Placed' && (
                                        <button onClick={() => handleUpdateStatus(order._id, 'Preparing')} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl text-xs font-black transition-all">Accept Order</button>
                                    )}
                                    {order.status === 'Preparing' && (
                                        <button onClick={() => handleUpdateStatus(order._id, 'Ready')} className="flex-1 bg-accent hover:bg-accent-hover text-white py-3 rounded-xl text-xs font-black transition-all">Mark Ready</button>
                                    )}
                                    {order.status === 'Ready' && (
                                        <button onClick={() => handleUpdateStatus(order._id, 'Completed')} className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3 rounded-xl text-xs font-black transition-all">Complete Pickup</button>
                                    )}
                                    <button onClick={() => handleUpdateStatus(order._id, 'Cancelled')} className="px-4 bg-red-500/10 text-red-500 rounded-xl text-xs font-black hover:bg-red-500 hover:text-white transition-all">Reject</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Quick Stats sidebar for Orders */}
            <div className="lg:col-span-4 space-y-6">
                <div className="glass p-8 rounded-[2.5rem] border border-white/5">
                    <h3 className="text-[10px] uppercase font-black text-gray-500 tracking-widest mb-6">Today's Performance</h3>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center text-brand text-xl"><FaCheckCircle /></div>
                            <div>
                                <p className="text-2xl font-black text-white leading-none">{completedOrders.length}</p>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Completed</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent text-xl"><FaClock /></div>
                            <div>
                                <p className="text-2xl font-black text-white leading-none">₹{completedOrders.reduce((acc, o) => acc + o.totalPrice, 0)}</p>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Revenue</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'menu' && (
          <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Add Item Panel */}
            <div className="lg:col-span-4">
                <div className="glass p-8 rounded-[2.5rem] border border-white/5 sticky top-24">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-1.5 h-6 bg-brand rounded-full"></div>
                        <h2 className="text-2xl font-black text-white tracking-tight">Add Item</h2>
                    </div>
                    <form onSubmit={handleAddItem} className="space-y-5">
                         <div>
                            <label className="text-[10px] uppercase font-black tracking-widest text-brand ml-2 mb-2 block">Item Name</label>
                            <input type="text" value={itemName} onChange={(e) => setItemName(e.target.value)} className="w-full glass bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-brand/50 transition-all font-bold placeholder:text-gray-700" placeholder="e.g. Masala Dosa" required />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-black tracking-widest text-brand ml-2 mb-2 block">Price (₹)</label>
                            <input type="number" value={itemPrice} onChange={(e) => setItemPrice(e.target.value)} className="w-full glass bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-brand/50 transition-all font-bold" min="1" placeholder="0.00" required />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-black tracking-widest text-brand ml-2 mb-2 block">Description <span className="opacity-40 italic">(Optional)</span></label>
                            <textarea value={itemDesc} onChange={(e) => setItemDesc(e.target.value)} className="w-full glass bg-white/5 border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-brand/50 transition-all h-24 resize-none font-medium text-sm" placeholder="Brief info about flavor or ingredients..." />
                        </div>
                        <p className="text-[10px] text-gray-500 font-medium px-2 italic">Tip: Use descriptive names to help students find your food faster!</p>
                        <button type="submit" className="w-full bg-brand text-white font-black py-4 rounded-2xl hover:bg-brand-hover transition-all shadow-xl shadow-brand/20 active:scale-95 flex items-center justify-center gap-2">
                            <FaPlus className="text-xs" /> Add To Menu
                        </button>
                    </form>
                </div>
            </div>

            {/* Current Menu List */}
            <div className="lg:col-span-8 flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-white tracking-tight">Active Menu <span className="text-brand">({shop.menu.length})</span></h2>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {shop.menu.length === 0 ? (
                        <div className="glass py-24 rounded-[2.5rem] border border-white/5 text-center">
                            <h3 className="text-xl font-bold text-gray-600">Your Menu is Empty</h3>
                            <p className="text-gray-700 mt-2">Start by adding items from the panel.</p>
                        </div>
                    ) : (
                        shop.menu.map(item => (
                            <div key={item._id} className={`glass p-6 rounded-[2rem] border border-white/5 flex items-center justify-between transition-all hover:bg-white/[0.02] ${!item.isAvailable ? 'opacity-50 grayscale' : ''}`}>
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl group transition-all ${item.isAvailable ? 'text-brand' : 'text-gray-600'}`}>
                                        <FaUtensils />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-brand font-black">₹{item.price}</span>
                                            {item.description && <span className="text-gray-500 text-xs font-medium line-clamp-1 truncate max-w-[200px]">· {item.description}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={() => handleToggleAvailability(item._id)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${item.isAvailable ? 'bg-accent/10 text-accent border-accent/20 hover:bg-accent/20' : 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20'}`}
                                    >
                                        {item.isAvailable ? 'Available' : 'Unavailable'}
                                    </button>
                                    <button onClick={() => handleDeleteItem(item._id)} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all">
                                        <FaTrash className="text-xs" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-2xl">
            <div className="glass p-10 rounded-[2.5rem] border border-white/5">
                <h2 className="text-2xl font-black text-white mb-8">Shop Configuration</h2>
                
                <div className="space-y-8">
                    <div className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] border border-white/10">
                        <div>
                            <h4 className="text-lg font-bold text-white mb-1">Accepting Orders</h4>
                            <p className="text-sm text-gray-500 font-medium">Toggle visibility on the campus map</p>
                        </div>
                        <button 
                            onClick={handleToggleShop}
                            className={`flex items-center gap-3 px-6 py-3 rounded-2xl font-black transition-all ${shop.isOpen ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-red-500 text-white shadow-lg shadow-red-900/40'}`}
                        >
                            {shop.isOpen ? <><FaToggleOn className="text-xl" /> ACTIVE</> : <><FaToggleOff className="text-xl" /> OFFLINE</>}
                        </button>
                    </div>

                    <div className="p-1 border-t border-white/5"></div>

                    <div className="space-y-4 opacity-50 cursor-not-allowed">
                        <label className="text-[10px] uppercase font-black tracking-widest text-gray-500 ml-2 block">Advanced Settings</label>
                        <div className="p-6 bg-white/2 rounded-2xl border border-white/5 flex items-center justify-between">
                             <span className="text-sm font-bold text-gray-600">Inventory Sync</span>
                             <span className="text-[10px] font-black text-gray-700 uppercase">Coming Soon</span>
                        </div>
                        <div className="p-6 bg-white/2 rounded-2xl border border-white/5 flex items-center justify-between">
                             <span className="text-sm font-bold text-gray-600">Reports Export</span>
                             <span className="text-[10px] font-black text-gray-700 uppercase">Coming Soon</span>
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VendorDashboard;
