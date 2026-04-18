// components/MobileHeader.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../API/Axios';

const MobileHeader = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userImage, setUserImage] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

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
    localStorage.removeItem("UniHub-Haramaya-Dev");
    localStorage.removeItem("UniHub-User");
    navigate('/user/login');
  };

  return (
    <header className="lg:hidden fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm z-20">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Menu Button */}
        <button 
          onClick={onMenuClick}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <i className="bi bi-list text-2xl text-gray-700"></i>
        </button>

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-8 h-8 rounded-lg flex items-center justify-center">
            <i className="bi bi-universal-access-circle text-white text-lg"></i>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            UniHub
          </h1>
        </Link>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden"
          >
            {userImage ? (
              <img 
                src={userImage} 
                alt={user?.first_name} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{user?.first_name?.[0]}{user?.last_name?.[0]}</span>
            )}
          </button>
          
          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <i className="bi bi-person text-gray-400"></i>
                  <span>Profile</span>
                </Link>
                <Link
                  to="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <i className="bi bi-gear text-gray-400"></i>
                  <span>Settings</span>
                </Link>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span>Logout</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;