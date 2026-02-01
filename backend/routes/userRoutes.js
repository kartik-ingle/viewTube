const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadImage } = require('../utils/cloudinary');

router.get('/:id', userController.getUserById);
router.put('/me', authMiddleware, uploadImage.single('profilePicture'), userController.updateProfile);
router.put('/:id/subscribe', authMiddleware, userController.subscribeToChannel);

module.exports = router;