// backend/models/user-model.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    Bio: {
        type: String,
        default: ""
    },
    imageURL: {
        type: String,
        default: ""
    },
    phone: {
        type: String,
        default: ""
    },
    location: {
        type: String,
        default: ""
    },
    role: {
        type: String,
        enum: ["user", "admin", "moderator"],
        default: "user"
    },
    isActive: {
        type: Boolean,
        default: true
    },
    google_id: {
        type: String
    },
    department: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

export default mongoose.model("User", userSchema);