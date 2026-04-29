import express from "express";
import { getAllUsers, searchUsers, getUserById } from "../controllers/userController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:userId", getUserById);
router.get("/", protect, getAllUsers);
router.get("/search", protect, searchUsers);

export default router;
