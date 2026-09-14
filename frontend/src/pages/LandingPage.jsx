import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cafeteriaAPI, menuAPI } from '../services/api';
import { 
  Flame, 
  Clock, 
  QrCode, 
  ShoppingBag, 
  Sparkles, 
  Zap, 
  ChevronRight, 
  Store, 
  ShieldCheck, 
  TrendingUp,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Star,
  Users,
  Utensils,
  Plus
} from 'lucide-react';

export default function LandingPage({ addToCart }) {
  const navigate = useNavigate();
  const [cafeterias, setCafeterias] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      cafeteriaAPI.getAll(),
      menuAPI.getMenuByCafeteria('cafeteria_1').catch(() => ({ data: [] }))
    ])
      .then(([cafesRes, menuRes]) => {
        setCafeterias(cafesRes.data);
        if (menuRes.data && menuRes.data.length > 0) {
          setFeaturedItems(menuRes.data.slice(0, 4));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0b0f17] text-gray-900 dark:text-gray-100 overflow-x-hidden">
      
      {/* HERO SECTION */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Ambient Glow Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-orange-500/20 via-amber-500/15 to-rose-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-orange-400/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* LEFT HERO TEXT & CTA */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-8">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-black shadow-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span>Next-Gen Campus Food Ordering Platform</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-headline font-black text-5xl sm:text-6xl lg:text-7xl tracking-tight leading-[1.08] text-gray-900 dark:text-white">
                Skip the Queue.<br />
                <span className="flame-text italic">Grab Your Food.</span><br />
                <span className="text-gray-900 dark:text-white">Go.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-xl font-medium leading-relaxed">
                Pre-order from campus cafeterias, monitor your live queue position in real time, and pick up your meal without standing in line.
              </p>

              {/* Primary Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/menu"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-primary hover:bg-orange-600 text-white font-black text-base glow-orange shadow-xl flex items-center justify-center gap-3 transition-all duration-200 hover:scale-[1.03] active:scale-95"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>Order Food Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <a
                  href="#cafeterias"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900/80 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white font-bold text-base hover:bg-gray-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <Store className="w-5 h-5 text-primary" />
                  <span>Explore Cafeterias</span>
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-6 border-t border-gray-200 dark:border-slate-800/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
                <div>
                  <p className="font-headline font-black text-2xl text-gray-900 dark:text-white">⚡ &lt; 4 min</p>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">Average Prep Time</p>
                </div>
                <div>
                  <p className="font-headline font-black text-2xl text-emerald-600 dark:text-emerald-400">🎯 99.8%</p>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">Queue Accuracy</p>
                </div>
                <div>
                  <p className="font-headline font-black text-2xl text-amber-500">⭐ 4.9/5</p>
                  <p className="text-xs text-gray-500 font-semibold mt-0.5">Student Rating</p>
                </div>
              </div>

            </div>

            {/* RIGHT HERO INTERACTIVE SHOWCASE CARD */}
            <div className="lg:col-span-5 relative">
              
              {/* Floating Stat Badge Top Right */}
              <div className="absolute -top-6 -right-4 z-20 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl flex items-center gap-3 animate-float">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">Order Ready!</p>
                  <p className="text-[10px] text-gray-400 font-medium">Show QR pass at counter</p>
                </div>
              </div>

              {/* Floating Stat Badge Bottom Left */}
              <div className="absolute -bottom-6 -left-4 z-20 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-xl flex items-center gap-3 animate-float" style={{ animationDelay: '2s' }}>
                <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-950/80 text-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">#2 in Queue</p>
                  <p className="text-[10px] text-gray-400 font-medium">~5 minutes remaining</p>
                </div>
              </div>

              {/* Main Simulated Card */}
              <div className="glass-card rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden glow-orange border border-orange-500/20">
                <div className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-slate-800 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flame-gradient flex items-center justify-center text-white shadow-md">
                      <Flame className="w-6 h-6 fill-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-primary tracking-widest block">Live Order Pass</span>
                      <h3 className="font-headline font-black text-xl text-gray-900 dark:text-white">#GN-1001</h3>
                    </div>
                  </div>
                  <span className="px-3.5 py-1 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs font-black border border-amber-500/30 animate-pulse">
                    PREPARING
                  </span>
                </div>

                {/* Queue Metrics */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-gray-200/60 dark:border-slate-700/60">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Queue Position</p>
                    <p className="font-headline font-black text-3xl text-gray-900 dark:text-white mt-1">
                      #2 <span className="text-xs font-semibold text-gray-400">ahead</span>
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-slate-800/80 p-4 rounded-2xl border border-gray-200/60 dark:border-slate-700/60">
                    <p className="text-[11px] font-bold text-gray-400 uppercase">Est. Preparation</p>
                    <p className="font-headline font-black text-3xl text-emerald-500 dark:text-emerald-400 mt-1">
                      ~5 <span className="text-xs font-semibold text-gray-400">min</span>
                    </p>
                  </div>
                </div>

                {/* Items Breakdown */}
                <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-200/50 dark:border-slate-700/50 space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-bold text-gray-900 dark:text-white">
                    <span>1x Paneer Butter Masala Meal</span>
                    <span>₹140</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-900 dark:text-white">
                    <span>1x Masala Dosa</span>
                    <span>₹70</span>
                  </div>
                </div>

                {/* Progress bar visual */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] font-black text-gray-400">
                    <span className="text-emerald-500">Placed</span>
                    <span className="text-emerald-500">Accepted</span>
                    <span className="text-primary underline">Preparing</span>
                    <span>Ready</span>
                  </div>
                  <div className="h-2 w-full bg-gray-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 flame-gradient rounded-full" />
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* LIVE CAMPUS RUSH MARQUEE TICKER */}
      <section className="bg-gradient-to-r from-orange-500 via-amber-500 to-rose-500 py-3 text-white shadow-lg overflow-hidden">
        <div className="flex items-center gap-8 animate-pulse text-xs sm:text-sm font-black uppercase tracking-wider justify-around max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2">
            <span>🟢 Main Cafeteria: LOW RUSH (~5 MIN)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🟡 Food Court: MODERATE RUSH (~12 MIN)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🟢 Coffee Corner: LOW RUSH (~3 MIN)</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <span>🟢 Juice Bar: LOW RUSH (~2 MIN)</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-24 bg-gray-100/60 dark:bg-slate-900/40 border-y border-gray-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <span className="px-3.5 py-1 rounded-full bg-orange-500/10 text-primary text-xs font-black uppercase tracking-widest">
              Seamless 4-Step Process
            </span>
            <h2 className="font-headline font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white tracking-tight">
              From Hunger to Pickup in Minutes
            </h2>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-base">
              Designed specifically for busy students during short campus break intervals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-200/70 dark:border-slate-800 shadow-xl relative flex flex-col justify-between hover:scale-[1.02] transition-all group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-primary flex items-center justify-center font-headline font-black text-2xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  1
                </div>
                <h3 className="font-headline font-bold text-xl text-gray-900 dark:text-white mb-3">
                  Browse & Rush Check
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Select your cafeteria, check real-time rush levels, and explore rich menus with dietary filters.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs font-bold text-primary flex items-center gap-1">
                <span>View Menus</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-200/70 dark:border-slate-800 shadow-xl relative flex flex-col justify-between hover:scale-[1.02] transition-all group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 flex items-center justify-center font-headline font-black text-2xl mb-6 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  2
                </div>
                <h3 className="font-headline font-bold text-xl text-gray-900 dark:text-white mb-3">
                  ASAP or Scheduled
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Choose immediate preparation or reserve a specific pickup slot right when your class finishes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs font-bold text-amber-500 flex items-center gap-1">
                <span>Flexible Slots</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-200/70 dark:border-slate-800 shadow-xl relative flex flex-col justify-between hover:scale-[1.02] transition-all group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-secondary flex items-center justify-center font-headline font-black text-2xl mb-6 group-hover:bg-secondary group-hover:text-white transition-colors">
                  3
                </div>
                <h3 className="font-headline font-bold text-xl text-gray-900 dark:text-white mb-3">
                  Track Smart Queue
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Monitor your exact position ahead in line (#2 in queue) and precise preparation countdown.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs font-bold text-secondary flex items-center gap-1">
                <span>Live Tracker</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-200/70 dark:border-slate-800 shadow-xl relative flex flex-col justify-between hover:scale-[1.02] transition-all group">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-headline font-black text-2xl mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                  4
                </div>
                <h3 className="font-headline font-bold text-xl text-gray-900 dark:text-white mb-3">
                  Scan QR & Pickup
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Receive a "READY" notification, flash your digital QR pass at the counter, and grab your food!
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800 text-xs font-bold text-emerald-500 flex items-center gap-1">
                <span>Zero Queue Wait</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* CAFETERIAS PREVIEW GRID */}
      <section id="cafeterias" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
            <div>
              <span className="text-xs font-black text-primary uppercase tracking-widest block mb-2">
                Campus Dining Locations
              </span>
              <h2 className="font-headline font-black text-3xl sm:text-4xl lg:text-5xl text-gray-900 dark:text-white tracking-tight">
                Active Cafeterias & Rush Meter
              </h2>
            </div>
            <Link
              to="/menu"
              className="text-primary font-bold text-sm flex items-center gap-1 hover:underline shrink-0"
            >
              <span>Explore All Menus</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {cafeterias.map(c => {
              const rush = c.rush || { rushLevel: 'LOW', rushLabel: 'Low Rush', estimatedWaitAvg: '5-10 min' };
              const isHigh = rush.rushLevel === 'HIGH';
              const isMod = rush.rushLevel === 'MODERATE';

              return (
                <div key={c.id} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-gray-200/80 dark:border-slate-800 overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col group hover:-translate-y-1">
                  
                  {/* Image & Badges */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={c.image_url}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    {/* Rush Status Badge */}
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-black backdrop-blur-md shadow-md flex items-center gap-1.5 ${
                        isHigh ? 'bg-red-500/90 text-white' :
                        isMod ? 'bg-amber-500/90 text-white' : 'bg-emerald-500/90 text-white'
                      }`}>
                        <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                        {rush.rushLabel}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-headline font-black text-xl leading-snug">{c.name}</h3>
                      <p className="text-xs text-gray-300 flex items-center gap-1 mt-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-primary" />
                        <span>{c.location}</span>
                      </p>
                    </div>
                  </div>

                  {/* Body & Actions */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">
                      {c.description}
                    </p>

                    <div className="pt-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Est. Wait Time</span>
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{rush.estimatedWaitAvg}</span>
                      </div>

                      <Link
                        to={`/menu?cafeteria=${c.id}`}
                        className="px-4 py-2.5 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-primary text-xs font-black hover:bg-primary hover:text-white transition-colors"
                      >
                        Order Here →
                      </Link>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* POPULAR DISHES DIRECT PREVIEW */}
      <section className="py-24 bg-gray-100/60 dark:bg-slate-900/40 border-y border-gray-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="px-3.5 py-1 rounded-full bg-orange-500/10 text-primary text-xs font-black uppercase tracking-widest">
              Student Favorites
            </span>
            <h2 className="font-headline font-black text-3xl sm:text-4xl text-gray-900 dark:text-white tracking-tight">
              Top Trending Campus Eats
            </h2>
            <p className="text-gray-600 dark:text-gray-400 font-medium text-sm">
              Quick 1-click order for popular items prepared fresh daily.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-200/80 dark:border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&q=80&w=600"
                  alt="Paneer Tikka Wrap"
                  className="w-full h-40 rounded-2xl object-cover mb-4"
                />
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-headline font-bold text-base text-gray-900 dark:text-white">Paneer Tikka Wrap</h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">VEG</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">Smokey grilled paneer wrapped with mint mayo & onions.</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-headline font-black text-lg text-gray-900 dark:text-white">₹110</span>
                <Link to="/menu" className="px-3.5 py-1.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-orange-600">
                  Order Now
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-200/80 dark:border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600"
                  alt="Iced Cold Coffee"
                  className="w-full h-40 rounded-2xl object-cover mb-4"
                />
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-headline font-bold text-base text-gray-900 dark:text-white">Iced Cold Coffee</h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">VEG</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">Thick creamy cold coffee with rich chocolate drizzle.</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-headline font-black text-lg text-gray-900 dark:text-white">₹80</span>
                <Link to="/menu" className="px-3.5 py-1.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-orange-600">
                  Order Now
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-200/80 dark:border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&q=80&w=600"
                  alt="Veg Biryani"
                  className="w-full h-40 rounded-2xl object-cover mb-4"
                />
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-headline font-bold text-base text-gray-900 dark:text-white">Hyderabadi Biryani</h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">VEG</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">Aromatic basmati rice with garden fresh vegetables.</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-headline font-black text-lg text-gray-900 dark:text-white">₹120</span>
                <Link to="/menu" className="px-3.5 py-1.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-orange-600">
                  Order Now
                </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-gray-200/80 dark:border-slate-800 shadow-xl flex flex-col justify-between">
              <div>
                <img
                  src="https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&q=80&w=600"
                  alt="Peri Peri Fries"
                  className="w-full h-40 rounded-2xl object-cover mb-4"
                />
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-headline font-bold text-base text-gray-900 dark:text-white">Peri Peri Fries</h4>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded">VEG</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">Crispy french fries tossed in zesty peri-peri spice mix.</p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
                <span className="font-headline font-black text-lg text-gray-900 dark:text-white">₹65</span>
                <Link to="/menu" className="px-3.5 py-1.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-orange-600">
                  Order Now
                </Link>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* FOOTER HIGH IMPACT CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 text-center relative z-10">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 p-12 sm:p-16 rounded-[3rem] border border-slate-700/80 shadow-2xl text-white relative overflow-hidden glow-orange">
            
            <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <span className="px-4 py-1.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-black uppercase tracking-widest mb-6 inline-block border border-orange-500/30">
              Campus Pre-Ordering Active Now
            </span>

            <h2 className="font-headline font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight mb-6">
              Never Wait in Line Again.
            </h2>

            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 font-medium">
              Join thousands of campus students pre-ordering food every day. Browse menus, track your queue position, and pick up on time.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/menu"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-primary hover:bg-orange-600 text-white font-black text-lg shadow-xl shadow-orange-500/40 flex items-center justify-center gap-3 transition-transform hover:scale-105"
              >
                <span>Start Ordering Now</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
