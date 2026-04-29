import express from 'express';
import {
  createTask,
  getTasksForTeam,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Task CRUD routes
router.post('/', createTask); // Create a new task
router.get('/team/:teamId', getTasksForTeam); // Get all tasks for a specific team
router.get('/:id', getTaskById); // Get single task by ID
router.put('/:id', updateTask); // Update task details
router.put('/:id/status', updateTaskStatus); // Update task status (move between columns)
router.delete('/:id', deleteTask); // Delete task

export default router;