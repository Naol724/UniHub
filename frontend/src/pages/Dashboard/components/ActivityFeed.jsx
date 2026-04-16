import React from 'react';

/**
 * ActivityFeed Component
 * Displays a chronological list of recent team activities.
 * Shows user avatars, action descriptions, timestamps, and team badges.
 * 
 * @param {Object} props
 * @param {Array} props.activities - Array of activity objects
 * @param {boolean} props.isLoading - Loading state for skeleton UI
 */
const ActivityFeed = ({ activities, isLoading = false }) => {
  // Helper to get avatar initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper to get random pastel color based on name (consistent per user)
  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-purple-100 text-purple-700',
      'bg-green-100 text-green-700',
      'bg-yellow-100 text-yellow-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                <div className="h-3 w-1/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Latest updates from your teams
          </p>
        </div>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          View All →
        </button>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {activity.userAvatar ? (
                <img
                  src={activity.userAvatar}
                  alt={activity.userName}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold ${getAvatarColor(activity.userName)}`}
                >
                  {getInitials(activity.userName)}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                <span className="font-semibold">{activity.userName}</span>
                {' '}{activity.action}{' '}
                {activity.target && (
                  <span className="font-medium text-gray-900 dark:text-white">
                    {activity.target}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {activity.timeAgo}
                </span>
                {activity.team && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {activity.team}
                  </span>
                )}
              </div>
            </div>

            {/* Optional badge for task status */}
            {activity.status && (
              <div className="flex-shrink-0">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : activity.status === 'in-progress'
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}
                >
                  {activity.status === 'completed' && '✓ Completed'}
                  {activity.status === 'in-progress' && '⟳ In Progress'}
                  {activity.status === 'new' && '✨ New'}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityFeed;