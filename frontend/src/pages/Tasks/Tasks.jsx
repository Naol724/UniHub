// frontend/src/pages/Tasks/Tasks.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/Button';

const Tasks = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [draggedTask, setDraggedTask] = useState(null);

  // Mock tasks data - replace with API call
  useEffect(() => {
    const mockTasks = [
      // To Do Tasks
      {
        id: 1,
        title: 'Design System Documentation',
        description: 'Create comprehensive documentation for the design system',
        status: 'todo',
        priority: 'high',
        team: 'UI/UX Team',
        dueDate: '2024-04-10',
        assignee: { id: 1, name: 'Naol Gonfa', initials: 'NG' }
      },
      {
        id: 2,
        title: 'Set Up CI/CD Pipeline',
        description: 'Configure continuous integration and deployment',
        status: 'todo',
        priority: 'medium',
        team: 'DevOps Team',
        dueDate: '2024-04-14',
        assignee: { id: 2, name: 'Alemayehu Niguse', initials: 'AN' }
      },
      {
        id: 3,
        title: 'Write Unit Tests',
        description: 'Create unit tests for authentication module',
        status: 'todo',
        priority: 'low',
        team: 'Backend Team',
        dueDate: '2024-04-16',
        assignee: { id: 3, name: 'Yisiyaq Gezehany', initials: 'YG' }
      },

      // In Progress Tasks
      {
        id: 4,
        title: 'API Integration',
        description: 'Integrate frontend with backend APIs',
        status: 'inprogress',
        priority: 'high',
        team: 'Backend Team',
        dueDate: '2024-04-08',
        assignee: { id: 4, name: 'Asefa Niguse', initials: 'AN' }
      },
      {
        id: 5,
        title: 'Dashboard Redesign',
        description: 'Redesign dashboard with new layout and components',
        status: 'inprogress',
        priority: 'medium',
        team: 'UI/UX Team',
        dueDate: '2024-04-09',
        assignee: { id: 5, name: 'Ermiyas Abebe', initials: 'EA' }
      },
      {
        id: 6,
        title: 'User Research Survey',
        description: 'Conduct user research survey and analyze results',
        status: 'inprogress',
        priority: 'low',
        team: 'Research Team',
        dueDate: '2024-04-11',
        assignee: { id: 6, name: 'Mekonnen Niguse', initials: 'MN' }
      },

      // Done Tasks
      {
        id: 7,
        title: 'Project Setup',
        description: 'Initial project setup and configuration',
        status: 'done',
        priority: 'high',
        team: 'All Teams',
        dueDate: '2024-04-01',
        assignee: { id: 7, name: 'Tola Fayisa', initials: 'TF' }
      },
      {
        id: 8,
        title: 'Database Schema Design',
        description: 'Design database schema for all modules',
        status: 'done',
        priority: 'high',
        team: 'Backend Team',
        dueDate: '2024-04-02',
        assignee: { id: 8, name: 'Fikru Bekele', initials: 'FB' }
      },
      {
        id: 9,
        title: 'Wireframes',
        description: 'Create wireframes for all pages',
        status: 'done',
        priority: 'medium',
        team: 'UI/UX Team',
        dueDate: '2024-04-03',
        assignee: { id: 9, name: 'Mahlet Ibrahim', initials: 'MI' }
      }
    ];

    setTimeout(() => {
      setTasks(mockTasks);
      setLoading(false);
    }, 1000);
  }, []);

  const pageStyles = {
    padding: '20px',
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    minHeight: '100vh'
  };

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px'
  };

  const titleStyles = {
    fontSize: '28px',
    fontWeight: '700',
    color: theme.colors.text,
    margin: '0 0 8px 0'
  };

  const subtitleStyles = {
    fontSize: '16px',
    color: theme.colors.textSecondary,
    margin: '0'
  };

  const kanbanStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    minHeight: '600px'
  };

  const columnStyles = {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column'
  };

  const columnHeaderStyles = (color) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '16px',
    fontSize: '14px',
    fontWeight: '700',
    color: theme.colors.text
  });

  const columnDotStyles = (color) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: color
  });

  const taskCountStyles = {
    backgroundColor: theme.colors.border,
    color: theme.colors.textSecondary,
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '12px',
    marginLeft: 'auto'
  };

  const taskCardStyles = (isDragging) => ({
    backgroundColor: theme.colors.surface,
    border: isDragging ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.border}`,
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '8px',
    cursor: 'grab',
    opacity: isDragging ? 0.5 : 1,
    transition: 'all 0.2s ease',
    borderLeft: isDragging ? `4px solid ${theme.colors.primary}` : 'none'
  });

  const taskTitleStyles = {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: '4px'
  };

  const taskMetaStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '10px',
    color: theme.colors.textSecondary,
    marginBottom: '4px'
  };

  const priorityStyles = (priority) => {
    const colors = {
      high: { bg: '#fef2f2', color: '#ef4444' },
      medium: { bg: '#fffbeb', color: '#f59e0b' },
      low: { bg: '#ecfdf5', color: '#10b981' }
    };
    return {
      backgroundColor: colors[priority]?.bg || colors.low.bg,
      color: colors[priority]?.color || colors.low.color,
      padding: '2px 6px',
      borderRadius: '4px',
      fontSize: '8px',
      fontWeight: '600',
      textTransform: 'uppercase'
    };
  };

  const dueDateStyles = {
    fontSize: '9px',
    color: theme.colors.textSecondary,
    marginTop: '4px'
  };

  const doneTaskStyles = {
    ...taskCardStyles(),
    opacity: 0.65
  };

  const doneTaskTitleStyles = {
    ...taskTitleStyles,
    textDecoration: 'line-through',
    color: theme.colors.textSecondary
  };

  const completedBadgeStyles = {
    fontSize: '9px',
    color: theme.colors.success,
    fontWeight: '600',
    marginTop: '4px'
  };

  // Drag and drop handlers
  const handleDragStart = (task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTask) {
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === draggedTask.id ? { ...task, status: newStatus } : task
        )
      );
      setDraggedTask(null);
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  if (loading) {
    return (
      <div style={pageStyles}>
        <div style={{ textAlign: 'center', padding: '100px 0' }}>
          <div>Loading tasks...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyles}>
      {/* Header */}
      <div style={headerStyles}>
        <div>
          <h1 style={titleStyles}>Tasks</h1>
          <p style={subtitleStyles}>Organize and track your project tasks</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            style={{
              backgroundColor: 'transparent',
              color: theme.colors.text,
              border: `1px solid ${theme.colors.border}`,
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Filter
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            style={{
              backgroundColor: theme.colors.primary,
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            + Add Task
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div style={kanbanStyles}>
        {/* To Do Column */}
        <div
          style={columnStyles}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'todo')}
        >
          <div style={columnHeaderStyles('#64748b')}>
            <div style={columnDotStyles('#64748b')} />
            To Do
            <span style={taskCountStyles}>{getTasksByStatus('todo').length}</span>
          </div>
          {getTasksByStatus('todo').map(task => (
            <div
              key={task.id}
              style={taskCardStyles()}
              draggable
              onDragStart={() => handleDragStart(task)}
              onMouseEnter={(e) => {
                if (!draggedTask) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 4px 12px ${theme.colors.shadow}`;
                }
              }}
              onMouseLeave={(e) => {
                if (!draggedTask) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              <div style={taskTitleStyles}>{task.title}</div>
              <div style={taskMetaStyles}>
                <span>{task.team}</span>
                <span style={priorityStyles(task.priority)}>{task.priority}</span>
              </div>
              <div style={dueDateStyles}>Due: {task.dueDate}</div>
            </div>
          ))}
        </div>

        {/* In Progress Column */}
        <div
          style={columnStyles}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'inprogress')}
        >
          <div style={columnHeaderStyles(theme.colors.primary)}>
            <div style={columnDotStyles(theme.colors.primary)} />
            In Progress
            <span style={taskCountStyles}>{getTasksByStatus('inprogress').length}</span>
          </div>
          {getTasksByStatus('inprogress').map(task => (
            <div
              key={task.id}
              style={taskCardStyles()}
              draggable
              onDragStart={() => handleDragStart(task)}
              onMouseEnter={(e) => {
                if (!draggedTask) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = `0 4px 12px ${theme.colors.shadow}`;
                }
              }}
              onMouseLeave={(e) => {
                if (!draggedTask) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }
              }}
            >
              <div style={taskTitleStyles}>{task.title}</div>
              <div style={taskMetaStyles}>
                <span>{task.team}</span>
                <span style={priorityStyles(task.priority)}>{task.priority}</span>
              </div>
              <div style={dueDateStyles}>Due: {task.dueDate}</div>
            </div>
          ))}
        </div>

        {/* Done Column */}
        <div
          style={columnStyles}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'done')}
        >
          <div style={columnHeaderStyles(theme.colors.success)}>
            <div style={columnDotStyles(theme.colors.success)} />
            Done
            <span style={taskCountStyles}>{getTasksByStatus('done').length}</span>
          </div>
          {getTasksByStatus('done').map(task => (
            <div
              key={task.id}
              style={doneTaskStyles}
              draggable
              onDragStart={() => handleDragStart(task)}
            >
              <div style={doneTaskTitleStyles}>{task.title}</div>
              <div style={completedBadgeStyles}>Completed</div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Task Modal - Placeholder */}
      {showCreateModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: theme.colors.surface,
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%'
          }}>
            <h2 style={{ margin: '0 0 20px 0' }}>Create New Task</h2>
            <p style={{ color: theme.colors.textSecondary, marginBottom: '20px' }}>
              Task creation functionality will be implemented here.
            </p>
            <Button
              onClick={() => setShowCreateModal(false)}
              style={{
                backgroundColor: theme.colors.primary,
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
