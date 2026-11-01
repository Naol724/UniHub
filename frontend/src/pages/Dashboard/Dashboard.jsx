import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';
import StatsCard from './components/StatsCard';

const STAT_META = [
  { id: 1, title: 'Teams', key: 'teams', icon: 'T', iconColor: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300', to: '/teams' },
  { id: 2, title: 'Tasks', key: 'tasks', icon: '✓', iconColor: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300', to: '/tasks' },
  { id: 3, title: 'Completed', key: 'done', icon: 'C', iconColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300', to: '/tasks' },
  { id: 4, title: 'Due soon', key: 'dueSoon', icon: '!', iconColor: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', to: '/tasks' },
];

const QUICK_ACTIONS = [
  { id: 'teams', label: 'Create team', to: '/teams', hint: 'Start a new group' },
  { id: 'tasks', label: 'Add task', to: '/tasks', hint: 'Assign work' },
  { id: 'resources', label: 'Upload file', to: '/resources', hint: 'Share a resource' },
  { id: 'messages', label: 'Open messages', to: '/messages', hint: 'Team notes' },
];

const progressForStatus = (status) => {
  const map = { todo: 0, inprogress: 50, done: 100 };
  return map[String(status || '').toLowerCase()] ?? 0;
};

const formatDue = (dateString) => {
  if (!dateString) return 'No date';
  const due = new Date(dateString);
  const today = new Date();
  const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((startDue - startToday) / 86400000);
  if (diffDays < 0) return `Overdue · ${due.toLocaleDateString()}`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  return due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const Dashboard = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [counts, setCounts] = useState({ teams: 0, tasks: 0, done: 0, dueSoon: 0 });
  const [recentTasks, setRecentTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [teamProgress, setTeamProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

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
      const [teamsRes, tasksRes, notifRes] = await Promise.all([
        API.get('/teams'),
        API.get('/tasks'),
        API.get('/notifications').catch(() => ({ data: { data: [] } })),
      ]);

      const teamList = teamsRes.data.data || [];
      const taskList = tasksRes.data.data || [];
      const notifList = notifRes.data.data || [];

      const now = new Date();
      const weekOut = new Date(now.getTime() + 7 * 86400000);
      const done = taskList.filter((t) => t.status === 'done').length;
      const dueSoon = taskList.filter((t) => {
        if (!t.dueDate || t.status === 'done') return false;
        const d = new Date(t.dueDate);
        return d <= weekOut;
      }).length;

      const upcoming = [...taskList]
        .filter((t) => t.dueDate && t.status !== 'done')
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5)
        .map((t) => ({
          id: t._id,
          title: t.title,
          team: t.team?.name || 'Team',
          dueDate: t.dueDate,
          priority: String(t.priority || 'medium').toLowerCase(),
          progress: progressForStatus(t.status),
          status: t.status,
        }));

      const progressRows = teamList.slice(0, 5).map((team) => {
        const teamTasks = taskList.filter(
          (t) => String(t.team?._id || t.team) === String(team._id)
        );
        const completed = teamTasks.filter((t) => t.status === 'done').length;
        const total = teamTasks.length;
        return {
          id: team._id,
          name: team.name,
          completed,
          total,
          pct: total ? Math.round((completed / total) * 100) : 0,
        };
      });

      setTeams(teamList.slice(0, 4));
      setRecentTasks(
        [...taskList]
          .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
          .slice(0, 5)
      );
      setDeadlines(upcoming);
      setNotifications(notifList.slice(0, 5));
      setTeamProgress(progressRows);
      setCounts({
        teams: teamList.length,
        tasks: taskList.length,
        done,
        dueSoon,
      });
    } catch (err) {
      const status = err.response?.status;
      const apiMsg = err.response?.data?.message;
      if (!err.response) {
        setError('Cannot reach the API. Make sure the backend is running on port 5000.');
      } else if (status === 401 || status === 403) {
        setError(apiMsg || 'Session expired. Please sign in again.');
      } else {
        setError(apiMsg || 'Failed to load dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const advanceTask = async (task) => {
    const next =
      task.status === 'todo' ? 'inprogress' : task.status === 'inprogress' ? 'done' : null;
    if (!next) return;
    try {
      setUpdatingId(task._id);
      await API.put(`/tasks/${task._id}/status`, { status: next });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update task');
    } finally {
      setUpdatingId(null);
    }
  };

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
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8">
      <header className="flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white leading-tight break-words">
            {getGreeting()}, {firstName}!
          </h1>
          <p className="text-sm sm:text-base text-gray-500 dark:text-slate-400 mt-1">
            Your live overview of teams, deadlines, and progress.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end sm:flex-shrink-0">
          <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
            <span className="sm:hidden">{shortDate}</span>
            <span className="hidden sm:inline">{longDate}</span>
          </p>
          <div className="page-actions">
            <button type="button" onClick={load} className="btn-secondary btn-responsive" disabled={loading}>
              Refresh
            </button>
            <Link to="/tasks" className="btn-primary btn-responsive text-center">
              Tasks
            </Link>
          </div>
        </div>
      </header>

      {error && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm break-words flex flex-wrap items-center justify-between gap-2">
          <span>{error}</span>
          <button type="button" onClick={load} className="btn-link">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16 sm:py-24">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5" aria-label="Overview stats">
            {STAT_META.map((stat, index) => (
              <Link key={stat.id} to={stat.to} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 rounded-xl">
                <StatsCard
                  title={stat.title}
                  value={counts[stat.key]}
                  icon={stat.icon}
                  iconColor={stat.iconColor}
                  delay={index * 40}
                />
              </Link>
            ))}
          </section>

          <section className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3" aria-label="Quick actions">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.id}
                to={action.to}
                className="rounded-xl border px-3 py-3 sm:px-4 sm:py-3.5 min-h-[72px]
                           hover:border-teal-400/60 dark:hover:border-teal-500/50 transition-colors
                           touch-manipulation"
                style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
              >
                <p className="text-sm font-semibold" style={{ color: theme.colors.text }}>{action.label}</p>
                <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{action.hint}</p>
              </Link>
            ))}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5 md:gap-6">
            <div
              className="rounded-xl border p-3.5 sm:p-5 flex flex-col min-h-0"
              style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
            >
              <div className="section-header !mb-3 sm:!mb-4">
                <h2 className="font-bold text-base sm:text-lg" style={{ color: theme.colors.text }}>
                  Upcoming deadlines
                </h2>
                <Link to="/tasks" className="btn-link self-start sm:self-auto -ml-2 sm:ml-0">
                  View tasks
                </Link>
              </div>
              {deadlines.length === 0 ? (
                <p className="text-sm py-2" style={{ color: theme.colors.textSecondary }}>
                  No upcoming deadlines. You&apos;re clear for now.
                </p>
              ) : (
                <ul className="space-y-2">
                  {deadlines.map((d) => (
                    <li key={d.id}>
                      <Link
                        to="/tasks"
                        className="block rounded-lg border px-3 py-2.5 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                        style={{ borderColor: theme.colors.border }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: theme.colors.text }}>
                              {d.title}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                              {d.team} · {formatDue(d.dueDate)}
                            </p>
                          </div>
                          <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-md ${priorityBadge(d.priority)}`}>
                            {d.priority}
                          </span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-teal-500 transition-all"
                            style={{ width: `${d.progress}%` }}
                          />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div
              className="rounded-xl border p-3.5 sm:p-5 flex flex-col min-h-0"
              style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
            >
              <div className="section-header !mb-3 sm:!mb-4">
                <h2 className="font-bold text-base sm:text-lg" style={{ color: theme.colors.text }}>
                  Team progress
                </h2>
                <Link to="/teams" className="btn-link self-start sm:self-auto -ml-2 sm:ml-0">
                  View teams
                </Link>
              </div>
              {teamProgress.length === 0 ? (
                <div className="flex flex-col items-start gap-3 py-2">
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                    Join or create a team to see progress.
                  </p>
                  <Link to="/teams" className="btn-primary btn-responsive">Create a team</Link>
                </div>
              ) : (
                <ul className="space-y-3">
                  {teamProgress.map((row) => (
                    <li key={row.id}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-sm font-medium truncate" style={{ color: theme.colors.text }}>{row.name}</p>
                        <span className="text-xs tabular-nums" style={{ color: theme.colors.textSecondary }}>
                          {row.completed}/{row.total} · {row.pct}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-teal-500"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5 md:gap-6">
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
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>No teams yet.</p>
                  <Link to="/teams" className="btn-primary btn-responsive">Create a team</Link>
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
                          style={{ backgroundColor: t.color || '#0f766e' }}
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
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

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
                  <p className="text-sm" style={{ color: theme.colors.textSecondary }}>No tasks yet.</p>
                  <Link to="/tasks" className="btn-primary btn-responsive">Create a task</Link>
                </div>
              ) : (
                <ul className="space-y-1 sm:space-y-2">
                  {recentTasks.map((t) => (
                    <li key={t._id} className="flex items-center gap-2">
                      <Link
                        to="/tasks"
                        className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 rounded-lg px-2 py-2.5 sm:py-2 -mx-1
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
                        <span className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide px-2 py-1 rounded-md flex-shrink-0 ${priorityBadge(t.priority)}`}>
                          {t.priority}
                        </span>
                      </Link>
                      {t.status !== 'done' && (
                        <button
                          type="button"
                          className="btn-secondary !min-h-[40px] !px-2.5 text-xs flex-shrink-0"
                          disabled={updatingId === t._id}
                          onClick={() => advanceTask(t)}
                          title={t.status === 'todo' ? 'Start task' : 'Mark done'}
                        >
                          {updatingId === t._id ? '…' : t.status === 'todo' ? 'Start' : 'Done'}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section
            className="rounded-xl border p-3.5 sm:p-5"
            style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
          >
            <div className="section-header !mb-3 sm:!mb-4">
              <h2 className="font-bold text-base sm:text-lg" style={{ color: theme.colors.text }}>
                Latest notifications
              </h2>
              <Link to="/notifications" className="btn-link self-start sm:self-auto -ml-2 sm:ml-0">
                View all
              </Link>
            </div>
            {notifications.length === 0 ? (
              <p className="text-sm" style={{ color: theme.colors.textSecondary }}>
                No notifications yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {notifications.map((n) => (
                  <li key={n._id}>
                    <Link
                      to="/notifications"
                      className="flex items-start gap-3 rounded-lg px-2 py-2 -mx-1 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <span
                        className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                          n.isRead ? 'bg-gray-300 dark:bg-slate-600' : 'bg-teal-500'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: theme.colors.text }}>
                          {n.title || n.message || 'Notification'}
                        </p>
                        <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>
                          {n.message && n.title ? n.message : (n.createdAt ? new Date(n.createdAt).toLocaleString() : '')}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
