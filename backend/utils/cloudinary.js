const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Storage for videos
const videoStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        console.log(`[CLOUDINARY] Uploading field: ${file.fieldname}, mimetype: ${file.mimetype}`);
        if (file.fieldname === 'video') {
            return {
                folder: 'viewtube/videos',
                resource_type: 'video',
                allowed_formats: ['mp4', 'mov', 'avi', 'mkv'],
                format: 'mp4',
                transformation: [{ quality: 'auto' }]
            };
        }
        // Specific for thumbnails and other images
        return {
            folder: 'viewtube/images',
            resource_type: 'image',
            allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            transformation: [{ width: 1280, height: 720, crop: 'limit' }]
        };
    }
});

// Storage for images (thumbnails, profile pictures)
const imageStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'viewtube/images',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1280, height: 720, crop: 'limit' }]
    }
});

const uploadVideo = multer({
    storage: videoStorage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const uploadImage = multer({
    storage: imageStorage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

module.exports = { cloudinary, uploadVideo, uploadImage };