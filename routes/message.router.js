import express from 'express';
import secureroute from '../middieware/Secureroute.js';
import { sendMessage } from '../controller/message.controller.js';
import { getMessage } from '../controller/message.controller.js';
const router = express.Router();
// Sample route for sending a message
router.post('/send/:id',secureroute,sendMessage)
router.get('/get/:id',secureroute,getMessage)


export default router;