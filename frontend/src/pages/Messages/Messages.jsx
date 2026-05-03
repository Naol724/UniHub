// frontend/src/pages/Messages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthGate from '../../hooks/useAuthGate';

const Messages = () => {
  const { theme } = useTheme();
  const { gate, AuthGate } = useAuthGate();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(true); // mobile: toggle between list and chat
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const mockConversations = [
      { id: 1, name: 'UI/UX Team',    type: 'team',   icon: 'UI', color: theme.colors.primary,   lastMessage: 'Great work on designs!',   timestamp: '10:30 AM', unreadCount: 3, isOnline: true,  memberCount: 4 },
      { id: 2, name: 'Naol Gonfa',    type: 'direct', icon: 'NG', color: '#6366f1',               lastMessage: 'Can you review mockups?',  timestamp: '9:45 AM',  unreadCount: 1, isOnline: true,  memberCount: 1 },
      { id: 3, name: 'Backend Team',  type: 'team',   icon: 'BE', color: theme.colors.secondary,  lastMessage: 'API endpoints ready',      timestamp: 'Yesterday',unreadCount: 0, isOnline: false, memberCount: 3 },
      { id: 4, name: 'Asefa Niguse',  type: 'direct', icon: 'AN', color: '#8b5cf6',               lastMessage: 'Thanks for the help!',     timestamp: 'Yesterday',unreadCount: 0, isOnline: false, memberCount: 1 },
      { id: 5, name: 'Research Team', type: 'team',   icon: 'RT', color: theme.colors.success,    lastMessage: 'Survey results are in',    timestamp: '2 days ago',unreadCount: 5, isOnline: false, memberCount: 2 },
    ];
    const mockMessages = [
      { id: 1, senderName: 'Naol Gonfa',  senderInitials: 'NG', content: 'Hey team! Just finished the new dashboard designs. Let me know what you think!', timestamp: '10:30 AM', isOwn: false },
      { id: 2, senderName: 'You',         senderInitials: 'ME', content: 'These look amazing! Love the color scheme and layout.',                           timestamp: '10:32 AM', isOwn: true  },
      { id: 3, senderName: 'Asefa Niguse',senderInitials: 'AN', content: 'Great work! Should we add hover states for the activity feed?',                   timestamp: '10:35 AM', isOwn: false },
      { id: 4, senderName: 'You',         senderInitials: 'ME', content: 'Good point! A subtle background change on hover would work great.',               timestamp: '10:38 AM', isOwn: true  },
    ];
    setTimeout(() => {
      setConversations(mockConversations);
      setMessages(mockMessages);
      setActiveConversation(mockConversations[0]);
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    gate('send a message', () => {
      if (!newMessage.trim()) return;
      setMessages((prev) => [...prev, {
        id: prev.length + 1, senderName: 'You', senderInitials: 'ME',
        content: newMessage, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isOwn: true,
      }]);
      setNewMessage('');
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const selectConversation = (conv) => {
    setActiveConversation(conv);
    setShowList(false); // on mobile, switch to chat view
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)]">
      <AuthGate />
      {/* Conversation list */}
      <aside
        className={`flex-shrink-0 w-full sm:w-72 flex flex-col rounded-xl border overflow-hidden ${
          showList ? 'flex' : 'hidden sm:flex'
        }`}
        style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
      >
        <div className="px-4 py-3 border-b font-semibold text-sm flex-shrink-0" style={{ borderColor: theme.colors.border, color: theme.colors.text }}>
          Conversations
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv)}
              className="w-full flex items-center gap-3 px-4 py-3 border-b text-left transition-colors hover:bg-gray-50"
              style={{
                borderColor: theme.colors.border,
                backgroundColor: activeConversation?.id === conv.id ? `${theme.colors.primary}10` : 'transparent',
              }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: conv.color }}>
                {conv.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-sm font-semibold truncate" style={{ color: theme.colors.text }}>{conv.name}</span>
                  <span className="text-xs flex-shrink-0" style={{ color: theme.colors.textSecondary }}>{conv.timestamp}</span>
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: theme.colors.textSecondary }}>{conv.lastMessage}</p>
              </div>
              {conv.unreadCount > 0 && (
                <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold text-white flex items-center justify-center" style={{ backgroundColor: theme.colors.primary }}>
                  {conv.unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </aside>

      {/* Chat panel */}
      <div
        className={`flex-1 flex flex-col rounded-xl border overflow-hidden min-w-0 ${
          !showList ? 'flex' : 'hidden sm:flex'
        }`}
        style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
      >
        {activeConversation ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b flex-shrink-0" style={{ borderColor: theme.colors.border }}>
              {/* Back button on mobile */}
              <button
                onClick={() => setShowList(true)}
                className="sm:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Back to conversations"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: activeConversation.color }}>
                {activeConversation.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: theme.colors.text }}>{activeConversation.name}</p>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  {activeConversation.type === 'team' ? `${activeConversation.memberCount} members · ` : ''}
                  {activeConversation.isOnline ? '🟢 Online' : '⚫ Offline'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2 max-w-[85%] sm:max-w-[75%] ${msg.isOwn ? 'self-end flex-row-reverse' : 'self-start'}`}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 self-end" style={{ backgroundColor: theme.colors.primary }}>
                    {msg.senderInitials}
                  </div>
                  <div>
                    {!msg.isOwn && <p className="text-xs font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>{msg.senderName}</p>}
                    <div
                      className="px-3 py-2 rounded-2xl text-sm leading-relaxed"
                      style={{
                        backgroundColor: msg.isOwn ? theme.colors.primary : theme.colors.border,
                        color: msg.isOwn ? '#fff' : theme.colors.text,
                        borderBottomRightRadius: msg.isOwn ? '4px' : '16px',
                        borderBottomLeftRadius: msg.isOwn ? '16px' : '4px',
                      }}
                    >
                      {msg.content}
                    </div>
                    <p className={`text-xs mt-1 ${msg.isOwn ? 'text-right' : ''}`} style={{ color: theme.colors.textSecondary }}>{msg.timestamp}</p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3 border-t flex-shrink-0" style={{ borderColor: theme.colors.border }}>
              <input
                type="text"
                className="flex-1 min-w-0 px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
                style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={handleSend}
                className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
                style={{ backgroundColor: theme.colors.primary }}
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center" style={{ color: theme.colors.textSecondary }}>
            <p className="text-sm">Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
