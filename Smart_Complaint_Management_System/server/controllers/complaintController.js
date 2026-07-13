const Complaint = require('../models/Complaint');
const User = require('../models/User');
const mongoose = require('mongoose');
// Import notification functions
const { 
    notifyStatusUpdate, 
    notifyComplaintResolved,
    notifyRatingReceived 
} = require('./notificationController');

// @desc    Get all complaints
// @route   GET /api/complaints
// @access  Private
const getComplaints = async (req, res) => {
    try {
        let query;
        
        // FIX: Explicitly select rating fields with '+'
        if (req.user.role === 'admin') {
            query = Complaint.find()
                .populate('user', 'name email')
                .select('+rating +feedback +ratedAt');
        } else {
            query = Complaint.find({ user: req.user.id })
                .populate('user', 'name email')
                .select('+rating +feedback +ratedAt');
        }

        const complaints = await query;
        
        // Debug log
        console.log('=== COMPLAINTS WITH RATINGS ===');
        complaints.forEach(c => {
            console.log(`ID: ${c._id}, Title: ${c.title}, Rating: ${c.rating}, Feedback: ${c.feedback}, Status: ${c.status}`);
        });

        res.status(200).json({
            success: true,
            count: complaints.length,
            data: complaints
        });
    } catch (error) {
        console.error('Get complaints error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching complaints'
        });
    }
};

// @desc    Get single complaint
// @route   GET /api/complaints/:id
// @access  Private
const getComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id)
            .populate('user', 'name email')
            .select('+rating +feedback +ratedAt');

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        if (complaint.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this complaint'
            });
        }

        res.status(200).json({
            success: true,
            data: complaint
        });
    } catch (error) {
        console.error('Get complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching complaint'
        });
    }
};

// @desc    Create complaint
// @route   POST /api/complaints
// @access  Private
const createComplaint = async (req, res) => {
    try {
        const { title, category, priority, description } = req.body;

        const complaint = await Complaint.create({
            title,
            category,
            priority,
            description,
            user: req.user.id,
            status: 'Pending'
        });

        await complaint.populate('user', 'name email');

        res.status(201).json({
            success: true,
            data: complaint
        });
    } catch (error) {
        console.error('Create complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating complaint'
        });
    }
};

// @desc    Update complaint status (Admin only) - WITH NOTIFICATIONS
// @route   PUT /api/complaints/:id
// @access  Private/Admin
const updateComplaintStatus = async (req, res) => {
    try {
        const { status, resolution, estimatedCompletionDate } = req.body;

        let complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        // Store old status for notification
        const oldStatus = complaint.status;
        const actor = req.user;

        // Update fields
        complaint.status = status || complaint.status;
        
        if (resolution) {
            complaint.resolution = resolution;
        }

        if (estimatedCompletionDate) {
            complaint.estimatedCompletionDate = estimatedCompletionDate;
        }

        if (status === 'Resolved') {
            complaint.resolvedAt = new Date();
        }

        await complaint.save();
        await complaint.populate('user', 'name email');

        // ===== TRIGGER NOTIFICATIONS =====
        console.log('=== TRIGGERING NOTIFICATIONS ===');
        console.log('Old Status:', oldStatus);
        console.log('New Status:', status);
        console.log('Actor:', actor.name);
        console.log('Complaint User:', complaint.user._id);

        // 1. Notify about status change (if status changed)
        if (oldStatus !== status) {
            console.log('Status changed - sending notification...');
            await notifyStatusUpdate(complaint, oldStatus, status, actor);
        }

        // 2. Notify if complaint is resolved
        if (status === 'Resolved' && oldStatus !== 'Resolved') {
            console.log('Complaint resolved - sending resolution notification...');
            await notifyComplaintResolved(complaint, actor);
        }

        res.status(200).json({
            success: true,
            data: complaint
        });
    } catch (error) {
        console.error('Update complaint status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating complaint status'
        });
    }
};

// @desc    Update complaint (User - only pending)
// @route   PUT /api/complaints/:id/update
// @access  Private
const updateComplaint = async (req, res) => {
    try {
        const { title, category, priority, description } = req.body;

        let complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        if (complaint.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this complaint'
            });
        }

        if (complaint.status !== 'Pending') {
            return res.status(400).json({
                success: false,
                message: 'Only pending complaints can be updated'
            });
        }

        complaint.title = title || complaint.title;
        complaint.category = category || complaint.category;
        complaint.priority = priority || complaint.priority;
        complaint.description = description || complaint.description;

        await complaint.save();
        await complaint.populate('user', 'name email');

        res.status(200).json({
            success: true,
            data: complaint
        });
    } catch (error) {
        console.error('Update complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating complaint'
        });
    }
};

// @desc    Delete complaint
// @route   DELETE /api/complaints/:id
// @access  Private
const deleteComplaint = async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        if (complaint.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this complaint'
            });
        }

        await complaint.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Complaint deleted successfully'
        });
    } catch (error) {
        console.error('Delete complaint error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting complaint'
        });
    }
};

// @desc    Get complaint statistics (Admin only)
// @route   GET /api/complaints/stats
// @access  Private/Admin
const getStats = async (req, res) => {
    try {
        const total = await Complaint.countDocuments();
        const pending = await Complaint.countDocuments({ status: 'Pending' });
        const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
        const resolved = await Complaint.countDocuments({ status: 'Resolved' });
        const rejected = await Complaint.countDocuments({ status: 'Rejected' });

        const categoryDistribution = await Complaint.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        const priorityDistribution = await Complaint.aggregate([
            { $group: { _id: '$priority', count: { $sum: 1 } } }
        ]);

        const today = new Date();
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0);
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);
            
            const count = await Complaint.countDocuments({
                createdAt: { $gte: date, $lt: nextDate }
            });
            
            last7Days.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                count
            });
        }

        const ratedComplaints = await Complaint.find({ rating: { $exists: true, $ne: null } });
        const averageRating = ratedComplaints.length > 0 
            ? ratedComplaints.reduce((acc, c) => acc + c.rating, 0) / ratedComplaints.length 
            : 0;

        const ratingDistribution = await Complaint.aggregate([
            { $match: { rating: { $exists: true, $ne: null } } },
            { $group: { _id: '$rating', count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                total,
                pending,
                inProgress,
                resolved,
                rejected,
                category: categoryDistribution,
                priority: priorityDistribution,
                dailyTrend: last7Days,
                rating: {
                    average: averageRating.toFixed(1),
                    total: ratedComplaints.length,
                    distribution: ratingDistribution
                }
            }
        });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
};

// ===== RATE COMPLAINT - WITH NOTIFICATION =====
const rateComplaint = async (req, res) => {
    try {
        console.log('=== RATING REQUEST STARTED ===');
        console.log('Complaint ID:', req.params.id);
        console.log('User ID:', req.user.id);
        console.log('Request body:', req.body);

        const { rating, feedback } = req.body;
        
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        const complaint = await Complaint.findById(req.params.id);
        
        if (!complaint) {
            return res.status(404).json({
                success: false,
                message: 'Complaint not found'
            });
        }

        console.log('Found complaint:', {
            id: complaint._id,
            status: complaint.status,
            user: complaint.user,
            currentRating: complaint.rating
        });
        
        if (complaint.user.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to rate this complaint'
            });
        }
        
        if (complaint.status !== 'Resolved') {
            return res.status(400).json({
                success: false,
                message: 'Complaint must be resolved to rate'
            });
        }
        
        if (complaint.rating) {
            return res.status(400).json({
                success: false,
                message: 'Complaint already rated'
            });
        }
        
        complaint.rating = parseInt(rating);
        complaint.feedback = feedback || '';
        complaint.ratedAt = new Date();
        
        await complaint.save();
        await complaint.populate('user', 'name email');

        console.log('Rating saved successfully:', {
            id: complaint._id,
            rating: complaint.rating,
            feedback: complaint.feedback,
            ratedAt: complaint.ratedAt
        });

        // ===== TRIGGER NOTIFICATION FOR RATING =====
        console.log('=== TRIGGERING RATING NOTIFICATION ===');
        await notifyRatingReceived(complaint, rating, feedback);
        
        res.status(200).json({
            success: true,
            message: 'Rating submitted successfully',
            data: complaint
        });
    } catch (error) {
        console.error('Rating error:', error);
        res.status(500).json({
            success: false,
            message: 'Error submitting rating: ' + error.message
        });
    }
};

module.exports = {
    getComplaints,
    getComplaint,
    createComplaint,
    updateComplaintStatus,
    updateComplaint,
    deleteComplaint,
    getStats,
    rateComplaint
};