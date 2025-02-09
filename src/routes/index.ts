// src/routes/index.ts
import { Router } from 'express';

// Initialize the router
const router = Router();

// Import all controllers for different entities
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRoleById,
  deleteRoleById,
} from '../services/role';

import {
  createUser,
  getAllUsers,
  getUserById,
  getUserProfile,
  updateUserById,
  deleteUserById,
  registerUser,
  loginUser,
} from '../services/user';

import {
  createIcon,
  getAllIcons,
  getIconById,
  updateIconById,
  deleteIconById,
} from '../services/icon';

import {
  createCountry,
  getAllCountries,
  getCountryById,
  updateCountryById,
  deleteCountryById,
} from '../services/country';

import {
  createBlockedUser,
  getAllBlockedUsers,
  getBlockedUserById,
  updateBlockedUserById,
  deleteBlockedUserById,
} from '../services/blockedUser';

import {
  createLocation,
  getAllLocations,
  getLocationById,
  updateLocationById,
  deleteLocationById,
} from '../services/location';

import {
  createUserSession,
  getAllUserSessions,
  getUserSessionById,
  deleteUserSessionById,
} from '../services/userSessionOnline';

import {
  createLanguage,
  getAllLanguages,
  getLanguageById,
  updateLanguageById,
  deleteLanguageById,
} from '../services/language';

import {
  createPrivateChat,
  getAllPrivateChats,
  getPrivateChatById,
  updatePrivateChatById,
  deletePrivateChatById,
} from '../services/privateChat';

import {
  createPrivateChatRequest,
  getAllPrivateChatRequests,
  getPrivateChatRequestById,
  updatePrivateChatRequestById,
  deletePrivateChatRequestById,
} from '../services/privateChatRequest';

import {
  createNotification,
  getAllNotifications,
  getNotificationById,
  updateNotificationById,
  deleteNotificationById,
} from '../services/notification';

import {
  createPrivateChatMessage,
  getMessagesInPrivateChat,
  getPrivateChatMessageById,
  updatePrivateChatMessageById,
  deletePrivateChatMessageById,
} from '../services/privateChatMessage';

import {
  createLocationChat,
  getAllLocationChats,
  getLocationChatById,
  updateLocationChatById,
  deleteLocationChatById,
} from '../services/locationChat';

import {
  createLocationChatMessage,
  getLocationChatMessagesByLocationChat,
  getLocationChatMessageById,
  updateLocationChatMessageById,
  deleteLocationChatMessageById,
} from '../services/locationChatMessage';
import {
  createEvent,
  getEventsByLocationChatId,
  getEventById,
  updateEventById,
  deleteEventById,
} from '../services/event';

import {
  createEventAttendance,
  getUserEventAttendances,
  getEventAttendanceById,
  deleteEventAttendanceById,
} from '../services/eventAttendance';

import {
  createUserRate,
  getRatingsForUser,
  getRatingsByUser,
  deleteUserRate,
} from '../services/userRate';

import {
  createEventComment,
  getAllEventComments,
  deleteEventCommentById,
} from '../services/eventComment';

// Define routes for each entity
// Role Routes
router.post('/roles', createRole);
router.get('/roles', getAllRoles);
router.get('/roles/:id', getRoleById);
router.put('/roles/:id', updateRoleById);
router.delete('/roles/:id', deleteRoleById);

// User Routes
router.post('/users', createUser);
router.get('/users', getAllUsers);
router.get('/users/profile', getUserProfile);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserById);
router.delete('/users/:id', deleteUserById);
router.post('/users/register', registerUser);
router.post('/users/login', loginUser);

// Icon Routes
router.post('/icons', createIcon);
router.get('/icons', getAllIcons);
router.get('/icons/:id', getIconById);
router.put('/icons/:id', updateIconById);
router.delete('/icons/:id', deleteIconById);

// Country Routes
router.post('/countries', createCountry);
router.get('/countries', getAllCountries);
router.get('/countries/:id', getCountryById);
router.put('/countries/:id', updateCountryById);
router.delete('/countries/:id', deleteCountryById);

// BlockedUser Routes
router.post('/blocked-users', createBlockedUser);
router.get('/blocked-users', getAllBlockedUsers);
router.get('/blocked-users/:id', getBlockedUserById);
router.put('/blocked-users/:id', updateBlockedUserById);
router.delete('/blocked-users/:id', deleteBlockedUserById);

// Location Routes
router.post('/locations', createLocation);
router.get('/locations', getAllLocations);
router.get('/locations/:id', getLocationById);
router.put('/locations/:id', updateLocationById);
router.delete('/locations/:id', deleteLocationById);

// UserSessionOnline Routes
router.post('/user-sessions', createUserSession);
router.get('/user-sessions', getAllUserSessions);
router.get('/user-sessions/:id', getUserSessionById);
router.delete('/user-sessions/:id', deleteUserSessionById);

// Language Routes
router.post('/languages', createLanguage);
router.get('/languages', getAllLanguages);
router.get('/languages/:id', getLanguageById);
router.put('/languages/:id', updateLanguageById);
router.delete('/languages/:id', deleteLanguageById);

// PrivateChat Routes
router.post('/private-chats', createPrivateChat);
router.get('/private-chats', getAllPrivateChats);
router.get('/private-chats/:id', getPrivateChatById);
router.put('/private-chats/:id', updatePrivateChatById);
router.delete('/private-chats/:id', deletePrivateChatById);

// PrivateChatRequest Routes
router.post('/private-chat-requests', createPrivateChatRequest);
router.get('/private-chat-requests', getAllPrivateChatRequests);
router.get('/private-chat-requests/:id', getPrivateChatRequestById);
router.put('/private-chat-requests/:id', updatePrivateChatRequestById);
router.delete('/private-chat-requests/:id', deletePrivateChatRequestById);

// Notification Routes
router.post('/notifications', createNotification);
router.get('/notifications', getAllNotifications);
router.get('/notifications/:id', getNotificationById);
router.put('/notifications/:id', updateNotificationById);
router.delete('/notifications/:id', deleteNotificationById);

// PrivateChatMessage Routes
router.post('/private-chat-messages', createPrivateChatMessage);
router.get(
  '/private-chat-messages/private-chat/:private_chat_id',
  getMessagesInPrivateChat
);
router.get('/private-chat-messages/:id', getPrivateChatMessageById);
router.put('/private-chat-messages/:id', updatePrivateChatMessageById);
router.delete('/private-chat-messages/:id', deletePrivateChatMessageById);

// LocationChat Routes
router.post('/location-chats', createLocationChat);
router.get('/location-chats', getAllLocationChats);
router.get('/location-chats/:id', getLocationChatById);
router.put('/location-chats/:id', updateLocationChatById);
router.delete('/location-chats/:id', deleteLocationChatById);

// LocationChatMessage Routes
router.post('/location-chat-messages', createLocationChatMessage);
router.get(
  '/location-chat-messages/location-chat/:location_chat_id',
  getLocationChatMessagesByLocationChat
);
router.get('/location-chat-messages/:id', getLocationChatMessageById);
router.put('/location-chat-messages/:id', updateLocationChatMessageById);
router.delete('/location-chat-messages/:id', deleteLocationChatMessageById);

// Event Routes
router.post('/events', createEvent);
router.get(
  '/events/location-chat/:location_chat_id',
  getEventsByLocationChatId
);
router.get('/events/:id', getEventById);
router.put('/events/:id', updateEventById);
router.delete('/events/:id', deleteEventById);

// EventAttendance Routes
router.post('/event-attendances', createEventAttendance);
router.get('/event-attendances/user/:user_id', getUserEventAttendances);
router.get('/event-attendances/:id', getEventAttendanceById);
router.delete('/event-attendances/:id', deleteEventAttendanceById);

// UserRate Routes
router.post('/user-rates', createUserRate);
router.get('/user-rates/user/:target_user_id', getRatingsForUser);
router.get('/user-rates/by-user/:voter_user_id', getRatingsByUser);
router.delete('/user-rates/:id', deleteUserRate);

// EventComment Routes
router.post('/event-comments', createEventComment);
router.get('/event-comments', getAllEventComments);
router.delete('/event-comments/:id', deleteEventCommentById);

export default router;
