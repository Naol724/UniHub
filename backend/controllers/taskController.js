import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import Task from '../models/Task.js';
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

const normalizeStatus = (status) => {
  if (!status) return 'todo';
  const map = {
    'to do': 'todo',
    todo: 'todo',
    'in progress': 'inprogress',
    inprogress: 'inprogress',
    in_progress: 'inprogress',
    done: 'done',
    completed: 'done',
  };
  return map[String(status).toLowerCase()] || 'todo';
};

const normalizePriority = (priority) => {
  if (!priority) return 'medium';
  const p = String(priority).toLowerCase();
  if (['low', 'medium', 'high'].includes(p)) return p;
  return 'medium';
};

const populateTask = async (taskOrQuery) => {
  const paths = [
    { path: 'assignee', select: 'firstName lastName first_name last_name email imageURL' },
    { path: 'reporter', select: 'firstName lastName first_name last_name email imageURL' },
    { path: 'createdBy', select: 'firstName lastName first_name last_name email imageURL' },
    { path: 'team', select: 'name color icon' },
  ];
  if (typeof taskOrQuery.exec === 'function') {
    return taskOrQuery
      .populate('assignee', 'firstName lastName first_name last_name email imageURL')
      .populate('reporter', 'firstName lastName first_name last_name email imageURL')
      .populate('createdBy', 'firstName lastName first_name last_name email imageURL')
      .populate('team', 'name color icon');
  }
  await taskOrQuery.populate(paths);
  return taskOrQuery;
};

// @desc    Create a new task
// @route   POST /api/tasks
const createTask = asyncHandler(async (req, res) => {
  const { title, description, deadline, dueDate, priority, assignedTo, assignee, teamId, team } = req.body;
  const uid = userIdOf(req);
  const resolvedTeamId = teamId || team;

  if (!title || !resolvedTeamId) throw new ApiError(400, 'Title and teamId are required');

  const teamDoc = await Team.findById(resolvedTeamId);
  if (!teamDoc) throw new ApiError(404, 'Team not found');
  if (!isTeamMember(teamDoc, uid)) throw new ApiError(403, 'You are not a member of this team');

  const assigneeId = assignee || assignedTo || null;
  if (assigneeId) {
    const assignedUser = await User.findById(assigneeId);
    if (!assignedUser) throw new ApiError(404, 'Assigned user not found');
    if (!isTeamMember(teamDoc, assigneeId)) {
      throw new ApiError(400, 'Assigned user must be a team member');
    }
  }

  const task = await Task.create({
    title: title.trim(),
    description: description || '',
    dueDate: dueDate || deadline ? new Date(dueDate || deadline) : undefined,
    priority: normalizePriority(priority),
    status: 'todo',
    assignee: assigneeId,
    team: resolvedTeamId,
    reporter: uid,
    createdBy: uid,
  });

  await populateTask(task);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
});

// @desc    Get all tasks for current user (across teams)
// @route   GET /api/tasks
const getMyTasks = asyncHandler(async (req, res) => {
  const uid = userIdOf(req);
  const teams = await Team.find({
    $or: [{ leader: uid }, { 'members.user': uid }],
  }).select('_id');
  const teamIds = teams.map((t) => t._id);

  const tasks = await populateTask(
    Task.find({
      $or: [
        { team: { $in: teamIds } },
        { assignee: uid },
        { createdBy: uid },
        { reporter: uid },
      ],
    }).sort({ createdAt: -1 })
  );

  res.status(200).json({ success: true, data: tasks });
});

// @desc    Get all tasks for a specific team
// @route   GET /api/tasks/team/:teamId
const getTasksForTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const uid = userIdOf(req);

  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, 'Team not found');
  if (!isTeamMember(team, uid)) throw new ApiError(403, 'You are not a member of this team');

  const tasks = await populateTask(Task.find({ team: teamId }).sort({ createdAt: -1 }));
  res.status(200).json({ success: true, data: tasks });
});

// @desc    Get single task by ID
// @route   GET /api/tasks/:id
const getTaskById = asyncHandler(async (req, res) => {
  const task = await populateTask(Task.findById(req.params.id).populate('team'));
  if (!task) throw new ApiError(404, 'Task not found');

  const team = await Team.findById(task.team._id || task.team);
  if (!team || !isTeamMember(team, userIdOf(req))) {
    throw new ApiError(403, 'Access denied. You are not a member of this team');
  }

  res.status(200).json({ success: true, data: task });
});

// @desc    Update task details
// @route   PUT /api/tasks/:id
const updateTask = asyncHandler(async (req, res) => {
  const { title, description, deadline, dueDate, priority, assignedTo, assignee, status } = req.body;
  const uid = userIdOf(req);

  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  const team = await Team.findById(task.team);
  if (!team || !isTeamMember(team, uid)) throw new ApiError(403, 'You are not a member of this team');

  const nextAssignee = assignee !== undefined ? assignee : assignedTo;
  if (nextAssignee !== undefined && nextAssignee?.toString() !== task.assignee?.toString()) {
    const isCreator = uid.toString() === task.createdBy.toString();
    const isLeader = uid.toString() === team.leader.toString();
    if (!isCreator && !isLeader) {
      throw new ApiError(403, 'Only task creator or team leader can re-assign tasks');
    }
    if (nextAssignee) {
      if (!isTeamMember(team, nextAssignee)) {
        throw new ApiError(400, 'Assigned user must be a team member');
      }
    }
    task.assignee = nextAssignee || null;
  }

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (dueDate !== undefined || deadline !== undefined) {
    const d = dueDate ?? deadline;
    task.dueDate = d ? new Date(d) : undefined;
  }
  if (priority !== undefined) task.priority = normalizePriority(priority);
  if (status !== undefined) task.status = normalizeStatus(status);
  task.updatedBy = uid;

  await task.save();
  await populateTask(task);

  res.status(200).json({ success: true, message: 'Task updated successfully', data: task });
});

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
const updateTaskStatus = asyncHandler(async (req, res) => {
  const status = normalizeStatus(req.body.status);
  if (!['todo', 'inprogress', 'done'].includes(status)) {
    throw new ApiError(400, 'Valid status is required: todo, inprogress, or done');
  }

  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  const team = await Team.findById(task.team);
  if (!team || !isTeamMember(team, userIdOf(req))) {
    throw new ApiError(403, 'You are not a member of this team');
  }

  task.status = status;
  task.updatedBy = userIdOf(req);
  await task.save();
  await populateTask(task);

  res.status(200).json({ success: true, message: 'Task status updated successfully', data: task });
});

// @desc    Delete task
// @route   DELETE /api/tasks/:id
const deleteTask = asyncHandler(async (req, res) => {
  const uid = userIdOf(req);
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, 'Task not found');

  const team = await Team.findById(task.team);
  if (!team || !isTeamMember(team, uid)) throw new ApiError(403, 'You are not a member of this team');

  const isCreator = uid.toString() === task.createdBy.toString();
  const isLeader = uid.toString() === team.leader.toString();
  if (!isCreator && !isLeader) {
    throw new ApiError(403, 'Only task creator or team leader can delete tasks');
  }

  await Task.findByIdAndDelete(req.params.id);
  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

export {
  createTask,
  getMyTasks,
  getTasksForTeam,
  getTaskById,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
