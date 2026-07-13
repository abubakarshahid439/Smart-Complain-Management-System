const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: ['General', 'Technical', 'Hostel', 'Academic', 'Other']
    },
    priority: {
        type: String,
        required: [true, 'Please add a priority'],
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
        default: 'Pending'
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    resolution: {
        type: String,
        default: ''
    },
    estimatedCompletionDate: {
        type: Date
    },
    resolvedAt: {
        type: Date
    },
    // ===== RATING FIELDS =====
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
        select: true // Make sure this is selectable
    },
    feedback: {
        type: String,
        default: '',
        select: true // Make sure this is selectable
    },
    ratedAt: {
        type: Date,
        select: true // Make sure this is selectable
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Complaint', complaintSchema);