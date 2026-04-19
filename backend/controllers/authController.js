// backend/controllers/authController.js
import User from "../models/user-model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const userRegister = async (req, res) => {
  const { firstName, lastName, email, password1, password2, department } = req.body;
  
  try {
    // Validation
    if (!firstName || !lastName || !email || !password1 || !password2) {
      return res.status(400).json({ 
        success: false,
        msg: "Please fill all required fields (firstName, lastName, email, password)" 
      });
    }
    
    if (password1 !== password2) {
      return res.status(400).json({ 
        success: false,
        msg: "Passwords do not match" 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        msg: "User with this email already exists" 
      });
    }
    
    // Hash password
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const passwordHash = await bcrypt.hash(password1, salt);
    
    // Create user
    const newUser = new User({
      first_name: firstName,
      last_name: lastName,
      email,
      passwordHash,
      department: department || ""
    });
    
    await newUser.save();
    
    return res.status(201).json({ 
      success: true,
      msg: "User " + newUser.email + " created successfully",
      user: {
        id: newUser._id,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        email: newUser.email
      }
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export const userLogin = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        msg: "Email and password are required" 
      });
    }
    
    const getUser = await User.findOne({ email });
    if (!getUser) {
      return res.status(404).json({ 
        success: false,
        msg: "Email not found" 
      });
    }
    
    const isPass = await bcrypt.compare(password, getUser.passwordHash);
    if (!isPass) {
      return res.status(401).json({ 
        success: false,
        msg: "Incorrect password" 
      });
    }
    
    const token = jwt.sign(
      {
        id: getUser._id,
        first_name: getUser.first_name,
        last_name: getUser.last_name,
        email: getUser.email
      },
      process.env.JWT_KEY_SECRET || "your_secret_key",
      { expiresIn: "1h" }
    );
    
    return res.status(200).json({
      success: true,
      token: `Bearer ${token}`,
      user: {
        id: getUser._id,
        first_name: getUser.first_name,
        last_name: getUser.last_name,
        email: getUser.email
      }
    });
    
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

export const updateProfile = async (req, res) => {
  const { firstName, lastName, Bio, department, phone, location } = req.body;
  const { id } = req.params;
  
  try {
    const updateData = {
      first_name: firstName,
      last_name: lastName,
      department: department || "",
    };
    
    if (Bio !== undefined) updateData.Bio = Bio;
    if (phone !== undefined) updateData.phone = phone;
    if (location !== undefined) updateData.location = location;
    
    const update = await User.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    ).select("-passwordHash");
    
    if (!update) {
      return res.status(404).json({ 
        success: false,
        msg: "User not found" 
      });
    }
    
    return res.status(200).json({
      success: true,
      msg: "Profile updated successfully",
      user: update
    });
    
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// backend/controllers/authController.js - Update getUserProfile
export const getUserProfile = async (req, res) => {
  const { id } = req.params;
  
  try {
    const user = await User.findById(id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ 
        success: false,
        msg: "User not found" 
      });
    }
    
    // Make sure image URL is complete
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const userData = user.toObject();
    if (userData.imageURL && !userData.imageURL.startsWith('http')) {
      userData.imageURL = `${baseUrl}${userData.imageURL}`;
    }
    
    return res.status(200).json({ 
      success: true,
      user: userData
    });
    
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Upload profile image
// backend/controllers/authController.js - Fix uploadProfileImage function
export const uploadProfileImage = async (req, res) => {
  const { id } = req.params;
  
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        msg: "No file uploaded" 
      });
    }
    
    // Store the full URL path
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/profiles/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      id, 
      { imageURL: imageUrl },
      { new: true }
    ).select("-passwordHash");
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        msg: "User not found" 
      });
    }
    
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      msg: "Profile picture updated successfully"
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Change password
export const changePassword = async (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  
  try {
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        msg: "Current password and new password are required" 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        msg: "New password must be at least 6 characters" 
      });
    }
    
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        msg: "User not found" 
      });
    }
    
    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ 
        success: false, 
        msg: "Current password is incorrect" 
      });
    }
    
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.passwordHash = newPasswordHash;
    await user.save();
    
    res.json({ 
      success: true, 
      msg: "Password changed successfully" 
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Get all users (for messaging)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "first_name last_name email _id imageURL isActive");
    res.json({ 
      success: true, 
      users 
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

// Search users
export const searchUsers = async (req, res) => {
  const { search } = req.query;
  
  try {
    let query = {};
    if (search && search.trim()) {
      query = {
        $or: [
          { first_name: { $regex: search, $options: 'i' } },
          { last_name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const users = await User.find(query, "first_name last_name email _id imageURL")
      .limit(20)
      .lean();
    
    return res.status(200).json({
      success: true,
      users: users
    });
  } catch (error) {
    console.error("Search users error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};