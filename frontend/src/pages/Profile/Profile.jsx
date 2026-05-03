// frontend/src/pages/Profile/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import useAuthGate from '../../hooks/useAuthGate';

const Profile = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { gate, AuthGate } = useAuthGate();
  const [profileData, setProfileData] = useState({
    firstName: 'Naol', lastName: 'Gonfa',
    email: 'naol.gonfa@university.edu', phone: '+251 91 234-5678',
    location: 'Addis Ababa, Ethiopia',
    bio: 'Computer Science student passionate about building great user experiences and solving complex problems through technology.',
    skills: ['React', 'TypeScript', 'Node.js', 'UI/UX Design', 'Python', 'Database Design', 'Agile', 'Git'],
    teams: [
      { id: 1, name: 'UI/UX Team',    role: 'Leader', icon: 'UI', color: theme.colors.primary   },
      { id: 2, name: 'Backend Team',  role: 'Member', icon: 'BE', color: theme.colors.secondary },
      { id: 3, name: 'Research Team', role: 'Member', icon: 'RE', color: theme.colors.success   },
    ],
    stats: { tasksCompleted: 18, totalTasks: 24, teamsJoined: 3, joinDate: 'January 2024' },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setTimeout(() => setLoading(false), 600); }, []);

  const handleChange = (field, value) => setProfileData((p) => ({ ...p, [field]: value }));
  const handleSave = () => setIsEditing(false);

  const initials = `${profileData.firstName.charAt(0)}${profileData.lastName.charAt(0)}`.toUpperCase();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputCls = `w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500`;
  const inputStyle = { backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text };

  return (
    <div className="space-y-5">
      <AuthGate />
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>Profile</h1>
        <p className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>Manage your personal information and preferences</p>
      </div>

      {/* Layout: stacked on mobile, side-by-side on lg */}
      <div className="flex flex-col lg:flex-row gap-5">

        {/* Profile card */}
        <div
          className="w-full lg:w-72 xl:w-80 flex-shrink-0 rounded-xl border p-6 text-center"
          style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}
        >
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold" style={{ backgroundColor: theme.colors.primaryLight, color: theme.colors.primary }}>
            {initials}
          </div>
          <h2 className="text-lg font-bold mb-0.5" style={{ color: theme.colors.text }}>{profileData.firstName} {profileData.lastName}</h2>
          <p className="text-sm mb-5" style={{ color: theme.colors.textSecondary }}>Computer Science Student</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 py-4 border-y mb-5" style={{ borderColor: theme.colors.border }}>
            {[
              { value: profileData.stats.tasksCompleted, label: 'Done' },
              { value: profileData.stats.teamsJoined,    label: 'Teams' },
              { value: profileData.stats.totalTasks,     label: 'Total' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-xl font-extrabold" style={{ color: theme.colors.text }}>{s.value}</p>
                <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div className="space-y-2 text-left">
            {[
              { label: 'Email',    value: profileData.email    },
              { label: 'Phone',    value: profileData.phone    },
              { label: 'Location', value: profileData.location },
              { label: 'Joined',   value: profileData.stats.joinDate },
            ].map((c) => (
              <div key={c.label} className="flex gap-2 text-xs">
                <span className="font-semibold w-16 flex-shrink-0" style={{ color: theme.colors.textSecondary }}>{c.label}</span>
                <span className="truncate" style={{ color: theme.colors.text }}>{c.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content sections */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* Edit Profile */}
          <div className="rounded-xl border p-5" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base" style={{ color: theme.colors.text }}>Edit Profile</h3>
              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors hover:bg-gray-50" style={{ borderColor: theme.colors.border, color: theme.colors.text }}>
                  Edit
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>First Name</label>
                    <input className={inputCls} style={inputStyle} value={profileData.firstName} onChange={(e) => handleChange('firstName', e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>Last Name</label>
                    <input className={inputCls} style={inputStyle} value={profileData.lastName} onChange={(e) => handleChange('lastName', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>Email</label>
                  <input type="email" className={inputCls} style={inputStyle} value={profileData.email} onChange={(e) => handleChange('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>Bio</label>
                  <textarea className={inputCls} style={{ ...inputStyle, resize: 'vertical' }} rows={3} value={profileData.bio} onChange={(e) => handleChange('bio', e.target.value)} />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ backgroundColor: theme.colors.primary }}>Save Changes</button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg border text-sm font-medium" style={{ borderColor: theme.colors.border, color: theme.colors.text }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[{ label: 'First Name', value: profileData.firstName }, { label: 'Last Name', value: profileData.lastName }].map((f) => (
                    <div key={f.label}>
                      <p className="text-xs font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>{f.label}</p>
                      <div className="px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}>{f.value}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>Email</p>
                  <div className="px-3 py-2 rounded-lg text-sm truncate" style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}>{profileData.email}</div>
                </div>
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: theme.colors.textSecondary }}>Bio</p>
                  <div className="px-3 py-2 rounded-lg text-sm leading-relaxed" style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}>{profileData.bio}</div>
                </div>
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="rounded-xl border p-5" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
            <h3 className="font-bold text-base mb-3" style={{ color: theme.colors.text }}>Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill) => (
                <span key={skill} className="px-3 py-1 rounded-full border text-xs font-medium" style={{ borderColor: theme.colors.border, color: theme.colors.text, backgroundColor: theme.colors.background }}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Teams */}
          <div className="rounded-xl border p-5" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
            <h3 className="font-bold text-base mb-3" style={{ color: theme.colors.text }}>Teams</h3>
            <div className="space-y-2">
              {profileData.teams.map((team) => (
                <div key={team.id} className="flex items-center gap-3 p-3 rounded-lg" style={{ backgroundColor: theme.colors.background, border: `1px solid ${theme.colors.border}` }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0" style={{ backgroundColor: team.color }}>
                    {team.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: theme.colors.text }}>{team.name}</p>
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{team.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
