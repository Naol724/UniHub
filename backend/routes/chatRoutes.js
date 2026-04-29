// backend/routes/chatRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getUserChatRooms,
  getChatMessages,
  sendMessage,
  createChatRoom,
  createDirectChat,
  editMessage,
  deleteMessage,
  addReaction,
  removeReaction,
  leaveChatRoom,
  addParticipant,
  searchMessages,
  createHouseInquiryChat
} from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for chat file uploads
const uploadsDir = path.join(process.cwd(), 'uploads', 'chat');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images and common document files
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only images and documents are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 5 // Maximum 5 files
  }
});

// All chat routes require authentication
router.use(protect);

// Chat room routes
router.get('/rooms', getUserChatRooms);
router.post('/rooms', createChatRoom);
router.post('/direct/:userId', createDirectChat);
router.get('/rooms/:roomId/messages', getChatMessages);
router.post('/rooms/:roomId/messages', upload.array('attachments', 5), sendMessage);
router.get('/rooms/:roomId/search', searchMessages);
router.delete('/rooms/:roomId/participants', leaveChatRoom);
router.post('/rooms/:roomId/participants', addParticipant);

// Message routes
router.patch('/messages/:messageId', editMessage);
router.delete('/messages/:messageId', deleteMessage);
router.post('/messages/:messageId/reactions', addReaction);
router.delete('/messages/:messageId/reactions', removeReaction);

// House inquiry chat
router.post('/house/:houseId/inquiry', createHouseInquiryChat);

export default router;
