import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory before any other local imports resolve config
dotenv.config({ path: path.join(__dirname, '.env') });

/**
 * Convert mongodb+srv:// URIs to a standard mongodb:// multi-host URI using
 * public DNS. Fixes querySrv ECONNREFUSED on networks whose local resolver
 * blocks or breaks SRV lookups (common on Windows / campus Wi‑Fi).
 */
async function resolveSrvMongoUri(uri) {
  if (!uri || !uri.startsWith('mongodb+srv://')) return uri;

  const withoutProtocol = uri.slice('mongodb+srv://'.length);
  const at = withoutProtocol.lastIndexOf('@');
  if (at < 0) return uri;

  const credentials = withoutProtocol.slice(0, at);
  const hostAndRest = withoutProtocol.slice(at + 1);
  const slash = hostAndRest.indexOf('/');
  const qMark = hostAndRest.indexOf('?');
  let hostname;
  let pathname = '/';
  let search = '';

  if (slash >= 0) {
    hostname = hostAndRest.slice(0, slash);
    const afterSlash = hostAndRest.slice(slash);
    const qi = afterSlash.indexOf('?');
    if (qi >= 0) {
      pathname = afterSlash.slice(0, qi) || '/';
      search = afterSlash.slice(qi + 1);
    } else {
      pathname = afterSlash || '/';
    }
  } else if (qMark >= 0) {
    hostname = hostAndRest.slice(0, qMark);
    search = hostAndRest.slice(qMark + 1);
  } else {
    hostname = hostAndRest;
  }

  hostname = hostname.split(':')[0];

  const resolver = new dns.Resolver();
  resolver.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
  const resolveSrv = promisify(resolver.resolveSrv.bind(resolver));
  const resolveTxt = promisify(resolver.resolveTxt.bind(resolver));

  const [srvRecords, txtRecords] = await Promise.all([
    resolveSrv(`_mongodb._tcp.${hostname}`),
    resolveTxt(hostname).catch(() => []),
  ]);

  if (!srvRecords?.length) {
    throw new Error(`No SRV records found for ${hostname}`);
  }

  const hosts = srvRecords
    .map((r) => `${r.name.replace(/\.$/, '')}:${r.port || 27017}`)
    .join(',');

  const txtParams = (txtRecords || [])
    .map((chunks) => (Array.isArray(chunks) ? chunks.join('') : String(chunks)))
    .join('&');

  const params = new URLSearchParams(search);
  const txtSearch = new URLSearchParams(txtParams);
  for (const [k, v] of txtSearch.entries()) {
    if (!params.has(k)) params.set(k, v);
  }
  if (!params.has('ssl') && !params.has('tls')) params.set('tls', 'true');

  const dbPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  const query = params.toString();
  const resolved = `mongodb://${credentials}@${hosts}${dbPath}${query ? `?${query}` : ''}`;
  console.log('🔁 Resolved mongodb+srv via public DNS (bypassing local SRV failure)');
  return resolved;
}

// Debug environment loading
console.log('🔧 Environment Loading Debug:', {
  NODE_ENV: process.env.NODE_ENV,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
  MONGODB_URI: process.env.MONGODB_URI ? '✅ Set' : '❌ Missing',
  FRONTEND_URL: process.env.FRONTEND_URL || '(default)',
  GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL || '(default)'
});

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import errorHandler from "./middleware/error.middleware.js";
import { currentConfig } from "./config/environment.js";

const app = express();
const PORT = currentConfig.PORT || process.env.PORT || 5000;

// Enhanced CORS configuration for both local and production
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      // Local development (Vite may fall back to 3001 if 3000 is busy)
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
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

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    success: true,
    mongodb: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
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

// Create HTTP server for Socket.io
const server = createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
      'https://uni-hub-theta.vercel.app',
      /\.onrender\.com$/,
      /\.vercel\.app$/
    ].filter(Boolean),
    credentials: true
  }
});

// Initialize chat socket
initializeChatSocket(io);

const connectWithRetry = async (attempt = 1) => {
  const maxAttempts = 3;
  try {
    const uri = await resolveSrvMongoUri(mongoUri);
    // Node on some Windows/antivirus setups fails Atlas TLS with
    // UNABLE_TO_VERIFY_LEAF_SIGNATURE. Prefer system CAs via npm scripts
    // (--use-system-ca); allow invalid certs only in local development.
    const isDev = (process.env.NODE_ENV || 'development') !== 'production';
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      family: 4,
      retryWrites: true,
      w: 'majority',
      ...(isDev ? { tlsAllowInvalidCertificates: true } : {}),
    });
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    server.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
  } catch (err) {
    console.error(`❌ MongoDB Connection Error (attempt ${attempt}/${maxAttempts}):`, err.message);
    console.error('🔍 Error Code:', err.code);
    console.error('🔍 Error Name:', err.name);
    if (err.reason) console.error('🔍 Reason:', err.reason);

    if (attempt < maxAttempts) {
      const waitMs = attempt * 2000;
      console.log(`⏳ Retrying MongoDB connection in ${waitMs}ms...`);
      await new Promise((r) => setTimeout(r, waitMs));
      return connectWithRetry(attempt + 1);
    }

    // Still listen in development so OAuth/API return clear errors instead of
    // "localhost refused to connect" when Atlas IP allowlisting is pending.
    console.error('⚠️  Starting API without MongoDB — Google sign-in and data APIs will fail until Atlas is reachable.');
    if (!server.listening) {
      server.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT} (DB disconnected)`));
    }
  }
};

connectWithRetry();
