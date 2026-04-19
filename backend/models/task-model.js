// backend/models/task-model.js (ONLY ONE FILE)
import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    Description: {
        type: String,
        required: true
    },
    deadline: Date,
    teamID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
        required: true
    },
    assignedToUserID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    status: {
        type: String,
        enum: ["todo", "in-progress", "done"],
        default: "todo"
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    priority: {
        type: String,
        enum: ["low", "medium", "high", "urgent"],
        default: "medium"
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

taskSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Check if model already exists before creating
const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

export default Task;