import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Team from '../models/Team.js';
import User from '../models/user-model.js';

const userIdOf = (req) => req.user.id || req.user._id;

const memberUserId = (m) => {
  const u = m?.user ?? m;
  return (u?._id || u)?.toString();
};

const isTeamMember = (team, userId) => {
  const id = userId.toString();
  if (team.leader?.toString() === id) return true;
  return (team.members || []).some((m) => memberUserId(m) === id);
};

const populateTeam = async (teamOrQuery) => {
  if (teamOrQuery?.then || typeof teamOrQuery?.populate === 'function' && !teamOrQuery.members) {
    // Query
    return teamOrQuery
      .populate('leader', 'firstName lastName first_name last_name email imageURL')
      .populate('members.user', 'firstName lastName first_name last_name email imageURL');
  }
  // Document
  await teamOrQuery.populate([
    { path: 'leader', select: 'firstName lastName first_name last_name email imageURL' },
    { path: 'members.user', select: 'firstName lastName first_name last_name email imageURL' },
  ]);
  return teamOrQuery;
};

const generateInviteCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  return code;
};

// @desc    Create a new team
// @route   POST /api/teams
export const createTeam = asyncHandler(async (req, res) => {
  const { name, description, icon, color } = req.body;
  const uid = userIdOf(req);

  if (!name?.trim()) throw new ApiError(400, 'Team name is required');

  const existingTeam = await Team.findOne({ name: name.trim(), leader: uid });
  if (existingTeam) throw new ApiError(400, 'You already have a team with this name');

  let inviteCode = generateInviteCode();
  while (await Team.findOne({ inviteCode })) {
    inviteCode = generateInviteCode();
  }

  const team = await Team.create({
    name: name.trim(),
    description: (description?.trim() || 'No description provided').slice(0, 500),
    icon: icon || 'TM',
    color: color || '#3b82f6',
    leader: uid,
    createdBy: uid,
    inviteCode,
    members: [{ user: uid, role: 'leader', joinedAt: new Date() }],
  });

  await populateTeam(team);

  res.status(201).json({
    success: true,
    message: 'Team created successfully',
    data: team,
  });
});

// @desc    Get user's teams
// @route   GET /api/teams
export const getUserTeams = asyncHandler(async (req, res) => {
  const uid = userIdOf(req);
  const teams = await populateTeam(
    Team.find({
      $or: [{ leader: uid }, { 'members.user': uid }],
      isActive: { $ne: false },
    }).sort({ createdAt: -1 })
  );

  res.status(200).json({ success: true, data: teams });
});

// @desc    Get single team by ID
// @route   GET /api/teams/:id
export const getTeamById = asyncHandler(async (req, res) => {
  const team = await populateTeam(Team.findById(req.params.id));
  if (!team) throw new ApiError(404, 'Team not found');
  if (!isTeamMember(team, userIdOf(req))) {
    throw new ApiError(403, 'Access denied. You are not a member of this team');
  }
  res.status(200).json({ success: true, data: team });
});

// @desc    Invite member to team
// @route   POST /api/teams/:id/invite
export const inviteMember = asyncHandler(async (req, res) => {
  const { userId, email } = req.body;
  const uid = userIdOf(req);
  const team = await Team.findById(req.params.id);
  if (!team) throw new ApiError(404, 'Team not found');
  if (team.leader.toString() !== uid.toString()) {
    throw new ApiError(403, 'Only team leader can invite members');
  }

  let targetId = userId;
  if (!targetId && email) {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) throw new ApiError(404, 'User not found');
    targetId = user._id;
  }
  if (!targetId) throw new ApiError(400, 'User ID or email is required');

  const user = await User.findById(targetId);
  if (!user) throw new ApiError(404, 'User not found');
  if (isTeamMember(team, targetId)) {
    throw new ApiError(400, 'User is already a member of this team');
  }

  await team.addMember(targetId, 'member');
  await populateTeam(team);

  res.status(200).json({
    success: true,
    message: 'Member invited successfully',
    data: team,
  });
});

// @desc    Join team via invite code
// @route   POST /api/teams/join
export const joinTeam = asyncHandler(async (req, res) => {
  const { inviteCode } = req.body;
  const uid = userIdOf(req);
  if (!inviteCode) throw new ApiError(400, 'Invite code is required');

  const team = await Team.findOne({ inviteCode: inviteCode.toUpperCase().trim(), isActive: true });
  if (!team) throw new ApiError(404, 'Invalid invite code');
  if (isTeamMember(team, uid)) throw new ApiError(400, 'You are already a member of this team');

  await team.addMember(uid, 'member');
  await populateTeam(team);

  res.status(200).json({
    success: true,
    message: 'Successfully joined the team',
    data: team,
  });
});

// @desc    Update team details
// @route   PUT /api/teams/:id
export const updateTeam = asyncHandler(async (req, res) => {
  const { name, description, icon, color } = req.body;
  const team = await Team.findById(req.params.id);
  if (!team) throw new ApiError(404, 'Team not found');
  if (team.leader.toString() !== userIdOf(req).toString()) {
    throw new ApiError(403, 'Only team leader can update team details');
  }

  if (name !== undefined) team.name = name.trim();
  if (description !== undefined) team.description = description.trim();
  if (icon !== undefined) team.icon = icon;
  if (color !== undefined) team.color = color;
  await team.save();
  await populateTeam(team);

  res.status(200).json({ success: true, message: 'Team updated successfully', data: team });
});

// @desc    Remove member from team
// @route   DELETE /api/teams/:id/members/:memberId
export const removeMember = asyncHandler(async (req, res) => {
  const { id, memberId } = req.params;
  const team = await Team.findById(id);
  if (!team) throw new ApiError(404, 'Team not found');
  if (team.leader.toString() !== userIdOf(req).toString()) {
    throw new ApiError(403, 'Only team leader can remove members');
  }
  if (team.leader.toString() === memberId) {
    throw new ApiError(400, 'Cannot remove the team leader');
  }
  if (!isTeamMember(team, memberId)) throw new ApiError(404, 'Member not found in this team');

  await team.removeMember(memberId);
  await populateTeam(team);

  res.status(200).json({ success: true, message: 'Member removed successfully', data: team });
});

// @desc    Delete team
// @route   DELETE /api/teams/:id
export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) throw new ApiError(404, 'Team not found');
  if (team.leader.toString() !== userIdOf(req).toString()) {
    throw new ApiError(403, 'Only team leader can delete the team');
  }
  await Team.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Team deleted successfully', data: {} });
});
