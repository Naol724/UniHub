import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  uploadResource,
  getMyResources,
  getResourcesForTeam,
  getResourceById,
  deleteResource
} from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const uploadDir = 'uploads/resources';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip'
  ];
  if (allowedTypes.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Invalid file type. Only images, PDFs, documents, and zip files are allowed.'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.use(protect);

router.post('/', upload.single('file'), uploadResource);
router.get('/', getMyResources);
router.get('/team/:teamId', getResourcesForTeam);
router.get('/:id', getResourceById);
router.delete('/:id', deleteResource);

export default router;
