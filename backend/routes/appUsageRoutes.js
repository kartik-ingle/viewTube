const express = require('express');
const router = express.Router();
const appUsageController = require('../controllers/appUsageController');
const authMiddleware = require('../middleware/authMiddleware');

// All routes require authentication
router.use(authMiddleware);

router.post('/track', appUsageController.trackAppUsage);
router.get('/today', appUsageController.getTodayAppUsage);
router.get('/stats', appUsageController.getAppUsageStats);
router.get('/daily-breakdown', appUsageController.getDailyBreakdown);

module.exports = router;