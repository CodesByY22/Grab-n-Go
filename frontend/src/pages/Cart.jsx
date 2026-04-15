import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const Cart = () => {
  const { cart, removeFromCart, addToCart, decreaseQty, total, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      toast.warning('Please login to place an order');
      navigate('/login');
      return;
    }

    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const orderData = {
        orderItems: cart.map(item => ({
          name: item.name,
          qty: item.qty,
          price: item.price,
          product: item._id
        })),
        shopId: cart[0].shopId,
        totalPrice: total
      };

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/orders', orderData, config);

      clearCart();
      toast.success('🎉 Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Order failed', error);
      const msg = error.response?.data?.message || 'Order failed. Please try again.';
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 py-20 text-center"
      >
        <div className="text-8xl mb-6 opacity-80">🛒</div>
        <h2 className="text-4xl font-bold text-white mb-4">Your Cart is Empty</h2>
        <p className="text-xl text-gray-400 mb-10 max-w-md mx-auto">Looks like you haven't added any yummy food yet. Go check out the menus!</p>
        <Link to="/" className="inline-block bg-brand text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all transform hover:-translate-y-1">
          Browse Shops
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
        <span className="w-1 h-8 bg-brand rounded-full mr-3"></span>
        Your Order
        <span className="ml-3 text-sm bg-brand/10 text-brand border border-brand/20 px-3 py-1 rounded-full font-medium">
          {cart.length} {cart.length === 1 ? 'item' : 'items'}
        </span>
      </h1>

      <div className="bg-dark-card border border-gray-800 rounded-xl overflow-hidden mb-8 shadow-2xl">
        {cart.map((item, index) => (
          <motion.div
            key={item._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center justify-between p-6 border-b border-gray-800 last:border-b-0 hover:bg-gray-800/30 transition-colors"
          >
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
              <p className="text-gray-400 text-sm">₹{item.price} each</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Quantity Controls */}
              <div className="flex items-center space-x-2 bg-gray-800 rounded-lg border border-gray-700">
                <button
                  onClick={() => decreaseQty(item._id)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-l-lg transition-colors"
                >
                  <FaMinus className="text-xs" />
                </button>
                <span className="text-white font-bold w-8 text-center">{item.qty}</span>
                <button
                  onClick={() => addToCart(item, item.shopId)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-r-lg transition-colors"
                >
                  <FaPlus className="text-xs" />
                </button>
              </div>

              <span className="font-bold text-brand text-lg min-w-[60px] text-right">₹{item.price * item.qty}</span>
              <button
                onClick={() => removeFromCart(item._id)}
                className="text-gray-500 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-full"
              >
                <FaTrash />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center bg-dark-card border border-gray-800 p-8 rounded-xl shadow-xl">
        <div className="text-3xl font-bold text-white mb-6 md:mb-0">
          Total: <span className="text-brand">₹{total}</span>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={clearCart}
            className="px-6 py-3 border border-gray-600 rounded-lg font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-300"
          >
            Clear Cart
          </button>
          <button
            onClick={handleCheckout}
            disabled={isProcessing}
            className={`px-8 py-3 bg-brand text-white rounded-lg font-bold shadow-lg shadow-brand/20 transition-all duration-300 ${
              isProcessing
                ? 'opacity-60 cursor-not-allowed'
                : 'hover:bg-brand-hover hover:shadow-xl hover:shadow-brand/30 hover:-translate-y-0.5'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Placing Order...</span>
              </span>
            ) : (
              'Place Order'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
