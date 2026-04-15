import React, { useEffect, useContext } from 'react';
import SocketContext from '../context/SocketContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderNotification = () => {
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;

    const handleStatusUpdate = (order) => {
      const statusMessages = {
        Preparing: '👨‍🍳 Your order is being prepared!',
        Ready: '✅ Your order is ready for pickup!',
        Completed: '🎉 Order completed! Enjoy your meal!',
        Cancelled: '❌ Your order has been cancelled.',
      };
      const msg = statusMessages[order.status] || `Order status: ${order.status}`;
      
      if (order.status === 'Ready') {
        toast.success(msg, { autoClose: 8000 });
      } else if (order.status === 'Cancelled') {
        toast.error(msg);
      } else {
        toast.info(msg);
      }
    };

    const handleNewOrder = (order) => {
      toast.success('🔔 New Order Received! 💰', { autoClose: 6000 });
    };

    socket.on('orderStatusUpdate', handleStatusUpdate);
    socket.on('newOrder', handleNewOrder);

    return () => {
      socket.off('orderStatusUpdate', handleStatusUpdate);
      socket.off('newOrder', handleNewOrder);
    };
  }, [socket]);

  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="dark"
    />
  );
};

export default OrderNotification;
