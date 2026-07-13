const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    complaintId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Complaint',
        required: true
    },
    participants: [{
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }],
    messages: [{
        sender: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true
        },
        senderName: {
            type: String,
            required: true
        },
        senderRole: {
            type: String,
            enum: ['user', 'admin'],
            required: true
        },
        message: {
            type: String,
            required: true
        },
        attachments: [{
            filename: String,
            url: String,
            size: Number,
            type: String
        }],
        isRead: {
            type: Boolean,
            default: false
        },
        readAt: {
            type: Date
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    lastMessageAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
chatSchema.index({ complaintId: 1 });
chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Chat', chatSchema);