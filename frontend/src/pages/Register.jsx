import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaUser, FaEnvelope, FaLock, FaStore, FaUserCircle, FaArrowRight } from 'react-icons/fa';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
        return setError('Password must be at least 6 characters');
    }
    setError('');
    setIsLoading(true);
    const res = await register(name, email, password, role);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 relative overflow-hidden page-fade-in py-12">
      {/* Background Decor */}
      <div className="absolute top-1/2 -right-20 w-80 h-80 bg-brand/10 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-accent/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '3s' }}></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass p-10 rounded-[2.5rem] shadow-2xl w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-flex items-center justify-center w-20 h-16 bg-gradient-to-tr from-brand to-yellow-400 rounded-2xl shadow-lg shadow-brand/20 mb-6"
          >
            <span className="text-xl font-black text-white tracking-tighter">GNG</span>
          </motion.div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-2">Create Account</h2>
          <p className="text-gray-400 font-medium font-sans">Join the Grab-n-Go community today</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-6 text-sm flex items-center"
          >
            <span className="mr-2">⚠️</span> {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role Selection */}
          <div className="flex gap-4 mb-8">
            <button
                type="button"
                onClick={() => setRole('user')}
                className={`flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    role === 'user' 
                    ? 'border-brand bg-brand/10 text-brand shadow-lg shadow-brand/10 scale-[1.02]' 
                    : 'border-white/5 bg-white/5 text-gray-500 hover:border-white/10'
                }`}
            >
                <FaUserCircle className="text-2xl" />
                <span className="text-xs font-bold uppercase tracking-wider">I'm a Student</span>
            </button>
            <button
                type="button"
                onClick={() => setRole('vendor')}
                className={`flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                    role === 'vendor' 
                    ? 'border-brand bg-brand/10 text-brand shadow-lg shadow-brand/10 scale-[1.02]' 
                    : 'border-white/5 bg-white/5 text-gray-500 hover:border-white/10'
                }`}
            >
                <FaStore className="text-2xl" />
                <span className="text-xs font-bold uppercase tracking-wider">I'm a Vendor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group">
                <label className="block text-gray-400 text-xs font-bold mb-2 ml-1 uppercase tracking-widest group-focus-within:text-brand transition-colors">Full Name</label>
                <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" />
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all placeholder:text-gray-600"
                    placeholder="Yash Sharma"
                    required
                />
                </div>
            </div>

            <div className="group">
                <label className="block text-gray-400 text-xs font-bold mb-2 ml-1 uppercase tracking-widest group-focus-within:text-brand transition-colors">Email Address</label>
                <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all placeholder:text-gray-600"
                    placeholder="yash@college.edu"
                    required
                />
                </div>
            </div>
          </div>

          <div className="group">
            <label className="block text-gray-400 text-xs font-bold mb-2 ml-1 uppercase tracking-widest group-focus-within:text-brand transition-colors">Create Password</label>
            <div className="relative">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white focus:ring-2 focus:ring-brand/50 focus:border-brand/50 transition-all placeholder:text-gray-600"
                placeholder="6+ characters"
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <p className="text-[10px] text-gray-500 text-center mb-6 leading-relaxed">
                By clicking "Get Started", you agree to our <span className="text-gray-400 font-medium">Terms of Service</span> and <span className="text-gray-400 font-medium">Privacy Policy</span>. We'll send you order notifications via email.
            </p>

            <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full bg-gradient-to-r from-brand to-yellow-500 text-white py-4 rounded-2xl font-bold shadow-xl shadow-brand/20 overflow-hidden transition-all active:scale-95 disabled:opacity-50"
            >
                <div className="relative z-10 flex items-center justify-center">
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                    <>
                    <span>Get Started</span>
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
                </div>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </div>
        </form>

        <div className="mt-10 text-center border-t border-white/5 pt-8">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand hover:text-white font-bold transition-colors">
              Sign In Instead
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
