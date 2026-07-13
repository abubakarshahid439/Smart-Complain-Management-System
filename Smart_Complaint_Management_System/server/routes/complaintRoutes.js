const express = require('express');
const {
    getComplaints,
    getComplaint,
    createComplaint,
    updateComplaintStatus,
    updateComplaint,
    deleteComplaint,
    getStats,
    rateComplaint
} = require('../controllers/complaintController');

const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

// GET all complaints & POST create complaint
router.route('/')
    .get(getComplaints)
    .post(createComplaint);

// GET stats - Admin only
router.get('/stats', authorize('admin'), getStats);

// GET single complaint, PUT update status (admin), DELETE complaint
router.route('/:id')
    .get(getComplaint)
    .put(authorize('admin'), updateComplaintStatus)
    .delete(deleteComplaint);

// PUT update complaint (user) - Only pending complaints
router.put('/:id/update', updateComplaint);

// POST rate complaint (user) - Only resolved complaints
router.post('/:id/rate', rateComplaint);

module.exports = router;