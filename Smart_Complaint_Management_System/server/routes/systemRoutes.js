const express = require('express');
const router = express.Router();
const { getSystemStatus, toggleSystemStatus } = require('../controllers/systemController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/status', getSystemStatus);
router.put('/toggle', protect, authorize('admin'), toggleSystemStatus);

module.exports = router;
