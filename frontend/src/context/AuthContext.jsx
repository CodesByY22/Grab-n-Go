import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const DEMO_USERS = {
  STUDENT: { email: 'student@campus.edu', password: 'student123', label: 'Student' },
  VENDOR: { email: 'vendor@campus.edu', password: 'vendor123', label: 'Main Cafe Vendor' },
  ADMIN: { email: 'admin@campus.edu', password: 'admin123', label: 'Campus Admin' }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('grabngo_token');
    if (token) {
      authAPI.getMe()
        .then((res) => {
          setUser(res.data.user);
        })
        .catch(() => {
          localStorage.removeItem('grabngo_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      // Default to Student demo account for instant seamless app load if no session
      loginAsDemo('STUDENT').finally(() => setLoading(false));
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login(email, password);
    const { token, user: userData } = res.data;
    localStorage.setItem('grabngo_token', token);
    setUser(userData);
    return userData;
  };

  const loginAsDemo = async (roleKey) => {
    const demo = DEMO_USERS[roleKey];
    if (demo) {
      return await login(demo.email, demo.password);
    }
  };

  const logout = () => {
    localStorage.removeItem('grabngo_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAsDemo, logout, DEMO_USERS }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
