import express from 'express';
import {
  createTask,
  getMyTasks,
  getTasksForTeam,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createTask);
router.get('/', getMyTasks);
router.get('/team/:teamId', getTasksForTeam);
router.put('/:id/status', updateTaskStatus); // before /:id
router.get('/:id', getTaskById);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

export default router;
