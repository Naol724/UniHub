const express = require("express");
const router = express.Router();
const { getAllUsers, searchUsers, getUserById } = require("../controllers/userController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

router.get("/:userId", getUserById);
router.get("/", protect, getAllUsers);
router.get("/search", protect, searchUsers);

module.exports = router;
