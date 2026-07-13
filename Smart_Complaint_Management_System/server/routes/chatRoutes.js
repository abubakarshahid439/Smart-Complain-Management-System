const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getOrCreateChat,
    sendMessage,
    getChatMessages,
    markAsRead,
    getUnreadCount
} = require('../controllers/chatController');

// All routes are protected
router.use(protect);

// Get or create chat for a complaint
router.get('/complaint/:complaintId', getOrCreateChat);

// Get messages for a complaint
router.get('/complaint/:complaintId/messages', getChatMessages);

// Send message
router.post('/complaint/:complaintId/message', sendMessage);

// Mark messages as read
router.put('/complaint/:complaintId/read', markAsRead);

// Get unread count for all chats
router.get('/unread', getUnreadCount);

module.exports = router;