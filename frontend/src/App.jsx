// frontend/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectRoute from './components/ProtectRoute';
import PublicRoute from './components/PublicRoute';
import AdminProtectRoute from './components/AdminProtectRoute';

// User Pages
import Login from './pages/auth/UserLogin';
import Register from './pages/auth/UserRegister';
import Dashboard from './pages/Dashboard';
import TeamsDashboard from './pages/Teams';
import TeamPage from './pages/TeamPage';
import TasksPage from './pages/Tasks';
import MessagesPage from './pages/Messages';
import ProfilePage from './pages/Profile';
import TeamChat from './pages/TeamChat';
import DashboardLayout from './components/DashboardLayout';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTeams from './pages/admin/AdminTeams';
import AdminTasks from './pages/admin/AdminTasks';
import AdminAdmins from './pages/admin/AdminAdmins';
import AdminSettings from './pages/admin/AdminSettings';

// Wrapper components
const ProtectedPage = ({ children }) => <ProtectRoute>{children}</ProtectRoute>;
const PublicPage = ({ children }) => <PublicRoute>{children}</PublicRoute>;

function App() {
  return (
    <Router>
      <Routes>
        {/* User Public Routes */}
        <Route path="user/login" element={<PublicPage><Login /></PublicPage>} />
        <Route path="user/register" element={<PublicPage><Register /></PublicPage>} />
        
        {/* Admin Public Route */}
        <Route path="admin/login" element={<AdminLogin />} />
        
        {/* User Protected Routes with Layout */}
        <Route element={<DashboardLayout />}>
          <Route path="dashboard" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
          <Route path="teams" element={<ProtectedPage><TeamsDashboard /></ProtectedPage>} />
          <Route path="teams/:teamId" element={<ProtectedPage><TeamPage /></ProtectedPage>} />
          <Route path="team-chat/:teamId" element={<ProtectedPage><TeamChat /></ProtectedPage>} />
          <Route path="tasks" element={<ProtectedPage><TasksPage /></ProtectedPage>} />
          <Route path="messages" element={<ProtectedPage><MessagesPage /></ProtectedPage>} />
          <Route path="profile" element={<ProtectedPage><ProfilePage /></ProtectedPage>} />
          <Route path="/" element={<ProtectedPage><Dashboard /></ProtectedPage>} />
        </Route>
        
        {/* Admin Protected Routes */}
        <Route path="/admin" element={<AdminProtectRoute><AdminLayout /></AdminProtectRoute>}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="teams" element={<AdminTeams />} />
          <Route path="tasks" element={<AdminTasks />} />
          <Route path="admins" element={<AdminAdmins />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
        
        {/* 404 - Not Found */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;