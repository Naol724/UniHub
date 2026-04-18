// // backend/routes/adminRoutes.js
// import { Router } from "express";
// import { 
//     adminRegister, 
//     adminLogin, 
//     getAdminProfile,
//     updateAdminProfile,
//     changeAdminPassword,
//     getAllAdmins,
//     updateAdminRole,
//     deleteAdmin,
//     getAvailablePermissions
// } from "../controllers/adminController.js";
// import { protectAdmin } from "../middleware/adminAuthMiddleware.js";

// const adminRouter = Router();

// // Public routes (no authentication needed)
// adminRouter.post("/register", adminRegister);  // This should be PUBLIC
// adminRouter.post("/login", adminLogin);

// // Protected routes (require admin authentication)
// adminRouter.get("/profile", protectAdmin, getAdminProfile);
// adminRouter.put("/profile", protectAdmin, updateAdminProfile);
// adminRouter.post("/change-password", protectAdmin, changeAdminPassword);

// // Admin management routes
// adminRouter.get("/all", protectAdmin, getAllAdmins);
// adminRouter.put("/:adminId/role", protectAdmin, updateAdminRole);
// adminRouter.delete("/:adminId", protectAdmin, deleteAdmin);
// adminRouter.get("/permissions", protectAdmin, getAvailablePermissions);

// export default adminRouter;