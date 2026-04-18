// backend/controllers/adminController.js
import Admin, { PERMISSIONS, ROLE_PERMISSIONS } from "../models/admin-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// ==================== PUBLIC ROUTES ====================

// Register First Admin (Public)
export const register = async (req, res) => {
    console.log("\n🔐 REGISTER ADMIN");
    console.log("Request body:", req.body);
    
    const { name, username, password, confirmPassword } = req.body;
    
    try {
        // Validation
        if (!name || !username || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }
        
        // Check if username exists
        const existingAdmin = await Admin.findOne({ username: username.toLowerCase() });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Username already exists"
            });
        }
        
        // Check if this is the first admin
        const adminCount = await Admin.countDocuments();
        const role = adminCount === 0 ? "super_admin" : "admin";
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Set permissions based on role
        const permissions = adminCount === 0 ? ROLE_PERMISSIONS.super_admin : ROLE_PERMISSIONS.admin;
        
        // Create admin
        const admin = new Admin({
            name,
            username: username.toLowerCase(),
            password: hashedPassword,
            role: role,
            permissions: permissions,
            isActive: true
        });
        
        await admin.save();
        
        // Generate token
        const token = jwt.sign(
            { 
                id: admin._id, 
                username: admin.username, 
                role: admin.role,
                permissions: admin.permissions
            },
            process.env.JWT_KEY_SECRET || "your_secret_key",
            { expiresIn: "7d" }
        );
        
        console.log("✅ Admin created successfully:", admin.username);
        
        res.status(201).json({
            success: true,
            message: "Admin registered successfully",
            token: `Bearer ${token}`,
            admin: {
                id: admin._id,
                name: admin.name,
                username: admin.username,
                role: admin.role,
                permissions: admin.permissions
            }
        });
        
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Login (Public)
export const login = async (req, res) => {
    console.log("\n🔐 ADMIN LOGIN");
    console.log("Request body:", req.body);
    
    const { username, password } = req.body;
    
    try {
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }
        
        const admin = await Admin.findOne({ username: username.toLowerCase() });
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        
        if (!admin.isActive) {
            return res.status(401).json({
                success: false,
                message: "Account is deactivated"
            });
        }
        
        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }
        
        // Update last login
        admin.lastLogin = new Date();
        await admin.save();
        
        const token = jwt.sign(
            { 
                id: admin._id, 
                username: admin.username, 
                role: admin.role,
                permissions: admin.permissions
            },
            process.env.JWT_KEY_SECRET || "your_secret_key",
            { expiresIn: "7d" }
        );
        
        console.log("✅ Login successful:", admin.username);
        
        res.json({
            success: true,
            message: "Login successful",
            token: `Bearer ${token}`,
            admin: {
                id: admin._id,
                name: admin.name,
                username: admin.username,
                role: admin.role,
                permissions: admin.permissions
            }
        });
        
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==================== PROTECTED ROUTES ====================

// Get Admin Profile
export const getProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin.id).select("-password");
        
        res.json({
            success: true,
            admin
        });
        
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Admin Profile
export const updateProfile = async (req, res) => {
    const { name, username } = req.body;
    
    try {
        const admin = await Admin.findById(req.admin.id);
        
        if (name) admin.name = name;
        if (username) admin.username = username.toLowerCase();
        
        await admin.save();
        
        res.json({
            success: true,
            message: "Profile updated successfully",
            admin: {
                id: admin._id,
                name: admin.name,
                username: admin.username,
                role: admin.role
            }
        });
        
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Change Password
export const changePassword = async (req, res) => {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    
    try {
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All password fields are required"
            });
        }
        
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New passwords do not match"
            });
        }
        
        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }
        
        const admin = await Admin.findById(req.admin.id);
        
        const isValid = await bcrypt.compare(currentPassword, admin.password);
        if (!isValid) {
            return res.status(401).json({
                success: false,
                message: "Current password is incorrect"
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        admin.password = await bcrypt.hash(newPassword, salt);
        await admin.save();
        
        res.json({
            success: true,
            message: "Password changed successfully"
        });
        
    } catch (error) {
        console.error("Change password error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Admins (Requires VIEW_ADMINS permission)
export const getAllAdmins = async (req, res) => {
    try {
        if (!req.admin.hasPermission(PERMISSIONS.VIEW_ADMINS)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You don't have permission to view admins"
            });
        }
        
        const admins = await Admin.find().select("-password").sort({ createdAt: -1 });
        
        res.json({
            success: true,
            admins
        });
        
    } catch (error) {
        console.error("Get all admins error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Create New Admin (Requires CREATE_ADMIN permission)
export const createAdmin = async (req, res) => {
    try {
        if (!req.admin.hasPermission(PERMISSIONS.CREATE_ADMIN)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You don't have permission to create admins"
            });
        }
        
        const { name, username, password, confirmPassword, role } = req.body;
        
        if (!name || !username || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }
        
        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Passwords do not match"
            });
        }
        
        const existingAdmin = await Admin.findOne({ username: username.toLowerCase() });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Username already exists"
            });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Set permissions based on role
        const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.admin;
        
        const admin = new Admin({
            name,
            username: username.toLowerCase(),
            password: hashedPassword,
            role: role || "admin",
            permissions: permissions,
            isActive: true
        });
        
        await admin.save();
        
        res.status(201).json({
            success: true,
            message: "Admin created successfully",
            admin: {
                id: admin._id,
                name: admin.name,
                username: admin.username,
                role: admin.role,
                permissions: admin.permissions
            }
        });
        
    } catch (error) {
        console.error("Create admin error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update Admin Role & Permissions (Requires EDIT_ADMIN permission)
export const updateAdmin = async (req, res) => {
    const { id } = req.params;
    const { role, permissions, isActive } = req.body;
    
    try {
        if (!req.admin.hasPermission(PERMISSIONS.EDIT_ADMIN)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You don't have permission to edit admins"
            });
        }
        
        const admin = await Admin.findById(id);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }
        
        // Prevent self demotion
        if (id === req.admin.id && role && role !== req.admin.role) {
            return res.status(400).json({
                success: false,
                message: "Cannot change your own role"
            });
        }
        
        if (role) admin.role = role;
        if (permissions) admin.permissions = permissions;
        if (isActive !== undefined) admin.isActive = isActive;
        
        await admin.save();
        
        res.json({
            success: true,
            message: "Admin updated successfully",
            admin: {
                id: admin._id,
                name: admin.name,
                username: admin.username,
                role: admin.role,
                permissions: admin.permissions,
                isActive: admin.isActive
            }
        });
        
    } catch (error) {
        console.error("Update admin error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Delete Admin (Requires DELETE_ADMIN permission)
export const deleteAdmin = async (req, res) => {
    const { id } = req.params;
    
    try {
        if (!req.admin.hasPermission(PERMISSIONS.DELETE_ADMIN)) {
            return res.status(403).json({
                success: false,
                message: "Access denied. You don't have permission to delete admins"
            });
        }
        
        if (id === req.admin.id) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete your own account"
            });
        }
        
        const admin = await Admin.findByIdAndDelete(id);
        
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found"
            });
        }
        
        res.json({
            success: true,
            message: "Admin deleted successfully"
        });
        
    } catch (error) {
        console.error("Delete admin error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get All Permissions (For frontend reference)
export const getAllPermissions = async (req, res) => {
    try {
        res.json({
            success: true,
            permissions: PERMISSIONS,
            rolePermissions: ROLE_PERMISSIONS
        });
        
    } catch (error) {
        console.error("Get permissions error:", error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};