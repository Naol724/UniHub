// frontend/src/pages/Notifications/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Notifications = () => {
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mock = [
      { id: 1, title: 'Task Assigned',      message: 'Naol Gonfa assigned you: Design System Documentation',              timestamp: '2 minutes ago',  isRead: false, iconBg: '#ecfdf5', iconColor: '#10b981', actionUrl: '/tasks'         },
      { id: 2, title: 'New Message',        message: 'Asefa Niguse sent a message in UI/UX Team chat',                    timestamp: '15 minutes ago', isRead: false, iconBg: '#eff6ff', iconColor: '#3b82f6', actionUrl: '/messages'      },
      { id: 3, title: 'Team Invitation',    message: "You've been invited to join Mobile Development team",               timestamp: '1 hour ago',     isRead: false, iconBg: '#f5f3ff', iconColor: '#8b5cf6', actionUrl: '/teams'         },
      { id: 4, title: 'File Shared',        message: 'Ermiyas Abebe shared Project_Specs.pdf with Research Team',         timestamp: '2 hours ago',    isRead: true,  iconBg: '#fffbeb', iconColor: '#f59e0b', actionUrl: '/resources'     },
      { id: 5, title: 'Deadline Reminder',  message: 'Database Schema Design is due today',                               timestamp: '3 hours ago',    isRead: true,  iconBg: '#fef2f2', iconColor: '#ef4444', actionUrl: '/tasks'         },
      { id: 6, title: 'Task Completed',     message: 'Yisiyaq Gezehany completed: Project Setup',                         timestamp: '5 hours ago',    isRead: true,  iconBg: '#ecfdf5', iconColor: '#10b981', actionUrl: '/tasks'         },
      { id: 7, title: 'Team Update',        message: 'Backend Team added new member: Abebe Alemu',                        timestamp: '1 day ago',      isRead: true,  iconBg: '#eff6ff', iconColor: '#3b82f6', actionUrl: '/teams'         },
      { id: 8, title: 'You were mentioned', message: 'Tola Fayisa mentioned you in a comment: "Great work on the dashboard!"', timestamp: '2 days ago', isRead: true, iconBg: '#f5f3ff', iconColor: '#8b5cf6', actionUrl: '/tasks'    },
    ];
    setTimeout(() => { setNotifications(mock); setLoading(false); }, 800);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = (id) => setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>Notifications</h1>
          <p className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="self-start sm:self-auto px-4 py-2 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ borderColor: theme.colors.border, color: theme.colors.text }}
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-2">
        {notifications.map((n) => (
          <button
            key={n.id}
            onClick={() => markRead(n.id)}
            className="w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all hover:-translate-y-0.5 hover:shadow-sm"
            style={{
              backgroundColor: n.isRead ? theme.colors.surface : `${theme.colors.primary}08`,
              borderColor: n.isRead ? theme.colors.border : theme.colors.primary,
              borderLeftWidth: n.isRead ? '1px' : '3px',
            }}
          >
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg font-bold" style={{ backgroundColor: n.iconBg, color: n.iconColor }}>
              {n.title.charAt(0)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold" style={{ color: theme.colors.text }}>{n.title}</span>
                {!n.isRead && (
                  <span className="text-xs font-bold px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: theme.colors.primary }}>New</span>
                )}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: theme.colors.textSecondary }}>{n.message}</p>
              <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>{n.timestamp}</p>
            </div>
          </button>
        ))}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-16" style={{ color: theme.colors.textSecondary }}>
          <p className="text-sm">No notifications to show.</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
