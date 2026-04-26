// backend/scripts/createAdmin.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import Admin from "../models/admin-model.js";

const createFirstAdmin = async () => {
    try {
        const mongoURI = process.env.DB_URL;
        
        if (!mongoURI) {
            console.error("❌ MONGODB_URI not found in .env file");
            console.log("\nPlease create a .env file in the backend folder with:");
            console.log('MONGODB_URI=mongodb+srv://username:password@cluster0.unt6mmg.mongodb.net/unihub?retryWrites=true&w=majority');
            process.exit(1);
        }
        
        console.log("📡 Connecting to MongoDB Atlas...");
        console.log("URI:", mongoURI.replace(/\/\/(.*)@/, '//***:***@')); // Hide password in log
        
        await mongoose.connect(mongoURI);
        console.log("✅ Connected to MongoDB Atlas successfully!");
        
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: "superadmin" });
        
        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash("Admin@123", salt);
            
            const admin = new Admin({
                name: "Super Admin",
                username: "superadmin",
                password: hashedPassword,
                role: "super_admin",
                permissions: [],
                isActive: true
            });
            
            await admin.save();
            
            console.log("\n✅ Super Admin created successfully!");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("📋 Login Credentials:");
            console.log("   Username: superadmin");
            console.log("   Password: Admin@123");
            console.log("   Role: super_admin");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        } else {
            console.log("\n⚠️ Super Admin already exists!");
            console.log("   Username: superadmin");
        }
        
        await mongoose.disconnect();
        console.log("✅ Disconnected from MongoDB");
        process.exit(0);
        
    } catch (error) {
        console.error("❌ Error:", error.message);
        
        if (error.message.includes('bad auth')) {
            console.log("\n💡 Authentication failed! Check your username and password in MONGODB_URI");
        } else if (error.message.includes('ENOTFOUND')) {
            console.log("\n💡 Network error! Check your internet connection and cluster address");
        }
        
        process.exit(1);
    }
};

createFirstAdmin();