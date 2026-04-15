import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import VendorDashboard from './pages/VendorDashboard';
import ShopMenu from './pages/ShopMenu';
import Cart from './pages/Cart';

import { SocketProvider } from './context/SocketContext';
import OrderNotification from './components/OrderNotification';
import OrdersHistory from './pages/OrdersHistory';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <div className="min-h-screen flex flex-col">
              <Navbar />
              <OrderNotification />
              <div className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/vendor-dashboard" element={<VendorDashboard />} />
                  <Route path="/shop/:id" element={<ShopMenu />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/orders" element={<OrdersHistory />} />
                </Routes>
              </div>
              <Footer />
            </div>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
