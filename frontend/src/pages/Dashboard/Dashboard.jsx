import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';
import StatsCard from './components/StatsCard';

const STAT_META = [
  { id: 1, title: 'Teams', key: 'teams', icon: 'T', iconColor: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
  { id: 2, title: 'Tasks', key: 'tasks', icon: '✓', iconColor: 'bg-violet-50 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400' },
  { id: 3, title: 'Completed', key: 'done', icon: 'C', iconColor: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { id: 4, title: 'In Progress', key: 'progress', icon: '…', iconColor: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [counts, setCounts] = useState({ teams: 0, tasks: 0, done: 0, progress: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const firstName = user?.firstName || user?.first_name || 'there';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [teamsRes, tasksRes] = await Promise.all([
        API.get('/teams'),
        API.get('/tasks'),
      ]);
      const teamList = teamsRes.data.data || [];
      const taskList = tasksRes.data.data || [];
      const done = taskList.filter((t) => t.status === 'done').length;
      const inProgress = taskList.filter((t) => t.status === 'inprogress').length;

      setTeams(teamList.slice(0, 4));
      setRecentTasks(taskList.slice(0, 5));
      setCounts({
        teams: teamList.length,
        tasks: taskList.length,
        done,
        progress: inProgress,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const longDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const shortDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  const priorityBadge = (priority) => {
    const p = String(priority || 'medium').toLowerCase();
    if (p === 'high') return 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    if (p === 'low') return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
    return 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
  };

  return (
    /* Layout already pads — avoid double padding */
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight break-words">
            {getGreeting()}, {firstName}!
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mt-1">
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end sm:flex-shrink-0">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            <span className="sm:hidden">{shortDate}</span>
            <span className="hidden sm:inline">{longDate}</span>
          </p>
          <div className="page-actions">
            <Link to="/teams" className="btn-secondary btn-responsive text-center">
              Teams
            </Link>
            <Link to="/tasks" className="btn-primary btn-responsive text-center">
              Tasks
            </Link>
          </div>
        </div>
      </header>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm break-words">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 sm:py-24">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats: 2×2 on mobile, 4 across on lg */}
          <section
            className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5"
            aria-label="Overview stats"
          >
            {STAT_META.map((stat, index) => (
              <StatsCard
                key={stat.id}
                title={stat.title}
                value={counts[stat.key]}
                icon={stat.icon}
                iconColor={stat.iconColor}
                delay={index * 40}
              />
            ))}
          </section>

          {/* Lists */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5 md:gap-6">
            {/* Teams */}
            <div
              className="rounded-xl border p-3.5 sm:p-5 flex flex-col min-h-0"
              style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
            >
              <div className="section-header !mb-3 sm:!mb-4">
                <h2 className="font-bold text-base sm:text-lg" style={{ color: theme.colors.text }}>
                  Your teams
                </h2>
                <Link to="/teams" className="btn-link self-start sm:self-auto -ml-2 sm:ml-0">
                  View all
                </Link>
              </div>

              {teams.length === 0 ? (
                <div className="flex flex-col items-start gap-3 py-2">
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    No teams yet.
                  </p>
                  <Link to="/teams" className="btn-primary btn-responsive">
                    Create a team
                  </Link>
                </div>
              ) : (
                <ul className="space-y-1 sm:space-y-2">
                  {teams.map((t) => (
                    <li key={t._id}>
                      <Link
                        to="/teams"
                        className="flex items-center gap-3 rounded-lg px-2 py-2.5 sm:py-2 -mx-1
                                   hover:bg-black/5 dark:hover:bg-white/5 transition-colors
                                   touch-manipulation min-h-[48px] sm:min-h-[44px]"
                      >
                        <div
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
                                     text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: t.color || '#3b82f6' }}
                        >
                          {t.icon || 'TM'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate" style={{ color: theme.colors.text }}>
                            {t.name}
                          </p>
                          <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>
                            {t.members?.length || 0} members
                          </p>
                        </div>
                        <svg className="w-4 h-4 flex-shrink-0 text-gray-400 dark:text-slate-500 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tasks */}
            <div
              className="rounded-xl border p-3.5 sm:p-5 flex flex-col min-h-0"
              style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
            >
              <div className="section-header !mb-3 sm:!mb-4">
                <h2 className="font-bold text-base sm:text-lg" style={{ color: theme.colors.text }}>
                  Recent tasks
                </h2>
                <Link to="/tasks" className="btn-link self-start sm:self-auto -ml-2 sm:ml-0">
                  View all
                </Link>
              </div>

              {recentTasks.length === 0 ? (
                <div className="flex flex-col items-start gap-3 py-2">
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    No tasks yet.
                  </p>
                  <Link to="/tasks" className="btn-primary btn-responsive">
                    Create a task
                  </Link>
                </div>
              ) : (
                <ul className="space-y-1 sm:space-y-2">
                  {recentTasks.map((t) => (
                    <li key={t._id}>
                      <Link
                        to="/tasks"
                        className="flex items-center gap-2 sm:gap-3 rounded-lg px-2 py-2.5 sm:py-2 -mx-1
                                   hover:bg-black/5 dark:hover:bg-white/5 transition-colors
                                   touch-manipulation min-h-[48px] sm:min-h-[44px]"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold truncate" style={{ color: theme.colors.text }}>
                            {t.title}
                          </p>
                          <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>
                            {t.team?.name || 'Team'} · {t.status}
                          </p>
                        </div>
                        <span
                          className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide
                                      px-2 py-1 rounded-md flex-shrink-0 ${priorityBadge(t.priority)}`}
                        >
                          {t.priority}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
