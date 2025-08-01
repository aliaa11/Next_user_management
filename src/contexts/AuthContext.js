'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, isTokenValid } from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token && isTokenValid()) {
        const userData = await getCurrentUser();
        setUser(userData);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginUser = async (token) => {
    localStorage.setItem('token', token);
    const userData = await getCurrentUser();
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
