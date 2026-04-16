import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import ShopCard from '../components/ShopCard';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFire, FaClock, FaStore, FaChartLine, FaClipboardList, FaArrowRight, FaPlus, FaBolt } from 'react-icons/fa';

const Home = () => {
  const { user } = useContext(AuthContext);
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [myShopStats, setMyShopStats] = useState({ live: 0, revenue: 0, isOpen: true });
  const resultsRef = useRef(null);

  const fetchVendorStats = async () => {
    if (user?.role === 'vendor' && user?.token) {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data: myShop } = await axios.get('/api/shops/myshop', config);
            const { data: orders } = await axios.get('/api/orders/shoporders', config);
            
            const completed = orders.filter(o => o.status === 'Completed');
            const revenue = completed.reduce((acc, o) => acc + o.totalPrice, 0);
            const live = orders.filter(o => !['Completed', 'Cancelled'].includes(o.status)).length;
            
            setMyShopStats({ live, revenue, isOpen: myShop.isOpen });
        } catch (error) {
            console.log('Vendor has no shop yet or error fetching stats');
        }
    }
  };

  const toggleShopStatus = async () => {
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.put('/api/shops/toggle', {}, config);
        setMyShopStats(prev => ({ ...prev, isOpen: data.isOpen }));
        // Also refresh the main shops list
        const { data: allShops } = await axios.get('/api/shops');
        setShops(allShops);
    } catch (error) {
        console.error('Error toggling shop status:', error);
    }
  };

  useEffect(() => {
    const fetchShopsData = async () => {
      try {
        const { data } = await axios.get('/api/shops');
        setShops(data);
      } catch (error) {
        console.error('Error fetching shops:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShopsData();
    fetchVendorStats();
  }, [user]);

  // Auto-scroll to results when searching
  useEffect(() => {
    if (search.trim().length > 0 && resultsRef.current) {
        // Only scroll if we aren't already looking at the results
        const rect = resultsRef.current.getBoundingClientRect();
        if (rect.top > window.innerHeight * 0.8) {
            resultsRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }
  }, [search]);

  // Comprehensive Search Logic: Checks Shop Name, Description, and Menu Items
  const filteredShops = shops.filter(shop => {
    const query = search.toLowerCase();
    
    // 1. Matches Shop Name
    const nameMatch = shop.name.toLowerCase().includes(query);
    
    // 2. Matches Shop Description
    const descMatch = shop.description?.toLowerCase().includes(query);
    
    // 3. Matches any Menu Item (Name or Description)
    const menuMatch = shop.menu?.some(item => 
      item.name.toLowerCase().includes(query) || 
      item.description?.toLowerCase().includes(query)
    );

    return nameMatch || descMatch || menuMatch;
  });

  return (
    <div className="page-fade-in pt-32">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden px-4 mb-20">
        {/* Background Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, cubicBezier: [0.16, 1, 0.3, 1] }}
          >
            {user?.role === 'vendor' ? (
              /* VENDOR HERO */
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 bg-brand/10 border border-brand/20 rounded-full px-5 py-2 mb-4 glass shadow-xl shadow-brand/5">
                  <FaChartLine className="text-brand text-sm" />
                  <span className="text-brand text-xs font-black uppercase tracking-widest">Vendor Dashboard Active</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                  Empower your <br />
                  <span className="text-gradient">Campus Business.</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                  Welcome back, Operator. Manage your orders, update your menu in real-time, and monitor your cafeteria's performance.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
                    <Link
                        to="/vendor-dashboard"
                        className="w-full sm:w-auto px-10 py-5 bg-brand hover:bg-brand-hover text-white rounded-2xl font-black text-lg transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-3 active:scale-95"
                    >
                        Go to Dashboard <FaArrowRight className="text-sm" />
                    </Link>
                    <Link
                        to="/vendor-dashboard"
                        className="w-full sm:w-auto px-10 py-5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 active:scale-95"
                    >
                        View Active Orders <FaClipboardList className="text-brand" />
                    </Link>
                </div>

                {/* Vendor Portal Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-20 max-w-4xl mx-auto">
                    {[
                        { label: 'Market Presence', value: `${shops.length} Shops`, icon: <FaStore /> },
                        { label: 'Platform Status', value: 'Live 24/7', icon: <FaFire className="text-brand" /> },
                        { label: 'Peak Hour', value: '12:30 PM', icon: <FaClock className="text-accent" /> },
                    ].map((stat, i) => (
                        <div key={i} className="glass-heavy p-6 rounded-3xl border border-white/10 text-left hover:border-brand/30 transition-all group">
                             <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-brand/10 transition-colors">
                                <span className="text-xl text-brand opacity-80">{stat.icon}</span>
                             </div>
                             <p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mb-1">{stat.label}</p>
                             <p className="text-2xl font-black text-white leading-none">{stat.value}</p>
                        </div>
                    ))}
                </div>
              </div>
            ) : (
              /* STUDENT HERO (DEFAULT) */
              <>
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-8 glass shadow-xl">
                  <FaFire className="text-brand text-sm animate-pulse" />
                  <span className="text-gray-300 text-xs font-black uppercase tracking-widest">Official Campus Dining Platform</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9]">
                  Skip the queue. <br />
                  <span className="text-gradient">Grab-n-Go.</span>
                </h1>

                <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
                  The smartest way to order food on campus. Select your shop, customize your meal, and pick it up when it's hot and fresh.
                </p>

                {/* Search Experience */}
                <div className="max-w-2xl mx-auto relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand to-yellow-500 rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
                  <div className="relative flex items-center bg-[#151A23] border border-white/10 rounded-[1.8rem] overflow-hidden p-2 shadow-2xl">
                    <FaSearch className="ml-5 text-gray-500 group-focus-within:text-brand transition-colors text-xl" />
                    <input
                      type="text"
                      placeholder="Search for 'Burgers', 'Coffee', 'Desserts'..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="flex-1 px-4 py-4 bg-transparent text-white placeholder-gray-600 focus:outline-none text-lg font-medium"
                    />
                    <button className="hidden sm:block bg-brand hover:bg-brand-hover text-white px-8 py-4 rounded-[1.3rem] font-bold transition-all shadow-lg shadow-brand/20 active:scale-95">
                      Browse Menu
                    </button>
                  </div>
                </div>

                {/* Stats Bento Grid Header */}
                <div className="mt-16 border-t border-white/5 pt-12">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-left group">
                        <div className="w-12 h-12 rounded-2xl bg-brand/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FaStore className="text-brand text-xl" />
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Market Presence</p>
                        <p className="text-2xl font-black text-white">{shops.length} Shops</p>
                    </div>
                    <div className="text-left group">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FaFire className="text-orange-500 text-xl" />
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Platform Status</p>
                        <p className="text-2xl font-black text-white">Live 24/7</p>
                    </div>
                    <div className="text-left group">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FaClock className="text-blue-500 text-xl" />
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Peak Hour</p>
                        <p className="text-2xl font-black text-white">12:30 PM</p>
                    </div>
                    <div className="text-left group">
                        <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FaBolt className="text-green-500 text-xl" />
                        </div>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Average Wait</p>
                        <p className="text-2xl font-black text-white">8 Mins</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Home Content */}
      <section ref={resultsRef} className="max-w-7xl mx-auto px-4 pb-24 relative z-10">
          {user?.role === 'vendor' ? (
              /* VENDOR SPECIFIC HOME CONTENT */
              <div className="space-y-16">
                  <div className="flex flex-col md:flex-row gap-8">
                      {/* My Shop Performance Bento */}
                      <div className="flex-1 glass-heavy p-10 rounded-[3rem] border border-white/10 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                              <FaChartLine className="text-8xl text-brand" />
                          </div>
                          <h3 className="text-2xl font-black text-white mb-6">Your Market Pulse</h3>
                          <div className="grid grid-cols-2 gap-8">
                              <div>
                                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Live Orders</p>
                                  <p className="text-4xl font-black text-white">{myShopStats.live || 0}</p>
                              </div>
                              <div>
                                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Today's Revenue</p>
                                  <p className="text-4xl font-black text-brand">₹{myShopStats.revenue || 0}</p>
                              </div>
                          </div>
                          <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between">
                              <span className="text-sm text-gray-500 font-medium italic">"Cafeteria demand is peaks around 12:30 PM today."</span>
                              <Link to="/vendor-dashboard" className="text-brand font-black text-sm hover:underline">Full Analytics →</Link>
                          </div>
                      </div>

                      {/* Quick Action Bento */}
                      <div className="w-full md:w-80 glass-heavy p-10 rounded-[3rem] border border-white/10 flex flex-col justify-between">
                          <h3 className="text-xl font-black text-white mb-6">Quick Actions</h3>
                          <div className="space-y-3">
                              <Link to="/vendor-dashboard" className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl hover:bg-brand/10 hover:text-brand transition-all font-bold text-sm">
                                  <FaPlus /> Add New Item
                              </Link>
                              <button 
                                onClick={toggleShopStatus}
                                className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-bold text-sm text-left border ${
                                    myShopStats.isOpen 
                                    ? 'bg-accent/10 border-accent/20 text-accent hover:bg-accent/20' 
                                    : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                                }`}
                              >
                                  <FaStore /> {myShopStats.isOpen ? 'Shop is Open' : 'Shop is Closed'}
                              </button>
                          </div>
                      </div>
                  </div>

                    {/* Campus Neighbors Grid */}
                    <div>
                        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
                            <div className="text-left">
                                <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-3">
                                    Campus <span className="text-brand">Neighbors</span>
                                </h2>
                                <p className="text-gray-500 font-medium">Keep an eye on what other shops are offering on campus today.</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {filteredShops.map((shop, i) => (
                                <ShopCard key={shop._id} shop={shop} index={i} searchTerm={search} />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* STUDENT SPECIFIC HOME CONTENT */
                <>
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                        <div className="text-left">
                            <h2 className="text-4xl font-black text-white tracking-tight leading-none mb-3">
                                Explore <span className="text-brand">Cafeteria</span> Shops
                            </h2>
                            <p className="text-gray-500 font-medium">Browse our curated list of high-quality campus dining spots.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-gray-500 uppercase tracking-widest px-4 py-2 bg-white/5 rounded-full border border-white/5">
                                {filteredShops.length} Found
                            </span>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                <div key={n} className="bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden animate-pulse">
                                    <div className="h-56 bg-white/5"></div>
                                    <div className="p-8 space-y-4">
                                        <div className="h-6 bg-white/5 rounded-full w-3/4"></div>
                                        <div className="h-4 bg-white/5 rounded-full w-full"></div>
                                        <div className="h-12 bg-white/5 rounded-2xl w-full pt-4"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            <AnimatePresence mode='popLayout'>
                                {filteredShops.map((shop, i) => (
                                    <ShopCard key={shop._id} shop={shop} index={i} searchTerm={search} />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </>
            )}
        </section>
    </div>
);
};

export default Home;
