import express from "express";
import dotenv from "dotenv";
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
import path from "path";
import { app, server } from "./socket/socket.js";

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost and any vercel frontend
        if (origin.includes("localhost") || origin.includes("vercel.app") || origin === process.env.FRONTEND_URL) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

dotenv.config();
const PORT = process.env.PORT || 3001;
const URI = process.env.MONGODB_URI;

// Serve static files for media uploads
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));

try {
    mongoose.connect(URI)
    console.log("MongoDb is connected succussfully")
} catch (error) {
    console.log(error)
}

app.use("/api/User", user);
app.use("/api/message", Message);
app.use("/api/status", statusRouter);
app.use("/api/group", groupRouter);
app.use("/api/ai", aiRouter);
app.use("/api/channel", channelRouter);
app.use("/api/action", actionRouter);

server.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`)
})