import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import API from '../../services/api';
import { setLocal } from '../../utils/storage';

const Profile = () => {
  const { theme } = useTheme();
  const { user, token } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: '', lastName: '', email: '', phone: '', location: '', bio: '',
    skills: [], teams: [], stats: { tasksCompleted: 0, totalTasks: 0, teamsJoined: 0 },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const userId = user?.id || user?._id;

  const load = useCallback(async () => {
    if (!userId) { setLoading(false); return; }
    try {
      setLoading(true);
      const [profileRes, teamsRes, tasksRes] = await Promise.all([
        API.get(`/auth/profile/${userId}`).catch(() => null),
        API.get('/teams').catch(() => ({ data: { data: [] } })),
        API.get('/tasks').catch(() => ({ data: { data: [] } })),
      ]);

      const p = profileRes?.data?.user || user || {};
      const teams = teamsRes.data.data || [];
      const tasks = tasksRes.data.data || [];
      const done = tasks.filter((t) => t.status === 'done').length;

      setProfileData({
        firstName: p.firstName || p.first_name || '',
        lastName: p.lastName || p.last_name || '',
        email: p.email || '',
        phone: p.phone || '',
        location: p.location || '',
        bio: p.Bio || p.bio || '',
        skills: p.skills || [],
        teams: teams.map((t) => ({
          id: t._id,
          name: t.name,
          role: (t.leader?._id || t.leader)?.toString() === userId?.toString() ? 'Leader' : 'Member',
          icon: t.icon || 'TM',
          color: t.color || theme.colors.primary,
        })),
        stats: {
          tasksCompleted: done,
          totalTasks: tasks.length,
          teamsJoined: teams.length,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId, user, theme.colors.primary]);

  useEffect(() => { load(); }, [load]);

  const handleChange = (field, value) => setProfileData((p) => ({ ...p, [field]: value }));

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await API.put(`/auth/profile/${userId}`, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        location: profileData.location,
        Bio: profileData.bio,
      });
      const updated = res.data.user;
      setLocal('user', { ...user, ...updated });
      setSuccess('Profile updated');
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const initials = `${(profileData.firstName || '?')[0]}${(profileData.lastName || '')[0] || ''}`.toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputCls = 'w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500';
  const inputStyle = { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>Profile</h1>
          <p className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>Manage your personal information</p>
        </div>
        {!isEditing ? (
          <button type="button" onClick={() => setIsEditing(true)} className="btn-primary btn-responsive">Edit</button>
        ) : (
          <div className="btn-group">
            <button type="button" onClick={() => { setIsEditing(false); load(); }} className="btn-secondary btn-responsive">Cancel</button>
            <button type="button" onClick={handleSave} disabled={saving} className="btn-primary btn-responsive">
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
      {success && <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">{success}</div>}

      <div className="flex flex-col lg:flex-row gap-5">
        <div className="w-full lg:w-72 rounded-xl border p-6 text-center" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold" style={{ backgroundColor: theme.colors.primaryLight || '#dbeafe', color: theme.colors.primary }}>
            {initials}
          </div>
          <h2 className="text-lg font-bold mb-0.5" style={{ color: theme.colors.text }}>{profileData.firstName} {profileData.lastName}</h2>
          <p className="text-sm mb-5" style={{ color: theme.colors.textSecondary }}>{profileData.email}</p>
          <div className="grid grid-cols-3 gap-2 py-4 border-y" style={{ borderColor: theme.colors.border }}>
            {[
              { value: profileData.stats.tasksCompleted, label: 'Done' },
              { value: profileData.stats.teamsJoined, label: 'Teams' },
              { value: profileData.stats.totalTasks, label: 'Total' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-extrabold" style={{ color: theme.colors.text }}>{s.value}</p>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 rounded-xl border p-6 space-y-4" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: theme.colors.text }}>First name</label>
              <input className={inputCls} style={inputStyle} disabled={!isEditing} value={profileData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: theme.colors.text }}>Last name</label>
              <input className={inputCls} style={inputStyle} disabled={!isEditing} value={profileData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: theme.colors.text }}>Phone</label>
              <input className={inputCls} style={inputStyle} disabled={!isEditing} value={profileData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: theme.colors.text }}>Location</label>
              <input className={inputCls} style={inputStyle} disabled={!isEditing} value={profileData.location} onChange={(e) => handleChange('location', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: theme.colors.text }}>Bio</label>
            <textarea className={inputCls} style={inputStyle} disabled={!isEditing} rows={4} value={profileData.bio} onChange={(e) => handleChange('bio', e.target.value)} />
          </div>

          {profileData.teams.length > 0 && (
            <div>
              <h3 className="text-sm font-bold mb-2" style={{ color: theme.colors.text }}>Your teams</h3>
              <div className="flex flex-wrap gap-2">
                {profileData.teams.map((t) => (
                  <span key={t.id} className="text-xs font-semibold px-2 py-1 rounded-full" style={{ backgroundColor: `${t.color}20`, color: t.color }}>
                    {t.name} · {t.role}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
