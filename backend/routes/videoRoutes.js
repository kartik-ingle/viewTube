const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadVideo, uploadImage } = require('../utils/cloudinary');

// Upload video (requires both video and thumbnail)
router.post('/upload',
    authMiddleware,
    uploadVideo.fields([
        { name: 'video', maxCount: 1 },
        { name: 'thumbnail', maxCount: 1 }
    ]),
    videoController.uploadVideo
);

// Public routes
router.get('/', videoController.getAllVideos);
router.get('/search', videoController.searchVideos); // NEW: Advanced search
router.get('/trending', videoController.getTrendingVideos); // NEW: Trending videos
router.get('/user/:userId', videoController.getVideosByUser);
router.get('/:id', videoController.getVideoById);

// Semi-protected routes (view increment doesn't require auth)
router.put('/:id/view', videoController.incrementViews);

// Protected routes (require authentication)
router.put('/:id/like', authMiddleware, videoController.likeVideo);
router.put('/:id/dislike', authMiddleware, videoController.dislikeVideo);
router.delete('/:id', authMiddleware, videoController.deleteVideo);

module.exports = router;