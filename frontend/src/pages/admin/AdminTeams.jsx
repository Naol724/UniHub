// frontend/src/pages/admin/AdminTeams.jsx
import React, { useState, useEffect } from 'react';
import API from '../../API/Axios';

const AdminTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchAllTeams();
  }, []);

  const fetchAllTeams = async () => {
    try {
      // Get all teams by fetching from a special admin endpoint
      // For now, we'll fetch teams from all users (you may need a dedicated admin endpoint)
      const response = await API.get("/teams?userID=all");
      setTeams(response.data.teams || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
      // Fallback: show empty state
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId) => {
    try {
      await API.delete(`/teams/${teamId}`, {
        data: { userID: 'admin' }
      });
      await fetchAllTeams();
      setShowDeleteModal(false);
      alert('Team deleted successfully');
    } catch (error) {
      console.error("Error deleting team:", error);
      alert(error.response?.data?.msg || "Failed to delete team");
    }
  };

  const filteredTeams = teams.filter(team =>
    team.teamName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teams Management</h1>
        <p className="text-gray-500 mt-1">Manage all teams in the system</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search teams by name or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team) => (
          <div key={team._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
              <h3 className="text-white font-bold text-lg truncate">{team.teamName}</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {team.description || 'No description provided'}
              </p>
              <div className="flex items-center justify-between text-sm mb-3">
                <div className="flex items-center gap-2">
                  <i className="bi bi-people text-gray-400"></i>
                  <span className="text-gray-600">{team.memberCount || 0} Members</span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="bi bi-calendar text-gray-400"></i>
                  <span className="text-gray-600">
                    {team.created_at ? new Date(team.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => window.open(`/teams/${team._id}`, '_blank')}
                  className="flex-1 px-3 py-1.5 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  View Details
                </button>
                <button 
                  onClick={() => {
                    setSelectedTeam(team);
                    setShowDeleteModal(true);
                  }}
                  className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <i className="bi bi-building text-5xl text-gray-300"></i>
          <p className="text-gray-500 mt-2">No teams found</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTeam && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">Delete Team</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{selectedTeam.teamName}</span>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteTeam(selectedTeam._id)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete Team
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeams;