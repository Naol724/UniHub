// backend/routes/teamRoutes.js
import { Router } from "express";
import {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    addMember,
    removeMember,
    getTeamMembers,
    updateMemberRole,
    checkUserRole
} from "../controllers/team-controller.js";
import { protect, isTeamOwner, isTeamOwnerOrAdmin, isTeamMember } from "../middleware/authMiddleware.js";

const teamRouter = Router();

// All team routes require authentication
teamRouter.use(protect);

// Routes accessible to authenticated users
teamRouter.post("/teams", createTeam);
teamRouter.get("/teams", getTeams);
teamRouter.get("/teams/:teamId", getTeamById);
teamRouter.get("/teams/:teamId/members", getTeamMembers);
teamRouter.get("/teams/:teamId/check-role/:userId", checkUserRole);

// Routes requiring team membership
teamRouter.put("/teams/:teamId", isTeamOwnerOrAdmin, updateTeam);
teamRouter.post("/teams/:teamId/members", isTeamOwnerOrAdmin, addMember);
teamRouter.delete("/teams/:teamId/members/:memberId", isTeamOwner, removeMember);
teamRouter.put("/teams/:teamId/members/:memberId/role", isTeamOwner, updateMemberRole);
teamRouter.delete("/teams/:teamId", isTeamOwner, deleteTeam);

export default teamRouter;