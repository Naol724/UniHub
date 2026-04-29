// backend/socket/chatSocket.js
import Message from '../models/Message.js';
import ChatRoom from '../models/ChatRoom.js';
import User from '../models/User.js';

export const initializeChatSocket = (io) => {
  // Store online users
  const onlineUsers = new Map();

  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room for notifications
    socket.on('authenticate', async (userId) => {
      try {
        // Verify user exists
        const user = await User.findById(userId);
        if (!user) {
          socket.emit('error', { message: 'Invalid user' });
          return;
        }

        // Store user mapping
        onlineUsers.set(userId.toString(), socket.id);
        socket.userId = userId;

        // Join user to their personal room
        socket.join(userId.toString());

        // Get user's chat rooms and join them
        const chatRooms = await ChatRoom.findForUser(userId);
        chatRooms.forEach(room => {
          socket.join(room._id.toString());
        });

        // Notify others that user is online
        socket.broadcast.emit('user_online', { userId });

        // Send online users list to the connected user
        const onlineUsersList = Array.from(onlineUsers.keys());
        socket.emit('online_users', onlineUsersList);

        console.log(`User ${userId} authenticated and connected`);
      } catch (error) {
        console.error('Authentication error:', error);
        socket.emit('error', { message: 'Authentication failed' });
      }
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { roomId, content, messageType = 'text', replyTo } = data;

        if (!socket.userId) {
          socket.emit('error', { message: 'Not authenticated' });
          return;
        }

        // Check if user is participant in the room
        const chatRoom = await ChatRoom.findById(roomId);
        if (!chatRoom || !chatRoom.isParticipant(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Create message
        const message = await Message.create({
          content,
          messageType,
          sender: socket.userId,
          chatRoom: roomId,
          replyTo
        });

        // Update chat room's last message
        chatRoom.lastMessage = message._id;
        chatRoom.lastMessageAt = message.createdAt;
        await chatRoom.save();

        // Populate message details
        await message.populate('sender', 'name email');
        await message.populate('replyTo', 'content sender');

        // Send message to all participants in the room
        io.to(roomId).emit('new_message', message);

        // Send notification to participants who are not in the room
        const participants = chatRoom.participants
          .filter(p => p.user.toString() !== socket.userId.toString())
          .map(p => p.user.toString());

        participants.forEach(participantId => {
          const participantSocketId = onlineUsers.get(participantId);
          if (participantSocketId && !socket.rooms.has(roomId)) {
            io.to(participantSocketId).emit('new_message_notification', {
              message,
              chatRoom,
              sender: message.sender
            });
          }
        });

      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicators
    socket.on('typing_start', (data) => {
      const { roomId } = data;
      if (socket.userId) {
        socket.to(roomId).emit('user_typing', {
          userId: socket.userId,
          roomId
        });
      }
    });

    socket.on('typing_stop', (data) => {
      const { roomId } = data;
      if (socket.userId) {
        socket.to(roomId).emit('user_stop_typing', {
          userId: socket.userId,
          roomId
        });
      }
    });

    // Mark messages as read
    socket.on('mark_read', async (data) => {
      try {
        const { roomId, messageIds } = data;

        if (!socket.userId) return;

        // Mark messages as read
        await Promise.all(
          messageIds.map(messageId => 
            Message.findById(messageId).then(message => {
              if (message) return message.markAsRead(socket.userId);
            })
          )
        );

        // Update chat room's last read time
        const chatRoom = await ChatRoom.findById(roomId);
        if (chatRoom) {
          await chatRoom.updateLastRead(socket.userId);
        }

        // Notify other participants that messages were read
        socket.to(roomId).emit('messages_read', {
          userId: socket.userId,
          messageIds
        });

      } catch (error) {
        console.error('Mark read error:', error);
      }
    });

    // Add reaction to message
    socket.on('add_reaction', async (data) => {
      try {
        const { messageId, emoji } = data;

        if (!socket.userId) return;

        const message = await Message.findById(messageId);
        if (!message) return;

        // Check if user is participant in the chat room
        const chatRoom = await ChatRoom.findById(message.chatRoom);
        if (!chatRoom || !chatRoom.isParticipant(socket.userId)) return;

        await message.addReaction(socket.userId, emoji);
        await message.populate('reactions.user', 'name');

        // Send updated message to all participants
        io.to(message.chatRoom.toString()).emit('message_updated', message);

      } catch (error) {
        console.error('Add reaction error:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Remove reaction from message
    socket.on('remove_reaction', async (data) => {
      try {
        const { messageId } = data;

        if (!socket.userId) return;

        const message = await Message.findById(messageId);
        if (!message) return;

        await message.removeReaction(socket.userId);
        await message.populate('reactions.user', 'name');

        // Send updated message to all participants
        io.to(message.chatRoom.toString()).emit('message_updated', message);

      } catch (error) {
        console.error('Remove reaction error:', error);
      }
    });

    // Join chat room
    socket.on('join_room', async (roomId) => {
      try {
        if (!socket.userId) return;

        const chatRoom = await ChatRoom.findById(roomId);
        if (!chatRoom || !chatRoom.isParticipant(socket.userId)) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        socket.join(roomId);

        // Notify others that user joined
        socket.to(roomId).emit('user_joined', {
          userId: socket.userId,
          roomId
        });

      } catch (error) {
        console.error('Join room error:', error);
      }
    });

    // Leave chat room
    socket.on('leave_room', (roomId) => {
      try {
        if (!socket.userId) return;

        socket.leave(roomId);

        // Notify others that user left
        socket.to(roomId).emit('user_left', {
          userId: socket.userId,
          roomId
        });

      } catch (error) {
        console.error('Leave room error:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      try {
        if (socket.userId) {
          // Remove from online users
          onlineUsers.delete(socket.userId.toString());

          // Notify others that user is offline
          socket.broadcast.emit('user_offline', { userId: socket.userId });

          console.log(`User ${socket.userId} disconnected`);
        }
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Helper function to send notification to specific user
  const sendNotificationToUser = (userId, notification) => {
    const socketId = onlineUsers.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit('notification', notification);
    }
  };

  // Helper function to send message to chat room
  const sendMessageToRoom = (roomId, message) => {
    io.to(roomId).emit('new_message', message);
  };

  // Make helper functions available globally
  global.chatSocketHelpers = {
    sendNotificationToUser,
    sendMessageToRoom,
    onlineUsers
  };

  console.log('Chat socket initialized');
};
