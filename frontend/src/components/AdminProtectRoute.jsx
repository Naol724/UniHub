// frontend/src/components/AdminProtectRoute.jsx
import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const AdminProtectRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("UniHub-Admin-Token");
    
    if (!token) {
      setIsValid(false);
      setLoading(false);
      return;
    }
    
    try {
      const cleanToken = token.replace('Bearer ', '');
      const decoded = jwtDecode(cleanToken);
      
      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("UniHub-Admin-Token");
        localStorage.removeItem("UniHub-Admin");
        setIsValid(false);
      } else if (decoded.role !== 'admin' && decoded.role !== 'super_admin' && decoded.role !== 'moderator') {
        setIsValid(false);
      } else {
        setIsValid(true);
      }
    } catch (error) {
      console.error("Admin token decode error:", error);
      localStorage.removeItem("UniHub-Admin-Token");
      localStorage.removeItem("UniHub-Admin");
      setIsValid(false);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isValid) {
    return <Navigate to="/admin/login" replace />;
  }

  return children || <Outlet />;
};

export default AdminProtectRoute;