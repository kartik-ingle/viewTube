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

router.get('/', videoController.getAllVideos);
router.get('/:id', videoController.getVideoById);
router.put('/:id/view', videoController.incrementViews);
router.put('/:id/like', authMiddleware, videoController.likeVideo);
router.put('/:id/dislike', authMiddleware, videoController.dislikeVideo);
router.delete('/:id', authMiddleware, videoController.deleteVideo);
router.get('/user/:userId', videoController.getVideosByUser);

module.exports = router;