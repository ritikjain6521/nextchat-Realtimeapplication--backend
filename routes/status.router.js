import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Status from "../models/status.model.js";
import secureRoute from "../middieware/Secureroute.js";

const router = express.Router();

// Multer config for file uploads
const uploadDir = path.join(path.resolve(), "public/uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// POST endpoint to create a new status
router.post("/upload", secureRoute, upload.single("media"), async (req, res) => {
  try {
    const { text, type } = req.body;
    const mediaUrl = req.file ? `/uploads/${req.file.filename}` : "";

    const newStatus = new Status({
      userId: req.user._id,
      mediaUrl,
      text,
      type: type || (req.file ? "image" : "text"),
    });

    await newStatus.save();

    // Populate user info before sending
    await newStatus.populate("userId", "fullname email");

    res.status(201).json(newStatus);
  } catch (error) {
    console.log("Error in status upload: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET endpoint to fetch all active statuses from all users
// In a real app, you might only fetch statuses of friends/contacts
router.get("/", secureRoute, async (req, res) => {
  try {
    const statuses = await Status.find()
      .populate("userId", "fullname email")
      .sort({ createdAt: -1 });
    
    // Group by user
    const groupedStatuses = statuses.reduce((acc, status) => {
      const userId = status.userId._id.toString();
      if (!acc[userId]) {
        acc[userId] = {
          user: status.userId,
          statuses: []
        };
      }
      acc[userId].statuses.push(status);
      return acc;
    }, {});

    res.status(200).json(Object.values(groupedStatuses));
  } catch (error) {
    console.log("Error fetching statuses: ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
