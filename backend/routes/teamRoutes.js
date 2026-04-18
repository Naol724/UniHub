const express = require('express');
const {
  createTeam,
  getUserTeams,
  getTeamById,
  inviteMember,
  joinTeam,
  updateTeam,
  removeMember,
  deleteTeam
} = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Team CRUD routes
router.post('/', createTeam); // Create a new team
router.get('/', getUserTeams); // Get all teams for current user
router.get('/:id', getTeamById); // Get single team by ID
router.put('/:id', updateTeam); // Update team details (leader only)
router.delete('/:id', deleteTeam); // Delete team (leader only)

// Team member management
router.post('/:id/invite', inviteMember); // Invite member to team (leader only)
router.post('/join', joinTeam); // Join team via invite code

// Remove member from team (leader only)
router.delete('/:id/members/:memberId', removeMember);

module.exports = router;