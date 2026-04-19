// backend/routes/authRoutes.js
import { Router } from "express";
import { 
  userLogin, 
  userRegister,
  updateProfile,
  getUserProfile,
  uploadProfileImage,
  changePassword,
  getAllUsers,
  searchUsers
} from "../controllers/authController.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const authRouter = Router();

// Configure multer for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/profiles';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// Auth routes
authRouter.post("/register", userRegister);
authRouter.post("/login", userLogin);

// Profile routes
authRouter.get("/profile/:id", getUserProfile);
authRouter.put("/profile/:id", updateProfile);
authRouter.post("/profile/:id/upload-image", upload.single('profileImage'), uploadProfileImage);
authRouter.post("/profile/:id/change-password", changePassword);

// User list routes
authRouter.get("/users", getAllUsers);
authRouter.get("/users/search", searchUsers);

export default authRouter;