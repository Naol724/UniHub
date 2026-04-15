const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const Task = require('../models/Task');
const Team = require('../models/Team');
const User = require('../models/User');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (team members only)
const createTask = asyncHandler(async (req, res) => {
  const { title, description, deadline, priority, assignedTo, teamId } = req.body;

  // Validate required fields
  if (!title || !teamId) {
    throw new ApiError(400, 'Title and teamId are required');
  }

  // Check if team exists and user is a member
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  if (!team.members.some(member => member.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'You are not a member of this team');
  }

  // Validate assignedTo if provided (must be team member)
  if (assignedTo) {
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      throw new ApiError(404, 'Assigned user not found');
    }
    if (!team.members.some(member => member.toString() === assignedTo)) {
      throw new ApiError(400, 'Assigned user must be a team member');
    }
  }

  // Create task
  const task = await Task.create({
    title,
    description: description || '',
    deadline: deadline ? new Date(deadline) : null,
    priority: priority || 'Medium',
    status: 'To Do',
    assignedTo: assignedTo || null,
    teamId,
    createdBy: req.user._id
  });

  // Populate for response
  await task.populate('assignedTo', 'name email');
  await task.populate('createdBy', 'name email');
  await task.populate('teamId', 'name');

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  });
});

// @desc    Get all tasks for a specific team
// @route   GET /api/tasks/team/:teamId
// @access  Private (team members only)
const getTasksForTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  // Check if team exists and user is a member
  const team = await Team.findById(teamId);
  if (!team) {
    throw new ApiError(404, 'Team not found');
  }

  if (!team.members.some(member => member.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'You are not a member of this team');
  }

  // Get tasks for the team
  const tasks = await Task.find({ teamId })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('teamId', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: tasks
  });
});

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
// @access  Private (team members only)
const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email')
    .populate('teamId', 'name members leader');

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  // Check if user is a member of the team
  if (!task.teamId.members.some(member => member.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'Access denied. You are not a member of this team');
  }

  res.status(200).json({
    success: true,
    data: task
  });
});

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private (team members only, creator/leader for re-assignment)
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, deadline, priority, assignedTo } = req.body;

  const task = await Task.findById(req.params.id).populate('teamId');

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  // Check if user is a member of the team
  if (!task.teamId.members.some(member => member.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'You are not a member of this team');
  }

  // Check permissions for re-assignment (only creator or leader)
  if (assignedTo !== undefined && assignedTo !== task.assignedTo?.toString()) {
    const isCreator = req.user._id.toString() === task.createdBy.toString();
    const isLeader = req.user._id.toString() === task.teamId.leader.toString();

    if (!isCreator && !isLeader) {
      throw new ApiError(403, 'Only task creator or team leader can re-assign tasks');
    }

    // Validate assigned user
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        throw new ApiError(404, 'Assigned user not found');
      }
      if (!task.teamId.members.some(member => member.toString() === assignedTo)) {
        throw new ApiError(400, 'Assigned user must be a team member');
      }
    }
  }

  // Update allowed fields
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (deadline !== undefined) task.deadline = deadline ? new Date(deadline) : null;
  if (priority !== undefined) task.priority = priority;
  if (assignedTo !== undefined) task.assignedTo = assignedTo;

  await task.save();

  // Populate for response
  await task.populate('assignedTo', 'name email');
  await task.populate('createdBy', 'name email');
  await task.populate('teamId', 'name');

  res.status(200).json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
});

// @desc    Update task status (move between Kanban columns)
// @route   PUT /api/tasks/:id/status
// @access  Private (team members only)
const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['To Do', 'In Progress', 'Done'];
  if (!status || !validStatuses.includes(status)) {
    throw new ApiError(400, 'Valid status is required: To Do, In Progress, or Done');
  }

  const task = await Task.findById(req.params.id).populate('teamId');

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  // Check if user is a member of the team
  if (!task.teamId.members.some(member => member.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'You are not a member of this team');
  }

  task.status = status;
  await task.save();

  // Populate for response
  await task.populate('assignedTo', 'name email');
  await task.populate('createdBy', 'name email');
  await task.populate('teamId', 'name');

  res.status(200).json({
    success: true,
    message: 'Task status updated successfully',
    data: task
  });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private (creator or team leader only)
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id).populate('teamId');

  if (!task) {
    throw new ApiError(404, 'Task not found');
  }

  // Check if user is a member of the team
  if (!task.teamId.members.some(member => member.toString() === req.user._id.toString())) {
    throw new ApiError(403, 'You are not a member of this team');
  }

  // Check permissions (only creator or leader)
  const isCreator = req.user._id.toString() === task.createdBy.toString();
  const isLeader = req.user._id.toString() === task.teamId.leader.toString();

  if (!isCreator && !isLeader) {
    throw new ApiError(403, 'Only task creator or team leader can delete tasks');
  }

  await Task.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Task deleted successfully'
  });
});

module.exports = {
  createTask,
  getTasksForTeam,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask
};