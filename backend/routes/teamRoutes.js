import express from 'express';
import {
  createTeam,
  getUserTeams,
  getTeamById,
  inviteMember,
  joinTeam,
  updateTeam,
  removeMember,
  deleteTeam
} from '../controllers/teamController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createTeam);
router.get('/', getUserTeams);
router.post('/join', joinTeam); // before /:id
router.get('/:id', getTeamById);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);
router.post('/:id/invite', inviteMember);
router.delete('/:id/members/:memberId', removeMember);

export default router;
