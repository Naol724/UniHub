// backend/scripts/createAdminUser.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'naolgonfa449@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('12345678', salt);

    // Create admin user
    const adminUser = await User.create({
      first_name: 'Admin',
      last_name: 'User',
      email: 'naolgonfa449@gmail.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      emailVerified: true
    });

    console.log('Admin user created successfully:');
    console.log('Email: naolgonfa449@gmail.com');
    console.log('Password: 12345678');
    console.log('User ID:', adminUser._id);

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();
