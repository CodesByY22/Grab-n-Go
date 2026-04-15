import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaPlus, FaCheckCircle, FaArrowLeft, FaShoppingCart, FaStar, FaClock, FaFire } from 'react-icons/fa';
import CartContext from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';

const ShopMenu = () => {
  const { id } = useParams();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart, getItemQty } = useContext(CartContext);
  const [addedItems, setAddedItems] = useState({});

  const handleAddToCart = (item, shopId) => {
    addToCart(item, shopId);
    setAddedItems(prev => ({ ...prev, [item._id]: true }));
    setTimeout(() => {
      setAddedItems(prev => ({ ...prev, [item._id]: false }));
    }, 1000);
  };

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const { data } = await axios.get(`/api/shops/${id}`);
        setShop(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchShop();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 page-fade-in">
        <div className="glass border border-white/5 p-12 rounded-[3rem] mb-12 animate-pulse">
          <div className="h-10 bg-white/5 rounded-full w-1/3 mb-6"></div>
          <div className="h-5 bg-white/5 rounded-full w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="glass border border-white/5 rounded-[2rem] p-8 animate-pulse">
              <div className="h-6 bg-white/5 rounded-full w-3/4 mb-4"></div>
              <div className="h-4 bg-white/5 rounded-full w-1/2 mb-8"></div>
              <div className="h-12 bg-white/5 rounded-xl w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-32 text-center page-fade-in">
        <div className="text-8xl mb-8 opacity-20 transition-transform hover:scale-110 duration-500">🍽️</div>
        <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Shop not found</h2>
        <p className="text-gray-500 mb-10 font-medium">This shop might have been removed or moved to a different wing.</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-brand/10 text-brand px-8 py-3 rounded-xl font-bold border border-brand/20 hover:bg-brand hover:text-white transition-all">
          <FaArrowLeft /> Back to Shops
        </Link>
      </div>
    );
  }

  // Show items if menu exists, only filter out if explicitly marked as false
  const availableMenu = shop.menu ? shop.menu : [];

  return (
    <div className="page-fade-in pb-20">
      {/* Shop Hero Header */}
      <section className="relative h-[50vh] min-h-[400px] flex items-end overflow-hidden pb-12 px-4 shadow-2xl">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={shop.image || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1934&q=80'} 
            className="w-full h-full object-cover scale-105 blur-[2px] opacity-40" 
            alt={shop.name} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070A] via-[#05070A]/80 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="text-left">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-brand font-black uppercase tracking-widest text-[10px] mb-6 transition-all group">
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to Shops
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
               <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-5xl md:text-7xl font-black text-white tracking-tighter"
               >
                {shop.name}
               </motion.h1>
               <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border backdrop-blur-md self-center ${
                    shop.isOpen ? 'bg-accent/10 text-accent border-accent/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                    {shop.isOpen ? '● Open' : '● Closed'}
                </div>
            </div>

            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl leading-relaxed">
                {shop.description}
            </p>

            <div className="flex flex-wrap gap-6 mt-8">
                <div className="flex items-center gap-2">
                    <FaStar className="text-yellow-400" />
                    <span className="text-white font-black">4.8</span>
                    <span className="text-gray-500 text-xs font-bold uppercase">(200+ Reviews)</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaClock className="text-brand" />
                    <span className="text-white font-black">10-15 Min</span>
                    <span className="text-gray-500 text-xs font-bold uppercase">Pickup Time</span>
                </div>
                <div className="flex items-center gap-2">
                    <FaFire className="text-orange-500" />
                    <span className="text-white font-black">Popular Items</span>
                </div>
            </div>
          </div>

          {!shop.isOpen && (
            <div className="glass px-8 py-4 rounded-2xl border border-red-500/20 text-red-500 font-black animate-pulse">
                SHOP CURRENTLY CLOSED
            </div>
          )}
        </div>
      </section>

      {/* Menu Sections */}
      <main className="max-w-7xl mx-auto px-4 mt-20">
        <div className="flex items-center gap-4 mb-12">
            <div className="h-10 w-1.5 bg-brand rounded-full"></div>
            <h2 className="text-4xl font-black text-white tracking-tight">Daily <span className="text-brand">Menu</span></h2>
            <div className="flex-1 border-t border-white/5 ml-4"></div>
        </div>

        {availableMenu.length === 0 ? (
          <div className="text-center py-24 glass rounded-[3rem] border border-white/5">
            <div className="text-7xl mb-6 opacity-30">🥣</div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">The menu is empty</h3>
            <p className="text-gray-500 font-medium">Chef is currently preparing something special. Check back in a bit!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {availableMenu.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.5 }}
                className="group bento-card glass border border-white/5 rounded-[2.5rem] p-8 hover:border-brand/30 hover:shadow-2xl hover:shadow-brand/5 transition-all duration-500 flex flex-col justify-between h-full hover:-translate-y-1"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black text-white group-hover:text-brand transition-colors tracking-tight">{item.name}</h3>
                    <div className="text-xl font-black text-brand tracking-tighter">₹{item.price}</div>
                  </div>
                  <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8 line-clamp-3">
                    {item.description || 'A delicious and handcrafted meal prepared with the finest ingredients available today.'}
                  </p>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 opacity-50">
                     <span className="w-2 h-2 rounded-full bg-accent"></span>
                     <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Freshly Prepared</span>
                  </div>

                  {shop.isOpen ? (
                    <button
                      onClick={() => handleAddToCart(item, shop._id)}
                      className={`relative flex items-center justify-center min-w-[120px] py-3 rounded-2xl transition-all duration-500 active:scale-95 group/btn ${
                        addedItems[item._id]
                        ? 'bg-accent text-white shadow-xl shadow-accent/20'
                        : 'bg-white/5 hover:bg-brand text-gray-300 hover:text-white border border-white/10 hover:border-brand shadow-lg'
                        }`}
                    >
                      {/* Quantity Badge */}
                      <AnimatePresence>
                        {getItemQty(item._id) > 0 && !addedItems[item._id] && (
                            <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-3 -right-3 bg-brand text-white text-[10px] font-black w-7 h-7 flex items-center justify-center rounded-xl border-4 border-[#0F141E] shadow-2xl"
                            >
                                {getItemQty(item._id)}
                            </motion.span>
                        )}
                      </AnimatePresence>

                      {addedItems[item._id] ? (
                        <div className="flex items-center gap-2">
                           <FaCheckCircle className="text-sm animate-pulse" />
                           <span className="text-sm font-black">Added</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                           <FaPlus className="text-xs group-hover/btn:rotate-90 transition-transform duration-300" />
                           <span className="text-sm font-black tracking-tight">Add to Cart</span>
                        </div>
                      )}
                    </button>
                  ) : (
                    <span className="px-5 py-2.5 bg-red-500/10 text-red-500 text-xs font-black uppercase tracking-widest rounded-xl border border-red-500/10 opacity-50">Unavailable</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Notification (Optional but premium) */}
      <AnimatePresence>
        {Object.values(addedItems).some(v => v) && (
            <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[110] glass px-8 py-4 rounded-full border border-brand/30 shadow-2xl shadow-brand/20 flex items-center gap-4 cursor-pointer"
                onClick={() => navigate('/cart')}
            >
                <div className="w-10 h-10 bg-brand rounded-full flex items-center justify-center text-white">
                    <FaShoppingCart />
                </div>
                <span className="text-white font-bold tracking-tight">View Your Cart</span>
                <div className="ml-4 bg-white/10 p-2 rounded-full"><FaArrowLeft className="rotate-180 text-xs text-brand" /></div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShopMenu;
