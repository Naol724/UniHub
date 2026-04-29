import User from "../models/user-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_KEY_SECRET || "your_secret_key";

const generateToken = (user) => jwt.sign(
  { id: user._id, email: user.email },
  JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE || "7d" }
);

const formatUser = (user) => ({
  id: user._id,
  firstName: user.firstName || user.first_name || "",
  lastName:  user.lastName  || user.last_name  || "",
  email:     user.email,
  role:      user.role,
  imageURL:  user.imageURL || user.avatar || "",
  department: user.department || "",
  isActive:  user.isActive
});

// Register - accepts { firstName, lastName, email, password, confirmPassword }
export const userRegister = async (req, res) => {
  const { firstName, lastName, email, password, password1, password2, confirmPassword, department } = req.body;

  const pass  = password  || password1;
  const pass2 = confirmPassword || password2;
  const fName = firstName;
  const lName = lastName;

  try {
    if (!fName || !lName || !email || !pass)
      return res.status(400).json({ success: false, message: "Please fill all required fields" });

    if (pass2 && pass !== pass2)
      return res.status(400).json({ success: false, message: "Passwords do not match" });

    if (pass.length < 6)
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser)
      return res.status(400).json({ success: false, message: "User with this email already exists" });

    const passwordHash = await bcrypt.hash(pass, 10);

    const newUser = await User.create({
      firstName: fName.trim(),
      lastName:  lName.trim(),
      first_name: fName.trim(),
      last_name:  lName.trim(),
      email:      email.toLowerCase().trim(),
      password:     passwordHash,
      passwordHash: passwordHash,
      department:   department || "",
      role: "user"
    });

    const token = generateToken(newUser);
    return res.status(201).json({ success: true, message: "User registered successfully", token, user: formatUser(newUser) });

  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: "Email already exists" });
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Login - accepts { email, password }
export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password)
      return res.status(400).json({ success: false, message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    // Support both password fields
    const storedHash = user.passwordHash || user.password;
    if (!storedHash)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, storedHash);
    if (!isMatch)
      return res.status(401).json({ success: false, message: "Invalid email or password" });

    const token = generateToken(user);
    return res.status(200).json({ success: true, message: "Login successful", token: `Bearer ${token}`, user: formatUser(user) });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  const { firstName, lastName, Bio, department, phone, location } = req.body;
  const { id } = req.params;
  try {
    const updateData = {};
    if (firstName) { updateData.firstName = firstName.trim(); updateData.first_name = firstName.trim(); }
    if (lastName)  { updateData.lastName  = lastName.trim();  updateData.last_name  = lastName.trim(); }
    if (Bio       !== undefined) updateData.Bio      = Bio;
    if (phone     !== undefined) updateData.phone    = phone;
    if (location  !== undefined) updateData.location = location;
    if (department !== undefined) updateData.department = department;

    const update = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-password -passwordHash");
    if (!update) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, message: "Profile updated successfully", user: formatUser(update) });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select("-password -passwordHash");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.status(200).json({ success: true, user: formatUser(user) });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const uploadProfileImage = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/profiles/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(id, { imageURL: imageUrl }, { new: true }).select("-password -passwordHash");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, imageUrl, message: "Profile picture updated successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  try {
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: "Both passwords are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    const storedHash = user.passwordHash || user.password;
    const isValid = await bcrypt.compare(currentPassword, storedHash);
    if (!isValid) return res.status(401).json({ success: false, message: "Current password is incorrect" });
    const newHash = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(id, { password: newHash, passwordHash: newHash });
    return res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password -passwordHash");
    return res.json({ success: true, users: users.map(formatUser) });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const searchUsers = async (req, res) => {
  const { search } = req.query;
  try {
    let query = {};
    if (search && search.trim()) {
      const r = { $regex: search, $options: 'i' };
      query = { $or: [{ firstName: r }, { lastName: r }, { first_name: r }, { last_name: r }, { email: r }] };
    }
    const users = await User.find(query).select("-password -passwordHash").limit(20).lean();
    return res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

