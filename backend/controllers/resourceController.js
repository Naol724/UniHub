const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Resource = require('../models/Resource');
const Team = require('../models/Team');
const fs = require('fs').promises;
const path = require('path');

// @desc    Upload a file to a team
// @route   POST /api/resources
// @access  Private (team members only)
const uploadResource = asyncHandler(async (req, res) => {
  const { teamId } = req.body;

  // Check if file was uploaded
  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  // Validate teamId
  if (!teamId) {
    throw new ApiError(400, 'Team ID is required');
  }

  // Check if team exists and user is a member
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  if (!team.members.some(member => member.toString() === req.user._id.toString())) {
    // Clean up uploaded file if access denied
    await fs.unlink(req.file.path);
    throw new ApiError(403, 'You are not a member of this team');
  }

  // Create resource record
  const resource = await Resource.create({
    filename: req.file.filename,
    originalname: req.file.originalname,
    path: req.file.path,
    size: req.file.size,
    mimetype: req.file.mimetype,
    teamId,
    uploadedBy: req.user._id,
    uploadDate: new Date()
  });

  // Populate for response
  await resource.populate('uploadedBy', 'name email');
  await resource.populate('teamId', 'name');

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: resource
  });
});

// @desc    Get all resources for a specific team
// @route   GET /api/resources/team/:teamId
// @access  Private (team members only)
const getResourcesForTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  // Check if team exists and user is a member
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  if (!team.members.some(member => member.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'You are not a member of this team');
  }

  // Get resources for the team
  const resources = await Resource.find({ teamId })
    .populate('uploadedBy', 'name email')
    .populate('teamId', 'name')
    .sort({ uploadDate: -1 });

  res.status(200).json({
    success: true,
    data: resources
  });
});

// @desc    Get single resource by ID
// @route   GET /api/resources/:id
// @access  Private (team members only)
const getResourceById = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id)
    .populate('uploadedBy', 'name email')
    .populate('teamId', 'name members leader');

  if (!resource) {
    throw new ApiError(404, 'Resource not found');
  }

  // Check if user is a member of the team
  if (!resource.teamId.members.some(member => member.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'Access denied. You are not a member of this team');
  }

  res.status(200).json({
    success: true,
    data: resource
  });
});

// @desc    Delete a resource
// @route   DELETE /api/resources/:id
// @access  Private (uploader or team leader only)
const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id).populate('teamId');

  if (!resource) {
    throw new ApiError(404, 'Resource not found');
  }

  // Check if user is a member of the team
  if (!resource.teamId.members.some(member => member.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'You are not a member of this team');
  }

  // Check permissions (only uploader or leader)
  const isUploader = req.user._id.toString() === resource.uploadedBy.toString();
  const isLeader = req.user._id.toString() === resource.teamId.leader.toString();

  if (!isUploader && !isLeader) {
    throw new ApiError(403, 'Only the uploader or team leader can delete this resource');
  }

  // Delete file from disk
  try {
    await fs.unlink(resource.path);
  } catch (error) {
    // Log error but continue with DB deletion
    console.error('Error deleting file from disk:', error);
  }

  // Delete from database
  await Resource.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Resource deleted successfully'
  });
});

module.exports = {
  uploadResource,
  getResourcesForTeam,
  getResourceById,
  deleteResource
};