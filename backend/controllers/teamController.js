const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Team = require('../models/Team');
const User = require('../models/User');

// Generate a random invite code
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// @desc    Create a new team
// @route   POST /api/teams
// @access  Private (leader only - creator becomes leader)
const createTeam = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Validate required fields
  if (!name) {
    throw new ApiError(400, 'Team name is required');
  }

  // Create team with current user as leader and member
  const team = await Team.create({
    name,
    description: description || '',
    leader: req.user._id,
    members: [req.user._id],
    inviteCode: generateInviteCode()
  });

  // Populate members for response
  await team.populate('members', 'name email');
  await team.populate('leader', 'name email');

  res.status(201).json({
    success: true,
    message: 'Team created successfully',
    data: team
  });
});

// @desc    Get all teams for current user
// @route   GET /api/teams
// @access  Private
const getUserTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({ members: req.user._id })
    .populate('members', 'name email')
    .populate('leader', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: teams
  });
});

// @desc    Get single team by ID
// @route   GET /api/teams/:id
// @access  Private (team members only)
const getTeamById = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id)
    .populate('members', 'name email')
    .populate('leader', 'name email');

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if user is a member
  if (!team.members.some(member => member._id.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'Access denied. You are not a member of this team');
  }

  res.status(200).json({
    success: true,
    data: team
  });
});

// @desc    Invite member to team
// @route   POST /api/teams/:id/invite
// @access  Private (leader only)
const inviteMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  const team = await Team.findById(req.params.id);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if current user is the leader
  if (team.leader.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only team leader can invite members');
  }

  // Check if user exists
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if user is already a member
  if (team.members.includes(userId)) {
    throw new ApiError(400, 'User is already a member of this team');
  }

  // Add user to team
  team.members.push(userId);
  await team.save();

  // Populate for response
  await team.populate('members', 'name email');

  res.status(200).json({
    success: true,
    message: 'Member invited successfully',
    data: team
  });
});

// @desc    Join team via invite code
// @route   POST /api/teams/join
// @access  Private
const joinTeam = asyncHandler(async (req, res) => {
  const { inviteCode } = req.body;

  if (!inviteCode) {
    throw new ApiError(400, 'Invite code is required');
  }

  const team = await Team.findOne({ inviteCode });

  if (!team) {
    throw new ApiError(404, 'Invalid invite code');
  }

  // Check if user is already a member
  if (team.members.includes(req.user._id)) {
    throw new ApiError(400, 'You are already a member of this team');
  }

  // Add user to team
  team.members.push(req.user._id);
  await team.save();

  // Populate for response
  await team.populate('members', 'name email');
  await team.populate('leader', 'name email');

  res.status(200).json({
    success: true,
    message: 'Successfully joined the team',
    data: team
  });
});

// @desc    Update team details
// @route   PUT /api/teams/:id
// @access  Private (leader only)
const updateTeam = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const team = await Team.findById(req.params.id);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if current user is the leader
  if (team.leader.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only team leader can update team details');
  }

  // Update fields
  if (name !== undefined) team.name = name;
  if (description !== undefined) team.description = description;

  await team.save();

  // Populate for response
  await team.populate('members', 'name email');
  await team.populate('leader', 'name email');

  res.status(200).json({
    success: true,
    message: 'Team updated successfully',
    data: team
  });
});

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:memberId
// @access  Private (leader only)
const removeMember = asyncHandler(async (req, res) => {
  const { id, memberId } = req.params;

  const team = await Team.findById(id);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if current user is the leader
  if (team.leader.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only team leader can remove members');
  }

  // Cannot remove yourself if you're the only member
  if (team.members.length === 1 && team.members[0].toString() === memberId) {
    throw new ApiError(400, 'Cannot remove the last member from the team');
  }

  // Check if member exists in team
  if (!team.members.includes(memberId)) {
    throw new ApiError(404, 'Member not found in this team');
  }

  // Remove member
  team.members = team.members.filter(member => member.toString() !== memberId);
  await team.save();

  // Populate for response
  await team.populate('members', 'name email');

  res.status(200).json({
    success: true,
    message: 'Member removed successfully',
    data: team
  });
});

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (leader only)
const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  // Check if current user is the leader
  if (team.leader.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'Only team leader can delete the team');
  }

  await team.remove();

  res.status(200).json({
    success: true,
    message: 'Team deleted successfully'
  });
});

module.exports = {
  createTeam,
  getUserTeams,
  getTeamById,
  inviteMember,
  joinTeam,
  updateTeam,
  removeMember,
  deleteTeam
};