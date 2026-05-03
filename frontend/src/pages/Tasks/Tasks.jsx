// frontend/src/pages/Tasks/Tasks.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthGate from '../../hooks/useAuthGate';

const PRIORITY_STYLES = {
  high:   { bg: '#fef2f2', color: '#ef4444' },
  medium: { bg: '#fffbeb', color: '#f59e0b' },
  low:    { bg: '#ecfdf5', color: '#10b981' },
};

const COLUMNS = [
  { id: 'todo',       label: 'To Do',      dot: '#64748b' },
  { id: 'inprogress', label: 'In Progress', dot: '#3b82f6' },
  { id: 'done',       label: 'Done',        dot: '#10b981' },
];

const Tasks = () => {
  const { theme } = useTheme();
  const { gate, AuthGate } = useAuthGate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);
  const [activeColumn, setActiveColumn] = useState('todo');

  useEffect(() => {
    const mock = [
      { id: 1, title: 'Design System Documentation', status: 'todo',       priority: 'high',   team: 'UI/UX Team',    dueDate: '2024-04-10' },
      { id: 2, title: 'Set Up CI/CD Pipeline',        status: 'todo',       priority: 'medium', team: 'DevOps Team',   dueDate: '2024-04-14' },
      { id: 3, title: 'Write Unit Tests',              status: 'todo',       priority: 'low',    team: 'Backend Team',  dueDate: '2024-04-16' },
      { id: 4, title: 'API Integration',               status: 'inprogress', priority: 'high',   team: 'Backend Team',  dueDate: '2024-04-08' },
      { id: 5, title: 'Dashboard Redesign',            status: 'inprogress', priority: 'medium', team: 'UI/UX Team',    dueDate: '2024-04-09' },
      { id: 6, title: 'User Research Survey',          status: 'inprogress', priority: 'low',    team: 'Research Team', dueDate: '2024-04-11' },
      { id: 7, title: 'Project Setup',                 status: 'done',       priority: 'high',   team: 'All Teams',     dueDate: '2024-04-01' },
      { id: 8, title: 'Database Schema Design',        status: 'done',       priority: 'high',   team: 'Backend Team',  dueDate: '2024-04-02' },
      { id: 9, title: 'Wireframes',                    status: 'done',       priority: 'medium', team: 'UI/UX Team',    dueDate: '2024-04-03' },
    ];
    setTimeout(() => { setTasks(mock); setLoading(false); }, 600);
  }, []);

  const getByStatus = (s) => tasks.filter((t) => t.status === s);

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTask) {
      setTasks((prev) => prev.map((t) => t.id === draggedTask.id ? { ...t, status: newStatus } : t));
      setDraggedTask(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const TaskCard = ({ task }) => {
    const p = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.low;
    const isDone = task.status === 'done';
    return (
      <div
        draggable
        onDragStart={() => setDraggedTask(task)}
        className="rounded-lg p-3 mb-2 border cursor-grab active:cursor-grabbing transition-all hover:-translate-y-0.5 hover:shadow-sm"
        style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, opacity: isDone ? 0.65 : 1 }}
      >
        <p className={`text-sm font-semibold mb-1.5 ${isDone ? 'line-through' : ''}`} style={{ color: isDone ? theme.colors.textSecondary : theme.colors.text }}>
          {task.title}
        </p>
        {!isDone ? (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs truncate max-w-[60%]" style={{ color: theme.colors.textSecondary }}>{task.team}</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded uppercase" style={{ backgroundColor: p.bg, color: p.color }}>{task.priority}</span>
            </div>
            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Due: {task.dueDate}</p>
          </>
        ) : (
          <p className="text-xs font-semibold text-green-500">Completed</p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <AuthGate />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>Tasks</h1>
          <p className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>Organize and track your project tasks</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button className="px-3 py-2 rounded-lg text-sm border transition-colors hover:bg-gray-50" style={{ borderColor: theme.colors.border, color: theme.colors.text }}>Filter</button>
          <button
            onClick={() => gate('add a task', () => setShowCreateModal(true))}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Add Task
          </button>
        </div>
      </div>

      {/* Mobile column tabs */}
      <div className="flex rounded-lg overflow-hidden border md:hidden" style={{ borderColor: theme.colors.border }}>
        {COLUMNS.map((col) => (
          <button key={col.id} onClick={() => setActiveColumn(col.id)} className="flex-1 py-2 text-xs font-semibold transition-colors" style={{ backgroundColor: activeColumn === col.id ? theme.colors.primary : theme.colors.surface, color: activeColumn === col.id ? '#fff' : theme.colors.textSecondary }}>
            {col.label} ({getByStatus(col.id).length})
          </button>
        ))}
      </div>

      {/* Desktop kanban */}
      <div className="hidden md:grid md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => (
          <div key={col.id} className="rounded-xl p-4 border min-h-[400px]" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, col.id)}>
            <div className="flex items-center gap-2 mb-4">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: col.dot }} />
              <span className="text-sm font-bold" style={{ color: theme.colors.text }}>{col.label}</span>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: theme.colors.border, color: theme.colors.textSecondary }}>{getByStatus(col.id).length}</span>
            </div>
            {getByStatus(col.id).map((task) => <TaskCard key={task.id} task={task} />)}
          </div>
        ))}
      </div>

      {/* Mobile single column */}
      <div className="md:hidden rounded-xl p-4 border min-h-[300px]" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }} onDragOver={(e) => e.preventDefault()} onDrop={(e) => handleDrop(e, activeColumn)}>
        {getByStatus(activeColumn).length === 0
          ? <p className="text-center text-sm py-8" style={{ color: theme.colors.textSecondary }}>No tasks here</p>
          : getByStatus(activeColumn).map((task) => <TaskCard key={task.id} task={task} />)
        }
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-xl p-6 shadow-xl" style={{ backgroundColor: theme.colors.surface }}>
            <h2 className="text-lg font-bold mb-2" style={{ color: theme.colors.text }}>Create New Task</h2>
            <p className="text-sm mb-5" style={{ color: theme.colors.textSecondary }}>Task creation functionality will be implemented here.</p>
            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: theme.colors.primary }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
