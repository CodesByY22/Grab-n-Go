import { io } from 'socket.io-client';

const getSocketURL = () => {
  if (import.meta.env.VITE_BACKEND_URL) return import.meta.env.VITE_BACKEND_URL;
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000';
  }
  return 'https://grab-n-go-1.onrender.com';
};

export const socket = io(getSocketURL(), {
  autoConnect: true,
  reconnectionAttempts: 3,
  timeout: 5000
});
