const express = require('express');
const {
  createTask,
  getTasksForTeam,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

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

module.exports = router;