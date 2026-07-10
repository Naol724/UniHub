import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';

const formatSize = (bytes = 0) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Resources = () => {
  const { theme } = useTheme();
  const fileRef = useRef(null);
  const [resources, setResources] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [uploadTeamId, setUploadTeamId] = useState('');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [resRes, teamsRes] = await Promise.all([
        API.get('/resources'),
        API.get('/teams'),
      ]);
      setResources(resRes.data.data || []);
      setTeams(teamsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = resources.filter((r) => {
    const q = searchTerm.toLowerCase();
    const name = (r.name || r.originalName || '').toLowerCase();
    const desc = (r.description || '').toLowerCase();
    const teamId = r.team?._id || r.team;
    return (name.includes(q) || desc.includes(q)) &&
      (selectedTeam === 'all' || teamId === selectedTeam);
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !uploadTeamId) {
      setError('Select a team and a file');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('teamId', uploadTeamId);
      await API.post('/resources', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setShowUploadModal(false);
      setFile(null);
      setUploadTeamId('');
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      await API.delete(`/resources/${id}`);
      setResources((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>Resources</h1>
          <p className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>Shared files and documents for your projects</p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            onClick={() => { setError(''); setShowUploadModal(true); }}
            disabled={teams.length === 0}
            className="btn-primary btn-responsive disabled:opacity-50"
          >
            Upload File
          </button>
        </div>
      </div>

      {error && !showUploadModal && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          className="flex-1 min-h-[44px] sm:min-h-0 px-3 py-2.5 sm:py-2 rounded-lg border text-sm outline-none"
          style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }}
          placeholder="Search files..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="min-h-[44px] sm:min-h-0 px-3 py-2.5 sm:py-2 rounded-lg border text-sm"
          style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border, color: theme.colors.text }}
          value={selectedTeam}
          onChange={(e) => setSelectedTeam(e.target.value)}
        >
          <option value="all">All Teams</option>
          {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: theme.colors.textSecondary }}>
          <p className="text-sm">No files found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((r) => {
            const ext = (r.extension || r.originalName?.split('.').pop() || 'FILE').toUpperCase();
            const teamName = r.team?.name || 'Team';
            const teamColor = r.team?.color || theme.colors.primary;
            return (
              <div key={r._id} className="rounded-xl p-4 border" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold mb-3 bg-blue-50 text-blue-600">{ext.slice(0, 3)}</div>
                <h3 className="text-sm font-semibold mb-1 truncate" style={{ color: theme.colors.text }}>{r.name || r.originalName}</h3>
                <p className="text-xs mb-2" style={{ color: theme.colors.textSecondary }}>
                  {formatSize(r.size)} · {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : ''}
                </p>
                <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-3" style={{ backgroundColor: `${teamColor}20`, color: teamColor }}>{teamName}</span>
                <button
                  type="button"
                  onClick={() => handleDelete(r._id)}
                  className="btn-link text-red-500 dark:text-red-400 min-h-[40px] px-0"
                >
                  Delete
                </button>
              </div>
            );
          })}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form onSubmit={handleUpload} className="w-full max-w-md rounded-xl p-6 shadow-xl space-y-4" style={{ backgroundColor: theme.colors.surface }}>
            <h2 className="text-lg font-bold" style={{ color: theme.colors.text }}>Upload File</h2>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <select
              className="w-full px-3 py-2 rounded-lg border text-sm"
              style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
              value={uploadTeamId}
              onChange={(e) => setUploadTeamId(e.target.value)}
              required
            >
              <option value="">Select team</option>
              {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
            </select>
            <input
              ref={fileRef}
              type="file"
              className="w-full text-sm"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
            />
            <div className="btn-group">
              <button type="button" onClick={() => setShowUploadModal(false)} className="btn-secondary btn-responsive">Cancel</button>
              <button type="submit" disabled={submitting} className="btn-primary btn-responsive">
                {submitting ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Resources;
