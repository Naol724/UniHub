const express = require("express");
const router = express.Router();
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const jwt = require("jsonwebtoken");
const User = require("../models/user-model");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

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
          firstName:  profile.name.givenName,
          lastName:   profile.name.familyName,
          first_name: profile.name.givenName,
          last_name:  profile.name.familyName,
          email,
          google_id:    profile.id,
          imageURL:     profile.photos[0]?.value || "",
          password:     "google-oauth",
          passwordHash: "google-oauth",
          role: "user",
          isActive: true
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

// Step 1 - redirect to Google
router.get("/", passport.authenticate("google", { scope: ["profile", "email"] }));

// Step 2 - Google redirects back here
router.get("/callback",
  passport.authenticate("google", { failureRedirect: `${FRONTEND_URL}/login?error=google_failed`, session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id, email: req.user.email }, JWT_SECRET, { expiresIn: "7d" });
    const user = {
      id:        req.user._id,
      firstName: req.user.firstName || req.user.first_name,
      lastName:  req.user.lastName  || req.user.last_name,
      email:     req.user.email,
      imageURL:  req.user.imageURL || "",
      role:      req.user.role
    };
    // Redirect to frontend with token and user in query params
    const params = new URLSearchParams({
      token,
      user: JSON.stringify(user)
    });
    res.redirect(`${FRONTEND_URL}/auth/google/success?${params}`);
  }
);

module.exports = router;
module.exports.initPassport = (app) => {
  app.use(passport.initialize());
};
