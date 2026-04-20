const User = require("../models/user-model");

const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}, "first_name last_name email _id isActive").lean();
        return res.status(200).json({ success: true, users });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

const searchUsers = async (req, res) => {
    const { search } = req.query;
    try {
        let query = {};
        if (search && search.trim()) {
            query = { $or: [{ first_name: { $regex: search, $options: 'i' } }, { last_name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] };
        }
        const users = await User.find(query, "first_name last_name email _id isActive").limit(20).lean();
        return res.status(200).json({ success: true, users });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

const getUserById = async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await User.findById(userId, "first_name last_name email _id isActive").lean();
        if (!user) return res.status(404).json({ success: false, message: "User not found" });
        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = { getAllUsers, searchUsers, getUserById };
