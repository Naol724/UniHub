const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
    roomType: { type: String, enum: ["team", "direct"], required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Room", roomSchema);
