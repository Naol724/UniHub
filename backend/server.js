// backend/server.js - Complete version
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import connectDB from "./config/database.js";
import http from "http";
import { Server } from "socket.io";
import authRouter from "./routes/authRoutes.js";
import teamRouter from "./routes/teamRoutes.js";
import taskRouter from "./routes/taskRoutes.js";
import userRouter from "./routes/userRoutes.js";
import Message from "./models/message-model.js";
import Room from "./models/room-model.js";
import Participant from "./models/RoomParticipant-model.js";
import Team from "./models/team-model.js";
import User from "./models/user-model.js";
import path from 'path';
import { protect } from "./middleware/authMiddleware.js";
import { fileURLToPath } from 'url';
// import adminRouter from "./routes/adminRoutes.js";
// import adminRouter from "./routes/adminRoutes.js";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        methods: ["POST", "GET", "PUT", "DELETE"],
        origin: ["http://localhost:3000", "http://localhost:5173"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

connectDB();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/unihub/user", authRouter);
app.use("/unihub", teamRouter);
app.use("/unihub", taskRouter);
app.use("/unihub/users", userRouter);
// app.use("/unihub/admin", adminRouter);
// ============ CHAT API ENDPOINTS ============

// Get team chat room
app.get("/unihub/teams/:teamId/chat-room", async (req, res) => {
    const { teamId } = req.params;
    
    try {
        console.log("Fetching chat room for team:", teamId);
        
        const team = await Team.findById(teamId).populate("chatRoomID");
        if (!team) {
            return res.status(404).json({ success: false, error: "Team not found" });
        }
        
        if (!team.chatRoomID) {
            return res.status(404).json({ success: false, error: "Chat room not found for this team" });
        }
        
        res.json({ 
            success: true, 
            roomId: team.chatRoomID._id.toString(),
            room: team.chatRoomID
        });
    } catch (error) {
        console.error("Error fetching chat room:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get chat messages for a team
app.get("/unihub/teams/:teamId/messages", async (req, res) => {
    const { teamId } = req.params;
    const { limit = 100 } = req.query;
    
    try {
        console.log("Fetching messages for team:", teamId);
        
        // Get team's chat room
        const team = await Team.findById(teamId).populate("chatRoomID");
        if (!team) {
            return res.status(404).json({ success: false, error: "Team not found" });
        }
        
        const roomId = team.chatRoomID._id;
        
        // Get messages
        const messages = await Message.find({ roomID: roomId })
            .populate("senderUserID", "first_name last_name email")
            .sort({ created_at: -1 })
            .limit(parseInt(limit));
        
        // Format messages for frontend
        const formattedMessages = messages.reverse().map(msg => ({
            _id: msg._id,
            roomID: msg.roomID,
            senderUserID: msg.senderUserID._id,
            senderName: `${msg.senderUserID.first_name} ${msg.senderUserID.last_name}`,
            content: msg.content,
            created_at: msg.created_at
        }));
        
        res.json({ success: true, messages: formattedMessages });
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// Private messaging endpoints
app.get("/unihub/messages/private/:userId", async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.headers.userid; // Get from auth
  
  try {
    const messages = await Message.find({
      $or: [
        { senderUserID: currentUserId, receiverId: userId },
        { senderUserID: userId, receiverId: currentUserId }
      ]
    }).sort({ created_at: 1 });
    
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put("/unihub/messages/private/:userId/read", async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.headers.userid;
  
  try {
    await Message.updateMany(
      { senderUserID: userId, receiverId: currentUserId, read: false },
      { $set: { read: true } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all users endpoint
app.get("/unihub/users", async (req, res) => {
    try {
        const users = await User.find({}, "first_name last_name email _id");
        res.json({ success: true, users });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get all conversations for a user
app.get("/unihub/messages/conversations", async (req, res) => {
    const currentUserId = req.headers.userid;
    
    try {
        // Get all unique users that the current user has chatted with
        const sentMessages = await Message.find({ senderUserID: currentUserId })
            .distinct('receiverId');
        const receivedMessages = await Message.find({ receiverId: currentUserId })
            .distinct('senderUserID');
        
        const allUserIds = [...new Set([...sentMessages, ...receivedMessages])];
        
        const conversations = [];
        
        for (const userId of allUserIds) {
            const otherUser = await User.findById(userId, 'first_name last_name email');
            if (otherUser) {
                // Get last message
                const lastMessage = await Message.findOne({
                    $or: [
                        { senderUserID: currentUserId, receiverId: userId },
                        { senderUserID: userId, receiverId: currentUserId }
                    ]
                }).sort({ created_at: -1 });
                
                // Get unread count
                const unreadCount = await Message.countDocuments({
                    senderUserID: userId,
                    receiverId: currentUserId,
                    read: false
                });
                
                conversations.push({
                    id: otherUser._id,
                    name: `${otherUser.first_name} ${otherUser.last_name}`,
                    email: otherUser.email,
                    lastMessage: lastMessage?.content || "No messages yet",
                    lastMessageTime: lastMessage?.created_at,
                    unread: unreadCount,
                    avatar: `${otherUser.first_name?.[0]}${otherUser.last_name?.[0]}`
                });
            }
        }
        
        // Sort by last message time
        conversations.sort((a, b) => {
            if (!a.lastMessageTime) return 1;
            if (!b.lastMessageTime) return -1;
            return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
        });
        
        res.json({ success: true, conversations });
    } catch (error) {
        console.error("Error fetching conversations:", error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// ============ SOCKET.IO ============

// Socket.IO authentication
io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (token) {
        try {
            const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_KEY_SECRET);
            const user = await User.findById(decoded.id).select("-passwordHash");
            
            if (user && user.isActive) {
                socket.userId = user._id;
                socket.userName = `${user.first_name} ${user.last_name}`;
                socket.userRole = user.role || "user";
                next();
            } else {
                next(new Error('User not found or inactive'));
            }
        } catch (err) {
            next(new Error('Authentication error'));
        }
    } else {
        next(new Error('No token provided'));
    }
});

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.userName} (${socket.id})`);
    
    // Join a team chat room
    socket.on("join-team-chat", async (teamId) => {
        try {
            console.log(`📝 ${socket.userName} joining team ${teamId} chat`);
            
            // Get team's chat room
            const team = await Team.findById(teamId).populate("chatRoomID");
            if (!team) {
                socket.emit("error", { message: "Team not found" });
                return;
            }
            
            const roomId = team.chatRoomID._id.toString();
            console.log(`Room ID: ${roomId}`);
            
            // Check if user is a member of the team
            const participant = await Participant.findOne({ 
                UserID: socket.userId, 
                roomID: roomId 
            });
            
            if (!participant) {
                // Add user as participant if not already
                const newParticipant = new Participant({
                    UserID: socket.userId,
                    roomID: roomId,
                    joinedAt: new Date()
                });
                await newParticipant.save();
                console.log(`Added ${socket.userName} as participant to room ${roomId}`);
            }
            
            // Join the socket room
            socket.join(roomId);
            socket.currentRoomId = roomId;
            
            console.log(`✅ ${socket.userName} joined room: ${roomId}`);
            socket.emit("room-joined", { success: true, roomId });
            
            // Notify others in the room
            socket.to(roomId).emit("user-joined", {
                userId: socket.userId,
                userName: socket.userName,
                message: `${socket.userName} joined the chat`
            });
            
        } catch (error) {
            console.error("Error joining team chat:", error);
            socket.emit("error", { message: error.message });
        }
    });
    
    // Send message
    socket.on("send-message", async (data) => {
        try {
            const { roomId, content } = data;
            console.log(`📨 Message from ${socket.userName} in room ${roomId}: ${content.substring(0, 50)}`);
            
            // Save message to database
            const newMessage = new Message({
                roomID: roomId,
                senderUserID: socket.userId,
                content: content,
                created_at: new Date()
            });
            await newMessage.save();
            
            // Get sender details
            const sender = await User.findById(socket.userId);
            
            // Prepare message data
            const messageData = {
                _id: newMessage._id,
                roomID: roomId,
                senderUserID: socket.userId,
                senderName: `${sender.first_name} ${sender.last_name}`,
                content: content,
                created_at: newMessage.created_at
            };
            
            // Broadcast to all users in the room (including sender)
            io.to(roomId).emit("new-message", messageData);
            console.log(`✅ Message broadcasted to room ${roomId}`);
            
        } catch (error) {
            console.error("Error sending message:", error);
            socket.emit("message-error", { error: error.message });
        }
    });
    
    // Typing indicator
    socket.on("typing", ({ roomId, isTyping }) => {
        socket.to(roomId).emit("user-typing", {
            userId: socket.userId,
            userName: socket.userName,
            isTyping
        });
    });
    
    // Leave team chat
    socket.on("leave-team-chat", async () => {
        if (socket.currentRoomId) {
            socket.leave(socket.currentRoomId);
            socket.to(socket.currentRoomId).emit("user-left", {
                userId: socket.userId,
                userName: socket.userName,
                message: `${socket.userName} left the chat`
            });
            console.log(`${socket.userName} left room: ${socket.currentRoomId}`);
            socket.currentRoomId = null;
        }
    });
    // Private messaging
socket.on("join-private-room", ({ userId, otherUserId }) => {
  const roomId = [userId, otherUserId].sort().join('-');
  socket.join(roomId);
  console.log(`${socket.userName} joined private room: ${roomId}`);
});

socket.on("send-private-message", async ({ receiverId, content, tempId }) => {
    const roomId = [socket.userId, receiverId].sort().join('-');
    
    const newMessage = new Message({
        senderUserID: socket.userId,
        receiverId: receiverId,
        content: content,
        created_at: new Date()
    });
    await newMessage.save();
    
    const messageData = {
        id: newMessage._id,
        senderId: socket.userId,
        receiverId: receiverId,
        content: content,
        created_at: newMessage.created_at,
        senderName: socket.userName
    };
    
    // Send to receiver only (not back to sender to avoid duplicate)
    socket.to(roomId).emit("new-private-message", messageData);
    
    // Optionally send confirmation to sender
    socket.emit("message-sent", { tempId, message: messageData });
});

socket.on("typing-private", ({ receiverId, isTyping }) => {
    const roomId = [socket.userId, receiverId].sort().join('-');
    console.log(`Typing: ${socket.userName} is ${isTyping ? 'typing' : 'stopped typing'} to ${receiverId}`);
    
    // Send to the receiver only
    socket.to(roomId).emit("user-typing-private", { 
        userId: socket.userId,
        userName: socket.userName,
        isTyping 
    });
});
    socket.on("disconnect", () => {
        console.log(`❌ User disconnected: ${socket.userName}`);
        if (socket.currentRoomId) {
            socket.to(socket.currentRoomId).emit("user-left", {
                userId: socket.userId,
                userName: socket.userName,
                message: `${socket.userName} disconnected`
            });
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n✅ Server running on http://localhost:${PORT}`);
    console.log(`✅ Socket.IO ready for connections`);
    console.log(`\n📡 Chat endpoints:`);
    console.log(`   GET /unihub/teams/:teamId/chat-room`);
    console.log(`   GET /unihub/teams/:teamId/messages`);
});