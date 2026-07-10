import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';

const displayName = (u) => {
  if (!u) return '?';
  const first = u.firstName || u.first_name || '';
  const last = u.lastName || u.last_name || '';
  return `${first} ${last}`.trim() || u.email || 'User';
};

const initials = (u) => {
  const name = displayName(u);
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const Teams = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [inviteCode, setInviteCode] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await API.get('/teams');
      setTeams(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Team name is required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await API.post('/teams', {
        name: form.name.trim(),
        description: form.description.trim() || 'No description provided',
      });
      setShowCreateModal(false);
      setForm({ name: '', description: '' });
      await fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      await API.post('/teams/join', { inviteCode: inviteCode.trim() });
      setShowJoinModal(false);
      setInviteCode('');
      await fetchTeams();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join team');
    } finally {
      setSubmitting(false);
    }
  };

  const myRole = (team) => {
    const uid = (user?.id || user?._id)?.toString();
    if (team.leader?._id?.toString() === uid || team.leader?.toString() === uid) return 'Leader';
    return 'Member';
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
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>Teams</h1>
          <p className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>
            Manage and collaborate with your project teams
          </p>
        </div>
        <div className="page-actions">
          <button
            type="button"
            onClick={() => { setError(''); setShowJoinModal(true); }}
            className="btn-secondary btn-responsive"
          >
            Join Team
          </button>
          <button
            type="button"
            onClick={() => { setError(''); setShowCreateModal(true); }}
            className="btn-primary btn-responsive"
          >
            Create Team
          </button>
        </div>
      </div>

      {error && !showCreateModal && !showJoinModal && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      {teams.length === 0 ? (
        <div className="text-center py-16 rounded-xl border" style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}>
          <p className="text-sm mb-3">You are not in any teams yet.</p>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="btn-primary btn-responsive"
          >
            Create your first team
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {teams.map((team) => {
            const members = (team.members || []).map((m) => m.user || m).filter(Boolean);
            const color = team.color || theme.colors.primary;
            return (
              <div
                key={team._id}
                className="rounded-xl p-5 border transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base"
                    style={{ backgroundColor: color }}
                  >
                    {team.icon || 'TM'}
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: `${color}20`, color }}
                  >
                    {myRole(team)}
                  </span>
                </div>
                <h3 className="font-bold text-base mb-1 truncate" style={{ color: theme.colors.text }}>
                  {team.name}
                </h3>
                <p className="text-sm mb-3 line-clamp-2" style={{ color: theme.colors.textSecondary }}>
                  {team.description}
                </p>
                <div className="flex items-center gap-1 mb-3">
                  {members.slice(0, 5).map((m) => (
                    <div
                      key={m._id || m.id}
                      title={displayName(m)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white -ml-1 first:ml-0"
                      style={{ backgroundColor: `${color}30`, color }}
                    >
                      {initials(m)}
                    </div>
                  ))}
                  <span className="ml-2 text-xs" style={{ color: theme.colors.textSecondary }}>
                    {members.length} members
                  </span>
                </div>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                  Invite code: <span className="font-mono font-semibold" style={{ color: theme.colors.text }}>{team.inviteCode}</span>
                </p>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form
            onSubmit={handleCreate}
            className="w-full max-w-md rounded-xl p-6 shadow-xl space-y-4"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <h2 className="text-lg font-bold" style={{ color: theme.colors.text }}>Create New Team</h2>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: theme.colors.text }}>Name</label>
              <input
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Team name"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: theme.colors.text }}>Description</label>
              <textarea
                className="w-full px-3 py-2 rounded-lg border text-sm outline-none"
                style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="What is this team for?"
                rows={3}
              />
            </div>
            <div className="btn-group pt-1">
              <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary btn-responsive">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary btn-responsive">
                {submitting ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <form
            onSubmit={handleJoin}
            className="w-full max-w-md rounded-xl p-6 shadow-xl space-y-4"
            style={{ backgroundColor: theme.colors.surface }}
          >
            <h2 className="text-lg font-bold" style={{ color: theme.colors.text }}>Join Team</h2>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <input
              className="w-full px-3 py-2 rounded-lg border text-sm outline-none font-mono uppercase"
              style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              placeholder="INVITE CODE"
              required
            />
            <div className="btn-group pt-1">
              <button type="button" onClick={() => setShowJoinModal(false)} className="btn-secondary btn-responsive">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary btn-responsive">
                {submitting ? 'Joining...' : 'Join'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Teams;
