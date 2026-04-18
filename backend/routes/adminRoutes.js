// backend/routes/adminRoutes.js
import { Router } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/admin-model.js";
import {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    getAllAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    getAllPermissions
} from "../controllers/adminController.js";

const adminRouter = Router();

// ==================== AUTHENTICATION MIDDLEWARE ====================
const protectAdmin = async (req, res, next) => {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no token provided"
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY_SECRET || "your_secret_key");
        const admin = await Admin.findById(decoded.id);
        
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Admin not found"
            });
        }
        
        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account is deactivated"
            });
        }
        
        req.admin = admin;
        next();
        
    } catch (error) {
        console.error("Auth error:", error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: "Token expired"
            });
        }
        
        return res.status(401).json({
            success: false,
            message: "Not authorized"
        });
    }
};

// ==================== PUBLIC ROUTES (No authentication) ====================
adminRouter.post("/register", register);
adminRouter.post("/login", login);

// ==================== PROTECTED ROUTES (Authentication required) ====================
adminRouter.use(protectAdmin);

// Profile routes
adminRouter.get("/profile", getProfile);
adminRouter.put("/profile", updateProfile);
adminRouter.post("/change-password", changePassword);

// Admin management routes (with permissions)
adminRouter.get("/all", getAllAdmins);
adminRouter.post("/create", createAdmin);
adminRouter.put("/:id", updateAdmin);
adminRouter.delete("/:id", deleteAdmin);

// Permissions
adminRouter.get("/permissions", getAllPermissions);

// Test route
adminRouter.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Admin route is working!",
        admin: {
            id: req.admin.id,
            name: req.admin.name,
            role: req.admin.role,
            permissions: req.admin.permissions
        }
    });
});

export default adminRouter;