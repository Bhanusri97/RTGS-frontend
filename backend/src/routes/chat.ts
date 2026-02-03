import express from 'express';
import { getChatMessages, getChats, markAsRead, sendMessage } from '../controllers/chatController';

const router = express.Router();

router.get('/', getChats); // Get all chats for a user
router.get('/:chatId/messages', getChatMessages); // Get messages for a chat
router.post('/send', sendMessage); // Send a message
router.put('/:chatId/read', markAsRead); // Mark chat as read

export default router;
