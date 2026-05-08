import dotenv from 'dotenv';

// Load environment variables at the very top
dotenv.config({ path: './.env', debug: true });

// Debug environment loading
console.log('🔧 Environment Loading Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
  MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing'
});
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

// Enhanced CORS configuration for both local and production
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      // Local development
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      // Production
      'https://uni-hub-theta.vercel.app',
      'https://unihub-w6ma.onrender.com',
      // Environment-based
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    // Check if origin matches any allowed origin
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow all Render domains in production
    if (origin && (origin.includes('.onrender.com') || origin.includes('.vercel.app'))) {
      return callback(null, true);
    }
    
    console.log('🚫 CORS blocked origin:', origin);
    console.log('✅ Allowed origins:', allowedOrigins);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count']
};

app.use(cors(corsOptions));
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
