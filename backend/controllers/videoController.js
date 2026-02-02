const Video = require('../models/Video');
const User = require('../models/User');
const { createNotification } = require('../utils/notifications');

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

// Get All Videos with Advanced Filtering
exports.getAllVideos = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            category,
            search,
            sortBy,
            uploadDate,
            minDuration,
            maxDuration,
            tags
        } = req.query;

        const query = { isPublished: true };

        // Category filter
        if (category && category !== 'all') {
            query.category = category;
        }

        // Search filter (title, description, tags)
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Tags filter
        if (tags) {
            const tagArray = tags.split(',').map(tag => tag.trim());
            query.tags = { $in: tagArray };
        }

        // Upload date filter
        if (uploadDate) {
            const now = new Date();
            let dateThreshold;

            switch (uploadDate) {
                case 'today':
                    dateThreshold = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    dateThreshold = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    dateThreshold = new Date(now.setDate(now.getDate() - 30));
                    break;
                case 'year':
                    dateThreshold = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
                default:
                    dateThreshold = null;
            }

            if (dateThreshold) {
                query.createdAt = { $gte: dateThreshold };
            }
        }

        // Duration filter
        if (minDuration || maxDuration) {
            query.duration = {};
            if (minDuration) query.duration.$gte = parseInt(minDuration);
            if (maxDuration) query.duration.$lte = parseInt(maxDuration);
        }

        // Build sort object
        let sortOptions = {};
        switch (sortBy) {
            case 'popular':
                sortOptions = { views: -1 };
                break;
            case 'rating':
                // This will need aggregation for accurate rating sort
                // For now, we'll sort by likes count
                sortOptions = { 'likes': -1 };
                break;
            case 'oldest':
                sortOptions = { createdAt: 1 };
                break;
            case 'recent':
            default:
                sortOptions = { createdAt: -1 };
                break;
        }

        const videos = await Video.find(query)
            .populate('uploadedBy', 'username channelName profilePicture _id')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean(); // Use lean for better performance

        const count = await Video.countDocuments(query);

        res.json({
            videos,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalVideos: count
        });
    } catch (error) {
        console.error('Get videos error:', error);
        res.status(500).json({ message: 'Error fetching videos' });
    }
};

// Search Videos with Advanced Options
exports.searchVideos = async (req, res) => {
    try {
        const {
            q, // search query
            category,
            sortBy = 'relevance',
            uploadDate,
            duration,
            page = 1,
            limit = 20
        } = req.query;

        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Build search query
        const searchQuery = {
            isPublished: true,
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } },
                { tags: { $in: [new RegExp(q, 'i')] } },
                { 'uploadedBy.channelName': { $regex: q, $options: 'i' } }
            ]
        };

        // Apply filters
        if (category && category !== 'all') {
            searchQuery.category = category;
        }

        if (uploadDate && uploadDate !== 'all') {
            const now = new Date();
            let dateThreshold;

            switch (uploadDate) {
                case 'today':
                    dateThreshold = new Date(now.setHours(0, 0, 0, 0));
                    break;
                case 'week':
                    dateThreshold = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    dateThreshold = new Date(now.setDate(now.getDate() - 30));
                    break;
                case 'year':
                    dateThreshold = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
            }

            if (dateThreshold) {
                searchQuery.createdAt = { $gte: dateThreshold };
            }
        }

        if (duration && duration !== 'all') {
            switch (duration) {
                case 'short':
                    searchQuery.duration = { $lt: 240 };
                    break;
                case 'medium':
                    searchQuery.duration = { $gte: 240, $lte: 1200 };
                    break;
                case 'long':
                    searchQuery.duration = { $gt: 1200 };
                    break;
            }
        }

        // Sort options
        let sortOptions = {};
        switch (sortBy) {
            case 'popular':
                sortOptions = { views: -1 };
                break;
            case 'rating':
                sortOptions = { likes: -1 };
                break;
            case 'recent':
                sortOptions = { createdAt: -1 };
                break;
            case 'relevance':
            default:
                // For relevance, we could use text score if we have text index
                sortOptions = { createdAt: -1 };
                break;
        }

        const videos = await Video.find(searchQuery)
            .populate('uploadedBy', 'username channelName profilePicture _id')
            .sort(sortOptions)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .lean();

        const count = await Video.countDocuments(searchQuery);

        res.json({
            videos,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page),
            totalVideos: count,
            searchQuery: q
        });
    } catch (error) {
        console.error('Search videos error:', error);
        res.status(500).json({ message: 'Error searching videos' });
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
        const likeIndex = video.likes.findIndex(id => id.toString() === userId.toString());
        const dislikeIndex = video.dislikes.findIndex(id => id.toString() === userId.toString());

        // Remove from dislikes if present
        if (dislikeIndex > -1) {
            video.dislikes.splice(dislikeIndex, 1);
        }

        // Toggle like
        if (likeIndex > -1) {
            video.likes.splice(likeIndex, 1); // Unlike
        } else {
            video.likes.push(userId); // Like

            // Create notification only if liker is not the owner
            // video.uploadedBy can be an ID or an object depending on population. 
            // We populated it in getVideoById, but findById usually doesn't populate unless chained.
            // But wait, LIKE VIDEO does not populate `uploadedBy`. So `video.uploadedBy` IS an ID here.
            // HOWEVER, if the code was copied from somewhere that populated, we must be careful.
            // In THIS controller, `likeVideo` does `Video.findById(req.params.id)`. It does NOT populate.
            // So video.uploadedBy IS an ObjectId.
            // The ERROR "Failed to like video" combined with "only when liking different account" suggests
            // that the notification creation might be failing on `recipient`.

            const uploadedById = video.uploadedBy._id || video.uploadedBy;

            if (uploadedById.toString() !== userId.toString()) {
                await createNotification({
                    recipient: uploadedById,
                    sender: userId,
                    type: 'like',
                    message: 'liked your video',
                    resourceId: video._id,
                    resourceType: 'Video',
                    link: `/video/${video._id}`,
                    thumbnail: video.thumbnailUrl
                });
            }
        }

        await video.save();

        res.json({
            message: likeIndex > -1 ? 'Video unliked' : 'Video liked',
            likes: video.likes.length,
            dislikes: video.dislikes.length
        });
    } catch (error) {
        console.error('Like video error:', error);
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
        const likeIndex = video.likes.findIndex(id => id.toString() === userId.toString());
        const dislikeIndex = video.dislikes.findIndex(id => id.toString() === userId.toString());

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

// Get Trending Videos
exports.getTrendingVideos = async (req, res) => {
    try {
        const { limit = 20 } = req.query;

        // Get videos from last 7 days sorted by views
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const videos = await Video.find({
            isPublished: true,
            createdAt: { $gte: sevenDaysAgo }
        })
            .populate('uploadedBy', 'username channelName profilePicture _id')
            .sort({ views: -1, likes: -1 })
            .limit(parseInt(limit))
            .lean();

        res.json({ videos });
    } catch (error) {
        console.error('Get trending videos error:', error);
        res.status(500).json({ message: 'Error fetching trending videos' });
    }
};