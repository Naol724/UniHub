import jwt from "jsonwebtoken";
import User from "../models/user-model.js";
import TeamMember from "../models/TeamMember-model.js";

export const protect = async (req, res, next) => {
  let token;
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer'))
      token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_KEY_SECRET || "your_secret_key");
    const user = await User.findById(decoded.id).select("-passwordHash");
    if (!user) return res.status(401).json({ success: false, message: "User not found" });
    if (!user.isActive) return res.status(401).json({ success: false, message: "Account is deactivated" });
    req.user = { id: user._id, first_name: user.first_name, last_name: user.last_name, email: user.email, role: user.role || "user" };
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return res.status(401).json({ success: false, message: "Invalid token" });
    if (error.name === 'TokenExpiredError') return res.status(401).json({ success: false, message: "Token expired" });
    return res.status(401).json({ success: false, message: "Not authorized" });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
  if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: `Role ${req.user.role} is not authorized` });
  next();
};

export const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') return res.status(403).json({ success: false, message: "Admin access required" });
  next();
};

export const optionalAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || process.env.JWT_KEY_SECRET || "your_secret_key");
      req.user = await User.findById(decoded.id).select("-passwordHash");
    }
  } catch (_) {}
  next();
};

export const isTeamOwnerOrAdmin = async (req, res, next) => {
  try {
    const teamId = req.params.teamId || req.body.teamID || req.body.teamId;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: "Not authenticated" });
    if (!teamId) return res.status(400).json({ success: false, message: "Team ID is required" });
    const member = await TeamMember.findOne({ userID: userId, teamId });
    if (!member) return res.status(403).json({ success: false, message: "You are not a member of this team" });
    if (member.role !== "owner" && member.role !== "admin") return res.status(403).json({ success: false, message: `Only team owner or admin can perform this action` });
    req.teamMember = member;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

export const isTeamOwner = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const member = await TeamMember.findOne({ userID: req.user.id, teamId });
    if (!member) return res.status(403).json({ success: false, message: "You are not a member of this team" });
    if (member.role !== 'owner') return res.status(403).json({ success: false, message: "Only team owner can perform this action" });
    req.teamMember = member;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

export const isTeamMember = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const member = await TeamMember.findOne({ userID: req.user.id, teamId });
    if (!member) return res.status(403).json({ success: false, message: "You are not a member of this team" });
    req.teamMember = member;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
