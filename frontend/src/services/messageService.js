// frontend/src/services/messageService.js
import API from "./api";

// Get all conversations for current user
export const getConversations = async () => {
  const res = await API.get("/messages/conversations");
  return res.data;
};

// Get conversation by ID
export const getConversationById = async (conversationId) => {
  const res = await API.get(`/messages/conversations/${conversationId}`);
  return res.data;
};

// Get messages for a conversation
export const getMessages = async (conversationId, page = 1, limit = 50) => {
  const res = await API.get(`/messages/conversations/${conversationId}/messages`, {
    params: { page, limit }
  });
  return res.data;
};

// Send message
export const sendMessage = async (conversationId, messageData) => {
  const res = await API.post(`/messages/conversations/${conversationId}/messages`, messageData);
  return res.data;
};

// Create new conversation
export const createConversation = async (conversationData) => {
  const res = await API.post("/messages/conversations", conversationData);
  return res.data;
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId) => {
  const res = await API.patch(`/messages/conversations/${conversationId}/read`);
  return res.data;
};

// Get unread message count
export const getUnreadCount = async () => {
  const res = await API.get("/messages/unread-count");
  return res.data;
};

// Search conversations
export const searchConversations = async (searchTerm) => {
  const res = await API.get("/messages/conversations/search", {
    params: { q: searchTerm }
  });
  return res.data;
};

// Delete conversation
export const deleteConversation = async (conversationId) => {
  const res = await API.delete(`/messages/conversations/${conversationId}`);
  return res.data;
};

// Leave conversation
export const leaveConversation = async (conversationId) => {
  const res = await API.post(`/messages/conversations/${conversationId}/leave`);
  return res.data;
};

// Add member to conversation
export const addConversationMember = async (conversationId, memberId) => {
  const res = await API.post(`/messages/conversations/${conversationId}/members`, { memberId });
  return res.data;
};

// Remove member from conversation
export const removeConversationMember = async (conversationId, memberId) => {
  const res = await API.delete(`/messages/conversations/${conversationId}/members/${memberId}`);
  return res.data;
};

// Get typing status
export const getTypingStatus = async (conversationId) => {
  const res = await API.get(`/messages/conversations/${conversationId}/typing`);
  return res.data;
};

// Send typing indicator
export const sendTypingIndicator = async (conversationId, isTyping) => {
  const res = await API.post(`/messages/conversations/${conversationId}/typing`, { isTyping });
  return res.data;
};
