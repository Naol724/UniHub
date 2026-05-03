// frontend/src/pages/Teams/Teams.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthGate from '../../hooks/useAuthGate';

const Teams = () => {
  const { theme } = useTheme();
  const { gate, AuthGate } = useAuthGate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const mockTeams = [
      { id: 1, name: 'UI/UX Design Team',      description: 'Designing beautiful user experiences',    icon: 'UI', color: theme.colors.primary,   members: [{ id: 1, name: 'Naol Gonfa', initials: 'NG' }, { id: 2, name: 'Asefa Niguse', initials: 'AN' }, { id: 3, name: 'Ermiyas Abebe', initials: 'EA' }, { id: 4, name: 'Tola Fayisa', initials: 'TF' }], tasksCompleted: 8,  totalTasks: 12, userRole: 'Leader' },
      { id: 2, name: 'Backend Development',     description: 'Building robust APIs and databases',      icon: 'BE', color: theme.colors.secondary, members: [{ id: 5, name: 'Fikru Bekele', initials: 'FB' }, { id: 6, name: 'Yisiyaq Gezehany', initials: 'YG' }, { id: 7, name: 'Abebe Alemu', initials: 'AA' }], tasksCompleted: 14, totalTasks: 18, userRole: 'Member' },
      { id: 3, name: 'Research & Analysis',     description: 'User research and data analysis',         icon: 'RE', color: theme.colors.success,   members: [{ id: 8, name: 'Mekonnen Niguse', initials: 'MN' }, { id: 9, name: 'Mahlet Ibrahim', initials: 'MI' }], tasksCompleted: 4,  totalTasks: 6,  userRole: 'Member' },
      { id: 4, name: 'Mobile Development',      description: 'Cross-platform mobile applications',      icon: 'MD', color: theme.colors.warning,   members: [{ id: 10, name: 'Birhanu Endris', initials: 'BE' }, { id: 11, name: 'Rahel Seid', initials: 'RS' }, { id: 12, name: 'Bethelehem Mekonnen', initials: 'BM' }], tasksCompleted: 9,  totalTasks: 15, userRole: 'Member' },
      { id: 5, name: 'DevOps & Infrastructure', description: 'Deployment pipelines and cloud',          icon: 'DO', color: theme.colors.danger,    members: [{ id: 13, name: 'Alemayehu Niguse', initials: 'AN' }, { id: 14, name: 'Ermiyas Abebe', initials: 'EA' }], tasksCompleted: 7,  totalTasks: 8,  userRole: 'Member' },
    ];
    setTimeout(() => { setTeams(mockTeams); setLoading(false); }, 600);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <AuthGate />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>Teams</h1>
          <p className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>Manage and collaborate with your project teams</p>
        </div>
        <button
          onClick={() => gate('create a team', () => setShowCreateModal(true))}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors hover:opacity-90"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Create Team
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {teams.map((team) => {
          const progress = Math.round((team.tasksCompleted / team.totalTasks) * 100);
          return (
            <div
              key={team.id}
              className="rounded-xl p-5 border transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer"
              style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0" style={{ backgroundColor: team.color }}>
                  {team.icon}
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${team.color}20`, color: team.color }}>
                  {team.userRole}
                </span>
              </div>
              <h3 className="font-bold text-base mb-1 truncate" style={{ color: theme.colors.text }}>{team.name}</h3>
              <p className="text-sm mb-4 line-clamp-2" style={{ color: theme.colors.textSecondary }}>{team.description}</p>
              <div className="flex items-center gap-1 mb-3">
                {team.members.slice(0, 5).map((m) => (
                  <div key={m.id} title={m.name} className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white -ml-1 first:ml-0" style={{ backgroundColor: `${team.color}30`, color: team.color }}>
                    {m.initials}
                  </div>
                ))}
                {team.members.length > 5 && (
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white -ml-1 bg-gray-100 text-gray-600">+{team.members.length - 5}</div>
                )}
                <span className="ml-2 text-xs" style={{ color: theme.colors.textSecondary }}>{team.members.length} members</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden mb-1.5" style={{ backgroundColor: theme.colors.border }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: team.color }} />
              </div>
              <div className="flex justify-between text-xs" style={{ color: theme.colors.textSecondary }}>
                <span>{team.tasksCompleted}/{team.totalTasks} tasks</span>
                <span>{progress}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-xl p-6 shadow-xl" style={{ backgroundColor: theme.colors.surface }}>
            <h2 className="text-lg font-bold mb-2" style={{ color: theme.colors.text }}>Create New Team</h2>
            <p className="text-sm mb-5" style={{ color: theme.colors.textSecondary }}>Team creation functionality will be implemented here.</p>
            <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: theme.colors.primary }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Teams;
