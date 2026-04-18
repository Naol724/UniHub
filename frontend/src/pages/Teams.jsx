// frontend/src/pages/TeamsDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API/Axios';

const TeamsDashboard = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTeam, setNewTeam] = useState({ teamName: '', description: '' });
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem("UniHub-User");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } else {
      navigate('/user/login');
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchTeams();
    }
  }, [user]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get(`/teams?userID=${user.id}`);
      const teamsData = response.data.teams || [];
      
      // Fetch member count and project count for each team
      const teamsWithCounts = await Promise.all(
        teamsData.map(async (team) => {
          try {
            const [membersRes, tasksRes] = await Promise.all([
              API.get(`/teams/${team._id}/members`),
              API.get(`/tasks/team/${team._id}`)
            ]);
            return {
              ...team,
              memberCount: membersRes.data.members?.length || 0,
              projectCount: tasksRes.data.tasks?.length || 0
            };
          } catch (err) {
            return {
              ...team,
              memberCount: 0,
              projectCount: 0
            };
          }
        })
      );
      
      setTeams(teamsWithCounts);
    } catch (error) {
      console.error("Error fetching teams:", error);
      setError(error.response?.data?.msg || "Failed to load teams");
      if (error.response?.status === 401) {
        navigate('/user/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeam.teamName.trim()) {
      setError("Team name is required");
      return;
    }
    
    try {
      const response = await API.post("/teams", {
        teamName: newTeam.teamName,
        description: newTeam.description,
        ownerID: user.id
      });
      
      if (response.data.success) {
        await fetchTeams();
        setShowCreateModal(false);
        setNewTeam({ teamName: '', description: '' });
        setError('');
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
        successMsg.innerText = 'Team created successfully!';
        document.body.appendChild(successMsg);
        setTimeout(() => successMsg.remove(), 3000);
      }
    } catch (error) {
      console.error("Error creating team:", error);
      setError(error.response?.data?.msg || "Failed to create team");
    }
  };

  const handleTeamClick = (teamId) => {
    navigate(`/teams/${teamId}`);
  };

  const stats = [
    { label: 'Total Teams', value: teams.length, icon: '👥', color: 'blue' },
    { label: 'Total Members', value: teams.reduce((sum, t) => sum + (t.memberCount || 0), 0), icon: '👤', color: 'green' },
    { label: 'Total Tasks', value: teams.reduce((sum, t) => sum + (t.projectCount || 0), 0), icon: '📋', color: 'purple' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Teams</h1>
              <p className="text-gray-500 mt-2">Manage and collaborate with your teams</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Team
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Teams Grid */}
        {teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team._id}
                onClick={() => handleTeamClick(team._id)}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all cursor-pointer overflow-hidden group"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-bold text-xl truncate">{team.teamName}</h3>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white text-xl">👥</span>
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {team.description || 'No description provided'}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">👤</span>
                      <span className="text-gray-600">{team.memberCount || 0} Members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">📋</span>
                      <span className="text-gray-600">{team.projectCount || 0} Tasks</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button className="w-full py-2 text-blue-600 font-medium text-sm hover:text-blue-700 transition-colors">
                      Click to view details →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-500 text-lg">No teams yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first team to get started</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Team
            </button>
          </div>
        )}

        {/* Create Team Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Create New Team</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setError('');
                    setNewTeam({ teamName: '', description: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form onSubmit={handleCreateTeam}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Team Name *</label>
                  <input
                    type="text"
                    required
                    value={newTeam.teamName}
                    onChange={(e) => setNewTeam({ ...newTeam, teamName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Enter team name"
                    autoFocus
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newTeam.description}
                    onChange={(e) => setNewTeam({ ...newTeam, description: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    placeholder="Describe what this team does..."
                  />
                </div>
                {error && (
                  <div className="mb-4 text-sm text-red-600">{error}</div>
                )}
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setError('');
                      setNewTeam({ teamName: '', description: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors"
                  >
                    Create Team
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamsDashboard;