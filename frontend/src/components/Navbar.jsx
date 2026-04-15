import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import { FaUserCircle, FaShoppingBag, FaBars, FaTimes, FaSignOutAlt, FaClipboardList, FaStoreAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  const menuItems = user?.role === 'vendor' 
    ? [{ name: 'Explore', path: '/', icon: <FaStoreAlt /> }]
    : [
        { name: 'Shops', path: '/', icon: <FaStoreAlt /> },
        { name: 'My Orders', path: '/orders', icon: <FaClipboardList /> },
      ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${
      scrolled ? 'py-3 bg-[#05070A]/80 backdrop-blur-xl border-b border-white/5 shadow-2xl' : 'py-5 bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-12">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center group gap-2" onClick={() => setIsOpen(false)}>
              <span className="text-2xl font-black tracking-tighter flex items-center">
                <span className="text-white">Grab</span>
                <span className="text-brand font-black mx-0.5">-n-</span>
                <span className="text-white">Go</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative text-sm font-bold tracking-wide transition-all hover:text-brand ${
                    location.pathname === item.path ? 'text-brand' : 'text-gray-400'
                  }`}
                >
                  {item.name}
                  {location.pathname === item.path && (
                    <motion.div layoutId="nav-underline" className="absolute -bottom-1 left-0 right-0 h-0.5 bg-brand rounded-full" />
                  )}
                </Link>
              ))}
              {user?.role === 'vendor' && (
                <Link
                  to="/vendor-dashboard"
                  className={`text-sm font-bold tracking-wide transition-all hover:text-brand ${
                    location.pathname === '/vendor-dashboard' ? 'text-brand' : 'text-gray-400'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </div>

            <div className="h-6 w-px bg-white/10 mx-2"></div>

            <div className="flex items-center gap-5">
              {user ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 group hover:border-brand/30 transition-all cursor-default">
                    <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
                        <FaUserCircle className="text-brand text-lg" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-black text-white leading-none mb-1">{user.name}</span>
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter px-1.5 py-0.5 bg-white/5 rounded-md self-start">{user.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/20"
                    title="Logout"
                  >
                    <FaSignOutAlt />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-sm font-bold text-gray-400 hover:text-white transition-colors px-4">Login</Link>
                  <Link to="/register" className="bg-brand text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-hover hover:scale-105 active:scale-95 transition-all shadow-lg shadow-brand/20">Sign Up</Link>
                </div>
              )}

              {/* Cart Toggle */}
              {user?.role !== 'vendor' && (
                <Link to="/cart" className="relative group">
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl group-hover:bg-brand/10 group-hover:border-brand/30 transition-all">
                        <FaShoppingBag className="text-lg text-gray-400 group-hover:text-brand transition-colors" />
                    </div>
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-brand text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-lg border-2 border-[#05070A] animate-bounce shadow-lg">
                            {cartCount}
                        </span>
                    )}
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Toggle */}
          <div className="md:hidden flex items-center gap-4">
            {user?.role !== 'vendor' && (
                <Link to="/cart" className="relative" onClick={() => setIsOpen(false)}>
                    <FaShoppingBag className="text-xl text-gray-400" />
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-brand text-white text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-md">
                            {cartCount}
                        </span>
                    )}
                </Link>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
            >
                {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="md:hidden glass border-t border-white/5 absolute top-full left-0 right-0 py-6 px-4 shadow-2xl"
            >
                <div className="flex flex-col gap-4">
                    {user && (
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl mb-2">
                             <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center">
                                <FaUserCircle className="text-brand text-2xl" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-white">{user.name}</span>
                                <span className="text-xs text-brand font-bold uppercase">{user.role}</span>
                            </div>
                        </div>
                    )}

                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 text-gray-300 hover:text-brand transition-all"
                        >
                            <span className="text-lg opacity-50">{item.icon}</span>
                            <span className="font-bold">{item.name}</span>
                        </Link>
                    ))}

                    <div className="h-px bg-white/5 my-2"></div>

                    {user ? (
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-4 p-4 rounded-xl bg-red-500/10 text-red-500 font-bold"
                        >
                            <FaSignOutAlt />
                            <span>Logout</span>
                        </button>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <Link to="/login" onClick={() => setIsOpen(false)} className="w-full py-4 rounded-xl text-center font-bold text-gray-400 bg-white/5">Login</Link>
                            <Link to="/register" onClick={() => setIsOpen(false)} className="w-full py-4 rounded-xl text-center font-bold text-white bg-brand">Sign Up</Link>
                        </div>
                    )}
                </div>
            </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
