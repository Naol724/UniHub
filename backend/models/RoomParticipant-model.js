const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema({
    UserID:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roomID:   { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    joinedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Participant", participantSchema);
