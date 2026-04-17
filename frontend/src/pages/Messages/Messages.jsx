// frontend/src/pages/Messages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';

const Messages = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Mock data - replace with API call
  useEffect(() => {
    const mockConversations = [
      {
        id: 1,
        name: 'UI/UX Team',
        type: 'team',
        icon: 'UI',
        color: theme.colors.primary,
        lastMessage: 'Great work on designs!',
        timestamp: '10:30 AM',
        unreadCount: 3,
        isOnline: true,
        memberCount: 4
      },
      {
        id: 2,
        name: 'Naol Gonfa',
        type: 'direct',
        icon: 'NG',
        color: theme.colors.text,
        lastMessage: 'Can you review mockups?',
        timestamp: '9:45 AM',
        unreadCount: 1,
        isOnline: true,
        memberCount: 1
      },
      {
        id: 3,
        name: 'Backend Team',
        type: 'team',
        icon: 'BE',
        color: theme.colors.secondary,
        lastMessage: 'API endpoints ready',
        timestamp: 'Yesterday',
        unreadCount: 0,
        isOnline: false,
        memberCount: 3
      },
      {
        id: 4,
        name: 'Asefa Niguse',
        type: 'direct',
        icon: 'AN',
        color: theme.colors.secondary,
        lastMessage: 'Thanks for the help!',
        timestamp: 'Yesterday',
        unreadCount: 0,
        isOnline: false,
        memberCount: 1
      },
      {
        id: 5,
        name: 'Research Team',
        type: 'team',
        icon: 'RT',
        color: theme.colors.success,
        lastMessage: 'Survey results are in',
        timestamp: '2 days ago',
        unreadCount: 5,
        isOnline: false,
        memberCount: 2
      }
    ];

    const mockMessages = [
      {
        id: 1,
        senderId: 1,
        senderName: 'Naol Gonfa',
        senderInitials: 'NG',
        content: 'Hey team! Just finished the new dashboard designs. Let me know what you think!',
        timestamp: '10:30 AM',
        isOwn: false
      },
      {
        id: 2,
        senderId: 0, // Current user
        senderName: 'You',
        senderInitials: 'ME',
        content: 'These look amazing! Love the color scheme and layout.',
        timestamp: '10:32 AM',
        isOwn: true
      },
      {
        id: 3,
        senderId: 2,
        senderName: 'Asefa Niguse',
        senderInitials: 'AN',
        content: 'Great work! Should we add hover states for the activity feed?',
        timestamp: '10:35 AM',
        isOwn: false
      },
      {
        id: 4,
        senderId: 0,
        senderName: 'You',
        senderInitials: 'ME',
        content: 'Good point! A subtle background change on hover would work great.',
        timestamp: '10:38 AM',
        isOwn: true
      }
    ];

    setTimeout(() => {
      setConversations(mockConversations);
      setMessages(mockMessages);
      setActiveConversation(mockConversations[0]);
      setLoading(false);
    }, 1000);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const pageStyles = {
    display: 'flex',
    height: 'calc(100vh - 40px)',
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    padding: '20px'
  };

  const chatListStyles = {
    width: '280px',
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    marginRight: '20px'
  };

  const chatListHeaderStyles = {
    padding: '16px',
    borderBottom: `1px solid ${theme.colors.border}`,
    fontSize: '14px',
    fontWeight: '700',
    color: theme.colors.text
  };

  const chatItemStyles = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderBottom: `1px solid ${theme.colors.border}`,
    cursor: 'pointer',
    backgroundColor: isActive ? theme.colors.primaryLight : 'transparent',
    transition: 'background-color 0.2s ease'
  });

  const avatarStyles = (color, size = 32) => ({
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    backgroundColor: color || theme.colors.primaryLight,
    color: color ? '#fff' : theme.colors.primary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size === 32 ? '12px' : '10px',
    fontWeight: '600',
    flexShrink: 0
  });

  const chatInfoStyles = {
    flex: 1,
    minWidth: 0
  };

  const chatNameStyles = {
    fontSize: '12px',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '2px'
  };

  const chatLastMessageStyles = {
    fontSize: '10px',
    color: theme.colors.textSecondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  };

  const unreadBadgeStyles = {
    backgroundColor: theme.colors.primary,
    color: '#fff',
    fontSize: '10px',
    fontWeight: '600',
    padding: '2px 6px',
    borderRadius: '10px',
    minWidth: '18px',
    textAlign: 'center',
    marginLeft: 'auto'
  };

  const chatPanelStyles = {
    flex: 1,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const chatHeaderStyles = {
    padding: '16px 20px',
    borderBottom: `1px solid ${theme.colors.border}`,
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const chatHeaderInfoStyles = {
    flex: 1
  };

  const chatHeaderNameStyles = {
    fontSize: '14px',
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: '2px'
  };

  const chatHeaderMetaStyles = {
    fontSize: '10px',
    color: theme.colors.textSecondary
  };

  const messagesContainerStyles = {
    flex: 1,
    padding: '16px 20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  };

  const messageStyles = (isOwn) => ({
    display: 'flex',
    gap: '8px',
    maxWidth: '80%',
    alignSelf: isOwn ? 'flex-end' : 'flex-start'
  });

  const messageBubbleStyles = (isOwn) => ({
    padding: '8px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    lineHeight: '1.4',
    backgroundColor: isOwn ? theme.colors.primary : theme.colors.border,
    color: isOwn ? '#fff' : theme.colors.text,
    borderBottomLeftRadius: isOwn ? '12px' : '3px',
    borderBottomRightRadius: isOwn ? '3px' : '12px'
  });

  const messageMetaStyles = {
    fontSize: '9px',
    color: theme.colors.textSecondary,
    marginTop: '3px'
  };

  const messageInputStyles = {
    padding: '16px 20px',
    borderTop: `1px solid ${theme.colors.border}`,
    display: 'flex',
    gap: '12px'
  };

  const inputStyles = {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: theme.colors.background,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    fontSize: '12px',
    color: theme.colors.text,
    outline: 'none'
  };

  const sendButtonStyles = {
    backgroundColor: theme.colors.primary,
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer'
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        id: messages.length + 1,
        senderId: 0,
        senderName: 'You',
        senderInitials: 'ME',
        content: newMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isOwn: true
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div style={pageStyles}>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div>Loading messages...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles}>
      {/* Chat List */}
      <div style={chatListStyles}>
        <div style={chatListHeaderStyles}>
          Conversations
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              style={chatItemStyles(activeConversation?.id === conversation.id)}
              onClick={() => setActiveConversation(conversation)}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = activeConversation?.id === conversation.id 
                  ? theme.colors.primaryLight 
                  : theme.colors.background;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = activeConversation?.id === conversation.id 
                  ? theme.colors.primaryLight 
                  : 'transparent';
              }}
            >
              <div style={avatarStyles(conversation.color)}>
                {conversation.icon}
              </div>
              <div style={chatInfoStyles}>
                <div style={chatNameStyles}>{conversation.name}</div>
                <div style={chatLastMessageStyles}>{conversation.lastMessage}</div>
              </div>
              {conversation.unreadCount > 0 && (
                <div style={unreadBadgeStyles}>
                  {conversation.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Panel */}
      <div style={chatPanelStyles}>
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div style={chatHeaderStyles}>
              <div style={avatarStyles(activeConversation.color, 40)}>
                {activeConversation.icon}
              </div>
              <div style={chatHeaderInfoStyles}>
                <div style={chatHeaderNameStyles}>{activeConversation.name}</div>
                <div style={chatHeaderMetaStyles}>
                  {activeConversation.type === 'team' 
                    ? `${activeConversation.memberCount} members · ${activeConversation.isOnline ? 'Online' : 'Offline'}`
                    : activeConversation.isOnline ? 'Online' : 'Offline'
                  }
                </div>
              </div>
            </div>

            {/* Messages */}
            <div style={messagesContainerStyles}>
              {messages.map((message) => (
                <div key={message.id} style={messageStyles(message.isOwn)}>
                  {!message.isOwn && (
                    <div style={avatarStyles(theme.colors.primary, 24)}>
                      {message.senderInitials}
                    </div>
                  )}
                  <div>
                    {!message.isOwn && (
                      <div style={{ fontSize: '9px', fontWeight: '600', color: theme.colors.textSecondary, marginBottom: '3px' }}>
                        {message.senderName}
                      </div>
                    )}
                    <div style={messageBubbleStyles(message.isOwn)}>
                      {message.content}
                    </div>
                    <div style={{
                      ...messageMetaStyles,
                      textAlign: message.isOwn ? 'right' : 'left'
                    }}>
                      {message.timestamp}
                    </div>
                  </div>
                  {message.isOwn && (
                    <div style={avatarStyles(theme.colors.primary, 24)}>
                      {message.senderInitials}
                    </div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div style={messageInputStyles}>
              <input
                type="text"
                style={inputStyles}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <button style={sendButtonStyles} onClick={handleSendMessage}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: theme.colors.textSecondary
          }}>
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
