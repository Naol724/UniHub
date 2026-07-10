import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';

const Notifications = () => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/notifications');
      setNotifications(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    try {
      await API.patch(`/notifications/${id}/read`);
    } catch (_) {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await API.patch('/notifications/read-all');
    } catch (_) {
      fetchNotifications();
    }
  };

  const timeAgo = (date) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins || 1}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>Notifications</h1>
          <p className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="btn-secondary btn-responsive"
          >
            Mark all as read
          </button>
        )}
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      {notifications.length === 0 ? (
        <div className="text-center py-16" style={{ color: theme.colors.textSecondary }}>
          <p className="text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n._id}
              onClick={() => markRead(n._id)}
              className="w-full flex items-start gap-3 p-4 rounded-xl border text-left"
              style={{
                backgroundColor: n.isRead ? theme.colors.surface : `${theme.colors.primary}08`,
                borderColor: n.isRead ? theme.colors.border : theme.colors.primary,
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold bg-blue-50 text-blue-600">
                {(n.title || 'N').charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold" style={{ color: theme.colors.text }}>{n.title}</span>
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                </div>
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{n.message}</p>
                <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>{timeAgo(n.createdAt)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
