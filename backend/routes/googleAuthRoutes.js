const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

let passport = null;

const initPassport = (app) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.log("⚠️  Google OAuth skipped - GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set");
    return;
  }

  passport = require("passport");
  const GoogleStrategy = require("passport-google-oauth20").Strategy;

  passport.use(new GoogleStrategy({
      clientID:     process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL || "/api/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            firstName:    profile.name.givenName,
            lastName:     profile.name.familyName,
            first_name:   profile.name.givenName,
            last_name:    profile.name.familyName,
            email,
            google_id:    profile.id,
            imageURL:     profile.photos[0]?.value || "",
            password:     "google-oauth",
            passwordHash: "google-oauth",
            role:         "user",
            isActive:     true
          });
        }
        return done(null, user);
      } catch (err) {
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
  console.log("✅ Google OAuth initialized");
};

// Step 1 - redirect to Google
router.get("/", (req, res) => {
  if (!passport) {
    return res.status(503).json({ success: false, message: "Google OAuth not configured" });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
});

// Step 2 - Google redirects back here
router.get("/callback", (req, res, next) => {
  if (!passport) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_not_configured`);
  }
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_URL}/login?error=google_failed`,
    session: false
  }, (err, user) => {
    if (err || !user) return res.redirect(`${FRONTEND_URL}/login?error=google_failed`);
    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    const userObj = {
      id:        user._id,
      firstName: user.firstName || user.first_name,
      lastName:  user.lastName  || user.last_name,
      email:     user.email,
      imageURL:  user.imageURL || "",
      role:      user.role
    };
    const params = new URLSearchParams({ token, user: JSON.stringify(userObj) });
    res.redirect(`${FRONTEND_URL}/auth/google/success?${params}`);
  })(req, res, next);
});

module.exports = router;
module.exports.initPassport = initPassport;
