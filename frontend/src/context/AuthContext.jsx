// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API/Axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("UniHub-Haramaya-Dev");
    const storedUser = localStorage.getItem("UniHub-User");
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        
        // Verify token with backend
        const response = await API.get(`/user/profile/${userData.id}`);
        
        if (response.data.success) {
          setUser({
            id: response.data.user._id,
            first_name: response.data.user.first_name,
            last_name: response.data.user.last_name,
            email: response.data.user.email,
            imageURL: response.data.user.imageURL,
            department: response.data.user.department
          });
          setIsAuthenticated(true);
        } else {
          logout();
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        if (error.response?.status === 401) {
          logout();
        }
      }
    }
    setLoading(false);
  };

  const login = (token, userData) => {
    localStorage.setItem("UniHub-Haramaya-Dev", token);
    localStorage.setItem("UniHub-User", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("UniHub-Haramaya-Dev");
    localStorage.removeItem("UniHub-User");
    setUser(null);
    setIsAuthenticated(false);
    navigate('/user/login');
  };

  const updateUser = (updatedData) => {
    const newUserData = { ...user, ...updatedData };
    localStorage.setItem("UniHub-User", JSON.stringify(newUserData));
    setUser(newUserData);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};