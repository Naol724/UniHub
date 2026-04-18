// frontend/src/services/teamService.js
import API from "./api";

// Get all teams for the current user
export const getUserTeams = async () => {
  const res = await API.get("/teams");
  return res.data;
};

// Get team by ID
export const getTeamById = async (teamId) => {
  const res = await API.get(`/teams/${teamId}`);
  return res.data;
};

// Create new team
export const createTeam = async (teamData) => {
  const res = await API.post("/teams", teamData);
  return res.data;
};

// Update team
export const updateTeam = async (teamId, teamData) => {
  const res = await API.put(`/teams/${teamId}`, teamData);
  return res.data;
};

// Delete team
export const deleteTeam = async (teamId) => {
  const res = await API.delete(`/teams/${teamId}`);
  return res.data;
};

// Join team by invite code
export const joinTeamByInviteCode = async (inviteCode) => {
  const res = await API.post("/teams/join", { inviteCode });
  return res.data;
};

// Leave team
export const leaveTeam = async (teamId) => {
  const res = await API.post(`/teams/${teamId}/leave`);
  return res.data;
};

// Add member to team
export const addTeamMember = async (teamId, memberData) => {
  const res = await API.post(`/teams/${teamId}/members`, memberData);
  return res.data;
};

// Remove member from team
export const removeTeamMember = async (teamId, memberId) => {
  const res = await API.delete(`/teams/${teamId}/members/${memberId}`);
  return res.data;
};

// Update member role
export const updateMemberRole = async (teamId, memberId, role) => {
  const res = await API.put(`/teams/${teamId}/members/${memberId}`, { role });
  return res.data;
};

// Get team members
export const getTeamMembers = async (teamId) => {
  const res = await API.get(`/teams/${teamId}/members`);
  return res.data;
};

// Generate invite code
export const generateInviteCode = async (teamId) => {
  const res = await API.post(`/teams/${teamId}/invite-code`);
  return res.data;
};

// Get team statistics
export const getTeamStats = async (teamId) => {
  const res = await API.get(`/teams/${teamId}/stats`);
  return res.data;
};
