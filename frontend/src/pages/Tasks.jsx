// frontend/src/pages/Tasks.jsx
import React, { useState, useEffect } from 'react';
import API from '../API/Axios';

const TasksPage = () => {
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [teamMembers, setTeamMembers] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [user, setUser] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    Description: '',
    deadline: '',
    teamID: '',
    assignedToUserID: '',
    priority: 'medium'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("UniHub-User");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, teamsRes] = await Promise.all([
        API.get(`/tasks?userID=${user.id}`),
        API.get(`/teams?userID=${user.id}`)
      ]);
      setTasks(tasksRes.data.tasks || []);
      setTeams(teamsRes.data.teams || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async (teamId) => {
    if (teamMembers[teamId]) return teamMembers[teamId];
    
    try {
      const response = await API.get(`/teams/${teamId}/members`);
      const members = response.data.members || [];
      setTeamMembers(prev => ({ ...prev, [teamId]: members }));
      return members;
    } catch (error) {
      console.error("Error fetching team members:", error);
      return [];
    }
  };

  const handleTeamChange = async (e) => {
    const teamId = e.target.value;
    setNewTask({ ...newTask, teamID: teamId, assignedToUserID: '' });
    if (teamId) {
      await fetchTeamMembers(teamId);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!newTask.teamID) {
      alert('Please select a team');
      return;
    }
    
    if (!newTask.assignedToUserID) {
      alert('Please assign the task to a team member');
      return;
    }
    
    try {
      const response = await API.post("/tasks", {
        title: newTask.title,
        Description: newTask.Description,
        teamID: newTask.teamID,
        assignedToUserID: newTask.assignedToUserID,
        priority: newTask.priority,
        deadline: newTask.deadline || null,
        userID: user.id
      });
      
      if (response.data.success) {
        alert('Task created successfully!');
        setShowCreateModal(false);
        setNewTask({ 
          title: '', 
          Description: '', 
          deadline: '', 
          teamID: '', 
          assignedToUserID: '',
          priority: 'medium'
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert(error.response?.data?.msg || "Failed to create task");
    }
  };

  const handleUpdateProgress = async (taskId, progress) => {
    try {
      const response = await API.put(`/tasks/${taskId}`, {
        progress: progress,
        userID: user.id
      });
      
      if (response.data.success) {
        fetchData();
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      alert("Failed to update task progress");
    }
  };

  const taskSections = {
    todo: tasks.filter(t => t.status === 'todo' || (!t.status && t.progress === 0)),
    inProgress: tasks.filter(t => t.status === 'in-progress' || (t.progress > 0 && t.progress < 100)),
    done: tasks.filter(t => t.status === 'done' || t.progress === 100)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tasks</h1>
            <p className="text-sm md:text-base text-gray-500 mt-1">Organize and track your project tasks</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md"
          >
            <span>➕</span>
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        {/* To Do Column */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <h2 className="font-semibold text-gray-900">To Do</h2>
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{taskSections.todo.length}</span>
            </div>
          </div>
          <div className="space-y-3">
            {taskSections.todo.map((task) => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onUpdateProgress={handleUpdateProgress}
              />
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <h2 className="font-semibold text-gray-900">In Progress</h2>
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{taskSections.inProgress.length}</span>
            </div>
          </div>
          <div className="space-y-3">
            {taskSections.inProgress.map((task) => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onUpdateProgress={handleUpdateProgress}
              />
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h2 className="font-semibold text-gray-900">Done</h2>
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{taskSections.done.length}</span>
            </div>
          </div>
          <div className="space-y-3">
            {taskSections.done.map((task) => (
              <TaskCard 
                key={task._id} 
                task={task} 
                onUpdateProgress={handleUpdateProgress}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Task</h2>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Enter task title"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  required
                  value={newTask.Description}
                  onChange={(e) => setNewTask({ ...newTask, Description: e.target.value })}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  placeholder="Describe the task"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Team *</label>
                <select
                  required
                  value={newTask.teamID}
                  onChange={handleTeamChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Select Team</option>
                  {teams.map(team => (
                    <option key={team._id} value={team._id}>{team.teamName}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                <select
                  required
                  value={newTask.assignedToUserID}
                  onChange={(e) => setNewTask({ ...newTask, assignedToUserID: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  disabled={!newTask.teamID}
                >
                  <option value="">Select a member</option>
                  {teamMembers[newTask.teamID]?.map(member => (
                    <option key={member._id} value={member.userID?._id}>
                      {member.userID?.first_name} {member.userID?.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={newTask.deadline}
                  onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Task Card Component
const TaskCard = ({ task, onUpdateProgress }) => {
  const [progress, setProgress] = useState(task.progress || 0);
  
  const handleProgressChange = (e) => {
    const newProgress = parseInt(e.target.value);
    setProgress(newProgress);
    onUpdateProgress(task._id, newProgress);
  };
  
  const handleQuickProgress = (percentage) => {
    setProgress(percentage);
    onUpdateProgress(task._id, percentage);
  };
  
  const getPriorityColor = () => {
    switch(task.priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };
  
  const getPriorityText = () => {
    switch(task.priority) {
      case 'urgent': return 'Urgent';
      case 'high': return 'High';
      case 'medium': return 'Medium';
      default: return 'Low';
    }
  };
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-gray-900 text-sm">{task.title}</h3>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${getPriorityColor()}`}></span>
          <span className="text-xs text-gray-500">{getPriorityText()}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.Description}</p>
      
      {/* Progress Section */}
      <div className="mb-3">
        <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <div className="flex items-center gap-2">
            <span className="font-medium">{task.progress || 0}%</span>
            <input
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                if (!isNaN(val) && val >= 0 && val <= 100) {
                  handleQuickProgress(val);
                }
              }}
              className="w-14 px-1 py-0.5 text-xs border rounded text-center"
            />
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              (task.progress || 0) === 100 ? 'bg-green-600' : 
              (task.progress || 0) >= 50 ? 'bg-blue-600' : 'bg-yellow-600'
            }`}
            style={{ width: `${task.progress || 0}%` }}
          ></div>
        </div>
      </div>
      
      {/* Quick Progress Buttons */}
      <div className="mb-3">
        <div className="flex gap-2">
          <button
            onClick={() => handleQuickProgress(25)}
            className="flex-1 text-xs py-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            25%
          </button>
          <button
            onClick={() => handleQuickProgress(50)}
            className="flex-1 text-xs py-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            50%
          </button>
          <button
            onClick={() => handleQuickProgress(75)}
            className="flex-1 text-xs py-1.5 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            75%
          </button>
          <button
            onClick={() => handleQuickProgress(100)}
            className="flex-1 text-xs py-1.5 rounded bg-green-100 text-green-700 hover:bg-green-200 transition-colors font-medium"
          >
            ✓ 100%
          </button>
        </div>
      </div>
      
      {/* Progress Slider */}
      <div className="mb-3">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={progress}
          onChange={handleProgressChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-400">
          👤 {task.assignedToUserID?.first_name} {task.assignedToUserID?.last_name}
        </span>
        {task.deadline && (
          <span className={`${new Date(task.deadline) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
            📅 {new Date(task.deadline).toLocaleDateString()}
          </span>
        )}
      </div>
      
      {/* Status Badge */}
      <div className="mt-3 pt-2 border-t border-gray-100">
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          task.status === 'done' || task.progress === 100 ? 'bg-green-100 text-green-700' :
          task.status === 'in-progress' || (task.progress > 0 && task.progress < 100) ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {task.status === 'done' || task.progress === 100 ? '✓ Completed' :
           task.status === 'in-progress' || (task.progress > 0 && task.progress < 100) ? '🔄 In Progress' : '📋 To Do'}
        </span>
      </div>
    </div>
  );
};

export default TasksPage;