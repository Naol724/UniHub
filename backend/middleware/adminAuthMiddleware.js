import jwt from "jsonwebtoken";
import Admin from "../models/admin-model.js";

const protectAdmin = async (req, res, next) => {
    let token;
    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
            token = req.headers.authorization.split(' ')[1];
        if (!token) return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
        const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_KEY_SECRET || "your_secret_key");
        if (!decoded.role || !['super_admin', 'admin', 'moderator'].includes(decoded.role))
            return res.status(403).json({ success: false, message: "Admin access required" });
        const admin = await Admin.findById(decoded.id);
        if (!admin) return res.status(401).json({ success: false, message: "Admin not found" });
        if (!admin.isActive) return res.status(401).json({ success: false, message: "Account is deactivated" });
        req.admin = { id: admin._id, name: admin.name, username: admin.username, role: admin.role, permissions: admin.permissions || [] };
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: "Invalid token" });
        if (error.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: "Token expired" });
        return res.status(401).json({ success: false, message: "Not authorized" });
    }
};

const requireRole = (roles) => (req, res, next) => {
    if (!req.admin) return res.status(401).json({ success: false, message: "Not authenticated" });
    if (!roles.includes(req.admin.role)) return res.status(403).json({ success: false, message: `Access denied. Required role: ${roles.join(' or ')}` });
    next();
};

const requirePermission = (permission) => (req, res, next) => {
    if (!req.admin) return res.status(401).json({ success: false, message: "Not authenticated" });
    if (req.admin.role === 'super_admin') return next();
    next();
};

export { protectAdmin, requireRole, requirePermission };
