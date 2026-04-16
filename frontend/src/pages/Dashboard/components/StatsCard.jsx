import React from 'react';

/**
 * StatsCard Component
 * Displays a single statistics card with title, value, percentage change, and icon.
 * Used in the dashboard overview grid to show key metrics.
 * 
 * @param {Object} props
 * @param {string} props.title - Card title (e.g., "Total Tasks")
 * @param {number|string} props.value - Main value to display
 * @param {number} props.change - Percentage change (positive or negative)
 * @param {string} props.changeType - 'increase' or 'decrease'
 * @param {React.ReactNode} props.icon - Icon component or emoji
 * @param {string} props.iconColor - Tailwind color class for icon background
 * @param {number} props.delay - Animation delay in ms
 */
const StatsCard = ({ title, value, change, changeType, icon, iconColor, delay = 0 }) => {
  const isPositive = changeType === 'increase';
  const changeColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const changeIcon = isPositive ? '↑' : '↓';

  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-5 transition-all duration-300 hover:shadow-md animate-fadeInUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
          {change !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              <span className={`text-xs font-semibold ${changeColor}`}>
                {changeIcon} {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                vs last week
              </span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl md:text-2xl ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;