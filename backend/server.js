import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from 'url';
import errorHandler from "./middleware/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'https://unihub-frontend.onrender.com', // Add your Render frontend URL
      /\.onrender\.com$/ // Allow all Render domains
    ].filter(Boolean);
    
    // Allow requests with no origin (mobile apps, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin matches any allowed pattern
    const isAllowed = allowed.some(allowedOrigin => {
      if (typeof allowedOrigin === 'string') {
        return allowedOrigin === origin;
      }
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return false;
    });
    
    if (isAllowed) return callback(null, true);
    console.log('CORS blocked origin:', origin);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.json({ 
    success: true, 
    message: "UniHub Backend Server is Running Successfully!",
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    env_uri_set: !!process.env.MONGODB_URI
  });
});

import passport from "passport";
import { createServer } from "http";
import { Server } from "socket.io";
import googleAuthRoutes, { initPassport } from "./routes/googleAuthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import teamRoutes from "./routes/teamRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import resourceRoutes from "./routes/resourceRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import houseRoutes from "./routes/houseRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import { initializeChatSocket } from "./socket/chatSocket.js";

initPassport(app);

app.use("/api/auth",          authRoutes);
app.use("/api/teams",         teamRoutes);
app.use("/api/tasks",         taskRoutes);
app.use("/api/resources",     resourceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/google",        googleAuthRoutes);
app.use("/api/houses",        houseRoutes);
app.use("/api/admin",         adminRoutes);
app.use("/api/chat",          chatRoutes);
app.use("/api/settings",      settingsRoutes);

app.use(errorHandler);

// Add MongoDB connection debugging
console.log('🔍 Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI (masked):', process.env.MONGODB_URI?.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@'));

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGODB_URI environment variable is not set');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  w: 'majority'
})
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.error("🔍 Error Code:", err.code);
    console.error("🔍 Error Name:", err.name);
    if (err.reason) {
      console.error("🔍 Reason:", err.reason);
    }
    // Don't exit in production, let the app run without DB for debugging
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// Create HTTP server for Socket.io
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'https://unihub-frontend.onrender.com',
      /\.onrender\.com$/
    ].filter(Boolean),
    credentials: true
  }
});

// Initialize chat socket
initializeChatSocket(io);

server.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
