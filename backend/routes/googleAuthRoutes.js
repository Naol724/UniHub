import express from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user-model.js";
import { isDevelopment, isProduction, currentConfig } from "../config/environment.js";

// Load environment variables
dotenv.config();

const router = express.Router();

const JWT_SECRET = currentConfig.JWT_SECRET;
const FRONTEND_URL = currentConfig.FRONTEND_URL;
const GOOGLE_CALLBACK_URL = currentConfig.GOOGLE_CALLBACK_URL;

let passportInitialized = false;

const initPassport = (app) => {
  // Debug: Log environment variables
  console.log("🔍 Google OAuth Environment Check:");
  console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing");
  console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing");
  console.log("GOOGLE_CALLBACK_URL:", process.env.GOOGLE_CALLBACK_URL);
  console.log("Environment:", process.env.NODE_ENV || "development");

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log("⚠️  Google OAuth skipped - GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set");
    console.log("📝 Please add these variables to your .env file:");
    console.log("   GOOGLE_CLIENT_ID=your-google-client-id");
    console.log("   GOOGLE_CLIENT_SECRET=your-google-client-secret");
    return;
  }

  if (passportInitialized) {
    console.log("✅ Google OAuth already initialized");
    return;
  }

  passport.use(new GoogleStrategy({
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL || GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔍 Google Profile:", profile.displayName, profile.emails[0]?.value);
        
        const email = profile.emails[0].value;
        if (!email) {
          return done(new Error("Email is required from Google profile"), null);
        }

        let user = await User.findOne({ email });
        if (!user) {
          console.log("👤 Creating new user from Google OAuth:", email);
          user = await User.create({
            firstName:    profile.name.givenName || "Google",
            lastName:     profile.name.familyName || "User",
            first_name:   profile.name.givenName || "Google",
            last_name:    profile.name.familyName || "User",
            email,
            google_id:    profile.id,
            imageURL:     profile.photos[0]?.value || "",
            password:     "google-oauth",
            passwordHash: "google-oauth",
            role:         "user",
            isActive:     true
          });
          console.log("✅ New user created successfully");
        } else {
          console.log("👤 Existing user found:", email);
          // Update Google ID if not present
          if (!user.google_id) {
            user.google_id = profile.id;
            await user.save();
          }
        }
        return done(null, user);
      } catch (err) {
        console.error("❌ Google OAuth Error:", err);
        return done(err, null);
      }
    }
  ));

  passport.serializeUser((user, done) => done(null, user._id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });

  app.use(passport.initialize());
  passportInitialized = true;
  console.log("✅ Google OAuth initialized");
};

// Step 1 - redirect to Google
router.get("/", (req, res) => {
  console.log("🔗 Google OAuth Init - Redirecting to Google");
  
  if (!passportInitialized) {
    console.log("❌ Google OAuth not configured - passport not initialized");
    return res.status(503).json({ 
      success: false, 
      message: "Google OAuth not configured",
      debug: {
        GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET,
        passportInitialized: passportInitialized
      }
    });
  }
  
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent"
  })(req, res);
});

// Step 2 - Google redirects back here
router.get("/callback", (req, res, next) => {
  console.log("🔗 Google OAuth Callback - Processing response");
  
  // Prevent caching of this route
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store'
  });
  
  if (!passportInitialized) {
    console.log("❌ Google OAuth not configured in callback");
    return res.redirect(`${FRONTEND_URL}/user/login?error=google_not_configured`);
  }
  
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/user/login?error=google_failed`,
    session: false
  }, (err, user) => {
    if (err) {
      console.error("❌ Google OAuth Callback Error:", err);
      return res.redirect(`${FRONTEND_URL}/user/login?error=google_callback_error`);
    }
    
    if (!user) {
      console.error("❌ Google OAuth - No user returned");
      return res.redirect(`${FRONTEND_URL}/user/login?error=google_no_user`);
    }
    
    console.log("✅ Google OAuth Success - User:", user.email);
    
    // Generate JWT token
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    
    // Format user object for frontend
    const userObj = {
      id:        user._id,
      firstName: user.firstName || user.first_name,
      lastName:  user.lastName  || user.last_name,
      email:     user.email,
      imageURL:  user.imageURL || "",
      role:      user.role,
      department: user.department || ""
    };
    
    // Redirect to frontend with token and user data
    const params = new URLSearchParams({ 
      token: `Bearer ${token}`, 
      user: JSON.stringify(userObj) 
    });
    
    console.log("🔄 Redirecting to frontend with token");
    res.redirect(`${FRONTEND_URL}/auth/google/success?${params}`);
  })(req, res, next);
});

export { initPassport };
export default router;
