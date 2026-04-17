import React from 'react';

/**
 * UpcomingDeadlines Component
 * Displays a list of upcoming task deadlines with priority indicators.
 * Shows task name, team, due date, and priority badge.
 * 
 * @param {Object} props
 * @param {Array} props.deadlines - Array of deadline objects
 */
const UpcomingDeadlines = ({ deadlines }) => {
  // Helper to get priority badge styling
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-700 dark:text-red-400',
          label: 'High',
        };
      case 'medium':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-700 dark:text-yellow-400',
          label: 'Medium',
        };
      case 'low':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-700 dark:text-green-400',
          label: 'Low',
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-700',
          text: 'text-gray-700 dark:text-gray-400',
          label: priority,
        };
    }
  };

  // Helper to check if deadline is today
  const isToday = (dateString) => {
    const today = new Date().toDateString();
    const dueDate = new Date(dateString).toDateString();
    return today === dueDate;
  };

  // Helper to check if deadline is overdue
  const isOverdue = (dateString) => {
    const today = new Date();
    const dueDate = new Date(dateString);
    return dueDate < today && !isToday(dateString);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Deadlines
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tasks that need your attention
          </p>
        </div>
        <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
          View Calendar →
        </button>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {deadlines.map((deadline) => {
          const priorityBadge = getPriorityBadge(deadline.priority);
          const isDueToday = isToday(deadline.dueDate);
          const isOverdueTask = isOverdue(deadline.dueDate);

          return (
            <div
              key={deadline.id}
              className={`p-3 rounded-lg border transition-all hover:shadow-sm cursor-pointer ${
                isDueToday
                  ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10'
                  : isOverdueTask
                  ? 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-900/10'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 dark:text-white truncate">
                    {deadline.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {deadline.team}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityBadge.bg} ${priorityBadge.text}`}
                >
                  {priorityBadge.label}
                </span>
              </div>

              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-gray-500 dark:text-gray-400">📅</span>
                  <span
                    className={`${
                      isDueToday
                        ? 'text-red-600 dark:text-red-400 font-semibold'
                        : isOverdueTask
                        ? 'text-orange-600 dark:text-orange-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {isDueToday
                      ? 'Due today'
                      : isOverdueTask
                      ? `Overdue - ${deadline.dueDate}`
                      : deadline.dueDate}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {deadline.progress}% complete
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    deadline.progress >= 75
                      ? 'bg-green-500'
                      : deadline.progress >= 40
                      ? 'bg-blue-500'
                      : 'bg-yellow-500'
                  }`}
                  style={{ width: `${deadline.progress}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      {deadlines.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">No upcoming deadlines 🎉</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Enjoy some free time!</p>
        </div>
      )}
    </div>
  );
};

export default UpcomingDeadlines;