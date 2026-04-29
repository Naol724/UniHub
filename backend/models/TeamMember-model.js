import mongoose from "mongoose";

const memberSchema = new mongoose.Schema({
    userID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    role:   { type: String, enum: ["owner", "admin", "member"], required: true },
    joinedAt: { type: Date, default: Date.now }
});

export default mongoose.model("TeamMember", memberSchema);
