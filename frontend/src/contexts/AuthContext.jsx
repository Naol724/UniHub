// frontend/src/contexts/AuthContext.jsx
// Auth is now required — users must login to access the app.
// All main routes are protected and require authentication.
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

  const login = useCallback(async (credentials, isGoogleLogin = false) => {
    let res;
    
    if (isGoogleLogin) {
      // For Google login, credentials are actually token and user
      const { token: googleToken, user: googleUser } = credentials;
      setLocal('token', googleToken);
      setLocal('user', googleUser);
      setToken(googleToken);
      setUser(googleUser);
      return { token: googleToken, user: googleUser };
    } else {
      // For regular login
      res = await API.post('/user/login', {
        email: credentials.email?.trim(),
        password: credentials.password,
      });
      const rawToken = res.data.token?.replace('Bearer ', '') || res.data.token;
      setLocal('token', rawToken);
      setLocal('user', res.data.user);
      setToken(rawToken);
      setUser(res.data.user);
      return res.data;
    }
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
