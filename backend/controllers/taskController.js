// backend/controllers/task-controller.js
import Task from "../models/task-model.js";
import TeamMember from "../models/TeamMember-model.js";
import User from "../models/user-model.js";

// backend/controllers/taskController.js


// backend/controllers/taskController.js - Fix createTask

export const createTask = async (req, res) => {
    console.log("=== CREATE TASK REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Request user (from middleware):", req.user);
    
    // Try to get userID from multiple sources
    let userID = req.user?.id;
    if (!userID) {
        userID = req.body.userID;
    }
    if (!userID) {
        userID = req.headers['userid'];
    }
    
    console.log("Final userID:", userID);
    
    const { title, Description, deadline, teamID, assignedToUserID, priority } = req.body;
    
    try {
        // Validation
        if (!title || !Description || !teamID) {
            return res.status(400).json({ 
                success: false,
                msg: "Title, description, and team ID are required" 
            });
        }
        
        if (!userID) {
            return res.status(401).json({ 
                success: false,
                msg: "User ID is required" 
            });
        }
        
        // Check if user is owner or admin of the team
        const member = await TeamMember.findOne({ userID, teamId: teamID });
        console.log("Member found:", member);
        
        if (!member) {
            return res.status(403).json({ 
                success: false,
                msg: "You are not a member of this team" 
            });
        }
        
        if (member.role !== "owner" && member.role !== "admin") {
            return res.status(403).json({ 
                success: false,
                msg: `Only team owner or admin can create tasks. Your role: ${member.role}` 
            });
        }
        
        // If no assigned user, assign to creator
        let finalAssignedToUserID = assignedToUserID;
        if (!finalAssignedToUserID) {
            finalAssignedToUserID = userID;
        }
        
        // Verify assigned user is a member of the team
        const assignedMember = await TeamMember.findOne({ 
            userID: finalAssignedToUserID, 
            teamId: teamID 
        });
        
        if (!assignedMember) {
            return res.status(400).json({ 
                success: false,
                msg: "Assigned user must be a member of the team" 
            });
        }
        
        const task = new Task({
            title,
            Description,
            deadline: deadline || null,
            teamID,
            assignedToUserID: finalAssignedToUserID,
            priority: priority || "medium",
            createdBy: userID,
            progress: 0,
            status: "todo"
        });
        
        await task.save();
        
        const populatedTask = await task
            .populate("teamID", "teamName")
            .populate("assignedToUserID", "first_name last_name email")
            .populate("createdBy", "first_name last_name email");
        
        console.log("Task created successfully");
        
        return res.status(201).json({
            success: true,
            task: populatedTask,
            message: "Task created successfully"
        });
        
    } catch (error) {
        console.error("Create task error:", error);
        return res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};
// backend/controllers/taskController.js - Fix updateTaskProgress

export const updateTaskProgress = async (req, res) => {
    const { taskId } = req.params;
    const { progress, userID } = req.body;
    
    console.log("=== UPDATE TASK PROGRESS ===");
    console.log("Task ID:", taskId);
    console.log("Progress:", progress);
    console.log("User ID:", userID);
    console.log("Request user from middleware:", req.user);
    
    try {
        // Find the task
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ 
                success: false,
                msg: "Task not found" 
            });
        }
        
        console.log("Task found:", task);
        console.log("Task teamID:", task.teamID);
        
        // Determine user ID (from middleware or body)
        const userId = req.user?.id || userID;
        
        if (!userId) {
            return res.status(401).json({ 
                success: false,
                msg: "User not authenticated" 
            });
        }
        
        // Check if user is owner or admin of the team
        const member = await TeamMember.findOne({ userID: userId, teamId: task.teamID });
        console.log("Member found:", member);
        
        if (!member) {
            return res.status(403).json({ 
                success: false,
                msg: "You are not a member of this team" 
            });
        }
        
        if (member.role !== "owner" && member.role !== "admin") {
            return res.status(403).json({ 
                success: false,
                msg: `Only team owner or admin can update tasks. Your role: ${member.role}` 
            });
        }
        
        // Update progress
        const updateData = { progress };
        
        // Auto-update status based on progress
        if (progress === 100) {
            updateData.status = "done";
        } else if (progress > 0 && progress < 100) {
            updateData.status = "in-progress";
        } else if (progress === 0) {
            updateData.status = "todo";
        }
        
        updateData.updatedAt = new Date();
        
        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            updateData,
            { new: true }
        ).populate("teamID", "teamName")
         .populate("assignedToUserID", "first_name last_name email")
         .populate("createdBy", "first_name last_name email");
        
        console.log("Task updated successfully:", updatedTask);
        
        return res.status(200).json({
            success: true,
            task: updatedTask,
            message: "Task progress updated successfully"
        });
        
    } catch (error) {
        console.error("Update task error:", error);
        return res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};
export const getTasks = async (req, res) => {
    const { teamID, userID } = req.query;
    
    try {
        let query = {};
        if (teamID) {
            query.teamID = teamID;
        }
        if (userID) {
            query.assignedToUserID = userID;
        }
        
        const tasks = await Task.find(query)
            .populate("teamID", "teamName")
            .populate("assignedToUserID", "first_name last_name email")
            .populate("createdBy", "first_name last_name email")
            .sort({ deadline: 1, createdAt: -1 });
        
        return res.status(200).json({ 
            success: true,
            tasks: tasks || [] 
        });
    } catch (error) {
        console.error("Get tasks error:", error);
        return res.status(500).json({ 
            success: false,
            error: error.message,
            tasks: [] 
        });
    }
};

export const getTaskById = async (req, res) => {
    const { taskId } = req.params;
    
    try {
        const task = await Task.findById(taskId)
            .populate("teamID", "teamName description")
            .populate("assignedToUserID", "first_name last_name email")
            .populate("createdBy", "first_name last_name email");
        
        if (!task) {
            return res.status(404).json({ 
                success: false,
                msg: "Task not found" 
            });
        }
        
        return res.status(200).json({ 
            success: true,
            task 
        });
    } catch (error) {
        console.error("Get task by ID error:", error);
        return res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

export const deleteTask = async (req, res) => {
    const { taskId } = req.params;
    const userID = req.user?.id || req.body.userID;
    
    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ 
                success: false,
                msg: "Task not found" 
            });
        }
        
        // Check if user is owner or admin
        const member = await TeamMember.findOne({ userID, teamId: task.teamID });
        if (!member || (member.role !== "owner" && member.role !== "admin")) {
            return res.status(403).json({ 
                success: false,
                msg: "Only team owner or admin can delete tasks" 
            });
        }
        
        await Task.findByIdAndDelete(taskId);
        
        return res.status(200).json({
            success: true,
            message: "Task deleted successfully"
        });
    } catch (error) {
        console.error("Delete task error:", error);
        return res.status(500).json({ 
            success: false,
            error: error.message 
        });
    }
};

export const getTeamTasks = async (req, res) => {
    const { teamId } = req.params;
    
    try {
        const tasks = await Task.find({ teamID: teamId })
            .populate("assignedToUserID", "first_name last_name email")
            .populate("createdBy", "first_name last_name email")
            .sort({ deadline: 1, createdAt: -1 });
        
        return res.status(200).json({ 
            success: true,
            tasks: tasks || [] 
        });
    } catch (error) {
        console.error("Get team tasks error:", error);
        return res.status(500).json({ 
            success: false,
            error: error.message,
            tasks: [] 
        });
    }
};

export const getUserTasks = async (req, res) => {
    const { userId } = req.params;
    
    try {
        const tasks = await Task.find({ assignedToUserID: userId })
            .populate("teamID", "teamName")
            .populate("createdBy", "first_name last_name email")
            .sort({ deadline: 1, createdAt: -1 });
        
        return res.status(200).json({ 
            success: true,
            tasks: tasks || [] 
        });
    } catch (error) {
        console.error("Get user tasks error:", error);
        return res.status(500).json({ 
            success: false,
            error: error.message,
            tasks: [] 
        });
    }
};
const handleUpdateTaskProgress = async (taskId, progress) => {
    if (!isOwner) return;
    
    try {
        const response = await API.put(`/tasks/${taskId}`, {
            progress: progress,
            userID: user.id  // Make sure userID is sent
        });
        
        if (response.data.success) {
            fetchTeamData();
        }
    } catch (error) {
        console.error("Error updating task:", error);
        alert('Failed to update task progress');
    }
};