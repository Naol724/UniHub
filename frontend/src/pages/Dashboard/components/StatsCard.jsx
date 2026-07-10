import React from 'react';

/**
 * Mobile-first stats card
 * Compact on phones, roomier from sm+
 */
const StatsCard = ({ title, value, change, changeType, icon, iconColor, delay = 0 }) => {
  const isPositive = changeType === 'increase';
  const changeColor = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const changeIcon = isPositive ? '↑' : '↓';
  const showChange = change !== undefined && change !== '' && change !== null;

  return (
    <div
      className="bg-white dark:bg-slate-800/80 rounded-xl border border-gray-200 dark:border-slate-700
                 p-3 sm:p-4 md:p-5
                 transition-all duration-300 hover:shadow-md animate-fadeInUp
                 min-h-[88px] sm:min-h-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between gap-2 h-full">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400 truncate">
            {title}
          </p>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mt-0.5 sm:mt-1 tabular-nums">
            {value}
          </p>
          {showChange && (
            <div className="hidden sm:flex items-center gap-1 mt-2">
              <span className={`text-xs font-semibold ${changeColor}`}>
                {changeIcon} {Math.abs(change)}%
              </span>
              <span className="text-xs text-gray-500 dark:text-slate-400">
                vs last week
              </span>
            </div>
          )}
        </div>
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg sm:rounded-xl
                      flex items-center justify-center text-base sm:text-xl md:text-2xl
                      flex-shrink-0 ${iconColor}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
