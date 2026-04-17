
import React, { useState, useEffect } from 'react';
import StatsCard from './components/StatsCard';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import UpcomingDeadlines from './components/UpcomingDeadlines';
import ProgressChart from './components/ProgressChart';
import { mockUserData, mockStats, mockActivities, mockDeadlines, mockChartData } from './mockData';

const Dashboard = () => {
  // State for user data (will be replaced by API call later)
  const [user, setUser] = useState(mockUserData);
  const [stats, setStats] = useState(mockStats);
  const [activities, setActivities] = useState(mockActivities);
  const [deadlines, setDeadlines] = useState(mockDeadlines);
  const [chartData, setChartData] = useState(mockChartData);

  // Simulate loading state (for future API integration)
  const [isLoading, setIsLoading] = useState(false);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Header Section with Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {getGreeting()}, {user.firstName}! 👋
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Here's what's happening with your projects today.
          </p>
        </div>
        
        {/* Date Display */}
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <StatsCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            iconColor={stat.iconColor}
            delay={index * 100}
          />
        ))}
      </div>

      {/* Main Content Grid: 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column: Activity Feed + Progress Chart (2/3 width on desktop) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Chart Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Task Progress Overview
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Track your team's task completion across all projects
                </p>
              </div>
              <select className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
            <ProgressChart data={chartData} />
          </div>

          {/* Activity Feed */}
          <ActivityFeed activities={activities} isLoading={isLoading} />
        </div>

        {/* Right Column: Quick Actions + Upcoming Deadlines (1/3 width on desktop) */}
        <div className="space-y-6">
          <QuickActions />
          <UpcomingDeadlines deadlines={deadlines} />
        </div>
      </div>

      {/* Recent Teams Section - Optional but adds value */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Active Teams
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Teams you're currently collaborating with
            </p>
          </div>
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user.teams.map((team) => (
            <div
              key={team.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                style={{ backgroundColor: team.color }}
              >
                {team.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {team.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {team.members} members • {team.tasks} tasks
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;