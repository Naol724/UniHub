// frontend/src/pages/Notifications/Notifications.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';

const Notifications = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock notifications data - replace with API call
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'task_assigned',
        title: 'Task Assigned',
        message: 'Naol Gonfa assigned you: Design System Documentation',
        timestamp: '2 minutes ago',
        isRead: false,
        icon: 'Task Assigned',
        iconBg: '#ecfdf5',
        iconColor: '#10b981',
        actionUrl: '/tasks'
      },
      {
        id: 2,
        type: 'new_message',
        title: 'New Message',
        message: 'Asefa Niguse sent a message in UI/UX Team chat',
        timestamp: '15 minutes ago',
        isRead: false,
        icon: 'New Message',
        iconBg: '#eff6ff',
        iconColor: '#3b82f6',
        actionUrl: '/messages'
      },
      {
        id: 3,
        type: 'team_invitation',
        title: 'Team Invitation',
        message: 'You\'ve been invited to join Mobile Development team',
        timestamp: '1 hour ago',
        isRead: false,
        icon: 'Team Invitation',
        iconBg: '#f5f3ff',
        iconColor: '#8b5cf6',
        actionUrl: '/teams'
      },
      {
        id: 4,
        type: 'file_shared',
        title: 'File Shared',
        message: 'Ermiyas Abebe shared Project_Specs.pdf with Research Team',
        timestamp: '2 hours ago',
        isRead: true,
        icon: 'File Shared',
        iconBg: '#fffbeb',
        iconColor: '#f59e0b',
        actionUrl: '/resources'
      },
      {
        id: 5,
        type: 'deadline_reminder',
        title: 'Deadline Reminder',
        message: 'Database Schema Design is due today',
        timestamp: '3 hours ago',
        isRead: true,
        icon: 'Deadline Reminder',
        iconBg: '#fef2f2',
        iconColor: '#ef4444',
        actionUrl: '/tasks'
      },
      {
        id: 6,
        type: 'task_completed',
        title: 'Task Completed',
        message: 'Yisiyaq Gezehany completed: Project Setup',
        timestamp: '5 hours ago',
        isRead: true,
        icon: 'Task Completed',
        iconBg: '#ecfdf5',
        iconColor: '#10b981',
        actionUrl: '/tasks'
      },
      {
        id: 7,
        type: 'team_update',
        title: 'Team Update',
        message: 'Backend Team added new member: Abebe Alemu',
        timestamp: '1 day ago',
        isRead: true,
        icon: 'Team Update',
        iconBg: '#eff6ff',
        iconColor: '#3b82f6',
        actionUrl: '/teams'
      },
      {
        id: 8,
        type: 'mention',
        title: 'You were mentioned',
        message: 'Tola Fayisa mentioned you in a comment: "Great work on the dashboard!"',
        timestamp: '2 days ago',
        isRead: true,
        icon: 'Mention',
        iconBg: '#f5f3ff',
        iconColor: '#8b5cf6',
        actionUrl: '/tasks'
      }
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, []);

  const pageStyles = {
    padding: '20px',
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    minHeight: '100vh'
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  };

  const titleStyles = {
    fontSize: '28px',
    fontWeight: '700',
    color: theme.colors.text,
    margin: '0 0 8px 0'
  };

  const subtitleStyles = {
    fontSize: '16px',
    color: theme.colors.textSecondary,
    margin: '0'
  };

  const notificationListStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const notificationItemStyles = (isRead) => ({
    display: 'flex',
    gap: '12px',
    padding: '16px',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    boxShadow: `0 2px 8px ${theme.colors.shadow}`,
    transition: 'all 0.2s ease',
    cursor: 'pointer',
    borderLeft: isRead ? 'none' : `3px solid ${theme.colors.primary}`,
    backgroundColor: isRead ? theme.colors.surface : `${theme.colors.primary}10`
  });

  const notificationIconStyles = (bg, color) => ({
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: bg,
    color: color,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0
  });

  const notificationContentStyles = {
    flex: 1,
    minWidth: 0
  };

  const notificationTitleStyles = {
    fontSize: '14px',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const notificationMessageStyles = {
    fontSize: '13px',
    color: theme.colors.textSecondary,
    lineHeight: '1.4',
    marginBottom: '4px'
  };

  const notificationTimeStyles = {
    fontSize: '11px',
    color: theme.colors.textSecondary
  };

  const newBadgeStyles = {
    backgroundColor: theme.colors.primary,
    color: '#fff',
    fontSize: '8px',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '10px',
    textTransform: 'uppercase'
  };

  const markAllReadStyles = {
    backgroundColor: 'transparent',
    color: theme.colors.text,
    border: `1px solid ${theme.colors.border}`,
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    cursor: 'pointer'
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id) => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prevNotifications =>
      prevNotifications.map(notification => ({ ...notification, isRead: true }))
    );
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    // Navigate to action URL (implement navigation logic)
    console.log('Navigate to:', notification.actionUrl);
  };

  if (loading) {
    return (
      <div style={pageStyles}>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div>Loading notifications...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div>
          <h1 style={titleStyles}>Notifications</h1>
          <p style={subtitleStyles}>
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            style={markAllReadStyles}
          >
            Mark all as read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div style={notificationListStyles}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            style={notificationItemStyles(notification.isRead)}
            onClick={() => handleNotificationClick(notification)}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = `0 4px 16px ${theme.colors.shadow}`;
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = `0 2px 8px ${theme.colors.shadow}`;
            }}
          >
            {/* Notification Icon */}
            <div style={notificationIconStyles(notification.iconBg, notification.iconColor)}>
              {notification.icon.charAt(0)}
            </div>

            {/* Notification Content */}
            <div style={notificationContentStyles}>
              <div style={notificationTitleStyles}>
                {notification.title}
                {!notification.isRead && (
                  <span style={newBadgeStyles}>New</span>
                )}
              </div>
              <div style={notificationMessageStyles}>
                {notification.message}
              </div>
              <div style={notificationTimeStyles}>
                {notification.timestamp}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: theme.colors.textSecondary
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>No notifications</div>
          <p>You're all caught up! No new notifications to show.</p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
