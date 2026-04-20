const User = require("../models/user-model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const userRegister = async (req, res) => {
  const { firstName, lastName, email, password1, password2, department } = req.body;
  try {
    if (!firstName || !lastName || !email || !password1 || !password2)
      return res.status(400).json({ success: false, msg: "Please fill all required fields" });
    if (password1 !== password2)
      return res.status(400).json({ success: false, msg: "Passwords do not match" });
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ success: false, msg: "User with this email already exists" });
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password1, salt);
    const newUser = new User({ first_name: firstName, last_name: lastName, email, passwordHash, department: department || "" });
    await newUser.save();
    return res.status(201).json({ success: true, msg: "User " + newUser.email + " created successfully", user: { id: newUser._id, first_name: newUser.first_name, last_name: newUser.last_name, email: newUser.email } });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ success: false, msg: "Email and password are required" });
    const getUser = await User.findOne({ email });
    if (!getUser)
      return res.status(404).json({ success: false, msg: "Email not found" });
    const isPass = await bcrypt.compare(password, getUser.passwordHash);
    if (!isPass)
      return res.status(401).json({ success: false, msg: "Incorrect password" });
    const token = jwt.sign(
      { id: getUser._id, first_name: getUser.first_name, last_name: getUser.last_name, email: getUser.email },
      process.env.JWT_SECRET || process.env.JWT_KEY_SECRET || "your_secret_key",
      { expiresIn: "1h" }
    );
    return res.status(200).json({ success: true, token: `Bearer ${token}`, user: { id: getUser._id, first_name: getUser.first_name, last_name: getUser.last_name, email: getUser.email } });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

const updateProfile = async (req, res) => {
  const { firstName, lastName, Bio, department, phone, location } = req.body;
  const { id } = req.params;
  try {
    const updateData = { first_name: firstName, last_name: lastName, department: department || "" };
    if (Bio !== undefined) updateData.Bio = Bio;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    const update = await User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select("-passwordHash");
    if (!update) return res.status(404).json({ success: false, msg: "User not found" });
    return res.status(200).json({ success: true, msg: "Profile updated successfully", user: update });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const getUserProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("-passwordHash");
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const userData = user.toObject();
    if (userData.imageURL && !userData.imageURL.startsWith('http')) userData.imageURL = `${baseUrl}${userData.imageURL}`;
    return res.status(200).json({ success: true, user: userData });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

const uploadProfileImage = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.file) return res.status(400).json({ success: false, msg: "No file uploaded" });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(id, { imageURL: imageUrl }, { new: true }).select("-passwordHash");
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    res.json({ success: true, imageUrl, msg: "Profile picture updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, msg: "Both passwords are required" });
    if (newPassword.length < 6) return res.status(400).json({ success: false, msg: "New password must be at least 6 characters" });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) return res.status(401).json({ success: false, msg: "Current password is incorrect" });
    user.passwordHash = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    await user.save();
    res.json({ success: true, msg: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "first_name last_name email _id imageURL isActive");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const searchUsers = async (req, res) => {
  const { search } = req.query;
  try {
    let query = {};
    if (search && search.trim()) {
      query = { $or: [{ first_name: { $regex: search, $options: 'i' } }, { last_name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] };
    }
    const users = await User.find(query, "first_name last_name email _id imageURL").limit(20).lean();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { userRegister, userLogin, updateProfile, getUserProfile, uploadProfileImage, changePassword, getAllUsers, searchUsers };
