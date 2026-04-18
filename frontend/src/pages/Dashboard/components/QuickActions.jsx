
import React from 'react';

/**
 * QuickActions Component
 * Provides shortcut buttons for common user actions.
 * These buttons will trigger modals/dialogs that can be implemented later.
 * 
 * Actions include:
 * - Create new task
 * - Create new team
 * - Upload file
 * - Send message
 */
const QuickActions = () => {
  const actions = [
    {
      id: 'new-task',
      label: 'New Task',
      icon: '➕',
      color: 'bg-blue-500 hover:bg-blue-600',
      description: 'Create a new task',
    },
    {
      id: 'create-team',
      label: 'Create Team',
      icon: '👥',
      color: 'bg-purple-500 hover:bg-purple-600',
      description: 'Start a new team',
    },
    {
      id: 'upload-file',
      label: 'Upload File',
      icon: '📄',
      color: 'bg-green-500 hover:bg-green-600',
      description: 'Share resources',
    },
    {
      id: 'send-message',
      label: 'Send Message',
      icon: '💬',
      color: 'bg-orange-500 hover:bg-orange-600',
      description: 'Chat with team',
    },
  ];

  // Placeholder handlers (will be connected to actual functionality by another team member)
  const handleAction = (actionId) => {
    console.log(`Quick action triggered: ${actionId}`);
    // TODO: Integrate with dialog/modal system
    // This will be connected by the integration team
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Common tasks at your fingertips
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={() => handleAction(action.id)}
            className={`${action.color} text-white rounded-lg p-3 text-center transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5`}
            title={action.description}
          >
            <div className="text-xl mb-1">{action.icon}</div>
            <div className="text-xs font-medium">{action.label}</div>
          </button>
        ))}
      </div>

      {/* Recent Activity Shortcut */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">📅</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">View Calendar</span>
          </div>
          <span className="text-gray-400 dark:text-gray-500">→</span>
        </button>
        <button className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors mt-1">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 dark:text-gray-400">🏆</span>
            <span className="text-sm text-gray-700 dark:text-gray-300">My Achievements</span>
          </div>
          <span className="text-gray-400 dark:text-gray-500">→</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;