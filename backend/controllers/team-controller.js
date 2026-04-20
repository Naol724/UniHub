const Room = require("../models/room-model");
const Team = require("../models/team-model");
const User = require("../models/user-model");
const TeamMember = require("../models/TeamMember-model");

const createTeam = async (req, res) => {
    const { teamName, description, ownerID } = req.body;
    try {
        if (!teamName || !ownerID) return res.status(400).json({ msg: "Please provide teamName and ownerID" });
        const findOwner = await User.findById(ownerID);
        if (!findOwner) return res.status(404).json({ msg: "Owner not found" });
        const createRoom = new Room({ roomType: "team" });
        await createRoom.save();
        const newTeam = new Team({ teamName, description: description || "", chatRoomID: createRoom._id });
        await newTeam.save();
        const createOwner = new TeamMember({ userID: ownerID, teamId: newTeam._id, role: "owner" });
        await createOwner.save();
        return res.status(201).json({ success: true, team: newTeam, message: "Team created successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getTeams = async (req, res) => {
    const { userID } = req.query;
    try {
        if (!userID) return res.status(400).json({ msg: "User ID is required" });
        const teams = await TeamMember.find({ userID }).populate("teamId", "teamName description chatRoomID created_at").lean();
        const formattedTeams = teams.map(t => ({ _id: t.teamId._id, teamName: t.teamId.teamName, description: t.teamId.description, role: t.role, joinedAt: t.joinedAt }));
        return res.status(200).json({ teams: formattedTeams });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getTeamById = async (req, res) => {
    const { teamId } = req.params;
    try {
        const team = await Team.findById(teamId).lean();
        if (!team) return res.status(404).json({ msg: "Team not found" });
        const members = await TeamMember.find({ teamId }).populate("userID", "first_name last_name email").lean();
        return res.status(200).json({ team: { ...team, members, memberCount: members.length } });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateTeam = async (req, res) => {
    const { teamId } = req.params;
    const { teamName, description, userID } = req.body;
    try {
        const member = await TeamMember.findOne({ userID, teamId });
        if (!member || member.role !== "owner") return res.status(403).json({ msg: "Only owner can update team" });
        const updatedTeam = await Team.findByIdAndUpdate(teamId, { teamName, description }, { new: true });
        if (!updatedTeam) return res.status(404).json({ msg: "Team not found" });
        return res.status(200).json({ success: true, team: updatedTeam, message: "Team updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const deleteTeam = async (req, res) => {
    const { teamId } = req.params;
    const { userID } = req.body;
    try {
        const member = await TeamMember.findOne({ userID, teamId });
        if (!member || member.role !== "owner") return res.status(403).json({ msg: "Only owner can delete team" });
        await TeamMember.deleteMany({ teamId });
        const deletedTeam = await Team.findByIdAndDelete(teamId);
        if (!deletedTeam) return res.status(404).json({ msg: "Team not found" });
        if (deletedTeam.chatRoomID) await Room.findByIdAndDelete(deletedTeam.chatRoomID);
        return res.status(200).json({ success: true, message: "Team deleted successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const addMember = async (req, res) => {
    const { teamId } = req.params;
    const { users, ownerID } = req.body;
    try {
        if (!teamId || !users || users.length === 0) return res.status(400).json({ success: false, msg: "Missing required data" });
        const findOwner = await TeamMember.findOne({ userID: ownerID, teamId }).populate("userID", "first_name last_name email");
        if (!findOwner) return res.status(403).json({ success: false, msg: "You are not a member of this team" });
        const userRole = findOwner.role?.toLowerCase();
        if (userRole !== "owner" && userRole !== "admin") return res.status(403).json({ success: false, msg: `Only team owner or admin can add members. Your role: ${findOwner.role}` });
        const addedMembers = [], skippedMembers = [];
        for (const user of users) {
            const userId = user._id || user;
            const exists = await TeamMember.findOne({ userID: userId, teamId });
            if (exists) { skippedMembers.push(user); continue; }
            const newMember = new TeamMember({ userID: userId, teamId, role: "member" });
            await newMember.save();
            addedMembers.push(newMember);
        }
        return res.status(200).json({ success: true, addedMembers, skippedCount: skippedMembers.length, message: `${addedMembers.length} members added successfully` });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

const removeMember = async (req, res) => {
    const { teamId, memberId } = req.params;
    const { ownerID } = req.body;
    try {
        const findOwner = await TeamMember.findOne({ userID: ownerID, teamId });
        if (!findOwner || findOwner.role !== "owner") return res.status(403).json({ msg: "Only owner can remove members" });
        const memberToRemove = await TeamMember.findById(memberId);
        if (!memberToRemove) return res.status(404).json({ msg: "Member not found" });
        if (memberToRemove.role === "owner") return res.status(403).json({ msg: "Cannot remove the team owner" });
        await TeamMember.findByIdAndDelete(memberId);
        return res.status(200).json({ success: true, message: "Member removed successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const getTeamMembers = async (req, res) => {
    const { teamId } = req.params;
    try {
        const members = await TeamMember.find({ teamId }).populate("userID", "first_name last_name email").lean();
        return res.status(200).json({ members });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const updateMemberRole = async (req, res) => {
    const { teamId, memberId } = req.params;
    const { role, ownerID } = req.body;
    try {
        const findOwner = await TeamMember.findOne({ userID: ownerID, teamId });
        if (!findOwner || findOwner.role !== "owner") return res.status(403).json({ msg: "Only owner can change member roles" });
        const updatedMember = await TeamMember.findByIdAndUpdate(memberId, { role }, { new: true }).populate("userID", "first_name last_name email");
        if (!updatedMember) return res.status(404).json({ msg: "Member not found" });
        return res.status(200).json({ success: true, member: updatedMember, message: "Member role updated successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

const checkUserRole = async (req, res) => {
    const { teamId, userId } = req.params;
    try {
        const member = await TeamMember.findOne({ userID: userId, teamId }).populate("userID", "first_name last_name email");
        return res.status(200).json({ success: true, isMember: !!member, role: member?.role || null });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { createTeam, getTeams, getTeamById, updateTeam, deleteTeam, addMember, removeMember, getTeamMembers, updateMemberRole, checkUserRole };
