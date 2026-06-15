import express from 'express';
import secureroute from '../middieware/Secureroute.js';
import { sendMessage, getMessage, starMessage, unstarMessage, getStarredMessages } from '../controller/message.controller.js';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, unique + path.extname(file.originalname));
    }
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit

const router = express.Router();

router.post('/send/:id', secureroute, upload.single('media'), sendMessage);
router.get('/get/:id', secureroute, getMessage);
router.post('/star/:id', secureroute, starMessage);
router.post('/unstar/:id', secureroute, unstarMessage);
router.get('/starred', secureroute, getStarredMessages);

export default router;