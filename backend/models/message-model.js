const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    roomID:       { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    senderUserID: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId:   { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content:      { type: String, required: true },
    read:         { type: Boolean, default: false },
    created_at:   { type: Date, default: Date.now }
});

module.exports = mongoose.models.Message || mongoose.model("Message", messageSchema);
