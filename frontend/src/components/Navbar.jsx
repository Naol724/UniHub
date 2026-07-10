// frontend/src/components/Navbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthModal from './AuthModal';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ user, isAuthenticated, onLogout, sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    const segment = path.split('/')[1];
    return segment ? segment.charAt(0).toUpperCase() + segment.slice(1) : 'Dashboard';
  };

  const displayName = user?.firstName || user?.first_name || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 flex-shrink-0">
        <div className="flex items-center justify-between h-14 px-3 sm:px-5">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="btn-icon lg:hidden flex-shrink-0"
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-slate-100 truncate">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <ThemeToggle />

            <Link
              to="/notifications"
              className="btn-icon relative"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </Link>

            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] sm:min-h-0 touch-manipulation"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">{initials}</span>
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-slate-200 max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <svg className="hidden sm:block w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700">
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 truncate">{displayName}</p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user?.email || ''}</p>
                    </div>
                    <Link to="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" onClick={() => setDropdownOpen(false)}>
                      Profile
                    </Link>
                    <Link to="/settings" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors" onClick={() => setDropdownOpen(false)}>
                      Settings
                    </Link>
                    <hr className="my-1 border-gray-100 dark:border-slate-700" />
                    <button
                      onClick={() => { onLogout?.(); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
              >
                <span className="hidden sm:inline">Sign in</span>
                <span className="sm:hidden">In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setAuthModalOpen(false)}
        actionLabel="access your account"
      />
    </>
  );
};

export default Navbar;
