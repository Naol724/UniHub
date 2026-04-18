// backend/routes/userRoutes.js
import { Router } from "express";
import { getAllUsers, searchUsers, getUserById } from "../controllers/userController.js";
import { protect, isAdmin } from "../middleware/authMiddleware.js";

const userRouter = Router();

// Public route - get user by ID (limited info)
userRouter.get("/:userId", getUserById);

// Admin only routes
userRouter.get("/", protect, getAllUsers);
userRouter.get("/search", protect, searchUsers);

export default userRouter;