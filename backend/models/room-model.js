import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    roomType: { type: String, enum: ["team", "direct"], required: true },
    created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Room", roomSchema);
