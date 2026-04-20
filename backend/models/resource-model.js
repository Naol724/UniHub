const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
    fileName:   { type: String },
    fileType:   String,
    filePath:   { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    TeamId:     { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true }
});

module.exports = mongoose.model("Resource", resourceSchema);
