import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/user.model.js";

const ADMIN_EMAIL = "admin@nexchat.com";
const ADMIN_PASSWORD = "Admin@NexChat2024";
const ADMIN_NAME = "Super Admin";

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ MongoDB connected");

        // Check if admin already exists
        const existing = await User.findOne({ email: ADMIN_EMAIL });
        if (existing) {
            // If already exists, just ensure isAdmin is true
            existing.isAdmin = true;
            existing.plan = "Enterprise";
            existing.credits = 99999;
            await existing.save();
            console.log("✅ Existing user updated to Admin!");
            console.log("─────────────────────────────────");
            console.log("  Email   :", ADMIN_EMAIL);
            console.log("  Password: (unchanged - your existing password)");
            console.log("  isAdmin : true");
            console.log("─────────────────────────────────");
        } else {
            // Create a new admin user
            const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
            const admin = new User({
                fullname: ADMIN_NAME,
                email: ADMIN_EMAIL,
                password: hashedPassword,
                isAdmin: true,
                plan: "Enterprise",
                credits: 99999,
            });
            await admin.save();
            console.log("✅ Admin user created successfully!");
            console.log("─────────────────────────────────");
            console.log("  Name    :", ADMIN_NAME);
            console.log("  Email   :", ADMIN_EMAIL);
            console.log("  Password:", ADMIN_PASSWORD);
            console.log("  Plan    : Enterprise");
            console.log("  Credits : 99,999");
            console.log("─────────────────────────────────");
        }
        console.log("🚀 Visit /admin-login to sign in!");
    } catch (error) {
        console.error("❌ Seed error:", error.message);
    } finally {
        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
    }
};

seedAdmin();
