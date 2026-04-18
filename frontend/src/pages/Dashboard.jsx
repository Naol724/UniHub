// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../API/Axios';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    activeTeams: 0,
    pendingTasks: 0,
    inProgressTasks: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("UniHub-User");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
    } else {
      navigate('/user/login');
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch teams for the current user
      const storedUser = localStorage.getItem("UniHub-User");
      if (!storedUser) return;
      
      const userData = JSON.parse(storedUser);
      
      const [teamsRes, tasksRes] = await Promise.all([
        API.get(`/teams?userID=${userData.id}`),
        API.get(`/tasks?userID=${userData.id}`)
      ]);

      const teams = teamsRes.data.teams || [];
      const tasks = tasksRes.data.tasks || [];

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'done' || t.progress === 100).length;
      const inProgressTasks = tasks.filter(t => t.status === 'in-progress' || (t.progress > 0 && t.progress < 100)).length;
      const pendingTasks = tasks.filter(t => t.status === 'todo' || t.progress === 0).length;
      
      // Get upcoming deadlines (tasks due in next 7 days)
      const now = new Date();
      const next7Days = new Date();
      next7Days.setDate(now.getDate() + 7);
      
      const upcoming = tasks
        .filter(t => t.deadline && new Date(t.deadline) >= now && new Date(t.deadline) <= next7Days)
        .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
        .slice(0, 5);

      setUpcomingDeadlines(upcoming);
      
      setStats({
        totalTasks,
        completedTasks,
        activeTeams: teams.length,
        pendingTasks,
        inProgressTasks
      });

      // Fetch recent activities (you can create an activity log endpoint later)
      // For now, using mock data based on tasks
      const recentActivityData = tasks
        .filter(t => t.updatedAt)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5)
        .map(task => ({
          id: task._id,
          user: task.assignedToUserID?.first_name || 'Someone',
          action: `${task.status === 'done' ? 'completed' : 'updated'} task "${task.title}"`,
          time: getTimeAgo(task.updatedAt),
          team: task.teamID?.teamName || 'Team'
        }));
      
      setRecentActivities(recentActivityData.length > 0 ? recentActivityData : [
        { id: 1, user: userData.first_name, action: "Welcome to UniHub! Start by creating a team.", time: "Just now", team: "Getting Started" }
      ]);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response?.status === 401) {
        navigate('/user/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)} days ago`;
    return date.toLocaleDateString();
  };

  const getPriorityBadge = (priority) => {
    const colors = {
      urgent: "bg-red-100 text-red-700",
      high: "bg-orange-100 text-orange-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-green-100 text-green-700"
    };
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[priority] || colors.medium}`}>{priority || 'Medium'}</span>;
  };

  const statsCards = [
    { title: "Total Tasks", value: stats.totalTasks, change: stats.totalTasks > 0 ? `+${stats.totalTasks}` : "0", icon: "📋", color: "blue" },
    { title: "Completed", value: stats.completedTasks, change: stats.completedTasks > 0 ? `+${stats.completedTasks}` : "0", icon: "✅", color: "green" },
    { title: "In Progress", value: stats.inProgressTasks, change: stats.inProgressTasks > 0 ? `${stats.inProgressTasks}` : "0", icon: "⚡", color: "yellow" },
    { title: "Active Teams", value: stats.activeTeams, change: stats.activeTeams > 0 ? `+${stats.activeTeams}` : "0", icon: "👥", color: "purple" },
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
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {user?.first_name || 'User'}! 👋
        </h1>
        <p className="text-sm md:text-base text-gray-500 mt-1">Here's what's happening with your projects today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-5 mb-6 md:mb-8">
        {statsCards.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 md:p-5 hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <span className="text-xl md:text-2xl">{stat.icon}</span>
              <span className={`text-xs md:text-sm font-semibold ${
                stat.change !== '0' ? 'text-green-600' : 'text-gray-400'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-xs md:text-sm text-gray-500 mt-1">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5 md:space-y-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Recent Activity</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="px-4 md:px-6 py-3 md:py-4 flex items-start gap-3 hover:bg-gray-50">
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs md:text-sm font-semibold text-white">
                      {activity.user.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm md:text-base text-gray-800">
                      <span className="font-semibold">{activity.user}</span> {activity.action}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                      <span className="text-xs text-gray-500">{activity.team}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">Quick Actions</h2>
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              <button 
                onClick={() => navigate('/tasks')}
                className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <span className="text-xl md:text-2xl">➕</span>
                <span className="text-xs md:text-sm font-medium text-gray-700">New Task</span>
              </button>
              <button 
                onClick={() => navigate('/teams')}
                className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <span className="text-xl md:text-2xl">👥</span>
                <span className="text-xs md:text-sm font-medium text-gray-700">Create Team</span>
              </button>
              <button 
                onClick={() => document.getElementById('file-upload')?.click()}
                className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <span className="text-xl md:text-2xl">📎</span>
                <span className="text-xs md:text-sm font-medium text-gray-700">Upload</span>
              </button>
              <button 
                onClick={() => navigate('/messages')}
                className="flex flex-col items-center gap-1 md:gap-2 p-2 md:p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <span className="text-xl md:text-2xl">💬</span>
                <span className="text-xs md:text-sm font-medium text-gray-700">Message</span>
              </button>
            </div>
            <input type="file" id="file-upload" className="hidden" />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5 md:space-y-6">
          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-100">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">Upcoming Deadlines</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingDeadlines.map((task) => (
                <div 
                  key={task._id} 
                  onClick={() => navigate(`/tasks`)}
                  className="px-4 md:px-6 py-3 md:py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm md:text-base text-gray-900">{task.title}</h3>
                    {getPriorityBadge(task.priority)}
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 mb-2">{task.teamID?.teamName || 'Team'}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">📅</span>
                    <span className="text-xs md:text-sm font-medium text-red-600">
                      {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No date'}
                    </span>
                  </div>
                </div>
              ))}
              {upcomingDeadlines.length === 0 && (
                <div className="px-4 md:px-6 py-8 text-center text-gray-500">
                  No upcoming deadlines
                </div>
              )}
            </div>
          </div>

          {/* Weekly Goal */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-6 border border-blue-100">
            <div className="flex items-center gap-2 md:gap-3 mb-2 md:mb-3">
              <span className="text-xl md:text-2xl">🎯</span>
              <h3 className="font-semibold text-gray-900">Weekly Goal</h3>
            </div>
            <p className="text-xs md:text-sm text-gray-600 mb-3">Complete your sprint tasks</p>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${stats.totalTasks > 0 ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-xs text-gray-500">{stats.completedTasks} of {stats.totalTasks} completed</p>
              <p className="text-xs font-medium text-blue-600">{stats.pendingTasks} tasks left</p>
            </div>
          </div>

          {/* Quick Tip */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">💡</span>
              <h3 className="font-semibold text-gray-900">Pro Tip</h3>
            </div>
            <p className="text-sm text-gray-600">
              Focus on high-priority tasks first. Use the task board to track your progress!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;