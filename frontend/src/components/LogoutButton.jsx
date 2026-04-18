// frontend/src/components/LogoutButton.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const LogoutButton = ({ className = "", iconOnly = false }) => {
  const { logout } = useAuth();

  return (
    <button
      onClick={logout}
      className={`flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${className}`}
    >
      <i className="bi bi-box-arrow-right text-lg"></i>
      {!iconOnly && <span>Logout</span>}
    </button>
  );
};

export default LogoutButton;