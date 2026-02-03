const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middleware/authMiddleware');

// Optional auth middleware - works with or without authentication
const optionalAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (token) {
        const jwt = require('jsonwebtoken');
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.userId;
        } catch (error) {
            // Invalid token, continue without auth
        }
    }
    next();
};

// Public routes (work without auth)
router.get('/public', recommendationController.getPublicRecommendations);
router.get('/similar/:videoId', recommendationController.getSimilarVideos);

// Routes that work better with auth but don't require it
router.get('/', optionalAuth, async (req, res) => {
    if (req.userId) {
        return recommendationController.getRecommendedVideos(req, res);
    } else {
        return recommendationController.getPublicRecommendations(req, res);
    }
});

// Protected routes
router.get('/channels', authMiddleware, recommendationController.getChannelRecommendations);

module.exports = router;