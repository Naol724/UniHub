// frontend/src/services/resourceService.js
import API from "./api";

// Get all resources for a team
export const getTeamResources = async (teamId, filters = {}) => {
  const res = await API.get(`/teams/${teamId}/resources`, { params: filters });
  return res.data;
};

// Get resource by ID
export const getResourceById = async (resourceId) => {
  const res = await API.get(`/resources/${resourceId}`);
  return res.data;
};

// Upload resource
export const uploadResource = async (teamId, formData) => {
  const res = await API.post(`/teams/${teamId}/resources`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

// Update resource metadata
export const updateResource = async (resourceId, resourceData) => {
  const res = await API.put(`/resources/${resourceId}`, resourceData);
  return res.data;
};

// Delete resource
export const deleteResource = async (resourceId) => {
  const res = await API.delete(`/resources/${resourceId}`);
  return res.data;
};

// Download resource
export const downloadResource = async (resourceId) => {
  const res = await API.get(`/resources/${resourceId}/download`, {
    responseType: 'blob'
  });
  return res.data;
};

// Get resource preview
export const getResourcePreview = async (resourceId) => {
  const res = await API.get(`/resources/${resourceId}/preview`, {
    responseType: 'blob'
  });
  return res.data;
};

// Search resources
export const searchResources = async (teamId, searchTerm, filters = {}) => {
  const res = await API.get(`/teams/${teamId}/resources/search`, {
    params: { q: searchTerm, ...filters }
  });
  return res.data;
};

// Get recently uploaded resources
export const getRecentResources = async (teamId, limit = 10) => {
  const res = await API.get(`/teams/${teamId}/resources/recent`, {
    params: { limit }
  });
  return res.data;
};

// Get resource statistics
export const getResourceStats = async (teamId) => {
  const res = await API.get(`/teams/${teamId}/resources/stats`);
  return res.data;
};

// Add version to resource
export const addResourceVersion = async (resourceId, formData) => {
  const res = await API.post(`/resources/${resourceId}/versions`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
};

// Get resource versions
export const getResourceVersions = async (resourceId) => {
  const res = await API.get(`/resources/${resourceId}/versions`);
  return res.data;
};

// Restore resource version
export const restoreResourceVersion = async (resourceId, versionId) => {
  const res = await API.post(`/resources/${resourceId}/versions/${versionId}/restore`);
  return res.data;
};

// Share resource
export const shareResource = async (resourceId, shareData) => {
  const res = await API.post(`/resources/${resourceId}/share`, shareData);
  return res.data;
};

// Get resource download URL
export const getResourceDownloadUrl = (resourceId) => {
  return `${API.defaults.baseURL}/resources/${resourceId}/download`;
};

// Get resource preview URL
export const getResourcePreviewUrl = (resourceId) => {
  return `${API.defaults.baseURL}/resources/${resourceId}/preview`;
};
