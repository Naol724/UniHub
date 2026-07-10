// frontend/src/contexts/AuthContext.jsx
// Auth is required — users must login to access the app.
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getLocal, setLocal, removeLocal } from '../utils/storage';
import API from '../services/api';

const AuthContext = createContext(null);

/** Normalize token — strip accidental "Bearer " prefix so api.js can add it once. */
const normalizeToken = (token) => {
  if (!token || typeof token !== 'string') return token;
  return token.replace(/^Bearer\s+/i, '').trim();
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getLocal('user'));
  const [token, setToken] = useState(() => normalizeToken(getLocal('token')));

  const isAuthenticated = !!(user && token);

  useEffect(() => {
    const sync = () => {
      setUser(getLocal('user'));
      setToken(normalizeToken(getLocal('token')));
    };
    window.addEventListener('focus', sync);
    return () => window.removeEventListener('focus', sync);
  }, []);

  const login = useCallback(async (credentials, isGoogleLogin = false) => {
    if (isGoogleLogin) {
      const { token: googleToken, user: googleUser } = credentials;
      const rawToken = normalizeToken(googleToken);
      setLocal('token', rawToken);
      setLocal('user', googleUser);
      setToken(rawToken);
      setUser(googleUser);
      return { token: rawToken, user: googleUser };
    }

    const res = await API.post('/auth/user/login', {
      email: credentials.email?.trim(),
      password: credentials.password,
    });
    const rawToken = normalizeToken(res.data.token);
    setLocal('token', rawToken);
    setLocal('user', res.data.user);
    setToken(rawToken);
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (userData) => {
    const { confirmPassword, ...rest } = userData;
    const res = await API.post('/auth/user/register', {
      ...rest,
      email: userData.email?.trim(),
    });
    const rawToken = normalizeToken(res.data.token);
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
