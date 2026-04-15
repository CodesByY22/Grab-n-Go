import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark-card/60 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-black mb-3 tracking-tighter flex items-center">
              <span className="text-white">Grab</span>
              <span className="text-brand font-black mx-0.5">-n-</span>
              <span className="text-white">Go</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Skip the queue. Order from your favorite college cafeteria shops online and pick up when ready.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-brand text-sm transition-colors">Browse Shops</Link>
              <Link to="/orders" className="block text-gray-400 hover:text-brand text-sm transition-colors">My Orders</Link>
              <Link to="/cart" className="block text-gray-400 hover:text-brand text-sm transition-colors">Cart</Link>
            </div>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">About</h4>
            <p className="text-gray-400 text-sm leading-relaxed">
              Built for college cafeterias. Vendors manage their shops, students order food — all in real-time.
            </p>
            <div className="flex items-center space-x-3 mt-4">
              <span className="text-2xl">🍔</span>
              <span className="text-2xl">🍕</span>
              <span className="text-2xl">🧃</span>
              <span className="text-2xl">☕</span>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Grab-n-Go. All rights reserved.
          </p>
          <p className="text-gray-600 text-xs mt-2 md:mt-0">
            Made with ❤️ for college campuses
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
