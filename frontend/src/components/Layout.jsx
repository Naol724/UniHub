// frontend/src/components/Layout.jsx
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { theme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div
      className="flex min-h-screen"
      style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        isAuthenticated={isAuthenticated}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <Navbar
          user={user}
          isAuthenticated={isAuthenticated}
          onLogout={logout}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        <main
          className="flex-1 overflow-auto p-3 sm:p-4 md:p-6"
          style={{ backgroundColor: theme.colors.background }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
