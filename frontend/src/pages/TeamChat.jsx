// frontend/src/pages/TeamChat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import API, { teamAPI } from '../API/Axios';

const TeamChat = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [team, setTeam] = useState(null);
    const [members, setMembers] = useState([]);
    const [user, setUser] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(true);
    const [roomJoined, setRoomJoined] = useState(false);
    const [roomId, setRoomId] = useState(null);
    const typingTimeoutRef = useRef(null);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    // Load user from localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("UniHub-User");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
        } else {
            navigate('/user/login');
        }
    }, []);

    // Fetch team data and messages
    useEffect(() => {
        if (!user || !teamId) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                console.log("Fetching team data for team:", teamId);
                
                // Use teamAPI to fetch data
                const [teamRes, membersRes, messagesRes, chatRoomRes] = await Promise.all([
                    teamAPI.getTeamById(teamId),
                    teamAPI.getTeamMembers(teamId),
                    teamAPI.getTeamMessages(teamId),
                    teamAPI.getTeamChatRoom(teamId)
                ]);
                
                console.log("Team data:", teamRes.data);
                console.log("Members:", membersRes.data);
                console.log("Messages:", messagesRes.data);
                console.log("Chat room:", chatRoomRes.data);
                
                setTeam(teamRes.data.team);
                setMembers(membersRes.data.members || []);
                setMessages(messagesRes.data.messages || []);
                setRoomId(chatRoomRes.data.roomId);
                
                scrollToBottom();
            } catch (error) {
                console.error("Error fetching data:", error);
                console.error("Error details:", error.response?.data);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [user, teamId]);

    // Initialize Socket.IO connection
    useEffect(() => {
        if (!user || !roomId) {
            console.log("Waiting for user and roomId...", { user: !!user, roomId: !!roomId });
            return;
        }

        const token = localStorage.getItem("UniHub-Haramaya-Dev");
        console.log("Connecting to socket with roomId:", roomId);
        
        socketRef.current = io('http://localhost:5000', {
            auth: { token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        
        socketRef.current.on('connect', () => {
            console.log('✅ Socket connected successfully');
            setIsConnected(true);
            socketRef.current.emit('join-team-chat', teamId);
        });
        
        socketRef.current.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });
        
        socketRef.current.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });
        
        socketRef.current.on('room-joined', (data) => {
            console.log('Room joined response:', data);
            if (data.success) {
                setRoomJoined(true);
            }
        });
        
        socketRef.current.on('new-message', (message) => {
            console.log('New message received:', message);
            setMessages(prev => [...prev, message]);
            scrollToBottom();
        });
        
        socketRef.current.on('user-typing', ({ userId, userName, isTyping: typing }) => {
            if (typing && userId !== user?.id) {
                setTypingUsers(prev => {
                    if (!prev.some(u => u.userId === userId)) {
                        return [...prev, { userId, userName }];
                    }
                    return prev;
                });
            } else {
                setTypingUsers(prev => prev.filter(u => u.userId !== userId));
            }
        });
        
        socketRef.current.on('user-joined', (data) => {
            console.log('User joined:', data);
        });
        
        socketRef.current.on('error', (error) => {
            console.error('Socket error:', error);
        });
        
        return () => {
            if (socketRef.current) {
                socketRef.current.emit('leave-team-chat');
                socketRef.current.disconnect();
            }
        };
    }, [user, teamId, roomId]);

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        
        if (!newMessage.trim()) {
            return;
        }
        
        if (!socketRef.current || !isConnected) {
            alert('Not connected to chat server');
            return;
        }
        
        if (!roomJoined) {
            alert('Joining chat room...');
            return;
        }
        
        if (!roomId) {
            alert('Chat room not ready');
            return;
        }
        
        console.log('Sending message to room:', roomId);
        
        socketRef.current.emit('send-message', {
            roomId: roomId,
            content: newMessage.trim()
        });
        
        setNewMessage('');
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        socketRef.current.emit('typing', { roomId, isTyping: false });
        setIsTyping(false);
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        
        if (!socketRef.current || !isConnected || !roomJoined || !roomId) return;
        
        if (!isTyping) {
            setIsTyping(true);
            socketRef.current.emit('typing', { roomId, isTyping: true });
        }
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current.emit('typing', { roomId, isTyping: false });
            setIsTyping(false);
        }, 1000);
    };

    const formatTime = (timestamp) => {
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

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                    <button
                        onClick={() => navigate(`/teams/${teamId}`)}
                        className="mb-2 text-white/80 hover:text-white text-sm flex items-center gap-1"
                    >
                        ← Back to Team
                    </button>
                    <h2 className="text-xl font-bold">{team?.teamName}</h2>
                    <p className="text-sm text-white/80 mt-1">{members.length} members</p>
                    <div className="mt-2 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isConnected && roomJoined ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                        <span className="text-xs">
                            {isConnected && roomJoined ? 'Connected' : isConnected ? 'Joining...' : 'Offline'}
                        </span>
                    </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                    <h3 className="text-sm font-semibold text-gray-500 mb-3">Team Members</h3>
                    <div className="space-y-2">
                        {members.map((member) => (
                            <div key={member._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                                        {getInitials(`${member.userID?.first_name} ${member.userID?.last_name}`)}
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">
                                        {member.userID?.first_name} {member.userID?.last_name}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {member.role === 'owner' ? 'Team Owner' : member.role === 'admin' ? 'Admin' : 'Member'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="bg-white border-b border-gray-200 px-6 py-4">
                    <h3 className="font-semibold text-gray-900">Team Chat</h3>
                    <p className="text-xs text-gray-500">Real-time conversation with your team</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                    {messages.length === 0 && (
                        <div className="text-center py-12">
                            <div className="text-5xl mb-3">💬</div>
                            <p className="text-gray-500">No messages yet</p>
                            <p className="text-sm text-gray-400">Be the first to send a message!</p>
                        </div>
                    )}
                    
                    {messages.map((msg, idx) => {
                        const isOwn = msg.senderUserID === user?.id;
                        return (
                            <div key={idx} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                                    {!isOwn && (
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-semibold text-gray-700">
                                                {msg.senderName}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {formatTime(msg.created_at)}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`rounded-2xl px-4 py-2 ${
                                        isOwn 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
                                    }`}>
                                        <p className="text-sm break-words">{msg.content}</p>
                                    </div>
                                    {isOwn && (
                                        <div className="text-right mt-1">
                                            <span className="text-xs text-gray-400">
                                                {formatTime(msg.created_at)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {!isOwn && (
                                    <div className="order-1 mr-3">
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                                            {getInitials(msg.senderName)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {typingUsers.length > 0 && (
                        <div className="flex items-center gap-2 text-gray-500 ml-2">
                            <div className="flex gap-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                            <span className="text-sm">
                                {typingUsers.map(u => u.userName).join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                            </span>
                        </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                </div>
                
                <div className="bg-white border-t border-gray-200 p-4">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={handleTyping}
                            placeholder={isConnected && roomJoined ? "Type a message..." : "Connecting to chat..."}
                            disabled={!isConnected || !roomJoined}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <button
                            type="submit"
                            disabled={!newMessage.trim() || !isConnected || !roomJoined}
                            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Send
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TeamChat;