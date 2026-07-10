import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Resource from '../models/Resource.js';
import Team from '../models/Team.js';
import fs from 'fs/promises';
import path from 'path';

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

const populateResource = async (resourceOrQuery) => {
  if (typeof resourceOrQuery.exec === 'function') {
    return resourceOrQuery
      .populate('uploadedBy', 'firstName lastName first_name last_name email imageURL')
      .populate('team', 'name color icon');
  }
  await resourceOrQuery.populate([
    { path: 'uploadedBy', select: 'firstName lastName first_name last_name email imageURL' },
    { path: 'team', select: 'name color icon' },
  ]);
  return resourceOrQuery;
};

// @desc    Upload a file to a team
// @route   POST /api/resources
const uploadResource = asyncHandler(async (req, res) => {
  const teamId = req.body.teamId || req.body.team;
  const uid = userIdOf(req);

  if (!req.file) throw new ApiError(400, 'No file uploaded');
  if (!teamId) {
    await fs.unlink(req.file.path).catch(() => {});
    throw new ApiError(400, 'Team ID is required');
  }

  const team = await Team.findById(teamId);
  if (!team) {
    await fs.unlink(req.file.path).catch(() => {});
    throw new ApiError(404, 'Team not found');
  }
  if (!isTeamMember(team, uid)) {
    await fs.unlink(req.file.path).catch(() => {});
    throw new ApiError(403, 'You are not a member of this team');
  }

  const ext = path.extname(req.file.originalname || '').replace('.', '') || 'bin';

  const resource = await Resource.create({
    name: req.body.name || req.file.originalname,
    description: req.body.description || '',
    filename: req.file.filename,
    originalName: req.file.originalname,
    path: req.file.path,
    size: req.file.size,
    mimeType: req.file.mimetype,
    extension: ext,
    team: teamId,
    uploadedBy: uid,
  });

  await populateResource(resource);

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: resource,
  });
});

// @desc    Get all resources for current user's teams
// @route   GET /api/resources
const getMyResources = asyncHandler(async (req, res) => {
  const uid = userIdOf(req);
  const teams = await Team.find({
    $or: [{ leader: uid }, { 'members.user': uid }],
  }).select('_id');
  const teamIds = teams.map((t) => t._id);

  const resources = await populateResource(
    Resource.find({ team: { $in: teamIds } }).sort({ createdAt: -1 })
  );

  res.status(200).json({ success: true, data: resources });
});

// @desc    Get all resources for a specific team
// @route   GET /api/resources/team/:teamId
const getResourcesForTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const uid = userIdOf(req);

  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, 'Team not found');
  if (!isTeamMember(team, uid)) throw new ApiError(403, 'You are not a member of this team');

  const resources = await populateResource(
    Resource.find({ team: teamId }).sort({ createdAt: -1 })
  );

  res.status(200).json({ success: true, data: resources });
});

// @desc    Get single resource by ID
// @route   GET /api/resources/:id
const getResourceById = asyncHandler(async (req, res) => {
  const resource = await populateResource(Resource.findById(req.params.id).populate('team'));
  if (!resource) throw new ApiError(404, 'Resource not found');

  const team = await Team.findById(resource.team._id || resource.team);
  if (!team || !isTeamMember(team, userIdOf(req))) {
    throw new ApiError(403, 'Access denied. You are not a member of this team');
  }

  res.status(200).json({ success: true, data: resource });
});

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
const deleteResource = asyncHandler(async (req, res) => {
  const uid = userIdOf(req);
  const resource = await Resource.findById(req.params.id);
  if (!resource) throw new ApiError(404, 'Resource not found');

  const team = await Team.findById(resource.team);
  if (!team || !isTeamMember(team, uid)) throw new ApiError(403, 'You are not a member of this team');

  const isUploader = uid.toString() === resource.uploadedBy.toString();
  const isLeader = uid.toString() === team.leader.toString();
  if (!isUploader && !isLeader) {
    throw new ApiError(403, 'Only the uploader or team leader can delete this resource');
  }

  try {
    await fs.unlink(resource.path);
  } catch (error) {
    console.error('Error deleting file from disk:', error.message);
  }

  await Resource.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Resource deleted successfully' });
});

export {
  uploadResource,
  getMyResources,
  getResourcesForTeam,
  getResourceById,
  deleteResource,
};
