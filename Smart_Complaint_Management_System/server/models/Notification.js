const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['status_update', 'new_complaint', 'complaint_resolved', 'complaint_rejected', 'admin_assigned', 'rating_received', 'system_alert'],
        required: true,
        default: 'system_alert'
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    data: {
        complaintId: {
            type: mongoose.Schema.ObjectId,
            ref: 'Complaint'
        },
        complaintTitle: String,
        oldStatus: String,
        newStatus: String,
        actor: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        actorName: String,
        url: String,
        rating: Number,
        feedback: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    readAt: {
        type: Date
    },
    emailSent: {
        type: Boolean,
        default: false
    },
    inAppSent: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Indexes for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);