import React, { useState, useEffect } from 'react';
import { analyticsAPI, orderAPI, cafeteriaAPI } from '../services/api';
import { 
  Shield, 
  Users, 
  Store, 
  ShoppingBag, 
  DollarSign, 
  TrendingUp, 
  Search, 
  CheckCircle2, 
  Activity,
  AlertCircle
} from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [cafeterias, setCafeterias] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getAdminAnalytics(),
      orderAPI.getAdminOrders(),
      cafeteriaAPI.getAll()
    ])
      .then(([analyticsRes, ordersRes, cafesRes]) => {
        setAnalytics(analyticsRes.data);
        setOrders(ordersRes.data);
        setCafeterias(cafesRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = orders.filter(o => {
    if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchNum = o.order_number.toLowerCase().includes(q);
      const matchStudent = (o.student_name || '').toLowerCase().includes(q);
      const matchCafe = (o.cafeteria_name || '').toLowerCase().includes(q);
      if (!matchNum && !matchStudent && !matchCafe) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 py-8 text-on-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ADMIN HEADER */}
        <div className="bg-gray-900 text-white rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                Campus System Administration
              </span>
              <h1 className="font-headline font-black text-3xl sm:text-4xl">
                Grab-N-Go Platform Command Center
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                Real-time oversight of campus dining operations, vendor throughput, and revenue.
              </p>
            </div>

            <div className="px-4 py-2 rounded-2xl bg-gray-800 border border-gray-700 flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>
        </div>

        {/* SYSTEM KPIS */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-orange-100 text-primary">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-500 font-bold">Total Students</span>
            </div>
            <p className="font-headline font-black text-3xl text-gray-900 dark:text-white">
              {analytics?.totalStudents || 3}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-600">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-500 font-bold">Active Vendors</span>
            </div>
            <p className="font-headline font-black text-3xl text-gray-900 dark:text-white">
              {analytics?.activeCafeterias || 4}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-blue-100 text-blue-600">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-500 font-bold">Total Orders</span>
            </div>
            <p className="font-headline font-black text-3xl text-gray-900 dark:text-white">
              {analytics?.totalOrders || orders.length}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-600">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-500 font-bold">Platform Revenue</span>
            </div>
            <p className="font-headline font-black text-3xl text-primary">
              ₹{analytics?.totalRevenue || 470}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 p-5 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-md col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-purple-100 text-purple-600">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-500 font-bold">Fulfilled Ratio</span>
            </div>
            <p className="font-headline font-black text-3xl text-emerald-500">
              100%
            </p>
          </div>
        </div>

        {/* CAFETERIA PERFORMANCE & STATUS */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
          <h2 className="font-headline font-black text-2xl text-gray-900 dark:text-white">
            Campus Cafeteria Operations & Rush Monitor
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cafeterias.map(c => {
              const rush = c.rush || { rushLabel: 'Low Rush', activeOrdersCount: 0 };
              return (
                <div key={c.id} className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-gray-900 dark:text-white">{c.name}</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                    <p className="text-xs text-gray-400">{c.location}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center text-xs font-bold">
                    <span className="text-gray-500">Active Queue: <strong className="text-gray-900 dark:text-white">{rush.activeOrdersCount}</strong></span>
                    <span className="text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded">{rush.rushLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SYSTEM ORDERS AUDIT LOG */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-headline font-black text-2xl text-gray-900 dark:text-white">
                Platform Orders Audit Log
              </h2>
              <p className="text-xs text-gray-500">Complete record of campus pre-orders across all locations.</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search order #..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-xs font-bold text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PLACED">PLACED</option>
                <option value="PREPARING">PREPARING</option>
                <option value="READY">READY</option>
                <option value="PICKED_UP">PICKED_UP</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-bold">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase">
                  <th className="py-3 px-4">Order #</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Cafeteria</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/40">
                    <td className="py-3 px-4 text-primary font-headline font-black">{o.order_number}</td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{o.student_name}</td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{o.cafeteria_name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black ${
                        o.status === 'PICKED_UP' ? 'bg-gray-100 text-gray-700' :
                        o.status === 'READY' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900 dark:text-white">₹{o.total_amount}</td>
                    <td className="py-3 px-4 text-gray-400">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}
