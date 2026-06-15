import express from 'express';
import secureroute from '../middieware/Secureroute.js';
import { createChannel, getChannels } from '../controller/channel.controller.js';

const router = express.Router();

router.post('/create', secureroute, createChannel);
router.get('/', secureroute, getChannels);

export default router;
