const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, commentController.addComment);
router.get('/video/:videoId', commentController.getCommentsByVideo);
router.delete('/:id', authMiddleware, commentController.deleteComment);
router.put('/:id/like', authMiddleware, commentController.likeComment);

module.exports = router;