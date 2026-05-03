// frontend/src/pages/Resources/Resources.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import useAuthGate from '../../hooks/useAuthGate';

const FILE_COLORS = {
  pdf:      { bg: '#fef2f2', color: '#ef4444' },
  sql:      { bg: '#eff6ff', color: '#3b82f6' },
  excel:    { bg: '#ecfdf5', color: '#10b981' },
  csv:      { bg: '#ecfdf5', color: '#10b981' },
  markdown: { bg: '#f5f3ff', color: '#8b5cf6' },
  design:   { bg: '#fffbeb', color: '#f59e0b' },
  word:     { bg: '#fef2f2', color: '#ef4444' },
};

const Resources = () => {
  const { theme } = useTheme();
  const { gate, AuthGate } = useAuthGate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');

  useEffect(() => {
    const mock = [
      { id: 1, name: 'Project Proposal.pdf',  type: 'pdf',      size: '2.4 MB',  uploadDate: '2024-04-05', team: 'UI/UX Team',    teamColor: theme.colors.primary,   icon: 'PDF', description: 'Initial project proposal document' },
      { id: 2, name: 'Database Schema.sql',   type: 'sql',      size: '156 KB',  uploadDate: '2024-04-04', team: 'Backend Team',  teamColor: theme.colors.secondary, icon: 'SQL', description: 'Database schema and relationships' },
      { id: 3, name: 'User Research.xlsx',    type: 'excel',    size: '1.8 MB',  uploadDate: '2024-04-03', team: 'Research Team', teamColor: theme.colors.success,   icon: 'XLS', description: 'User research data and analysis' },
      { id: 4, name: 'Dashboard Mockups.fig', type: 'design',   size: '45.2 MB', uploadDate: '2024-04-02', team: 'UI/UX Team',    teamColor: theme.colors.primary,   icon: 'FIG', description: 'Figma design mockups for dashboard' },
      { id: 5, name: 'API Documentation.md',  type: 'markdown', size: '89 KB',   uploadDate: '2024-04-01', team: 'Backend Team',  teamColor: theme.colors.secondary, icon: 'MD',  description: 'REST API documentation' },
      { id: 6, name: 'Meeting Notes.docx',    type: 'word',     size: '234 KB',  uploadDate: '2024-03-30', team: 'Research Team', teamColor: theme.colors.success,   icon: 'DOC', description: 'Team meeting notes and action items' },
      { id: 7, name: 'Brand Guidelines.pdf',  type: 'pdf',      size: '12.5 MB', uploadDate: '2024-03-28', team: 'UI/UX Team',    teamColor: theme.colors.primary,   icon: 'PDF', description: 'Brand identity and design guidelines' },
      { id: 8, name: 'Sprint Backlog.csv',    type: 'csv',      size: '67 KB',   uploadDate: '2024-03-25', team: 'Backend Team',  teamColor: theme.colors.secondary, icon: 'CSV', description: 'Current sprint backlog and tasks' },
    ];
    setTimeout(() => { setResources(mock); setLoading(false); }, 600);
  }, []);

  const teams = ['all', ...new Set(resources.map((r) => r.team))];
  const filtered = resources.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q)) &&
           (selectedTeam === 'all' || r.team === selectedTeam);
  });

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
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>Resources</h1>
          <p className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>Shared files and documents for your projects</p>
        </div>
        <button
          onClick={() => gate('upload a file', () => setShowUploadModal(true))}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-colors"
          style={{ backgroundColor: theme.colors.primary }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          Upload File
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input type="text" className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }} placeholder="Search files..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <select className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }} value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
          {teams.map((t) => <option key={t} value={t}>{t === 'all' ? 'All Teams' : t}</option>)}
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: theme.colors.textSecondary }}><p className="text-sm">No files found.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((r) => {
            const fc = FILE_COLORS[r.type] || FILE_COLORS.pdf;
            return (
              <div key={r.id} className="rounded-xl p-4 border transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold mb-3" style={{ backgroundColor: fc.bg, color: fc.color }}>{r.icon}</div>
                <h3 className="text-sm font-semibold mb-1 truncate" title={r.name} style={{ color: theme.colors.text }}>{r.name}</h3>
                <p className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>{r.size} · {r.uploadDate}</p>
                <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: theme.colors.textSecondary }}>{r.description}</p>
                <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${r.teamColor}20`, color: r.teamColor }}>{r.team}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="w-full max-w-md rounded-xl p-6 shadow-xl" style={{ backgroundColor: theme.colors.surface }}>
            <h2 className="text-lg font-bold mb-2" style={{ color: theme.colors.text }}>Upload File</h2>
            <div className="border-2 border-dashed rounded-xl p-8 text-center mb-4" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.background }}>
              <svg className="w-10 h-10 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <p className="text-sm mb-3" style={{ color: theme.colors.textSecondary }}>Drag and drop files here or click to browse</p>
              <button className="px-4 py-1.5 rounded-lg border text-sm" style={{ borderColor: theme.colors.primary, color: theme.colors.primary }}>Choose Files</button>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowUploadModal(false)} className="px-4 py-2 rounded-lg border text-sm" style={{ borderColor: theme.colors.border, color: theme.colors.text }}>Cancel</button>
              <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: theme.colors.primary }}>Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
