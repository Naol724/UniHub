// backend/routes/taskRoutes.js
import { Router } from "express";
import {
    createTask,
    updateTaskProgress,
    getTasks,
    getTaskById,
    deleteTask,
    getTeamTasks,
    getUserTasks
} from "../controllers/taskController.js";
import { protect, isTeamOwnerOrAdmin, isTeamMember } from "../middleware/authMiddleware.js";

const taskRouter = Router();

// All task routes require authentication
taskRouter.use(protect);

// Routes accessible to authenticated users
taskRouter.get("/tasks", getTasks);
taskRouter.get("/tasks/:taskId", getTaskById);
taskRouter.get("/tasks/user/:userId", getUserTasks);
taskRouter.get("/tasks/team/:teamId", isTeamMember, getTeamTasks);

// Routes requiring owner or admin privileges
taskRouter.post("/tasks", isTeamOwnerOrAdmin, createTask);
taskRouter.put("/tasks/:taskId", isTeamOwnerOrAdmin, updateTaskProgress);  // Make sure this exists
taskRouter.delete("/tasks/:taskId", isTeamOwnerOrAdmin, deleteTask);

export default taskRouter;