const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount
} = require('../controllers/notificationController');

// All routes are protected (require authentication)
router.use(protect);

// GET all notifications for the logged-in user
router.get('/', getNotifications);

// GET unread count
router.get('/unread-count', getUnreadCount);

// PUT mark a notification as read
router.put('/:id/read', markAsRead);

// PUT mark all notifications as read
router.put('/read-all', markAllAsRead);

// DELETE a notification
router.delete('/:id', deleteNotification);

module.exports = router;