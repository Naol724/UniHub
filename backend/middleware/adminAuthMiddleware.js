// backend/middleware/adminAuthMiddleware.js
import jwt from "jsonwebtoken";
import Admin from "../models/admin-model.js";

// Protect admin routes - Verify admin token
export const protectAdmin = async (req, res, next) => {
    let token;
    
    try {
        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: "Not authorized, no token provided" 
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_KEY_SECRET || "your_secret_key");
        
        // Check if it's an admin token (has role property)
        if (!decoded.role || (decoded.role !== 'super_admin' && decoded.role !== 'admin' && decoded.role !== 'moderator')) {
            return res.status(403).json({ 
                success: false,
                message: "Admin access required" 
            });
        }
        
        // Find admin in database
        const admin = await Admin.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({ 
                success: false,
                message: "Admin not found" 
            });
        }
        
        // Check if admin is active
        if (!admin.isActive) {
            return res.status(401).json({ 
                success: false,
                message: "Account is deactivated. Please contact super admin." 
            });
        }
        
        // Attach admin to request
        req.admin = {
            id: admin._id,
            name: admin.name,
            username: admin.username,
            role: admin.role,
            permissions: admin.permissions || []
        };
        
        next();
    } catch (error) {
        console.error("Admin auth middleware error:", error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                success: false, 
                message: "Invalid token" 
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                message: "Token expired. Please login again." 
            });
        }
        return res.status(401).json({ 
            success: false, 
            message: "Not authorized" 
        });
    }
};

// Check specific admin role
export const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({ 
                success: false, 
                message: "Not authenticated" 
            });
        }
        
        if (!roles.includes(req.admin.role)) {
            return res.status(403).json({ 
                success: false, 
                message: `Access denied. Required role: ${roles.join(' or ')}` 
            });
        }
        
        next();
    };
};

// Check admin permission
// backend/middleware/adminAuthMiddleware.js - Update requirePermission
export const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({ 
                success: false, 
                message: "Not authenticated" 
            });
        }
        
        // Super admin has all permissions
        if (req.admin.role === 'super_admin') {
            return next();
        }
        
        // For now, allow all authenticated admins (temporary)
        // Remove this after setting up permissions properly
        return next();
        
        // Original permission check (commented out for now)
        // if (!req.admin.permissions || !req.admin.permissions.includes(permission)) {
        //     return res.status(403).json({ 
        //         success: false, 
        //         message: `Access denied. Required permission: ${permission}` 
        //     });
        // }
        
        // next();
    };
};

// Check if admin has any of the given permissions
export const requireAnyPermission = (permissions) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({ 
                success: false, 
                message: "Not authenticated" 
            });
        }
        
        // Super admin has all permissions
        if (req.admin.role === 'super_admin') {
            return next();
        }
        
        const hasPermission = permissions.some(p => req.admin.permissions?.includes(p));
        
        if (!hasPermission) {
            return res.status(403).json({ 
                success: false, 
                message: `Access denied. Required one of permissions: ${permissions.join(', ')}` 
            });
        }
        
        next();
    };
};

// Check if admin has all given permissions
export const requireAllPermissions = (permissions) => {
    return (req, res, next) => {
        if (!req.admin) {
            return res.status(401).json({ 
                success: false, 
                message: "Not authenticated" 
            });
        }
        
        // Super admin has all permissions
        if (req.admin.role === 'super_admin') {
            return next();
        }
        
        const hasAllPermissions = permissions.every(p => req.admin.permissions?.includes(p));
        
        if (!hasAllPermissions) {
            return res.status(403).json({ 
                success: false, 
                message: `Access denied. Required all permissions: ${permissions.join(', ')}` 
            });
        }
        
        next();
    };
};