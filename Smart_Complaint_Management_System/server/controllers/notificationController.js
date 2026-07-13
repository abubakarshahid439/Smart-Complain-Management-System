const Notification = require('../models/Notification');
const User = require('../models/User');

// ===== Get User Notifications =====
const getNotifications = async (req, res) => {
    try {
        const { limit = 20, offset = 0 } = req.query;
        
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .skip(parseInt(offset))
            .limit(parseInt(limit))
            .populate('data.actor', 'name email')
            .populate('data.complaintId', 'title status');

        const unreadCount = await Notification.countDocuments({
            user: req.user.id,
            isRead: false
        });

        res.status(200).json({
            success: true,
            data: notifications,
            unreadCount,
            total: notifications.length
        });
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching notifications'
        });
    }
};

// ===== Mark Notification as Read =====
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        if (notification.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        notification.isRead = true;
        notification.readAt = new Date();
        await notification.save();

        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking notification as read'
        });
    }
};

// ===== Mark All as Read =====
const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.status(200).json({
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking all as read'
        });
    }
};

// ===== Delete Notification =====
const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notification not found'
            });
        }

        if (notification.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        await notification.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Notification deleted'
        });
    } catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting notification'
        });
    }
};

// ===== Get Unread Count =====
const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            user: req.user.id,
            isRead: false
        });

        res.status(200).json({
            success: true,
            unreadCount: count
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting unread count'
        });
    }
};

// ===== Create Notification =====
const createNotification = async (notificationData) => {
    try {
        const notification = await Notification.create(notificationData);
        console.log('✅ Notification created:', notification._id);
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};

// ===== Notify Status Update =====
const notifyStatusUpdate = async (complaint, oldStatus, newStatus, actor) => {
    try {
        const user = await User.findById(complaint.user);
        if (!user) {
            console.log('User not found for notification');
            return null;
        }

        console.log('Creating status update notification for:', user.email);

        const notificationData = {
            user: user._id,
            type: 'status_update',
            title: 'Complaint Status Updated',
            message: `Your complaint "${complaint.title}" has been updated from ${oldStatus} to ${newStatus}`,
            data: {
                complaintId: complaint._id,
                complaintTitle: complaint.title,
                oldStatus,
                newStatus,
                actor: actor._id,
                actorName: actor.name,
                url: `/dashboard#complaint-${complaint._id}`
            },
            priority: 'medium'
        };

        const notification = await createNotification(notificationData);
        console.log('✅ Status update notification created');
        return notification;
    } catch (error) {
        console.error('Notify status update error:', error);
        return null;
    }
};

// ===== Notify Complaint Resolved =====
const notifyComplaintResolved = async (complaint, actor) => {
    try {
        const user = await User.findById(complaint.user);
        if (!user) {
            console.log('User not found for notification');
            return null;
        }

        console.log('Creating resolution notification for:', user.email);

        const notificationData = {
            user: user._id,
            type: 'complaint_resolved',
            title: 'Complaint Resolved 🎉',
            message: `Your complaint "${complaint.title}" has been resolved. ${complaint.resolution ? 'Resolution: ' + complaint.resolution : ''}`,
            data: {
                complaintId: complaint._id,
                complaintTitle: complaint.title,
                actor: actor._id,
                actorName: actor.name,
                url: `/dashboard#complaint-${complaint._id}`
            },
            priority: 'high'
        };

        const notification = await createNotification(notificationData);
        console.log('✅ Resolution notification created');
        return notification;
    } catch (error) {
        console.error('Notify complaint resolved error:', error);
        return null;
    }
};

// ===== Notify Rating Received =====
const notifyRatingReceived = async (complaint, rating, feedback) => {
    try {
        // Notify the user who submitted the complaint
        const user = await User.findById(complaint.user);
        if (!user) {
            console.log('User not found for rating notification');
            return null;
        }

        console.log('Creating rating notification for:', user.email);

        // Notification for the user who rated
        const userNotificationData = {
            user: user._id,
            type: 'rating_received',
            title: 'Rating Received ⭐',
            message: `Thank you for rating "${complaint.title}" ${rating}/5${feedback ? ' - Feedback: ' + feedback : ''}`,
            data: {
                complaintId: complaint._id,
                complaintTitle: complaint.title,
                rating,
                feedback,
                url: `/dashboard#complaint-${complaint._id}`
            },
            priority: 'medium'
        };

        await createNotification(userNotificationData);

        // Also notify all admins
        const admins = await User.find({ role: 'admin' });
        console.log(`Notifying ${admins.length} admins about rating`);
        
        for (const admin of admins) {
            const adminNotification = {
                user: admin._id,
                type: 'rating_received',
                title: 'New Rating Received ⭐',
                message: `${user.name} rated "${complaint.title}" ${rating}/5${feedback ? ' - Feedback: ' + feedback : ''}`,
                data: {
                    complaintId: complaint._id,
                    complaintTitle: complaint.title,
                    rating,
                    feedback,
                    actor: user._id,
                    actorName: user.name,
                    url: `/admin-dashboard#complaint-${complaint._id}`
                },
                priority: 'high'
            };

            await createNotification(adminNotification);
        }

        console.log('✅ Rating notifications created');
        return true;
    } catch (error) {
        console.error('Notify rating received error:', error);
        return null;
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    getUnreadCount,
    createNotification,
    notifyStatusUpdate,
    notifyComplaintResolved,
    notifyRatingReceived
};