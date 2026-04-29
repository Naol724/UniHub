// backend/routes/houseRoutes.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  createHouse,
  getHouses,
  getHouseById,
  updateHouse,
  deleteHouse,
  uploadHouseImages,
  setMainImage,
  deleteHouseImage,
  getUserHouseListings,
  getFeaturedHouses,
  searchHousesByLocation,
  searchHouses,
  toggleFeatured
} from '../controllers/houseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Configure multer for house image uploads
const uploadsDir = path.join(process.cwd(), 'uploads', 'houses');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'house-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 10 // Maximum 10 files
  }
});

// Public routes
router.get('/', getHouses);
router.get('/featured', getFeaturedHouses);
router.get('/search', searchHouses);
router.get('/search/location', searchHousesByLocation);
router.get('/:id', getHouseById);

// Protected routes
router.use(protect); // All routes below this require authentication

router.post('/', upload.array('images', 10), createHouse);
router.get('/user/listings', getUserHouseListings);
router.put('/:id', updateHouse);
router.delete('/:id', deleteHouse);

// Image management routes
router.post('/:id/images', upload.array('images', 10), uploadHouseImages);
router.patch('/:id/images/:imageId/main', setMainImage);
router.delete('/:id/images/:imageId', deleteHouseImage);

// Admin only route
router.patch('/:id/featured', toggleFeatured);

export default router;
