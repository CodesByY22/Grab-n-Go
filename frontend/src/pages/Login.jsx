import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaArrowRight, FaGoogle } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const res = await login(email, password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 relative overflow-hidden page-fade-in">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-brand/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center w-20 h-16 bg-gradient-to-tr from-brand to-yellow-400 rounded-2xl shadow-lg shadow-brand/20 mb-6"
          >
            <span className="text-xl font-black text-white tracking-tighter">GNG</span>
          </motion.div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h2>
          <p className="text-gray-400 font-medium">Log in to your Grab-n-Go account</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 text-sm flex items-center"
          >
            <span className="mr-2">⚠️</span> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="group">
            <label className="block text-gray-400 text-xs font-bold mb-2 ml-1 uppercase tracking-widest group-focus-within:text-brand transition-colors">Email Address</label>
            <div className="relative">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all placeholder:text-gray-600"
                placeholder="yash@example.com"
                required
              />
            </div>
          </div>

          <div className="group">
            <div className="flex justify-between items-center mb-2 ml-1">
                <label className="block text-gray-400 text-xs font-bold uppercase tracking-widest group-focus-within:text-brand transition-colors">Password</label>
                <Link to="#" className="text-xs text-brand hover:text-white transition-colors">Forgot?</Link>
            </div>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all placeholder:text-gray-600"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative w-full bg-gradient-to-r from-brand to-yellow-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-brand/20 mt-4 overflow-hidden transition-all active:scale-95 disabled:opacity-50"
          >
            <div className="relative z-10 flex items-center justify-center">
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">
            New to Grab-n-Go?{' '}
            <Link to="/register" className="text-brand hover:text-white font-bold transition-colors">
              Create an Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
