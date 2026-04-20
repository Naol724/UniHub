const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    firstName:    { type: String, trim: true },
    lastName:     { type: String, trim: true },
    first_name:   { type: String, trim: true },
    last_name:    { type: String, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String },
    passwordHash: { type: String },
    Bio:          { type: String, default: "" },
    imageURL:     { type: String, default: "" },
    phone:        { type: String, default: "" },
    location:     { type: String, default: "" },
    role:         { type: String, enum: ["user", "admin", "moderator", "student"], default: "user" },
    isActive:     { type: Boolean, default: true },
    google_id:    { type: String },
    department:   { type: String, default: "" },
    avatar:       { type: String, default: "" },
    bio:          { type: String, default: "" },
    skills:       { type: [String], default: [] },
    teams:        { type: [mongoose.Schema.Types.ObjectId], ref: "Team", default: [] },
    lastLogin:    { type: Date }
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model("User", userSchema);
