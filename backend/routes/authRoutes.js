const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { protect, optionalAuth, authorize } = require("../middleware/authMiddleware");
const { userRegister, userLogin, updateProfile, getUserProfile, uploadProfileImage, changePassword, getAllUsers, searchUsers } = require("../controllers/authController");

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

router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/profile/:id", getUserProfile);
router.put("/profile/:id", updateProfile);
router.post("/profile/:id/upload-image", upload.single('profileImage'), uploadProfileImage);
router.post("/profile/:id/change-password", changePassword);
router.get("/users", getAllUsers);
router.get("/users/search", searchUsers);

module.exports = router;
