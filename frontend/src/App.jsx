import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import StudentDashboard from './pages/StudentDashboard';
import MenuPage from './pages/MenuPage';
import CartPage from './pages/CartPage';
import OrderTracking from './pages/OrderTracking';
import VendorDashboard from './pages/VendorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function AppContent() {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);

  const addToCart = (item, vendor) => {
    setCart(prev => {
      if (prev.length > 0 && prev[0].vendorId !== vendor.id) {
        if (!window.confirm(`Your cart already contains items from "${prev[0].vendorName}". Clear cart and switch to "${vendor.name}"?`)) {
          return prev;
        }
        return [{ ...item, vendorId: vendor.id, vendorName: vendor.name }];
      }
      return [...prev, { ...item, vendorId: vendor.id, vendorName: vendor.name }];
    });
  };

  const clearCart = () => setCart([]);

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body selection:bg-orange-500 selection:text-white">
      <Navbar cartCount={cart.length} />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage addToCart={addToCart} />} />
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/menu" element={<MenuPage addToCart={addToCart} cart={cart} />} />
          <Route path="/cart" element={<CartPage cart={cart} clearCart={clearCart} />} />
          <Route path="/orders" element={<OrderTracking />} />
          
          {/* Vendor Protected Route */}
          <Route 
            path="/vendor" 
            element={
              <ProtectedRoute allowedRoles={['VENDOR', 'ADMIN']}>
                <VendorDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Admin Protected Route */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>

      <footer className="bg-white dark:bg-slate-900 border-t border-gray-200/80 dark:border-slate-800 py-8 text-center text-xs font-semibold text-gray-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-headline font-black text-primary italic text-base">Grab-N-Go</span>
            <span>— Skip the Queue. Grab Your Food. Go.</span>
          </div>
          <p>© 2026 Campus Smart Cafeteria Platform. Production Grade.</p>
        </div>
      </footer>
    </div>
  );
}

import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
