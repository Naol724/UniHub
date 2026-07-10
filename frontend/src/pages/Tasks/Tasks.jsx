import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';

const COLUMNS = [
  { id: 'todo', label: 'To Do', short: 'To Do', dot: '#64748b' },
  { id: 'inprogress', label: 'In Progress', short: 'Doing', dot: '#3b82f6' },
  { id: 'done', label: 'Done', short: 'Done', dot: '#10b981' },
];

const priorityStyle = (priority, isDark) => {
  const map = {
    high: isDark
      ? { bg: 'rgba(248,113,113,0.15)', color: '#f87171' }
      : { bg: '#fef2f2', color: '#ef4444' },
    medium: isDark
      ? { bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' }
      : { bg: '#fffbeb', color: '#f59e0b' },
    low: isDark
      ? { bg: 'rgba(52,211,153,0.15)', color: '#34d399' }
      : { bg: '#ecfdf5', color: '#10b981' },
  };
  return map[priority] || map.low;
};

const Tasks = () => {
  const { theme, isDark } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);
  const [movingId, setMovingId] = useState(null);
  const [activeColumn, setActiveColumn] = useState('todo');
  const [form, setForm] = useState({ title: '', description: '', teamId: '', priority: 'medium', dueDate: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [tasksRes, teamsRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/teams'),
      ]);
      setTasks(tasksRes.data.data || []);
      setTeams(teamsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getByStatus = (s) => tasks.filter((t) => t.status === s);

  const moveTask = async (task, newStatus) => {
    if (!task || task.status === newStatus) return;
    const id = task._id;
    const prevStatus = task.status;

    setMovingId(id);
    setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t)));
    setActiveColumn(newStatus);

    try {
      await API.put(`/tasks/${id}/status`, { status: newStatus });
    } catch (err) {
      setTasks((prev) => prev.map((t) => (t._id === id ? { ...t, status: prevStatus } : t)));
      setError(err.response?.data?.message || 'Failed to move task');
    } finally {
      setMovingId(null);
    }
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTarget(null);
    if (!draggedTask) return;
    await moveTask(draggedTask, newStatus);
    setDraggedTask(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.teamId) {
      setError('Title and team are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await API.post('/tasks', {
        title: form.title.trim(),
        description: form.description.trim(),
        teamId: form.teamId,
        priority: form.priority,
        dueDate: form.dueDate || undefined,
      });
      setShowCreateModal(false);
      setForm({ title: '', description: '', teamId: '', priority: 'medium', dueDate: '' });
      setActiveColumn('todo');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TaskCard = ({ task, compact = false }) => {
    const p = priorityStyle(task.priority, isDark);
    const isDone = task.status === 'done';
    const teamName = task.team?.name || 'Team';
    const due = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date';
    const isMoving = movingId === task._id;
    const otherStatuses = COLUMNS.filter((c) => c.id !== task.status);

    return (
      <div
        draggable={!isMoving}
        onDragStart={(e) => {
          setDraggedTask(task);
          e.dataTransfer.effectAllowed = 'move';
          e.dataTransfer.setData('text/plain', task._id);
        }}
        onDragEnd={() => {
          setDraggedTask(null);
          setDropTarget(null);
        }}
        className={`rounded-xl p-3 mb-2 border transition-all ${
          isMoving ? 'opacity-50' : 'hover:-translate-y-0.5 hover:shadow-sm'
        } ${draggedTask?._id === task._id ? 'opacity-60 ring-2 ring-blue-400' : ''} cursor-grab active:cursor-grabbing`}
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          opacity: isDone && !isMoving ? 0.75 : undefined,
        }}
      >
        <p
          className={`text-sm font-semibold mb-1.5 ${isDone ? 'line-through' : ''}`}
          style={{ color: isDone ? theme.colors.textSecondary : theme.colors.text }}
        >
          {task.title}
        </p>
        {!compact && task.description ? (
          <p className="text-xs mb-2 line-clamp-2" style={{ color: theme.colors.textSecondary }}>
            {task.description}
          </p>
        ) : null}
        <div className="flex items-center justify-between mb-2 gap-2">
          <span className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>{teamName}</span>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded uppercase flex-shrink-0" style={{ backgroundColor: p.bg, color: p.color }}>
            {task.priority}
          </span>
        </div>
        <p className="text-xs mb-3" style={{ color: theme.colors.textSecondary }}>Due: {due}</p>

        {/* Move controls — works on mobile & desktop */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t" style={{ borderColor: theme.colors.border }}>
          <span className="text-[10px] uppercase tracking-wide self-center mr-1" style={{ color: theme.colors.textSecondary }}>
            Move
          </span>
          {otherStatuses.map((col) => (
            <button
              key={col.id}
              type="button"
              disabled={isMoving}
              onClick={(e) => {
                e.stopPropagation();
                moveTask(task, col.id);
              }}
              className="min-h-[36px] px-2.5 py-1 rounded-md text-xs font-semibold touch-manipulation disabled:opacity-50 transition-colors"
              style={{
                backgroundColor: `${col.dot}22`,
                color: col.dot,
                border: `1px solid ${col.dot}55`,
              }}
            >
              {col.short}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const ColumnDropZone = ({ col, children, className = '' }) => {
    const isOver = dropTarget === col.id && draggedTask && draggedTask.status !== col.id;
    return (
      <div
        className={`${className} rounded-xl border p-3 transition-colors ${isOver ? 'ring-2 ring-blue-400' : ''}`}
        style={{
          backgroundColor: isOver ? `${theme.colors.primary}15` : theme.colors.background,
          borderColor: isOver ? theme.colors.primary : theme.colors.border,
          minHeight: 280,
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDropTarget(col.id);
        }}
        onDragLeave={() => setDropTarget((t) => (t === col.id ? null : t))}
        onDrop={(e) => handleDrop(e, col.id)}
      >
        {children}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>Tasks</h1>
          <p className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>
            Drag cards or tap Move to change status
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            onClick={() => { setError(''); setShowCreateModal(true); }}
            disabled={teams.length === 0}
            className="btn-primary btn-responsive disabled:opacity-50"
          >
            New Task
          </button>
        </div>
      </div>

      {error && !showCreateModal && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">{error}</div>
      )}
      {teams.length === 0 && (
        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 text-sm">
          Join or create a team before adding tasks.
        </div>
      )}

      {/* Desktop Kanban */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const list = getByStatus(col.id);
          return (
            <ColumnDropZone key={col.id} col={col}>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.dot }} />
                <h3 className="text-sm font-bold" style={{ color: theme.colors.text }}>{col.label}</h3>
                <span className="text-xs ml-auto font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.colors.surface, color: theme.colors.textSecondary }}>
                  {list.length}
                </span>
              </div>
              {list.length === 0 ? (
                <p className="text-xs text-center py-8" style={{ color: theme.colors.textSecondary }}>
                  {draggedTask ? 'Drop here' : 'No tasks'}
                </p>
              ) : (
                list.map((t) => <TaskCard key={t._id} task={t} />)
              )}
            </ColumnDropZone>
          );
        })}
      </div>

      {/* Mobile: status tabs + list + move buttons */}
      <div className="md:hidden space-y-3">
        <div className="grid grid-cols-3 gap-2">
          {COLUMNS.map((col) => {
            const active = activeColumn === col.id;
            const canDrop = draggedTask && draggedTask.status !== col.id;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setActiveColumn(col.id)}
                onDragOver={(e) => {
                  if (!canDrop) return;
                  e.preventDefault();
                  setDropTarget(col.id);
                }}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`min-h-[48px] px-2 py-2 rounded-xl text-xs font-semibold touch-manipulation transition-all ${
                  dropTarget === col.id && canDrop ? 'ring-2 ring-blue-400 scale-[1.02]' : ''
                }`}
                style={{
                  backgroundColor: active ? theme.colors.primary : theme.colors.surface,
                  color: active ? '#fff' : theme.colors.text,
                  border: `1px solid ${active ? theme.colors.primary : theme.colors.border}`,
                }}
              >
                <span className="block">{col.short}</span>
                <span className="block opacity-80 font-normal">({getByStatus(col.id).length})</span>
              </button>
            );
          })}
        </div>

        <div
          className="rounded-xl border p-3 min-h-[200px]"
          style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => handleDrop(e, activeColumn)}
        >
          {getByStatus(activeColumn).length === 0 ? (
            <p className="text-sm text-center py-10" style={{ color: theme.colors.textSecondary }}>
              No tasks in {COLUMNS.find((c) => c.id === activeColumn)?.label}. Use Move on a card to bring one here.
            </p>
          ) : (
            getByStatus(activeColumn).map((t) => <TaskCard key={t._id} task={t} />)
          )}
        </div>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-xl p-6 shadow-xl space-y-3"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <h2 className="text-lg font-bold" style={{ color: theme.colors.text }}>Create Task</h2>
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <input
              className="w-full min-h-[44px] px-3 py-2 rounded-lg border text-sm"
              style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
            />
            <textarea
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
              placeholder="Description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <select
              className="w-full min-h-[44px] px-3 py-2 rounded-lg border text-sm"
              style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
              value={form.teamId}
              onChange={(e) => setForm((p) => ({ ...p, teamId: e.target.value }))}
              required
            >
              <option value="">Select team</option>
              {teams.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <select
                className="min-h-[44px] px-3 py-2 rounded-lg border text-sm"
                style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <input
                type="date"
                className="min-h-[44px] px-3 py-2 rounded-lg border text-sm"
                style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
                value={form.dueDate}
                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
              />
            </div>
            <div className="btn-group pt-2">
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary btn-responsive">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary btn-responsive">
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Tasks;
