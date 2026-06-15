import express from 'express';
import secureroute from '../middieware/Secureroute.js';
import { chatWithAI } from '../controller/ai.controller.js';

const router = express.Router();

router.post('/chat', secureroute, chatWithAI);

export default router;
