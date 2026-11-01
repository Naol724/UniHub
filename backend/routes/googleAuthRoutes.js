import express from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user-model.js";
import { currentConfig } from "../config/environment.js";

const router = express.Router();

let passportInitialized = false;

const getFrontendUrl = () => currentConfig.FRONTEND_URL;
const getJwtSecret = () => currentConfig.JWT_SECRET;
const getCallbackUrl = () => currentConfig.GOOGLE_CALLBACK_URL;

const DEFAULT_DEV_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "http://127.0.0.1:5173",
];

const isAllowedFrontendOrigin = (origin) => {
  if (!origin || typeof origin !== "string") return false;
  try {
    const url = new URL(origin);
    const normalized = `${url.protocol}//${url.host}`;
    const allowed = new Set(
      [
        getFrontendUrl(),
        process.env.FRONTEND_URL,
        ...DEFAULT_DEV_ORIGINS,
      ]
        .filter(Boolean)
        .map((o) => {
          try {
            const u = new URL(o);
            return `${u.protocol}//${u.host}`;
          } catch {
            return null;
          }
        })
        .filter(Boolean)
    );

    if (allowed.has(normalized)) return true;
    // Allow deployed Vercel preview/prod hosts if configured base is vercel
    if (/\.vercel\.app$/i.test(url.hostname)) return true;
    return false;
  } catch {
    return false;
  }
};

const encodeOAuthState = (payload) =>
  Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");

const decodeOAuthState = (state) => {
  if (!state || typeof state !== "string") return {};
  try {
    return JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
  } catch {
    try {
      return JSON.parse(Buffer.from(state, "base64").toString("utf8"));
    } catch {
      return {};
    }
  }
};

const resolveFrontendRedirectBase = (req) => {
  const fromState = decodeOAuthState(req.query.state).returnTo;
  if (isAllowedFrontendOrigin(fromState)) {
    return fromState.replace(/\/$/, "");
  }
  return getFrontendUrl().replace(/\/$/, "");
};

const initPassport = (app) => {
  console.log("🔍 Google OAuth Environment Check:");
  console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing");
  console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing");
  console.log("GOOGLE_CALLBACK_URL:", getCallbackUrl());
  console.log("FRONTEND_URL:", getFrontendUrl());
  console.log("Environment:", process.env.NODE_ENV || "development");

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log("⚠️  Google OAuth skipped - GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set");
    console.log("📝 Please add these variables to your .env file:");
    console.log("   GOOGLE_CLIENT_ID=your-google-client-id");
    console.log("   GOOGLE_CLIENT_SECRET=your-google-client-secret");
    return;
  }

  if (!getJwtSecret()) {
    console.log("⚠️  Google OAuth skipped - JWT_SECRET not set");
    return;
  }

  if (passportInitialized) {
    console.log("✅ Google OAuth already initialized");
    return;
  }

  passport.use(new GoogleStrategy({
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  getCallbackUrl(),
      passReqToCallback: false,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🔍 Google Profile:", profile.displayName, profile.emails?.[0]?.value);

        const email = profile.emails?.[0]?.value;
        if (!email) {
          return done(new Error("Email is required from Google profile"), null);
        }

        let user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
          console.log("👤 Creating new user from Google OAuth:", email);
          user = await User.create({
            firstName:    profile.name?.givenName || "Google",
            lastName:     profile.name?.familyName || "User",
            first_name:   profile.name?.givenName || "Google",
            last_name:    profile.name?.familyName || "User",
            email:        email.toLowerCase().trim(),
            google_id:    profile.id,
            imageURL:     profile.photos?.[0]?.value || "",
            // Placeholder — Google users authenticate via OAuth, not password
            password:     "google-oauth",
            passwordHash: "google-oauth",
            role:         "user",
            isActive:     true
          });
          console.log("✅ New user created successfully");
        } else {
          console.log("👤 Existing user found:", email);
          if (!user.google_id) {
            user.google_id = profile.id;
            if (profile.photos?.[0]?.value && !user.imageURL) {
              user.imageURL = profile.photos[0].value;
            }
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

  const requestedReturnTo = req.query.returnTo;
  const returnTo = isAllowedFrontendOrigin(requestedReturnTo)
    ? String(requestedReturnTo).replace(/\/$/, "")
    : getFrontendUrl().replace(/\/$/, "");

  if (!passportInitialized) {
    console.log("❌ Google OAuth not configured - passport not initialized");
    return res.redirect(`${returnTo}/user/login?error=google_not_configured`);
  }

  if (mongoose.connection.readyState !== 1) {
    console.log("❌ Google OAuth blocked - MongoDB is not connected");
    return res.redirect(`${returnTo}/user/login?error=google_db_unavailable`);
  }

  console.log("↩️  OAuth returnTo:", returnTo);

  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "select_account",
    state: encodeOAuthState({ returnTo }),
  })(req, res);
});

// Step 2 - Google redirects back here
router.get("/callback", (req, res, next) => {
  console.log("🔗 Google OAuth Callback - Processing response");

  const FRONTEND_URL = resolveFrontendRedirectBase(req);

  res.set({
    "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    Pragma: "no-cache",
    Expires: "0",
    "Surrogate-Control": "no-store",
  });

  if (!passportInitialized) {
    console.log("❌ Google OAuth not configured in callback");
    return res.redirect(`${FRONTEND_URL}/user/login?error=google_not_configured`);
  }

  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/user/login?error=google_failed`,
    session: false,
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

    const token = jwt.sign(
      { id: user._id, email: user.email },
      getJwtSecret(),
      { expiresIn: process.env.JWT_EXPIRE || "7d" }
    );

    const userObj = {
      id:        user._id,
      firstName: user.firstName || user.first_name,
      lastName:  user.lastName  || user.last_name,
      email:     user.email,
      imageURL:  user.imageURL || "",
      role:      user.role,
      department: user.department || ""
    };

    const params = new URLSearchParams({
      token,
      user: JSON.stringify(userObj)
    });

    console.log("🔄 Redirecting to frontend with token:", FRONTEND_URL);
    res.redirect(`${FRONTEND_URL}/auth/google/success?${params}`);
  })(req, res, next);
});

export { initPassport };
export default router;
