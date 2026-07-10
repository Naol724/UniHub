import express from "express";
import { getAllUsers, searchUsers, getUserById } from "../controllers/userController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/search", protect, searchUsers);
router.get("/", protect, getAllUsers);
router.get("/:userId", protect, getUserById);

export default router;
