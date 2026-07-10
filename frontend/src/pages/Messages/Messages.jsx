import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import API from '../../services/api';

/**
 * Messages page — team conversation list backed by real teams.
 * Full realtime chat can be expanded later; this removes mock data
 * and gives users a working entry point tied to their teams.
 */
const Messages = () => {
  const { theme } = useTheme();
  const [teams, setTeams] = useState([]);
  const [activeTeam, setActiveTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState('');
  const [notes, setNotes] = useState({});

  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get('/teams');
      const list = res.data.data || [];
      setTeams(list);
      if (list.length) setActiveTeam(list[0]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load conversations');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const teamNotes = activeTeam ? (notes[activeTeam._id] || []) : [];

  const sendNote = () => {
    if (!draft.trim() || !activeTeam) return;
    const entry = {
      id: Date.now(),
      content: draft.trim(),
      at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };
    setNotes((prev) => ({
      ...prev,
      [activeTeam._id]: [...(prev[activeTeam._id] || []), entry],
    }));
    setDraft('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: theme.colors.text }}>Messages</h1>
        <p className="text-sm mt-0.5" style={{ color: theme.colors.textSecondary }}>
          Team spaces for quick notes. Create a team to start collaborating.
        </p>
      </div>

      {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      {teams.length === 0 ? (
        <div className="text-center py-16 rounded-xl border" style={{ borderColor: theme.colors.border, color: theme.colors.textSecondary }}>
          <p className="text-sm">No team conversations yet. Create a team first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[420px]">
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
            {teams.map((t) => (
              <button
                key={t._id}
                type="button"
                onClick={() => setActiveTeam(t)}
                className="w-full flex items-center gap-3 p-3 text-left border-b min-h-[56px] touch-manipulation transition-colors"
                style={{
                  borderColor: theme.colors.border,
                  backgroundColor: activeTeam?._id === t._id ? `${theme.colors.primary}10` : 'transparent',
                }}
              >
                <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: t.color || theme.colors.primary }}>
                  {t.icon || 'TM'}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: theme.colors.text }}>{t.name}</p>
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{t.members?.length || 0} members</p>
                </div>
              </button>
            ))}
          </div>

          <div className="md:col-span-2 rounded-xl border flex flex-col" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
            <div className="p-4 border-b font-semibold" style={{ borderColor: theme.colors.border, color: theme.colors.text }}>
              {activeTeam?.name || 'Select a team'}
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[260px]">
              {teamNotes.length === 0 ? (
                <p className="text-sm" style={{ color: theme.colors.textSecondary }}>No notes yet. Write something below.</p>
              ) : (
                teamNotes.map((m) => (
                  <div key={m.id} className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.isOwn ? 'ml-auto text-white' : ''}`} style={{ backgroundColor: m.isOwn ? theme.colors.primary : theme.colors.background, color: m.isOwn ? '#fff' : theme.colors.text }}>
                    <p>{m.content}</p>
                    <p className="text-[10px] mt-1 opacity-70">{m.at}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t flex flex-col sm:flex-row gap-2" style={{ borderColor: theme.colors.border }}>
              <input
                className="flex-1 min-h-[44px] sm:min-h-0 px-3 py-2.5 sm:py-2 rounded-lg border text-sm outline-none"
                style={{ backgroundColor: theme.colors.background, borderColor: theme.colors.border, color: theme.colors.text }}
                placeholder="Write a note..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendNote()}
              />
              <button type="button" onClick={sendNote} className="btn-primary btn-responsive sm:w-auto">
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Messages;
