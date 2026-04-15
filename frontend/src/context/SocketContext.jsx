import { createContext, useState, useEffect, useContext } from 'react';
import io from 'socket.io-client';
import AuthContext from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      // Use relative URL in dev (Vite proxy handles it), or env var in production
      const socketUrl = import.meta.env.VITE_API_URL || window.location.origin;
      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
      });

      setSocket(newSocket);

      // Join user's personal room for order status updates
      newSocket.emit('join', user._id);

      newSocket.on('connect', () => {
        console.log('🔌 Socket connected:', newSocket.id);
      });

      newSocket.on('connect_error', (err) => {
        console.warn('Socket connection error:', err.message);
      });

      return () => {
        newSocket.close();
        setSocket(null);
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
