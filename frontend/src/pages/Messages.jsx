// frontend/src/pages/Messages.jsx
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import API from '../API/Axios';

const MessagesPage = () => {
    const [selectedUser, setSelectedUser] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [user, setUser] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [isUserTyping, setIsUserTyping] = useState(false);
    const [typingUserName, setTypingUserName] = useState('');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const pendingMessagesRef = useRef(new Set());

    // Load current user
    useEffect(() => {
        const storedUser = localStorage.getItem("UniHub-User");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        }
    }, []);

    // Fetch all users
    useEffect(() => {
        if (!user) return;

        const fetchUsers = async () => {
            try {
                const response = await API.get("/users");
                const users = response.data.users || [];
                const otherUsers = users.filter(u => u._id !== user.id);
                setAllUsers(otherUsers);
                await fetchConversations();
                setLoading(false);
            } catch (error) {
                console.error("Error fetching users:", error);
                setLoading(false);
            }
        };
        
        fetchUsers();
    }, [user]);

    const fetchConversations = async () => {
        try {
            const response = await API.get("/messages/conversations", {
                headers: { userid: user?.id }
            });
            if (response.data.success) {
                setConversations(response.data.conversations || []);
            }
        } catch (error) {
            console.error("Error fetching conversations:", error);
        }
    };

    // Initialize Socket.IO
    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem("UniHub-Haramaya-Dev");
        
        socketRef.current = io('http://localhost:5000', {
            auth: { token },
            transports: ['websocket', 'polling']
        });

        socketRef.current.on('connect', () => {
            console.log('Socket connected');
            setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        // Handle incoming private messages from others
        socketRef.current.on('new-private-message', (message) => {
            console.log('New private message received:', message);
            
            if (message.senderId === user.id) {
                console.log('Skipping own message');
                return;
            }
            
            const isForCurrentConversation = selectedUser?.id === message.senderId;
            
            if (isForCurrentConversation) {
                setMessages(prev => {
                    const exists = prev.some(m => m.id === message.id);
                    if (exists) return prev;
                    return [...prev, {
                        id: message.id,
                        senderUserID: message.senderId,
                        receiverId: message.receiverId,
                        content: message.content,
                        created_at: message.created_at,
                        isMe: false
                    }];
                });
                scrollToBottom();
            }
            
            const otherUserId = message.senderId;
            const otherUserName = message.senderName;
            
            setConversations(prev => {
                const existing = prev.find(c => c.id === otherUserId);
                if (existing) {
                    return prev.map(c => 
                        c.id === otherUserId 
                            ? { 
                                ...c, 
                                lastMessage: message.content, 
                                lastMessageTime: message.created_at,
                                unread: isForCurrentConversation ? c.unread : c.unread + 1
                              }
                            : c
                    );
                } else {
                    const newConv = {
                        id: otherUserId,
                        name: otherUserName,
                        lastMessage: message.content,
                        lastMessageTime: message.created_at,
                        unread: isForCurrentConversation ? 0 : 1,
                        avatar: otherUserName?.split(' ').map(n => n[0]).join('') || '??'
                    };
                    return [newConv, ...prev];
                }
            });
        });

        // Handle typing indicator from other users
        socketRef.current.on('user-typing-private', ({ userId, userName, isTyping }) => {
            console.log('📝 Typing event received:', { userId, userName, isTyping, selectedUserId: selectedUser?.id });
            
            // Only show typing indicator for the currently selected user
            if (selectedUser?.id === userId) {
                setIsUserTyping(isTyping);
                if (isTyping) {
                    setTypingUserName(userName);
                } else {
                    setTypingUserName('');
                }
            }
        });

        socketRef.current.on('message-sent', ({ tempId, message }) => {
            console.log('Message confirmed:', tempId);
            pendingMessagesRef.current.delete(tempId);
            
            setMessages(prev => prev.map(m => 
                m.tempId === tempId 
                    ? {
                        id: message.id,
                        senderUserID: message.senderId,
                        receiverId: message.receiverId,
                        content: message.content,
                        created_at: message.created_at,
                        isMe: true
                      }
                    : m
            ));
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [user, selectedUser]);

    // Fetch messages when a user is selected
    useEffect(() => {
        if (!selectedUser || !user) return;
        
        const fetchMessages = async () => {
            try {
                const response = await API.get(`/messages/private/${selectedUser.id}`, {
                    headers: { userid: user.id }
                });
                
                const formattedMessages = response.data.messages.map(msg => ({
                    ...msg,
                    isMe: msg.senderUserID === user.id
                }));
                setMessages(formattedMessages);
                scrollToBottom();
                
                await API.put(`/messages/private/${selectedUser.id}/read`, {}, {
                    headers: { userid: user.id }
                });
                
                setConversations(prev => prev.map(c => 
                    c.id === selectedUser.id ? { ...c, unread: 0 } : c
                ));
                
                if (socketRef.current && isConnected) {
                    socketRef.current.emit('join-private-room', {
                        userId: user.id,
                        otherUserId: selectedUser.id
                    });
                }
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
        
        fetchMessages();
        
        // Reset typing indicator when changing conversations
        setIsUserTyping(false);
        setTypingUserName('');
    }, [selectedUser, user, isConnected]);

    const handleSelectUser = (selected) => {
        if (selectedUser?.id === selected.id) return;
        setSelectedUser(selected);
        setIsUserTyping(false);
        setTypingUserName('');
        setMessages([]);
    };

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !selectedUser || !isConnected) return;
        
        const content = messageInput.trim();
        const tempId = Date.now().toString();
        
        const tempMessage = {
            tempId: tempId,
            id: tempId,
            senderUserID: user.id,
            receiverId: selectedUser.id,
            content: content,
            created_at: new Date().toISOString(),
            isMe: true,
            isTemp: true
        };
        
        pendingMessagesRef.current.add(tempId);
        setMessages(prev => [...prev, tempMessage]);
        setMessageInput('');
        scrollToBottom();
        
        setConversations(prev => {
            const existing = prev.find(c => c.id === selectedUser.id);
            if (existing) {
                return prev.map(c => 
                    c.id === selectedUser.id 
                        ? { ...c, lastMessage: content, lastMessageTime: new Date().toISOString() }
                        : c
                );
            } else {
                const newConv = {
                    id: selectedUser.id,
                    name: selectedUser.name,
                    lastMessage: content,
                    lastMessageTime: new Date().toISOString(),
                    unread: 0,
                    avatar: selectedUser.avatar
                };
                return [newConv, ...prev];
            }
        });
        
        try {
            socketRef.current.emit('send-private-message', {
                receiverId: selectedUser.id,
                content: content,
                tempId: tempId
            });
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => prev.filter(m => m.tempId !== tempId));
            pendingMessagesRef.current.delete(tempId);
            alert("Failed to send message");
        }
        
        // Stop typing indicator after sending
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        socketRef.current.emit('typing-private', { 
            receiverId: selectedUser.id, 
            isTyping: false 
        });
    };

    const handleTyping = (e) => {
        const value = e.target.value;
        setMessageInput(value);
        
        if (!socketRef.current || !selectedUser) return;
        
        // Send typing indicator when user starts typing
        if (value.trim().length > 0) {
            console.log('📝 Sending typing start to:', selectedUser.name);
            socketRef.current.emit('typing-private', { 
                receiverId: selectedUser.id, 
                isTyping: true 
            });
        } else {
            console.log('📝 Sending typing stop to:', selectedUser.name);
            socketRef.current.emit('typing-private', { 
                receiverId: selectedUser.id, 
                isTyping: false 
            });
        }
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Set timeout to stop typing indicator after 2 seconds of no typing
        typingTimeoutRef.current = setTimeout(() => {
            if (socketRef.current && selectedUser && value.trim().length === 0) {
                console.log('📝 Timeout: Sending typing stop to:', selectedUser.name);
                socketRef.current.emit('typing-private', { 
                    receiverId: selectedUser.id, 
                    isTyping: false 
                });
            }
        }, 2000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
        if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString();
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const filteredUsers = allUsers.filter(u =>
        u.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const userList = filteredUsers.map(u => {
        const conversation = conversations.find(c => c.id === u._id);
        return {
            id: u._id,
            name: `${u.first_name} ${u.last_name}`,
            email: u.email,
            lastMessage: conversation?.lastMessage || "Start a conversation",
            lastMessageTime: conversation?.lastMessageTime,
            unread: conversation?.unread || 0,
            avatar: `${u.first_name?.[0]}${u.last_name?.[0]}`,
        };
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-120px)] lg:h-[calc(100vh-100px)]">
            <div className="mb-4 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Messages</h1>
                <p className="text-sm md:text-base text-gray-500 mt-1">Direct messages with team members</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full flex flex-col lg:flex-row">
                
                {/* Users List */}
                <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-200 flex flex-col">
                    <div className="p-3 md:p-4 border-b border-gray-200">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search users..."
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {userList.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No users found</div>
                        ) : (
                            userList.map((conv) => (
                                <div
                                    key={conv.id}
                                    onClick={() => handleSelectUser(conv)}
                                    className={`flex items-center gap-3 p-3 md:p-4 cursor-pointer transition-all hover:bg-gray-50 ${
                                        selectedUser?.id === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                    }`}
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-base shadow-sm">
                                            {conv.avatar}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{conv.name}</h3>
                                            <span className="text-xs text-gray-400 flex-shrink-0">{formatTime(conv.lastMessageTime)}</span>
                                        </div>
                                        <p className="text-xs md:text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                                        {conv.unread > 0 && (
                                            <span className="inline-block mt-1 bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                                                {conv.unread}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {selectedUser ? (
                        <>
                            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-sm">
                                            {selectedUser.avatar}
                                        </div>
                                        <div>
                                            <h2 className="font-semibold text-gray-900">{selectedUser.name}</h2>
                                            <p className="text-xs text-gray-500">
                                                {isUserTyping ? (
                                                    <span className="text-blue-500 animate-pulse flex items-center gap-1">
                                                        <span>{typingUserName} is typing</span>
                                                        <span className="flex gap-0.5">
                                                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                            <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span>{isConnected ? 'Online' : 'Offline'}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                                {messages.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-5xl mb-3">💬</div>
                                        <p className="text-gray-500">No messages yet</p>
                                        <p className="text-sm text-gray-400">Send a message to start the conversation!</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => (
                                        <div key={msg.tempId || msg.id || idx} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                            {!msg.isMe && (
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
                                                    <span className="text-white text-xs font-semibold">{selectedUser.avatar}</span>
                                                </div>
                                            )}
                                            <div className={`max-w-[85%] md:max-w-[70%] ${msg.isMe ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'} rounded-2xl px-4 py-2 shadow-sm`}>
                                                <p className="text-sm md:text-base break-words">{msg.content}</p>
                                                <p className={`text-xs mt-1 ${msg.isMe ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                                                    {formatTime(msg.created_at)}
                                                    {msg.isTemp && <span className="ml-1 italic">Sending...</span>}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="p-3 md:p-4 border-t border-gray-200 bg-white">
                                <div className="flex items-center gap-2 md:gap-3">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={handleTyping}
                                        onKeyPress={handleKeyPress}
                                        placeholder={`Message ${selectedUser.name}...`}
                                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={!messageInput.trim()}
                                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md disabled:opacity-50"
                                    >
                                        Send
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No conversation selected</h3>
                                <p className="text-sm text-gray-500">Select a user from the list to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;