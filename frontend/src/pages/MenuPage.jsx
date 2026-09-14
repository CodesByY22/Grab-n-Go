import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cafeteriaAPI, menuAPI } from '../services/api';
import { 
  Search, 
  Clock, 
  MapPin, 
  Plus, 
  Minus, 
  Sparkles, 
  Leaf, 
  Flame,
  Store,
  ChevronDown,
  ShoppingBag,
  Check
} from 'lucide-react';

export default function MenuPage({ addToCart, cart = [] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCafeId = searchParams.get('cafeteria');

  const [cafeterias, setCafeterias] = useState([]);
  const [selectedCafe, setSelectedCafe] = useState(null);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCat, setSelectedCat] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnlyFilter, setVegOnlyFilter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addedItemIds, setAddedItemIds] = useState({});

  // Quantities state for items
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    Promise.all([
      cafeteriaAPI.getAll(),
      menuAPI.getCategories()
    ])
      .then(([cafesRes, catsRes]) => {
        setCafeterias(cafesRes.data);
        setCategories(catsRes.data);
        
        let cafeToSelect = cafesRes.data[0];
        if (initialCafeId) {
          const found = cafesRes.data.find(c => c.id === initialCafeId);
          if (found) cafeToSelect = found;
        }
        setSelectedCafe(cafeToSelect);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (selectedCafe) {
      menuAPI.getMenuByCafeteria(selectedCafe.id)
        .then(res => setMenuItems(res.data))
        .catch(() => setMenuItems([]));
    }
  }, [selectedCafe]);

  const handleCafeChange = (cafe) => {
    setSelectedCafe(cafe);
    setSearchParams({ cafeteria: cafe.id });
  };

  const handleQtyChange = (itemId, delta) => {
    setQuantities(prev => {
      const current = prev[itemId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [itemId]: next };
    });
  };

  const handleAddToCart = (item) => {
    const qty = quantities[item.id] || 1;
    for (let i = 0; i < qty; i++) {
      addToCart(item, selectedCafe);
    }
    
    // Quick success animation
    setAddedItemIds(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [item.id]: false }));
    }, 1500);
  };

  // Filter menu items
  const filteredItems = menuItems.filter(item => {
    if (selectedCat !== 'ALL' && item.category_id !== selectedCat && item.category_name !== selectedCat) return false;
    if (vegOnlyFilter && !item.is_veg) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchName = item.name.toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }
    return true;
  });

  const rush = selectedCafe?.rush || { rushLabel: 'Low Rush', estimatedWaitAvg: '5-10 min' };

  return (
    <div className="min-h-screen bg-gray-50/70 dark:bg-[#0b0f17] py-10 text-gray-900 dark:text-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* CAFETERIA HERO BANNER */}
        {selectedCafe && (
          <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-200/80 dark:border-slate-800 bg-slate-900 text-white min-h-[220px] flex items-end p-8 sm:p-10">
            <img
              src={selectedCafe.image_url}
              alt={selectedCafe.name}
              className="absolute inset-0 w-full h-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
            
            <div className="relative z-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3.5 py-1 rounded-full bg-emerald-500 text-white font-black text-xs shadow-md">
                    🟢 {rush.rushLabel}
                  </span>
                  <span className="text-xs text-gray-300 font-bold bg-white/10 backdrop-blur-md px-3 py-1 rounded-full">
                    ⏱️ Est. Wait: {rush.estimatedWaitAvg}
                  </span>
                </div>
                <h1 className="font-headline font-black text-3xl sm:text-4xl lg:text-5xl text-white">
                  {selectedCafe.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-300 flex items-center gap-1.5 mt-2 font-medium">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>{selectedCafe.location} • Hours: {selectedCafe.opening_hours}</span>
                </p>
              </div>

              {/* Cafeteria Selector */}
              <div className="shrink-0 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-700">
                <label className="text-[10px] font-black uppercase text-gray-400 block mb-1">Switch Location:</label>
                <div className="relative">
                  <select
                    value={selectedCafe.id}
                    onChange={(e) => {
                      const c = cafeterias.find(cat => cat.id === e.target.value);
                      if (c) handleCafeChange(c);
                    }}
                    className="appearance-none bg-slate-800 text-white font-bold text-xs rounded-xl px-4 py-2.5 pr-8 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer w-full"
                  >
                    {cafeterias.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.rush?.rushLabel || 'Active'})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

            </div>
          </div>
        )}

        {/* SEARCH & FILTERS BAR */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search dishes (e.g. Paneer Wrap, Cold Coffee, Biryani)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-gray-200/80 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
            />
          </div>

          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnlyFilter(!vegOnlyFilter)}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border text-xs font-black transition-all shadow-sm ${
              vegOnlyFilter 
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-emerald-500/20' 
                : 'bg-white dark:bg-slate-900 border-gray-200/80 dark:border-slate-800 text-gray-700 dark:text-gray-300 hover:border-emerald-500'
            }`}
          >
            <Leaf className="w-4 h-4" />
            <span>Pure Veg Only</span>
          </button>

        </div>

        {/* CATEGORY PILLS */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCat('ALL')}
            className={`px-6 py-3 rounded-2xl text-xs font-black shrink-0 transition-all shadow-sm ${
              selectedCat === 'ALL'
                ? 'bg-primary text-white shadow-orange-500/25'
                : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-slate-800 hover:bg-orange-50'
            }`}
          >
            All Items ({menuItems.length})
          </button>

          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`px-6 py-3 rounded-2xl text-xs font-black shrink-0 transition-all shadow-sm flex items-center gap-2 ${
                selectedCat === cat.id
                  ? 'bg-primary text-white shadow-orange-500/25'
                  : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border border-gray-200/80 dark:border-slate-800 hover:bg-orange-50'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* FOOD MENU ITEMS GRID */}
        <div>
          {filteredItems.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-200/80 dark:border-slate-800">
              <p className="text-gray-400 font-bold text-lg">No dishes found matching your search.</p>
              <p className="text-xs text-gray-500 mt-1 font-medium">Try clearing your filters or search keywords.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map(item => {
                const qty = quantities[item.id] || 1;
                const isAvailable = item.is_available;
                const isJustAdded = addedItemIds[item.id];

                return (
                  <div
                    key={item.id}
                    className={`bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-gray-200/80 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 ${
                      !isAvailable ? 'opacity-50 grayscale' : ''
                    }`}
                  >
                    <div>
                      {/* Image & Badges */}
                      <div className="relative h-48 rounded-2xl overflow-hidden mb-5">
                        <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5 shadow-md">
                          <Clock className="w-3.5 h-3.5 text-orange-400" />
                          <span>~{item.prep_time_mins} min prep</span>
                        </div>

                        {/* Veg / Non-Veg Indicator */}
                        <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-1.5 rounded-lg shadow-md">
                          <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                            item.is_veg ? 'border-emerald-600' : 'border-red-600'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              item.is_veg ? 'bg-emerald-600' : 'bg-red-600'
                            }`} />
                          </div>
                        </div>

                        {!isAvailable && (
                          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
                            <span className="px-4 py-1.5 rounded-full bg-red-500 text-white font-black text-xs uppercase tracking-wider shadow-lg">
                              Sold Out
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-headline font-black text-xl text-gray-900 dark:text-white leading-snug mb-1">
                        {item.name}
                      </h3>
                      
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 font-medium leading-relaxed">
                        {item.description}
                      </p>

                      {/* Tags */}
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {item.tags.map((t, idx) => (
                            <span key={idx} className="px-2.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Price & Add to Cart Controls */}
                    <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] text-gray-400 uppercase font-black block">Price</span>
                        <span className="font-headline font-black text-2xl text-gray-900 dark:text-white">
                          ₹{item.price}
                        </span>
                      </div>

                      {isAvailable ? (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
                            <button
                              onClick={() => handleQtyChange(item.id, -1)}
                              className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 flex items-center justify-center hover:bg-gray-200 font-bold"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center font-black text-xs text-gray-900 dark:text-white">
                              {qty}
                            </span>
                            <button
                              onClick={() => handleQtyChange(item.id, 1)}
                              className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 flex items-center justify-center hover:bg-gray-200 font-bold"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleAddToCart(item)}
                            className={`px-5 py-3 rounded-xl font-black text-xs shadow-md transition-all active:scale-95 flex items-center gap-1.5 ${
                              isJustAdded
                                ? 'bg-emerald-500 text-white'
                                : 'bg-primary hover:bg-orange-600 text-white shadow-orange-500/25'
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-4 h-4" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag className="w-4 h-4" />
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>
                        </div>
                      ) : (
                        <button disabled className="px-4 py-2.5 rounded-xl bg-gray-200 dark:bg-slate-800 text-gray-400 font-bold text-xs cursor-not-allowed">
                          Unavailable
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
