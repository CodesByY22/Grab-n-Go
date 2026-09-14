import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles = [], children }) {
  const { user, loginAsDemo } = useAuth();

  const userRole = user?.role || 'STUDENT';

  if (!allowedRoles.includes(userRole)) {
    const requiredRole = allowedRoles[0]; // e.g. 'VENDOR' or 'ADMIN'

    return (
      <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-gray-200 dark:border-slate-800 shadow-2xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-primary flex items-center justify-center mx-auto shadow-md">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase text-primary tracking-widest block mb-1">
              Role Permission Required
            </span>
            <h2 className="font-headline font-black text-2xl text-gray-900 dark:text-white">
              {requiredRole === 'VENDOR' ? 'Vendor Terminal Access' : requiredRole === 'ADMIN' ? 'Admin Control Access' : 'Student Access Only'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
              You are currently viewing as <strong className="text-gray-900 dark:text-white">{userRole}</strong>. Click below to switch to <strong className="text-primary">{requiredRole}</strong> mode.
            </p>
          </div>

          <button
            onClick={() => loginAsDemo(requiredRole)}
            className="w-full py-4 rounded-2xl bg-primary hover:bg-orange-600 text-white font-black text-sm shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-transform hover:scale-105"
          >
            <span>Switch to {requiredRole} Account</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return children;
}
