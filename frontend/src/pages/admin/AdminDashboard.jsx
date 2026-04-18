// frontend/src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import API from '../../API/Axios';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTeams: 0,
    totalTasks: 0,
    totalAdmins: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentTeams, setRecentTeams] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [usersRes, teamsRes, tasksRes, adminsRes] = await Promise.all([
        API.get("/users"),
        API.get("/teams?userID=all"),
        API.get("/tasks"),
        API.get("/admin/all")
      ]);

      const users = usersRes.data.users || [];
      const teams = teamsRes.data.teams || [];
      const tasks = tasksRes.data.tasks || [];
      const admins = adminsRes.data.admins || [];

      setStats({
        totalUsers: users.length,
        totalTeams: teams.length,
        totalTasks: tasks.length,
        totalAdmins: admins.length
      });

      setRecentUsers(users.slice(0, 5));
      setRecentTeams(teams.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: "bi-people", color: "blue" },
    { title: "Total Teams", value: stats.totalTeams, icon: "bi-building", color: "green" },
    { title: "Total Tasks", value: stats.totalTasks, icon: "bi-check2-square", color: "purple" },
    { title: "Total Admins", value: stats.totalAdmins, icon: "bi-shield-lock", color: "orange" },
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome to the admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                <i className={`${stat.icon} text-xl text-${stat.color}-600`}></i>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">View All →</button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentUsers.map((user) => (
              <div key={user._id} className="px-6 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{user.first_name} {user.last_name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Teams */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Teams</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700">View All →</button>
          </div>
          <div className="divide-y divide-gray-100">
            {recentTeams.map((team) => (
              <div key={team._id} className="px-6 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <i className="bi bi-building text-green-600"></i>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{team.teamName}</p>
                  <p className="text-sm text-gray-500">{team.description || 'No description'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;