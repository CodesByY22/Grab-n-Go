import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaStore, FaClock, FaChevronRight, FaStar } from 'react-icons/fa';

const ShopCard = ({ shop, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.6, delay: index * 0.05, cubicBezier: [0.16, 1, 0.3, 1] }}
      className="group relative h-full"
    >
      <div className="glass border border-white/5 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-brand/20 hover:border-brand/20 transition-all duration-700 h-full flex flex-col relative z-10">
        
        {/* Top Badges */}
        <div className="absolute top-5 left-5 right-5 flex justify-between items-start z-20">
             <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                <FaStar className="text-yellow-400 text-[10px]" />
                <span className="text-[10px] font-black text-white">4.8</span>
             </div>
             
             <div className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase border backdrop-blur-md shadow-lg ${
                shop.isOpen 
                ? 'bg-accent/10 text-accent border-accent/20' 
                : 'bg-red-500/10 text-red-500 border-red-500/20'
             }`}>
                {shop.isOpen ? '● Open' : '● Closed'}
             </div>
        </div>

        {/* Image / Header */}
        <div className="relative h-60 overflow-hidden bg-white/5">
            {shop.image ? (
                <img 
                    src={shop.image} 
                    alt={shop.name} 
                    className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 group-hover:rotate-1" 
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-white/5 to-white/[0.02]">
                    <FaStore className="text-6xl text-white/10 group-hover:scale-110 group-hover:text-brand/20 transition-all duration-700" />
                </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#151A23] via-[#151A23]/20 to-transparent opacity-90"></div>
            
            {/* Quick Stats on Image */}
            <div className="absolute bottom-6 left-8 flex gap-4">
                 <div className="flex flex-col">
                    <span className="text-xs text-brand font-black uppercase tracking-tighter">Distance</span>
                    <span className="text-sm text-white font-bold">200m</span>
                 </div>
                 <div className="w-px h-6 bg-white/10 self-center"></div>
                 <div className="flex flex-col">
                    <span className="text-xs text-brand font-black uppercase tracking-tighter">Pickup</span>
                    <span className="text-sm text-white font-bold">~10 min</span>
                 </div>
            </div>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 flex flex-col">
          <div className="mb-4">
            <h3 className="text-2xl font-black text-white group-hover:text-brand transition-colors mb-2 tracking-tight line-clamp-1">{shop.name}</h3>
            <p className="text-gray-500 text-sm font-medium leading-relaxed line-clamp-2 min-h-[2.5rem]">
                {shop.description || 'Discover a world of flavors at our shop. Prepared fresh, ordered fast.'}
            </p>
          </div>

          <div className="mt-auto pt-6 flex items-center justify-between border-t border-white/5">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                    <FaClock className="text-xs text-gray-500" />
                </div>
                <span className="text-xs font-bold text-gray-500">{shop.menu?.length || 0} Items</span>
            </div>

            {shop.isOpen ? (
                <Link
                to={`/shop/${shop._id}`}
                className="inline-flex items-center gap-2 bg-white/5 hover:bg-brand text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all hover:translate-x-1 shadow-lg hover:shadow-brand/20"
                >
                Order
                <FaChevronRight className="text-[10px]" />
                </Link>
            ) : (
                <button
                disabled
                className="inline-flex items-center gap-2 bg-red-500/5 text-red-500/50 px-5 py-2.5 rounded-xl text-sm font-black cursor-not-allowed"
                >
                Closed
                </button>
            )}
          </div>
        </div>
      </div>

      {/* Modern Background Blur Shadow */}
      <div className="absolute inset-x-8 bottom-0 h-4 bg-brand/50 rounded-full blur-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-700"></div>
    </motion.div>
  );
};

export default ShopCard;
