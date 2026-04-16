const express = require('express');
const multer = require('multer');
const path = require('path');
const {
  uploadResource,
  getResourcesForTeam,
  getResourceById,
  deleteResource
} = require('../controllers/resourceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/resources/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, documents, and zip files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// All routes require authentication
router.use(protect);

// Resource routes
router.post('/', upload.single('file'), uploadResource); // Upload file to team
router.get('/team/:teamId', getResourcesForTeam); // Get all resources for team
router.get('/:id', getResourceById); // Get single resource by ID
router.delete('/:id', deleteResource); // Delete resource

module.exports = router;