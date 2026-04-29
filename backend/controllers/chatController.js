// backend/controllers/chatController.js
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import House from '../models/House.js';
import fs from 'fs/promises';

// @desc    Get user's chat rooms
// @route   GET /api/chat/rooms
// @access  Private
export const getUserChatRooms = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;

  const filters = {};
  if (type) filters.type = type;

  const chatRooms = await ChatRoom.findForUser(req.user._id, filters)
    .skip((parseInt(page) - 1) * parseInt(limit))
    .limit(parseInt(limit));

  // Add unread count for each room
  const chatRoomsWithUnread = await Promise.all(
    chatRooms.map(async (room) => {
      const unreadCount = await Message.getUnreadCount(req.user._id, room._id);
      return room.toObject({ virtuals: true });
    })
  );

  const total = await ChatRoom.countDocuments({
    'participants.user': req.user._id,
    isActive: true,
    ...filters
  });

  res.status(200).json({
    success: true,
    data: chatRoomsWithUnread,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// @desc    Get messages for a chat room
// @route   GET /api/chat/rooms/:roomId/messages
// @access  Private
export const getChatMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  // Check if user is participant
  const chatRoom = await ChatRoom.findById(roomId);
  if (!chatRoom || !chatRoom.isParticipant(req.user._id)) {
    throw new ApiError(403, 'Access denied to this chat room');
  }

  const messages = await Message.getChatMessages(roomId, parseInt(page), parseInt(limit));

  // Mark messages as read
  await Promise.all(
    messages.map(message => message.markAsRead(req.user._id))
  );

  // Update user's last read time in chat room
  await chatRoom.updateLastRead(req.user._id);

  res.status(200).json({
    success: true,
    data: messages
  });
});

// @desc    Send a message
// @route   POST /api/chat/rooms/:roomId/messages
// @access  Private
export const sendMessage = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { content, messageType = 'text', replyTo } = req.body;

  if (!content && messageType === 'text') {
    throw new ApiError(400, 'Message content is required');
  }

  // Check if user is participant
  const chatRoom = await ChatRoom.findById(roomId);
  if (!chatRoom || !chatRoom.isParticipant(req.user._id)) {
    throw new ApiError(403, 'Access denied to this chat room');
  }

  // Create message
  const message = await Message.create({
    content,
    messageType,
    sender: req.user._id,
    chatRoom: roomId,
    replyTo
  });

  // Add attachments if any
  if (req.files && req.files.length > 0) {
    const attachments = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimeType: file.mimetype
    }));
    
    message.attachments = attachments;
    await message.save();
  }

  // Update chat room's last message
  chatRoom.lastMessage = message._id;
  chatRoom.lastMessageAt = message.createdAt;
  await chatRoom.save();

  // Populate message details
  await message.populate('sender', 'name email');
  await message.populate('replyTo', 'content sender');

  res.status(201).json({
    success: true,
    data: message
  });
});

// @desc    Create a new chat room
// @route   POST /api/chat/rooms
// @access  Private
export const createChatRoom = asyncHandler(async (req, res) => {
  const { name, type, description, participants, metadata } = req.body;

  if (!name || !type) {
    throw new ApiError(400, 'Name and type are required');
  }

  if (!['direct', 'group', 'service'].includes(type)) {
    throw new ApiError(400, 'Invalid chat room type');
  }

  // For direct chat, ensure only 2 participants
  if (type === 'direct' && (!participants || participants.length !== 1)) {
    throw new ApiError(400, 'Direct chat must have exactly 1 other participant');
  }

  // Check if direct chat already exists
  if (type === 'direct') {
    const existingChat = await ChatRoom.findDirectChat(req.user._id, participants[0]);
    if (existingChat) {
      return res.status(200).json({
        success: true,
        message: 'Direct chat already exists',
        data: existingChat
      });
    }
  }

  // Create chat room
  const chatRoomData = {
    name,
    type,
    description,
    createdBy: req.user._id,
    metadata: metadata || {}
  };

  // Add participants
  chatRoomData.participants = [
    { user: req.user._id, role: 'admin' }
  ];

  if (participants && participants.length > 0) {
    participants.forEach(userId => {
      chatRoomData.participants.push({ user: userId, role: 'member' });
    });
  }

  const chatRoom = await ChatRoom.create(chatRoomData);

  // Populate for response
  await chatRoom.populate('participants.user', 'name email');
  await chatRoom.populate('createdBy', 'name email');

  res.status(201).json({
    success: true,
    data: chatRoom
  });
});

// @desc    Create or get direct chat with user
// @route   POST /api/chat/direct/:userId
// @access  Private
export const createDirectChat = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Check if target user exists
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new ApiError(404, 'User not found');
  }

  // Check if direct chat already exists
  let chatRoom = await ChatRoom.findDirectChat(req.user._id, userId);

  if (!chatRoom) {
    // Create new direct chat
    chatRoom = await ChatRoom.createDirectChat(req.user._id, userId);
  }

  // Populate for response
  await chatRoom.populate('participants.user', 'name email');

  res.status(200).json({
    success: true,
    data: chatRoom
  });
});

// @desc    Edit a message
// @route   PATCH /api/chat/messages/:messageId
// @access  Private
export const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, 'Message content is required');
  }

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  // Check if user is the sender
  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only edit your own messages');
  }

  // Check if message is too old to edit (24 hours)
  const hoursSinceCreation = (Date.now() - message.createdAt) / (1000 * 60 * 60);
  if (hoursSinceCreation > 24) {
    throw new ApiError(400, 'Messages can only be edited within 24 hours');
  }

  await message.editMessage(content);

  res.status(200).json({
    success: true,
    data: message
  });
});

// @desc    Delete a message
// @route   DELETE /api/chat/messages/:messageId
// @access  Private
export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  // Check if user is the sender
  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only delete your own messages');
  }

  await message.softDelete();

  res.status(200).json({
    success: true,
    message: 'Message deleted successfully'
  });
});

// @desc    Add reaction to message
// @route   POST /api/chat/messages/:messageId/reactions
// @access  Private
export const addReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;

  if (!emoji) {
    throw new ApiError(400, 'Emoji is required');
  }

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  // Check if user is participant in the chat room
  const chatRoom = await ChatRoom.findById(message.chatRoom);
  if (!chatRoom || !chatRoom.isParticipant(req.user._id)) {
    throw new ApiError(403, 'Access denied to this chat room');
  }

  await message.addReaction(req.user._id, emoji);

  res.status(200).json({
    success: true,
    data: message
  });
});

// @desc    Remove reaction from message
// @route   DELETE /api/chat/messages/:messageId/reactions
// @access  Private
export const removeReaction = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) {
    throw new ApiError(404, 'Message not found');
  }

  await message.removeReaction(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Reaction removed successfully'
  });
});

// @desc    Leave a chat room
// @route   DELETE /api/chat/rooms/:roomId/participants
// @access  Private
export const leaveChatRoom = asyncHandler(async (req, res) => {
  const { roomId } = req.params;

  const chatRoom = await ChatRoom.findById(roomId);
  if (!chatRoom) {
    throw new ApiError(404, 'Chat room not found');
  }

  if (!chatRoom.isParticipant(req.user._id)) {
    throw new ApiError(403, 'You are not a participant in this chat room');
  }

  await chatRoom.removeParticipant(req.user._id);

  res.status(200).json({
    success: true,
    message: 'Left chat room successfully'
  });
});

// @desc    Add participant to chat room
// @route   POST /api/chat/rooms/:roomId/participants
// @access  Private
export const addParticipant = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { userId, role = 'member' } = req.body;

  if (!userId) {
    throw new ApiError(400, 'User ID is required');
  }

  const chatRoom = await ChatRoom.findById(roomId);
  if (!chatRoom) {
    throw new ApiError(404, 'Chat room not found');
  }

  // Check if user is admin or creator
  const userParticipant = chatRoom.participants.find(
    p => p.user.toString() === req.user._id.toString()
  );
  
  if (!userParticipant || (userParticipant.role !== 'admin' && chatRoom.createdBy.toString() !== req.user._id.toString())) {
    throw new ApiError(403, 'Only admins can add participants');
  }

  // Check if target user exists
  const targetUser = await User.findById(userId);
  if (!targetUser) {
    throw new ApiError(404, 'User not found');
  }

  await chatRoom.addParticipant(userId, role);

  res.status(200).json({
    success: true,
    message: 'Participant added successfully',
    data: chatRoom
  });
});

// @desc    Search messages in chat room
// @route   GET /api/chat/rooms/:roomId/search
// @access  Private
export const searchMessages = asyncHandler(async (req, res) => {
  const { roomId } = req.params;
  const { q: searchTerm, page = 1, limit = 20 } = req.query;

  if (!searchTerm) {
    throw new ApiError(400, 'Search term is required');
  }

  // Check if user is participant
  const chatRoom = await ChatRoom.findById(roomId);
  if (!chatRoom || !chatRoom.isParticipant(req.user._id)) {
    throw new ApiError(403, 'Access denied to this chat room');
  }

  const messages = await Message.searchMessages(roomId, searchTerm, parseInt(page), parseInt(limit));

  res.status(200).json({
    success: true,
    data: messages
  });
});

// @desc    Create service chat for house inquiry
// @route   POST /api/chat/house/:houseId/inquiry
// @access  Private
export const createHouseInquiryChat = asyncHandler(async (req, res) => {
  const { houseId } = req.params;
  const { message } = req.body;

  if (!message) {
    throw new ApiError(400, 'Message is required');
  }

  // Check if house exists
  const house = await House.findById(houseId).populate('postedBy');
  if (!house) {
    throw new ApiError(404, 'House not found');
  }

  // Check if service chat already exists for this house and user
  let chatRoom = await ChatRoom.findOne({
    type: 'service',
    'metadata.houseId': houseId,
    'participants.user': { $all: [req.user._id, house.postedBy._id] },
    isActive: true
  });

  if (!chatRoom) {
    // Create new service chat
    chatRoom = await ChatRoom.create({
      name: `Inquiry: ${house.title}`,
      type: 'service',
      description: `Chat about house: ${house.title}`,
      participants: [
        { user: req.user._id, role: 'member' },
        { user: house.postedBy._id, role: 'admin' }
      ],
      createdBy: req.user._id,
      metadata: {
        houseId: house._id,
        serviceType: 'house_inquiry'
      }
    });
  }

  // Create initial message
  const initialMessage = await Message.create({
    content: message,
    messageType: 'text',
    sender: req.user._id,
    chatRoom: chatRoom._id
  });

  // Update chat room
  chatRoom.lastMessage = initialMessage._id;
  chatRoom.lastMessageAt = initialMessage.createdAt;
  await chatRoom.save();

  // Populate for response
  await chatRoom.populate('participants.user', 'name email');
  await initialMessage.populate('sender', 'name email');

  res.status(201).json({
    success: true,
    data: {
      chatRoom,
      message: initialMessage
    }
  });
});
