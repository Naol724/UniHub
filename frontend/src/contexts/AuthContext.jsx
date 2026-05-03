// frontend/src/contexts/AuthContext.jsx
// Auth is optional — the app works without login.
// Auth state is only needed for service-request actions (Create Team, Add Task, Upload, etc.)
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getLocal, setLocal, removeLocal } from '../utils/storage';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getLocal('user'));
  const [token, setToken] = useState(() => getLocal('token'));

  // Derived flag — no async loading needed
  const isAuthenticated = !!(user && token);

  // Sync user from storage on focus (handles multi-tab logout)
  useEffect(() => {
    const sync = () => {
      setUser(getLocal('user'));
      setToken(getLocal('token'));
    };
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, []);

  const login = useCallback(async (credentials) => {
    const res = await API.post('/user/login', {
      email: credentials.email?.trim(),
      password: credentials.password,
    });
    const rawToken = res.data.token?.replace('Bearer ', '') || res.data.token;
    setLocal('token', rawToken);
    setLocal('user', res.data.user);
    setToken(rawToken);
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (userData) => {
    const { confirmPassword, ...rest } = userData;
    const res = await API.post('/user/register', {
      ...rest,
      email: userData.email?.trim(),
    });
    const rawToken = res.data.token?.replace('Bearer ', '') || res.data.token;
    setLocal('token', rawToken);
    setLocal('user', res.data.user);
    setToken(rawToken);
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    removeLocal('token');
    removeLocal('user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
