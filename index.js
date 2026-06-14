import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import user from "./routes/User.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import Message from "./routes/message.router.js";
import statusRouter from "./routes/status.router.js";
import path from "path";
import { app, server } from "./socket/socket.js";

const allowedOrigins = [
    "http://localhost:3001", 
    "https://nextchat-realtimeapplication-backen.vercel.app",
    process.env.FRONTEND_URL
];

app.use(express.json());
app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));
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

server.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})