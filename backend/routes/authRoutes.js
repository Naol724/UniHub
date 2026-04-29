import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect, optionalAuth, authorize } from "../middleware/authMiddleware.js";
import { userRegister, userLogin, updateProfile, getUserProfile, uploadProfileImage, changePassword, getAllUsers, searchUsers } from "../controllers/authController.js";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = './uploads/profiles';
        if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, 'profile-' + Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|gif/;
        if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) cb(null, true);
        else cb(new Error('Only images are allowed'));
    }
});

router.post("/user/register", userRegister);
router.post("/user/login", userLogin);
router.get("/profile/:id", getUserProfile);
router.put("/profile/:id", updateProfile);
router.post("/profile/:id/upload-image", upload.single('profileImage'), uploadProfileImage);
router.post("/profile/:id/change-password", changePassword);
router.get("/users", getAllUsers);
router.get("/users/search", searchUsers);

export default router;
