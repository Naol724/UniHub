// frontend/src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Layout = () => {
  const { theme } = useTheme();
  const { user } = useAuth();

  const layoutStyles = {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: theme.colors.background,
    color: theme.colors.text
  };

  const mainContentStyles = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const contentStyles = {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
    backgroundColor: theme.colors.background
  };

  return (
    <div style={layoutStyles}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div style={mainContentStyles}>
        {/* Navbar */}
        <Navbar />
        
        {/* Page Content */}
        <main style={contentStyles}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
