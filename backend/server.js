require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const errorHandler = require("./middleware/error.middleware");

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

const passport = require("passport");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const { initPassport } = require("./routes/googleAuthRoutes");

const authRoutes         = require("./routes/authRoutes");
const teamRoutes         = require("./routes/teamRoutes");
const taskRoutes         = require("./routes/taskRoutes");
const resourceRoutes     = require("./routes/resourceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const userRoutes         = require("./routes/userRoutes");

initPassport(app);

app.use("/api/auth",          authRoutes);
app.use("/api/teams",         teamRoutes);
app.use("/api/tasks",         taskRoutes);
app.use("/api/resources",     resourceRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users",         userRoutes);
app.use("/api/google",        googleAuthRoutes);

app.use(errorHandler);

// Add MongoDB connection debugging
console.log('🔍 Environment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI set:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI (masked):', process.env.MONGODB_URI?.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@'));

mongoose.connect(process.env.MONGODB_URI, {
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

app.listen(PORT, () => console.log(`🚀 Server is running on port ${PORT}`));
