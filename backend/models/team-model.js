const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema({
    teamName:   { type: String, required: true },
    description:{ type: String },
    inviteLink: String,
    chatRoomID: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Team", teamSchema);
