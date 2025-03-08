// src/routes/index.ts
import { Router } from 'express';

// Initialize the router
const router = Router();

import { registerUser, loginUser } from '../controllers/users';

import { getAllLocationChats } from '../controllers/locationsChats';

// User Routes
router.post('/users/register', registerUser);
router.post('/users/login', loginUser);

// Location Routes
router.get('/location-chats', getAllLocationChats);

export default router;
