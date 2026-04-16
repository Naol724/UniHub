
/**
 * Mock Data for Dashboard Components
 * 
 * This file contains mock data that simulates API responses.
 * When the backend API is ready, another team member will replace these
 * with actual API calls to fetch real user data, stats, activities, etc.
 * 
 * Structure matches expected API response format for easy integration.
 */

// Mock User Data
export const mockUserData = {
  id: 'user_123',
  firstName: 'Naol',
  lastName: 'Gonfa',
  email: 'naol.gonfa@university.edu',
  avatar: null, // Will be URL when implemented
  role: 'Computer Science Student',
  joinDate: '2024-01-15',
  teams: [
    {
      id: 'team_1',
      name: 'UI/UX Design Team',
      icon: '🎨',
      color: '#3B82F6',
      members: 4,
      tasks: 12,
      role: 'Member',
    },
    {
      id: 'team_2',
      name: 'Backend Development',
      icon: '⚙️',
      color: '#8B5CF6',
      members: 3,
      tasks: 18,
      role: 'Lead',
    },
    {
      id: 'team_3',
      name: 'Research Team',
      icon: '📊',
      color: '#10B981',
      members: 2,
      tasks: 6,
      role: 'Member',
    },
  ],
};

// Mock Stats Cards Data
export const mockStats = [
  {
    id: 1,
    title: 'Total Tasks',
    value: 24,
    change: 12,
    changeType: 'increase',
    icon: '📋',
    iconColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  },
  {
    id: 2,
    title: 'Completed',
    value: 18,
    change: 8,
    changeType: 'increase',
    icon: '✅',
    iconColor: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  },
  {
    id: 3,
    title: 'Active Teams',
    value: 5,
    change: 2,
    changeType: 'increase',
    icon: '👥',
    iconColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  },
  {
    id: 4,
    title: 'Pending',
    value: 6,
    change: 3,
    changeType: 'decrease',
    icon: '⏳',
    iconColor: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
  },
];

// Mock Activity Feed Data
export const mockActivities = [
  {
    id: 'act_1',
    userName: 'Naol Gonfa',
    userAvatar: null,
    action: 'completed task',
    target: 'Design System Review',
    timeAgo: '2 minutes ago',
    team: 'UI/UX Team',
    status: 'completed',
  },
  {
    id: 'act_2',
    userName: 'Asefa Niguse',
    userAvatar: null,
    action: 'commented on',
    target: 'API Integration',
    timeAgo: '15 minutes ago',
    team: 'Backend Team',
    status: 'in-progress',
  },
  {
    id: 'act_3',
    userName: 'Ermiyas Abebe',
    userAvatar: null,
    action: 'uploaded',
    target: 'Project_Specs.pdf',
    timeAgo: '1 hour ago',
    team: 'Research Team',
    status: null,
  },
  {
    id: 'act_4',
    userName: 'Tola Fayisa',
    userAvatar: null,
    action: 'created new team',
    target: 'Mobile Development',
    timeAgo: '2 hours ago',
    team: null,
    status: 'new',
  },
  {
    id: 'act_5',
    userName: 'Yerosan Milkessa',
    userAvatar: null,
    action: 'assigned task',
    target: 'Database Schema Design',
    timeAgo: '3 hours ago',
    team: 'Backend Team',
    status: 'new',
  },
  {
    id: 'act_6',
    userName: 'Abdisa Jemal',
    userAvatar: null,
    action: 'completed task',
    target: 'Wireframe Review',
    timeAgo: '5 hours ago',
    team: 'UI/UX Team',
    status: 'completed',
  },
];

// Mock Deadlines Data
export const mockDeadlines = [
  {
    id: 'dl_1',
    title: 'Database Schema Design',
    team: 'Backend Team',
    dueDate: '2026-04-12',
    priority: 'high',
    progress: 85,
  },
  {
    id: 'dl_2',
    title: 'User Testing Report',
    team: 'UI/UX Team',
    dueDate: '2026-04-13',
    priority: 'medium',
    progress: 45,
  },
  {
    id: 'dl_3',
    title: 'Final Presentation Prep',
    team: 'Research Team',
    dueDate: '2026-04-14',
    priority: 'high',
    progress: 30,
  },
  {
    id: 'dl_4',
    title: 'API Documentation',
    team: 'Backend Team',
    dueDate: '2026-04-16',
    priority: 'low',
    progress: 60,
  },
  {
    id: 'dl_5',
    title: 'Mobile App Prototype',
    team: 'Mobile Team',
    dueDate: '2026-04-18',
    priority: 'medium',
    progress: 25,
  },
];

// Mock Chart Data (Team-wise task completion)
export const mockChartData = {
  labels: ['UI/UX', 'Backend', 'Research', 'Mobile', 'DevOps'],
  completed: [8, 14, 4, 9, 7],
  total: [12, 18, 6, 15, 8],
};