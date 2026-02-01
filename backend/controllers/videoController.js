const Video = require('../models/Video');
const User = require('../models/User');

// Upload Video
exports.uploadVideo = async (req, res) => {
    try {
        const { title, description, category, tags } = req.body;

        if (!req.files || !req.files.video) {
            return res.status(400).json({ message: 'Please upload a video file' });
        }

        if (!req.files.thumbnail) {
            return res.status(400).json({ message: 'Please upload a thumbnail' });
        }

        const videoUrl = req.files.video[0].path;
        const thumbnailUrl = req.files.thumbnail[0].path;
        const duration = req.files.video[0].duration || 0;

        console.log('[DEBUG] Full req.files.video[0]:', req.files.video[0]);
        console.log('[UPLOAD] Video URL:', videoUrl);
        console.log('[UPLOAD] Thumbnail URL:', thumbnailUrl);

        const video = new Video({
            title,
            description,
            videoUrl,
            thumbnailUrl,
            duration,
            category: category || 'General',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            uploadedBy: req.userId
        });

        await video.save();

        res.status(201).json({
            message: 'Video uploaded successfully',
            video
        });
    } catch (error) {
        console.error('Upload video error:', error);
        res.status(500).json({ message: 'Error uploading video' });
    }
};

// Get All Videos
exports.getAllVideos = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, search } = req.query;

        const query = { isPublished: true };

        if (category && category !== 'all') {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const videos = await Video.find(query)
            .populate('uploadedBy', 'username channelName profilePicture _id')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const count = await Video.countDocuments(query);

        res.json({
            videos,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalVideos: count
        });
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({ message: 'Error fetching videos' });
    }
};

// Get Single Video
exports.getVideoById = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id)
            .populate('uploadedBy', 'username channelName profilePicture subscribers _id');

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        res.json({ video });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching video' });
    }
};

// Increment Video Views
exports.incrementViews = async (req, res) => {
    try {
        const video = await Video.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        res.json({ message: 'View counted', views: video.views });
    } catch (error) {
        res.status(500).json({ message: 'Error incrementing views' });
    }
};

// Like Video
exports.likeVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const userId = req.userId;
        const likeIndex = video.likes.indexOf(userId);
        const dislikeIndex = video.dislikes.indexOf(userId);

        // Remove from dislikes if present
        if (dislikeIndex > -1) {
            video.dislikes.splice(dislikeIndex, 1);
        }

        // Toggle like
        if (likeIndex > -1) {
            video.likes.splice(likeIndex, 1); // Unlike
        } else {
            video.likes.push(userId); // Like
        }

        await video.save();

        res.json({
            message: likeIndex > -1 ? 'Video unliked' : 'Video liked',
            likes: video.likes.length,
            dislikes: video.dislikes.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error liking video' });
    }
};

// Dislike Video
exports.dislikeVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const userId = req.userId;
        const likeIndex = video.likes.indexOf(userId);
        const dislikeIndex = video.dislikes.indexOf(userId);

        // Remove from likes if present
        if (likeIndex > -1) {
            video.likes.splice(likeIndex, 1);
        }

        // Toggle dislike
        if (dislikeIndex > -1) {
            video.dislikes.splice(dislikeIndex, 1); // Remove dislike
        } else {
            video.dislikes.push(userId); // Dislike
        }

        await video.save();

        res.json({
            message: dislikeIndex > -1 ? 'Dislike removed' : 'Video disliked',
            likes: video.likes.length,
            dislikes: video.dislikes.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error disliking video' });
    }
};

// Delete Video
exports.deleteVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);

        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Check if user owns the video
        if (video.uploadedBy.toString() !== req.userId) {
            console.log(`[VIDEO-AUTH] Ownership mismatch: video.uploadedBy(${video.uploadedBy}) !== req.userId(${req.userId})`);
            return res.status(403).json({ message: 'Not authorized to delete this video' });
        }

        await video.deleteOne();

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting video' });
    }
};

// Get Videos by User/Channel
exports.getVideosByUser = async (req, res) => {
    try {
        const videos = await Video.find({ uploadedBy: req.params.userId, isPublished: true })
            .populate('uploadedBy', 'username channelName profilePicture _id')
            .sort({ createdAt: -1 });

        res.json({ videos });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user videos' });
    }
};