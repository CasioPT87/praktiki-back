// src/routes/index.ts
import { Router } from 'express';

// Initialize the router
const router = Router();

import {
  registerUser,
  registerGuest,
  loginUser,
  getUserLogged,
} from '../controllers/users';
import { getAllLocationChats } from '../controllers/locationsChats';
import { getAllLanguages } from '../controllers/languages';
import { joinQueue } from '../controllers/randomVideoConversation';

// User Routes
router.post('/users/register', registerUser);
router.post('/users/login', loginUser);
router.post('/users/register/guest', registerGuest);
router.get('/users/logged', getUserLogged);

// Location Routes
router.get('/location-chats', getAllLocationChats);

// Location Routes
router.get('/languages', getAllLanguages);

// queue Routes
router.get('/random-queue/join/:combination', joinQueue);

export default router;
