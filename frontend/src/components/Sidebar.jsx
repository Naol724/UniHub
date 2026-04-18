// components/Sidebar.jsx - Responsive sidebar with Bootstrap Icons and Logout
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import API from '../API/Axios';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userImage, setUserImage] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("UniHub-User");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchUserProfile(parsedUser.id);
    }
  }, []);

  const fetchUserProfile = async (userId) => {
    try {
      const response = await API.get(`/user/profile/${userId}`);
      if (response.data.success && response.data.user) {
        if (response.data.user.imageURL) {
          setUserImage(response.data.user.imageURL);
        }
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem("UniHub-Haramaya-Dev");
    localStorage.removeItem("UniHub-User");
    
    // Close sidebar if open
    if (onClose) onClose();
    
    // Redirect to login page
    navigate('/user/login');
  };

  const navItems = [
    { icon: "bi-speedometer2", label: "Dashboard", path: "/dashboard" },
    { icon: "bi-people", label: "Teams", path: "/teams" },
    { icon: "bi-check2-square", label: "Tasks", path: "/tasks" },
    { icon: "bi-chat-dots", label: "Messages", path: "/messages" },
    { icon: "bi-folder2", label: "Resources", path: "/resources" },
    { icon: "bi-bell", label: "Notifications", path: "/notifications" },
    { icon: "bi-person", label: "Profile", path: "/profile" },
  ];

  const isActive = (path) => location.pathname === path;

  // Sidebar content (reused for both desktop and mobile)
  const SidebarContent = () => (
    <>
      {/* Logo Section */}
      <div className="px-4 md:px-6 pt-6 pb-6 border-b border-gray-100">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={onClose}>
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
            <i className="bi bi-universal-access-circle text-white text-xl"></i>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            UniHub
          </h1>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 md:px-4 py-6 space-y-1.5">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-3 px-3 md:px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(item.path)
                ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <i className={`${item.icon} text-xl`}></i>
            <span className="flex-1">{item.label}</span>
            {isActive(item.path) && (
              <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
            )}
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="px-4 md:px-6 py-4 border-t border-gray-100">
        <Link to="/profile" onClick={onClose} className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 transition-all group mb-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold shadow-sm overflow-hidden">
            {userImage ? (
              <img 
                src={userImage} 
                alt={user?.first_name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = `<span class="text-white font-semibold">${user?.first_name?.[0]}${user?.last_name?.[0]}</span>`;
                }}
              />
            ) : (
              <span className="text-white font-semibold">
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <i className="bi bi-chevron-right text-gray-400 group-hover:text-blue-500 transition-colors"></i>
        </Link>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-all group"
        >
          <i className="bi bi-box-arrow-right text-xl"></i>
          <span className="flex-1 text-left text-sm font-medium">Logout</span>
          <i className="bi bi-arrow-right text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"></i>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar - always visible on large screens */}
      <aside className="hidden lg:flex lg:w-72 bg-white/95 backdrop-blur-sm border-r border-gray-200 shadow-lg flex-col fixed left-0 top-0 h-screen overflow-y-auto z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Drawer - overlay on small screens */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <aside className="fixed left-0 top-0 w-80 h-full bg-white shadow-2xl z-50 lg:hidden animate-slide-in flex flex-col overflow-y-auto">
            <div className="flex justify-end p-2">
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <i className="bi bi-x-lg text-gray-600"></i>
              </button>
            </div>
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
};

export default Sidebar;