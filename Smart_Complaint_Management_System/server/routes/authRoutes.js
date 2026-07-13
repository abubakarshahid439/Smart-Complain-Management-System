const express = require('express');
const { register, login, getMe, approveUser, updateProfile, getUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.get('/users', protect, authorize('admin'), getUsers);
router.get('/approve/:token', approveUser);

module.exports = router;
