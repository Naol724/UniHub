// frontend/src/pages/TeamPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../API/Axios';

const TeamPage = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('members');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [addingMembers, setAddingMembers] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    Description: '',
    deadline: '',
    assignedToUserID: '',
    priority: 'medium'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("UniHub-User");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }
  }, []);

  useEffect(() => {
    if (user && user.id && teamId) {
      checkUserRoleAndFetch();
    }
  }, [user, teamId]);

  const checkUserRoleAndFetch = async () => {
    try {
      const roleResponse = await API.get(`/teams/${teamId}/check-role/${user.id}`);
      
      if (roleResponse.data.isMember) {
        const userRole = roleResponse.data.role;
        setIsOwner(userRole === 'owner' || userRole === 'admin');
      }
      
      await Promise.all([
        fetchTeamData(),
        fetchAllUsers()
      ]);
    } catch (error) {
      console.error("Error:", error);
      await fetchTeamData();
    }
  };

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const [teamRes, membersRes, tasksRes] = await Promise.all([
        API.get(`/teams/${teamId}`),
        API.get(`/teams/${teamId}/members`),
        API.get(`/tasks/team/${teamId}`)
      ]);
      
      setTeam(teamRes.data.team);
      setMembers(membersRes.data.members || []);
      setTasks(tasksRes.data.tasks || []);
    } catch (error) {
      console.error("Error fetching team data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await API.get("/users");
      setAllUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    if (!allUsers.length || !members.length) return;
    
    if (searchTerm.trim()) {
      const filtered = allUsers.filter(user => 
        !members.some(m => m.userID?._id === user._id) &&
        (user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         user.email?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      const nonMembers = allUsers.filter(user => 
        !members.some(m => m.userID?._id === user._id)
      );
      setFilteredUsers(nonMembers);
    }
    setSelectedUsers([]);
    setSelectAll(false);
  }, [searchTerm, allUsers, members]);

  useEffect(() => {
    if (selectAll) {
      setSelectedUsers(filteredUsers.map(user => user._id));
    } else {
      setSelectedUsers([]);
    }
  }, [selectAll, filteredUsers]);

  const handleSelectUser = (userId) => {
    setSelectedUsers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleAddSelectedMembers = async () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user to add');
      return;
    }

    if (!isOwner) {
      alert('Only team owner can add members');
      return;
    }

    setAddingMembers(true);
    
    try {
      const response = await API.post(`/teams/${teamId}/members`, {
        users: selectedUsers.map(id => ({ _id: id })),
        ownerID: user.id
      });

      if (response.data.success) {
        alert(`${selectedUsers.length} member(s) added successfully!`);
        setSelectedUsers([]);
        setSelectAll(false);
        setSearchTerm('');
        setShowAddMemberModal(false);
        await fetchTeamData();
        await fetchAllUsers();
      }
    } catch (error) {
      console.error("Error adding members:", error);
      alert(error.response?.data?.msg || "Failed to add members");
    } finally {
      setAddingMembers(false);
    }
  };

  const handleRemoveMember = async (memberId, memberName) => {
    if (!isOwner) {
      alert('Only team owner can remove members');
      return;
    }
    
    if (window.confirm(`Remove ${memberName} from team?`)) {
      try {
        await API.delete(`/teams/${teamId}/members/${memberId}`, {
          data: { ownerID: user.id }
        });
        alert('Member removed successfully!');
        fetchTeamData();
        fetchAllUsers();
      } catch (error) {
        console.error("Error removing member:", error);
        alert(error.response?.data?.msg || "Failed to remove member");
      }
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    if (!isOwner) {
      alert('Only team owner can create tasks');
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
        teamID: teamId,
        assignedToUserID: newTask.assignedToUserID,
        priority: newTask.priority,
        deadline: newTask.deadline,
        userID: user.id
      });

      if (response.data.success) {
        alert('Task created successfully!');
        setShowAddTaskModal(false);
        setNewTask({ 
          title: '', 
          Description: '', 
          deadline: '', 
          assignedToUserID: '',
          priority: 'medium'
        });
        fetchTeamData();
      }
    } catch (error) {
      console.error("Error creating task:", error);
      alert(error.response?.data?.msg || "Failed to create task");
    }
  };

  const handleUpdateTaskProgress = async (taskId, progress) => {
    if (!isOwner) return;
    
    try {
      const response = await API.put(`/tasks/${taskId}`, {
        progress: progress,
        userID: user.id
      });
      
      if (response.data.success) {
        fetchTeamData();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleEditTask = async (taskId, updatedData) => {
    if (!isOwner) return;
    
    try {
      const response = await API.put(`/tasks/${taskId}`, {
        ...updatedData,
        userID: user.id
      });
      
      if (response.data.success) {
        alert('Task updated successfully!');
        fetchTeamData();
        setShowEditTaskModal(false);
        setEditingTask(null);
      }
    } catch (error) {
      console.error("Error editing task:", error);
      alert(error.response?.data?.msg || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!isOwner) {
      alert('Only team owner can delete tasks');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await API.delete(`/tasks/${taskId}`, {
          data: { userID: user.id }
        });
        alert('Task deleted successfully!');
        fetchTeamData();
      } catch (error) {
        console.error("Error deleting task:", error);
        alert(error.response?.data?.msg || "Failed to delete task");
      }
    }
  };

  // TaskCard Component with Enhanced Progress Feature
  const TaskCard = ({ task }) => {
    const [localProgress, setLocalProgress] = useState(task.progress || 0);
    
    const handleProgressChange = (e) => {
      const newProgress = parseInt(e.target.value);
      setLocalProgress(newProgress);
      handleUpdateTaskProgress(task._id, newProgress);
    };
    
    const handleQuickProgress = (percentage) => {
      setLocalProgress(percentage);
      handleUpdateTaskProgress(task._id, percentage);
    };
    
    const handleManualProgress = (e) => {
      let value = parseInt(e.target.value);
      if (isNaN(value)) value = 0;
      value = Math.min(100, Math.max(0, value));
      setLocalProgress(value);
      handleUpdateTaskProgress(task._id, value);
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
          <h4 className="font-medium text-gray-900 text-sm">{task.title}</h4>
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
              {isOwner && (
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={localProgress}
                  onChange={handleManualProgress}
                  className="w-14 px-1 py-0.5 text-xs border rounded text-center"
                />
              )}
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className={`h-2.5 rounded-full transition-all duration-300 ${
                (task.progress || 0) === 100 ? 'bg-green-600' : 
                (task.progress || 0) >= 50 ? 'bg-blue-600' : 'bg-yellow-600'
              }`}
              style={{ width: `${task.progress || 0}%` }}
            ></div>
          </div>
        </div>
        
        {/* Quick Progress Buttons - Only for owners */}
        {isOwner && (
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
        )}
        
        {/* Progress Slider - Only for owners */}
        {isOwner && (
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={localProgress}
              onChange={handleProgressChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>
        )}
        
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
        
        {/* Status Badge and Actions */}
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              task.status === 'done' || task.progress === 100 ? 'bg-green-100 text-green-700' :
              task.status === 'in-progress' || (task.progress > 0 && task.progress < 100) ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {task.status === 'done' || task.progress === 100 ? '✓ Completed' :
               task.status === 'in-progress' || (task.progress > 0 && task.progress < 100) ? '🔄 In Progress' : '📋 To Do'}
            </span>
            
            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingTask(task);
                    setShowEditTaskModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-700 text-xs"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500">Team not found</p>
        <button onClick={() => navigate('/teams')} className="mt-4 text-blue-600 hover:underline">
          Back to Teams
        </button>
      </div>
    );
  }

  const todoTasks = tasks.filter(t => t.status === 'todo' || t.progress === 0);
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress' || (t.progress > 0 && t.progress < 100));
  const doneTasks = tasks.filter(t => t.status === 'done' || t.progress === 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/teams')}
            className="mb-4 flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Teams
          </button>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{team.teamName}</h1>
              <p className="text-blue-100 mt-2">{team.description || 'No description provided'}</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-sm">👥 {members.length} Members</span>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <span className="text-sm">📋 {tasks.length} Tasks</span>
              </div>
              {isOwner && (
                <div className="bg-yellow-400 text-gray-900 rounded-lg px-4 py-2 font-semibold">
                  👑 Owner
                </div>
              )}
            </div>
            <button
    onClick={() => navigate(`/team-chat/${teamId}`)}
    className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
>
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
    Team Chat
</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('members')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'members'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Members ({members.length})
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'tasks'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tasks ({tasks.length})
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Members Tab */}
        {activeTab === 'members' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Team Members</h2>
              {isOwner && (
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Members
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div key={member._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">
                        {member.userID?.first_name?.[0]}{member.userID?.last_name?.[0]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {member.userID?.first_name} {member.userID?.last_name}
                        </h3>
                        <p className="text-xs text-gray-500">{member.userID?.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                          member.role === 'owner' ? 'bg-yellow-100 text-yellow-700' : 
                          member.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                    {isOwner && member.role !== 'owner' && (
                      <button
                        onClick={() => handleRemoveMember(member._id, `${member.userID?.first_name} ${member.userID?.last_name}`)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Team Tasks</h2>
              {isOwner && (
                <button
                  onClick={() => setShowAddTaskModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Create Task
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* To Do Column */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">To Do</h3>
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{todoTasks.length}</span>
                </div>
                <div className="space-y-3">
                  {todoTasks.map(task => <TaskCard key={task._id} task={task} />)}
                  {todoTasks.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No tasks to do</div>}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">In Progress</h3>
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{inProgressTasks.length}</span>
                </div>
                <div className="space-y-3">
                  {inProgressTasks.map(task => <TaskCard key={task._id} task={task} />)}
                  {inProgressTasks.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No tasks in progress</div>}
                </div>
              </div>

              {/* Done Column */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <h3 className="font-semibold text-gray-900">Done</h3>
                  <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">{doneTasks.length}</span>
                </div>
                <div className="space-y-3">
                  {doneTasks.map(task => <TaskCard key={task._id} task={task} />)}
                  {doneTasks.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No completed tasks</div>}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Add Team Members</h2>
              <button onClick={() => setShowAddMemberModal(false)}>✕</button>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-4 py-2 border rounded-xl mb-4"
            />
            {selectedUsers.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl flex justify-between">
                <span>{selectedUsers.length} user(s) selected</span>
                <button onClick={() => { setSelectedUsers([]); setSelectAll(false); }}>Clear all</button>
              </div>
            )}
            <div className="max-h-96 overflow-y-auto border rounded-xl mb-4">
              {filteredUsers.map(userItem => (
                <div key={userItem._id} className="p-3 border-b">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" checked={selectedUsers.includes(userItem._id)} onChange={() => handleSelectUser(userItem._id)} />
                    <div>
                      <p className="font-medium">{userItem.first_name} {userItem.last_name}</p>
                      <p className="text-sm text-gray-500">{userItem.email}</p>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowAddMemberModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
              <button onClick={handleAddSelectedMembers} disabled={selectedUsers.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-xl">
                Add {selectedUsers.length} Member(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Create New Task</h2>
            <form onSubmit={handleCreateTask}>
              <input type="text" placeholder="Task Title" required value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="w-full px-4 py-2 border rounded-xl mb-4" />
              <textarea placeholder="Description" required value={newTask.Description} onChange={(e) => setNewTask({ ...newTask, Description: e.target.value })} rows="3" className="w-full px-4 py-2 border rounded-xl mb-4" />
              <select required value={newTask.assignedToUserID} onChange={(e) => setNewTask({ ...newTask, assignedToUserID: e.target.value })} className="w-full px-4 py-2 border rounded-xl mb-4">
                <option value="">Assign to member</option>
                {members.map(member => <option key={member._id} value={member.userID?._id}>{member.userID?.first_name} {member.userID?.last_name}</option>)}
              </select>
              <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })} className="w-full px-4 py-2 border rounded-xl mb-4">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
              <input type="date" value={newTask.deadline} onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })} className="w-full px-4 py-2 border rounded-xl mb-4" />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowAddTaskModal(false)} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-xl">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {showEditTaskModal && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold mb-4">Edit Task</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleEditTask(editingTask._id, {
                title: formData.get('title'),
                Description: formData.get('Description'),
                priority: formData.get('priority'),
                assignedToUserID: formData.get('assignedToUserID'),
                deadline: formData.get('deadline')
              });
            }}>
              <input type="text" name="title" defaultValue={editingTask.title} required className="w-full px-4 py-2 border rounded-xl mb-4" />
              <textarea name="Description" defaultValue={editingTask.Description} rows="3" required className="w-full px-4 py-2 border rounded-xl mb-4" />
              <select name="assignedToUserID" defaultValue={editingTask.assignedToUserID?._id} className="w-full px-4 py-2 border rounded-xl mb-4">
                {members.map(member => <option key={member._id} value={member.userID?._id}>{member.userID?.first_name} {member.userID?.last_name}</option>)}
              </select>
              <select name="priority" defaultValue={editingTask.priority || 'medium'} className="w-full px-4 py-2 border rounded-xl mb-4">
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option>
              </select>
              <input type="date" name="deadline" defaultValue={editingTask.deadline?.split('T')[0]} className="w-full px-4 py-2 border rounded-xl mb-4" />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setShowEditTaskModal(false); setEditingTask(null); }} className="px-4 py-2 border rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamPage;