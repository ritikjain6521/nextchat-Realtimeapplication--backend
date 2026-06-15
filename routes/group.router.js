import express from 'express';
import secureroute from '../middieware/Secureroute.js';
import { createGroup, getGroups } from '../controller/group.controller.js';

const router = express.Router();

router.post('/create', secureroute, createGroup);
router.get('/', secureroute, getGroups);

export default router;
