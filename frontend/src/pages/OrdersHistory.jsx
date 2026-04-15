import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import SocketContext from '../context/SocketContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const OrdersHistory = () => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (updatedOrder) => {
      setOrders((prev) =>
        prev.map((o) => o._id === updatedOrder._id ? { ...o, status: updatedOrder.status } : o)
      );
    };

    socket.on('orderStatusUpdate', handleStatusUpdate);

    return () => {
      socket.off('orderStatusUpdate', handleStatusUpdate);
    };
  }, [socket]);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('/api/orders/myorders', config);
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Placed':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'Preparing':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Ready':
        return 'bg-green-500/10 text-green-400 border-green-500/20 animate-pulse';
      case 'Completed':
        return 'bg-gray-700/30 text-gray-400 border-gray-700';
      case 'Cancelled':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-gray-700/30 text-gray-400 border-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Placed': return '📝';
      case 'Preparing': return '👨‍🍳';
      case 'Ready': return '✅';
      case 'Completed': return '🎉';
      case 'Cancelled': return '❌';
      default: return '📋';
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="text-6xl block mb-4">🔒</span>
        <h2 className="text-2xl font-bold text-white mb-4">Please Login</h2>
        <p className="text-gray-400 mb-6">You need to be logged in to view your orders.</p>
        <Link to="/login" className="inline-block bg-brand text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-hover transition-all">Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="h-8 bg-gray-800 rounded w-1/4 mb-8 animate-pulse"></div>
        {[1, 2, 3].map((n) => (
          <div key={n} className="bg-dark-card border border-gray-800 rounded-xl p-6 mb-6 animate-pulse">
            <div className="flex justify-between mb-4">
              <div className="h-5 bg-gray-800 rounded w-1/3"></div>
              <div className="h-5 bg-gray-800 rounded w-20"></div>
            </div>
            <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-800 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto px-4 py-20 text-center"
      >
        <span className="text-7xl block mb-4 opacity-70">📦</span>
        <h2 className="text-3xl font-bold text-white mb-4">No Orders Yet</h2>
        <p className="text-gray-400 mb-8 text-lg">Go grab something to eat!</p>
        <Link to="/" className="inline-block bg-brand text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-brand-hover shadow-lg shadow-brand/20 transition-all">
          Browse Shops
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center">
        <span className="w-1 h-8 bg-brand rounded-full mr-3"></span>
        Your Orders
        <span className="ml-3 text-sm bg-gray-800 text-gray-400 px-3 py-1 rounded-full font-medium">
          {orders.length} orders
        </span>
      </h1>
      <div className="space-y-6">
        {orders.map((order, index) => (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-dark-card rounded-xl shadow-lg p-6 border border-gray-800 hover:border-gray-700 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {order.shop?.name || 'Unknown Shop'}
                </h3>
                <p className="text-sm text-gray-400 mt-1">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getStatusStyle(order.status)}`}>
                <span>{getStatusIcon(order.status)}</span>
                {order.status}
              </span>
            </div>
            <div className="border-t border-gray-800 pt-4">
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center mb-2 text-gray-300">
                  <span>{item.qty}x {item.name}</span>
                  <span className="font-semibold text-white">₹{item.price * item.qty}</span>
                </div>
              ))}
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-800 font-bold text-lg text-white">
                <span>Total</span>
                <span className="text-brand">₹{order.totalPrice}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OrdersHistory;
