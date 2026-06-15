import express from 'express';
import secureroute from '../middieware/Secureroute.js';
import { toggleBlockUser, toggleMuteConversation, clearChat, leaveGroupOrChannel } from '../controller/action.controller.js';

const router = express.Router();

router.post('/block/:id', secureroute, toggleBlockUser);
router.post('/mute/:id', secureroute, toggleMuteConversation);
router.post('/clear/:id', secureroute, clearChat);
router.post('/leave/:id', secureroute, leaveGroupOrChannel);

export default router;
