import express from 'express';
import secureroute from '../middieware/Secureroute.js';
import { chatWithAI } from '../controller/ai.controller.js';

import { requireCredits } from '../middieware/admin.middleware.js';

const router = express.Router();

router.post('/chat', secureroute, requireCredits(1), chatWithAI);

export default router;
