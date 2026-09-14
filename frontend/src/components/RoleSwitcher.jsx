import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Store, GraduationCap } from 'lucide-react';

export default function RoleSwitcher() {
  const navigate = useNavigate();
  const { user, loginAsDemo } = useAuth();

  const currentRole = user?.role || 'STUDENT';

  const handleSwitch = async (roleKey) => {
    await loginAsDemo(roleKey);
    if (roleKey === 'STUDENT') navigate('/dashboard');
    if (roleKey === 'VENDOR') navigate('/vendor');
    if (roleKey === 'ADMIN') navigate('/admin');
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-inner text-xs font-bold">
      <button
        onClick={() => handleSwitch('STUDENT')}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all duration-200 ${
          currentRole === 'STUDENT'
            ? 'bg-orange-500 text-white shadow-md font-black scale-105'
            : 'text-gray-600 dark:text-gray-300 hover:text-orange-500'
        }`}
        title="Switch to Student View & Dashboard"
      >
        <GraduationCap className="w-3.5 h-3.5" />
        <span>Student</span>
      </button>

      <button
        onClick={() => handleSwitch('VENDOR')}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all duration-200 ${
          currentRole === 'VENDOR'
            ? 'bg-amber-500 text-white shadow-md font-black scale-105'
            : 'text-gray-600 dark:text-gray-300 hover:text-amber-500'
        }`}
        title="Switch to Vendor Kitchen Terminal"
      >
        <Store className="w-3.5 h-3.5" />
        <span>Vendor</span>
      </button>

      <button
        onClick={() => handleSwitch('ADMIN')}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all duration-200 ${
          currentRole === 'ADMIN'
            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md font-black scale-105'
            : 'text-gray-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white'
        }`}
        title="Switch to Admin Command Center"
      >
        <Shield className="w-3.5 h-3.5" />
        <span>Admin</span>
      </button>
    </div>
  );
}
