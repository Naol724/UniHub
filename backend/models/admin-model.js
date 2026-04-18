// backend/models/admin-model.js
import mongoose from "mongoose";

// Define all available permissions
export const PERMISSIONS = {
    // User Management
    VIEW_USERS: 'view_users',
    CREATE_USER: 'create_user',
    EDIT_USER: 'edit_user',
    DELETE_USER: 'delete_user',
    
    // Team Management
    VIEW_TEAMS: 'view_teams',
    CREATE_TEAM: 'create_team',
    EDIT_TEAM: 'edit_team',
    DELETE_TEAM: 'delete_team',
    
    // Task Management
    VIEW_TASKS: 'view_tasks',
    CREATE_TASK: 'create_task',
    EDIT_TASK: 'edit_task',
    DELETE_TASK: 'delete_task',
    
    // Admin Management
    VIEW_ADMINS: 'view_admins',
    CREATE_ADMIN: 'create_admin',
    EDIT_ADMIN: 'edit_admin',
    DELETE_ADMIN: 'delete_admin',
    
    // Dashboard
    VIEW_DASHBOARD: 'view_dashboard',
    
    // Settings
    VIEW_SETTINGS: 'view_settings',
    EDIT_SETTINGS: 'edit_settings',
    
    // Reports
    VIEW_REPORTS: 'view_reports',
    EXPORT_DATA: 'export_data',
};

// Role-based permission presets
export const ROLE_PERMISSIONS = {
    super_admin: Object.values(PERMISSIONS),
    
    admin: [
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.EDIT_USER,
        PERMISSIONS.VIEW_TEAMS,
        PERMISSIONS.EDIT_TEAM,
        PERMISSIONS.VIEW_TASKS,
        PERMISSIONS.EDIT_TASK,
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_REPORTS,
        PERMISSIONS.VIEW_SETTINGS,
    ],
    
    moderator: [
        PERMISSIONS.VIEW_USERS,
        PERMISSIONS.VIEW_TEAMS,
        PERMISSIONS.VIEW_TASKS,
        PERMISSIONS.VIEW_DASHBOARD,
        PERMISSIONS.VIEW_REPORTS,
    ],
};

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["super_admin", "admin", "moderator"],
        default: "admin"
    },
    permissions: {
        type: [String],
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Set default permissions based on role before saving
adminSchema.pre('save', function(next) {
    if (this.isNew && (!this.permissions || this.permissions.length === 0)) {
        this.permissions = ROLE_PERMISSIONS[this.role] || ROLE_PERMISSIONS.admin;
    }
    next();
});

// Method to check permission
adminSchema.methods.hasPermission = function(permission) {
    if (this.role === 'super_admin') return true;
    return this.permissions.includes(permission);
};

// Method to check multiple permissions
adminSchema.methods.hasAllPermissions = function(permissions) {
    if (this.role === 'super_admin') return true;
    return permissions.every(p => this.permissions.includes(p));
};

// Remove password when sending to client
adminSchema.methods.toJSON = function() {
    const admin = this.toObject();
    delete admin.password;
    return admin;
};

export default mongoose.model("Admin", adminSchema);