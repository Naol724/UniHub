// frontend/src/pages/Settings/Settings.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import API from "../../services/api";
import useAuthGate from "../../hooks/useAuthGate";

const TABS = [
  { id: "profile",       label: "Profile" },
  { id: "privacy",       label: "Privacy" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance",    label: "Appearance" },
  { id: "chat",          label: "Chat" },
  { id: "security",      label: "Security" },
];

const Toggle = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
    <div>
      <p className="text-sm font-medium text-gray-800">{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        checked ? "bg-blue-500" : "bg-gray-200"
      }`}
      aria-checked={checked}
      role="switch"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const Section = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">{title}</h3>
    <div className="bg-white rounded-xl border border-gray-200 px-4 divide-y divide-gray-100">
      {children}
    </div>
  </div>
);

const Field = ({ label, children }) => (
  <div className="py-3">
    <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
    {children}
  </div>
);

const inputCls =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const selectCls =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500";

const Settings = () => {
  const { theme, setThemeByName } = useTheme();
  const { user } = useAuth();
  const { gate, AuthGate } = useAuthGate();

  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [pwData, setPwData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!user) { setLoading(false); return; } // guest — skip API call
    try {
      setLoading(true);
      const res = await API.get("/settings");
      setSettings(res.data.data);
    } catch (err) {
      showToast("error", "Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const set = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const save = async (section, endpoint, payload) => {
    gate(`save ${section} settings`, async () => {
      try {
        setSaving(true);
        await API.put(endpoint, payload);
        showToast("success", "Saved successfully.");
      } catch (err) {
        showToast("error", (err && err.message) || "Failed to save.");
      } finally {
        setSaving(false);
      }
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("error", "Only image files are allowed."); return; }
    if (file.size > 2 * 1024 * 1024) { showToast("error", "Image must be under 2 MB."); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    try {
      setUploadingAvatar(true);
      const form = new FormData();
      form.append("avatar", avatarFile);
      const res = await API.post("/settings/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSettings((prev) => ({
        ...prev,
        profile: { ...prev.profile, avatar: res.data.data.avatar },
      }));
      setAvatarFile(null);
      showToast("success", "Avatar updated.");
    } catch (err) {
      showToast("error", "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError("");
    if (pwData.newPassword !== pwData.confirmPassword) { setPwError("New passwords do not match."); return; }
    if (pwData.newPassword.length < 6) { setPwError("Password must be at least 6 characters."); return; }
    if (!user || !user.id) { setPwError("User not found. Please log in again."); return; }
    try {
      setSaving(true);
      await API.post(`/auth/profile/${user.id}/change-password`, {
        currentPassword: pwData.currentPassword,
        newPassword: pwData.newPassword,
      });
      setPwData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("success", "Password changed successfully.");
    } catch (err) {
      setPwError((err && err.message) || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = (value) => {
    set("appearance", "theme", value);
    if (value !== "auto") setThemeByName(value);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading settings...</p>
        </div>
      </div>
    );
  }

  // Guest view — prompt to sign in
  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <AuthGate />
        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center">
          <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Settings</h2>
          <p className="text-sm text-gray-500 mb-4">Sign in to manage your account preferences</p>
          <button
            onClick={() => gate('access settings', () => {})}
            className="px-5 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold transition-colors"
          >
            Sign in to continue
          </button>
        </div>
      </div>
    );
  }

  const backendBase = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");
  const avatarUrl = avatarPreview
    ? avatarPreview
    : settings.profile && settings.profile.avatar
    ? `${backendBase}/uploads/avatars/${settings.profile.avatar}`
    : null;

  const initials = user
    ? ((user.first_name || "").charAt(0) + (user.last_name || "").charAt(0)).toUpperCase() || "U"
    : "U";

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: theme.colors.background, color: theme.colors.text }}>
      <AuthGate />
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>
          {toast.text}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: theme.colors.text }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>Manage your account preferences</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 max-w-5xl">
        <nav className="md:w-48 flex-shrink-0">
          <ul className="space-y-1">
            {TABS.map((tab) => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex-1 min-w-0">

          {activeTab === "profile" && (
            <div>
              <h2 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>Profile Settings</h2>

              <Section title="Avatar">
                <div className="py-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center flex-shrink-0">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-blue-600 font-bold text-xl">{initials}</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition">
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                      Choose photo
                    </label>
                    {avatarFile && (
                      <button onClick={handleAvatarUpload} disabled={uploadingAvatar} className="px-3 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 disabled:opacity-60 transition">
                        {uploadingAvatar ? "Uploading..." : "Upload"}
                      </button>
                    )}
                    <p className="text-xs text-gray-400">JPG, PNG or GIF - max 2 MB</p>
                  </div>
                </div>
              </Section>

              <Section title="Basic Information">
                <Field label="First Name">
                  <input className={inputCls} value={settings.profile && settings.profile.firstName || ""} onChange={(e) => set("profile", "firstName", e.target.value)} />
                </Field>
                <Field label="Last Name">
                  <input className={inputCls} value={settings.profile && settings.profile.lastName || ""} onChange={(e) => set("profile", "lastName", e.target.value)} />
                </Field>
                <Field label="Bio">
                  <textarea className={inputCls} rows={3} maxLength={500} value={settings.profile && settings.profile.bio || ""} onChange={(e) => set("profile", "bio", e.target.value)} />
                </Field>
                <Field label="Phone">
                  <input className={inputCls} value={settings.profile && settings.profile.phone || ""} onChange={(e) => set("profile", "phone", e.target.value)} />
                </Field>
                <Field label="Website">
                  <input className={inputCls} placeholder="https://" value={settings.profile && settings.profile.website || ""} onChange={(e) => set("profile", "website", e.target.value)} />
                </Field>
              </Section>

              <Section title="Social Links">
                {["linkedin", "github", "twitter", "facebook"].map((platform) => (
                  <Field key={platform} label={platform.charAt(0).toUpperCase() + platform.slice(1)}>
                    <input
                      className={inputCls}
                      placeholder={`https://${platform}.com/...`}
                      value={(settings.profile && settings.profile.socialLinks && settings.profile.socialLinks[platform]) || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          profile: {
                            ...prev.profile,
                            socialLinks: { ...(prev.profile && prev.profile.socialLinks), [platform]: e.target.value },
                          },
                        }))
                      }
                    />
                  </Field>
                ))}
              </Section>

              <button
                onClick={() => save("profile", "/settings/profile", {
                  firstName: settings.profile && settings.profile.firstName,
                  lastName: settings.profile && settings.profile.lastName,
                  bio: settings.profile && settings.profile.bio,
                  phone: settings.profile && settings.profile.phone,
                  website: settings.profile && settings.profile.website,
                  socialLinks: settings.profile && settings.profile.socialLinks,
                })}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 transition"
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          )}

          {activeTab === "privacy" && (
            <div>
              <h2 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>Privacy Settings</h2>
              <Section title="Visibility">
                <Field label="Profile Visibility">
                  <select className={selectCls} value={(settings.privacy && settings.privacy.profileVisibility) || "public"} onChange={(e) => set("privacy", "profileVisibility", e.target.value)}>
                    <option value="public">Public</option>
                    <option value="friends">Friends only</option>
                    <option value="private">Private</option>
                  </select>
                </Field>
              </Section>
              <Section title="Contact Info">
                <Toggle label="Show email address" checked={(settings.privacy && settings.privacy.showEmail) || false} onChange={(v) => set("privacy", "showEmail", v)} />
                <Toggle label="Show phone number" checked={(settings.privacy && settings.privacy.showPhone) || false} onChange={(v) => set("privacy", "showPhone", v)} />
              </Section>
              <Section title="Interactions">
                <Toggle label="Allow direct messages" checked={settings.privacy && settings.privacy.allowDirectMessages !== undefined ? settings.privacy.allowDirectMessages : true} onChange={(v) => set("privacy", "allowDirectMessages", v)} />
                <Toggle label="Allow friend requests" checked={settings.privacy && settings.privacy.allowFriendRequests !== undefined ? settings.privacy.allowFriendRequests : true} onChange={(v) => set("privacy", "allowFriendRequests", v)} />
                <Toggle label="Show online status" checked={settings.privacy && settings.privacy.showOnlineStatus !== undefined ? settings.privacy.showOnlineStatus : true} onChange={(v) => set("privacy", "showOnlineStatus", v)} />
                <Toggle label="Allow search by email" checked={settings.privacy && settings.privacy.allowSearchByEmail !== undefined ? settings.privacy.allowSearchByEmail : true} onChange={(v) => set("privacy", "allowSearchByEmail", v)} />
              </Section>
              <button onClick={() => save("privacy", "/settings/privacy", settings.privacy)} disabled={saving} className="px-5 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 transition">
                {saving ? "Saving..." : "Save Privacy"}
              </button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div>
              <h2 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>Notification Settings</h2>
              {["email", "push", "inApp"].map((type) => (
                <Section key={type} title={type === "inApp" ? "In-App" : type.charAt(0).toUpperCase() + type.slice(1)}>
                  {[
                    { key: "newMessages",     label: "New messages" },
                    { key: "friendRequests",  label: "Friend requests" },
                    { key: "teamInvitations", label: "Team invitations" },
                    { key: "taskAssignments", label: "Task assignments" },
                    { key: "houseInquiries",  label: "House inquiries" },
                    { key: "systemUpdates",   label: "System updates" },
                  ].map(({ key, label }) => (
                    <Toggle
                      key={key}
                      label={label}
                      checked={settings.notifications && settings.notifications[type] && settings.notifications[type][key] !== undefined ? settings.notifications[type][key] : true}
                      onChange={(v) =>
                        setSettings((prev) => ({
                          ...prev,
                          notifications: {
                            ...prev.notifications,
                            [type]: { ...(prev.notifications && prev.notifications[type]), [key]: v },
                          },
                        }))
                      }
                    />
                  ))}
                </Section>
              ))}
              <button onClick={() => save("notifications", "/settings/notifications", settings.notifications)} disabled={saving} className="px-5 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 transition">
                {saving ? "Saving..." : "Save Notifications"}
              </button>
            </div>
          )}

          {activeTab === "appearance" && (
            <div>
              <h2 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>Appearance Settings</h2>
              <Section title="Theme">
                <Field label="Color Theme">
                  <div className="flex gap-3 py-1">
                    {["light", "dark"].map((t) => (
                      <button
                        key={t}
                        onClick={() => handleThemeChange(t)}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition ${
                          (settings.appearance && settings.appearance.theme) === t
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </button>
                    ))}
                  </div>
                </Field>
              </Section>
              <Section title="Locale">
                <Field label="Language">
                  <select className={selectCls} value={(settings.appearance && settings.appearance.language) || "en"} onChange={(e) => set("appearance", "language", e.target.value)}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="pt">Portuguese</option>
                    <option value="ru">Russian</option>
                    <option value="zh">Chinese</option>
                    <option value="ja">Japanese</option>
                    <option value="ko">Korean</option>
                  </select>
                </Field>
                <Field label="Date Format">
                  <select className={selectCls} value={(settings.appearance && settings.appearance.dateFormat) || "MM/DD/YYYY"} onChange={(e) => set("appearance", "dateFormat", e.target.value)}>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </Field>
                <Field label="Time Format">
                  <select className={selectCls} value={(settings.appearance && settings.appearance.timeFormat) || "12h"} onChange={(e) => set("appearance", "timeFormat", e.target.value)}>
                    <option value="12h">12-hour</option>
                    <option value="24h">24-hour</option>
                  </select>
                </Field>
              </Section>
              <button onClick={() => save("appearance", "/settings/appearance", settings.appearance)} disabled={saving} className="px-5 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 transition">
                {saving ? "Saving..." : "Save Appearance"}
              </button>
            </div>
          )}

          {activeTab === "chat" && (
            <div>
              <h2 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>Chat Settings</h2>
              <Section title="Behaviour">
                <Toggle label="Sound notifications" description="Play a sound when a new message arrives" checked={settings.chat && settings.chat.soundEnabled !== undefined ? settings.chat.soundEnabled : true} onChange={(v) => set("chat", "soundEnabled", v)} />
                <Toggle label="Desktop notifications" description="Show browser notifications for new messages" checked={settings.chat && settings.chat.desktopNotifications !== undefined ? settings.chat.desktopNotifications : true} onChange={(v) => set("chat", "desktopNotifications", v)} />
                <Toggle label="Show message preview" description="Show a snippet of the message in notifications" checked={settings.chat && settings.chat.showPreview !== undefined ? settings.chat.showPreview : true} onChange={(v) => set("chat", "showPreview", v)} />
                <Toggle label="Enter to send" description="Press Enter to send (Shift+Enter for new line)" checked={settings.chat && settings.chat.enterToSend !== undefined ? settings.chat.enterToSend : false} onChange={(v) => set("chat", "enterToSend", v)} />
                <Toggle label="Show online users" checked={settings.chat && settings.chat.showOnlineUsers !== undefined ? settings.chat.showOnlineUsers : true} onChange={(v) => set("chat", "showOnlineUsers", v)} />
              </Section>
              <button onClick={() => save("chat", "/settings/chat", settings.chat)} disabled={saving} className="px-5 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 transition">
                {saving ? "Saving..." : "Save Chat Settings"}
              </button>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h2 className="text-lg font-semibold mb-4" style={{ color: theme.colors.text }}>Security Settings</h2>

              <Section title="Change Password">
                <form onSubmit={handlePasswordChange} className="py-2 space-y-3">
                  {pwError && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{pwError}</p>}
                  <Field label="Current Password">
                    <input type="password" className={inputCls} value={pwData.currentPassword} onChange={(e) => setPwData((p) => ({ ...p, currentPassword: e.target.value }))} required />
                  </Field>
                  <Field label="New Password">
                    <input type="password" className={inputCls} value={pwData.newPassword} onChange={(e) => setPwData((p) => ({ ...p, newPassword: e.target.value }))} required />
                  </Field>
                  <Field label="Confirm New Password">
                    <input type="password" className={inputCls} value={pwData.confirmPassword} onChange={(e) => setPwData((p) => ({ ...p, confirmPassword: e.target.value }))} required />
                  </Field>
                  <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 transition">
                    {saving ? "Saving..." : "Change Password"}
                  </button>
                </form>
              </Section>

              <Section title="Security Options">
                <Toggle label="Login alerts" description="Get notified when a new device logs into your account" checked={settings.security && settings.security.loginAlerts !== undefined ? settings.security.loginAlerts : true} onChange={(v) => set("security", "loginAlerts", v)} />
                <Toggle label="Require password for sensitive actions" checked={settings.security && settings.security.requirePasswordForSensitiveActions !== undefined ? settings.security.requirePasswordForSensitiveActions : true} onChange={(v) => set("security", "requirePasswordForSensitiveActions", v)} />
              </Section>

              <Section title="Session">
                <Field label="Session timeout (hours)">
                  <input type="number" className={inputCls} min={1} max={168} value={(settings.security && settings.security.sessionTimeout) || 24} onChange={(e) => set("security", "sessionTimeout", Number(e.target.value))} />
                </Field>
              </Section>

              <button
                onClick={() => save("security", "/settings/security", {
                  loginAlerts: settings.security && settings.security.loginAlerts,
                  sessionTimeout: settings.security && settings.security.sessionTimeout,
                  requirePasswordForSensitiveActions: settings.security && settings.security.requirePasswordForSensitiveActions,
                })}
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-60 transition"
              >
                {saving ? "Saving..." : "Save Security Settings"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Settings;
