// frontend/src/components/admin/AdminSidebar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import API from '../../API/Axios';

const AdminSidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [admin, setAdmin] = useState(null);

  useEffect(() => {
    const storedAdmin = localStorage.getItem("UniHub-Admin");
    if (storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
    }
  }, []);

  const navItems = [
    { icon: "bi-speedometer2", label: "Dashboard", path: "/admin/dashboard" },
    { icon: "bi-people", label: "Users", path: "/admin/users" },
    { icon: "bi-building", label: "Teams", path: "/admin/teams" },
    { icon: "bi-check2-square", label: "Tasks", path: "/admin/tasks" },
    { icon: "bi-shield-lock", label: "Admins", path: "/admin/admins" },
    { icon: "bi-gear", label: "Settings", path: "/admin/settings" },
  ];

  const isActive = (path) => location.pathname === path;

  const SidebarContent = () => (
    <>
      <div className="px-6 pt-6 pb-6 border-b border-gray-200">
        <Link to="/admin/dashboard" className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
            <i className="bi bi-shield-lock text-white text-xl"></i>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Admin Panel
          </h1>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1.5">
        {navItems.map((item, idx) => (
          <Link
            key={idx}
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
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

      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
            {admin?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{admin?.name || 'Admin'}</p>
            <p className="text-xs text-gray-500 truncate">{admin?.role || 'admin'}</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <aside className="hidden lg:flex lg:w-64 bg-white border-r border-gray-200 flex-col fixed left-0 top-0 h-screen overflow-y-auto z-30">
        <SidebarContent />
      </aside>

      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
          <aside className="fixed left-0 top-0 w-72 h-full bg-white shadow-2xl z-50 lg:hidden flex flex-col overflow-y-auto">
            <div className="flex justify-end p-2">
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
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

export default AdminSidebar;