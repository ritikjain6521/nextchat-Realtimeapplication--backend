import dotenv from "dotenv";
dotenv.config(); // MUST be first — loads env vars before any other module reads process.env

import express from "express";
import mongoose from "mongoose";
import user from "./routes/User.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import Message from "./routes/message.router.js";
import statusRouter from "./routes/status.router.js";
import groupRouter from "./routes/group.router.js";
import aiRouter from "./routes/ai.router.js";
import channelRouter from "./routes/channel.router.js";
import actionRouter from "./routes/action.router.js";
import adminRouter from "./routes/admin.router.js";
import paymentRouter from "./routes/payment.router.js";
import path from "path";
import { app, server } from "./socket/socket.js";

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost and any vercel frontend
        if (
            origin.includes("localhost") ||
            origin.includes("vercel.app") ||
            origin === process.env.FRONTEND_URL
        ) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

const PORT = process.env.PORT || 3001;
const URI = process.env.MONGODB_URI;

// Serve static files for media uploads
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

// Connect to MongoDB
const connectDB = async () => {
    try {
        if (!URI) {
            throw new Error(
                "MONGODB_URI is not defined. Please set it in your environment variables (e.g. on the Render dashboard)."
            );
        }
        await mongoose.connect(URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("Database connection error:", error.message);
        process.exit(1); // Exit if DB connection fails — prevents silent failures
    }
};

connectDB();

app.use("/api/User", user);
app.use("/api/message", Message);
app.use("/api/status", statusRouter);
app.use("/api/group", groupRouter);
app.use("/api/ai", aiRouter);
app.use("/api/channel", channelRouter);
app.use("/api/action", actionRouter);
app.use("/api/admin", adminRouter);
app.use("/api/payment", paymentRouter);

// Root route to check backend health
app.get("/", (req, res) => {
    res.status(200).json({ message: "Backend is running successfully!" });
});

// 404 handler for unknown routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global error handler — catches any unhandled errors from route handlers
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err.stack || err.message);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});