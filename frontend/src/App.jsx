// frontend/src/App.jsx
// Main routes now require authentication — login required to access app.
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import ProtectRoute from './components/ProtectRoute';
import ErrorBoundary from './components/ErrorBoundary';

// Main pages
import Dashboard    from './pages/Dashboard/Dashboard';
import Teams        from './pages/Teams/Teams';
import Tasks        from './pages/Tasks/Tasks';
import Messages     from './pages/Messages/Messages';
import Resources    from './pages/Resources/Resources';
import Notifications from './pages/Notifications/Notifications';
import Profile      from './pages/Profile/Profile';
import Settings     from './pages/Settings/Settings';

// Auth pages
import Login         from './pages/auth/Login';
import Register      from './pages/auth/Register';
import GoogleSuccess from './pages/auth/GoogleSuccess';

// Admin pages (still require admin auth)
import AdminLayout    from './components/admin/AdminLayout';
import AdminLogin     from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers     from './pages/admin/AdminUsers';
import AdminTeams     from './pages/admin/AdminTeams';
import AdminTasks     from './pages/admin/AdminTasks';
import AdminAdmins    from './pages/admin/AdminAdmins';
import AdminSettings  from './pages/admin/AdminSettings';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
              {/* ── Auth routes — public (no authentication required) ─────────────────────────────── */}
              <Route path="/user/login"    element={<Login />} />
              <Route path="/user/register" element={<Register />} />
              <Route path="/auth/google/success" element={<GoogleSuccess />} />
              
              {/* ── Legacy auth routes — redirect to new auth routes ───────────────── */}
              <Route path="/login"    element={<Navigate to="/user/login" replace />} />
              <Route path="/register" element={<Navigate to="/user/register" replace />} />

              {/* ── Main app — requires authentication ─────────────────────────────── */}
              <Route path="/" element={
                <ProtectRoute>
                  <Layout />
                </ProtectRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="teams"         element={<Teams />} />
                <Route path="tasks"         element={<Tasks />} />
                <Route path="messages"      element={<Messages />} />
                <Route path="resources"     element={<Resources />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile"       element={<Profile />} />
                <Route path="settings"      element={<Settings />} />
              </Route>

              {/* ── Admin panel — still requires admin token ────────────── */}
              <Route path="/admin/login"    element={<AdminLogin />} />
              <Route path="/admin"          element={<AdminLayout />}>
                <Route index                element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard"     element={<AdminDashboard />} />
                <Route path="users"         element={<AdminUsers />} />
                <Route path="teams"         element={<AdminTeams />} />
                <Route path="tasks"         element={<AdminTasks />} />
                <Route path="admins"        element={<AdminAdmins />} />
                <Route path="settings"      element={<AdminSettings />} />
              </Route>

              {/* ── 404 fallback ─────────────────────────────────────────── */}
              <Route path="*" element={<Navigate to="/user/login" replace />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
