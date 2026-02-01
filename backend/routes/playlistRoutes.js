const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.get('/public', playlistController.getAllPublicPlaylists);
router.get('/:id', playlistController.getPlaylistById);

// Semi-protected route (auth optional)
router.get('/user/:userId', async (req, res, next) => {
    // Try to authenticate, but don't fail if no token
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (token) {
        authMiddleware(req, res, (err) => {
            if (!err) return next();
            next();
        });
    } else {
        next();
    }
}, playlistController.getPlaylistsByUser);

// Protected routes
router.post('/', authMiddleware, playlistController.createPlaylist);
router.put('/:id', authMiddleware, playlistController.updatePlaylist);
router.delete('/:id', authMiddleware, playlistController.deletePlaylist);
router.post('/:id/videos', authMiddleware, playlistController.addVideoToPlaylist);
router.delete('/:id/videos/:videoId', authMiddleware, playlistController.removeVideoFromPlaylist);

module.exports = router;