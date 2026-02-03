const Video = require('../models/Video');
const History = require('../models/History');
const User = require('../models/User');

// Get Recommended Videos for User
exports.getRecommendedVideos = async (req, res) => {
    try {
        const userId = req.userId;
        const { limit = 20, exclude } = req.query;

        // Get user's watch history
        const watchHistory = await History.find({ userId })
            .populate('videoId')
            .sort({ watchedAt: -1 })
            .limit(50);

        // Get user's liked videos
        const likedVideos = await Video.find({ likes: userId }).limit(20);

        // Get user's subscribed channels
        const user = await User.findById(userId).select('subscribedChannels');
        const subscribedChannels = user?.subscribedChannels || [];

        // Extract categories from watched and liked videos
        const watchedCategories = new Set();
        const watchedVideoIds = new Set();
        const watchedChannels = new Set();

        watchHistory.forEach(item => {
            if (item.videoId) {
                watchedCategories.add(item.videoId.category);
                watchedVideoIds.add(item.videoId._id.toString());
                watchedChannels.add(item.videoId.uploadedBy?.toString());
            }
        });

        likedVideos.forEach(video => {
            watchedCategories.add(video.category);
            watchedVideoIds.add(video._id.toString());
            watchedChannels.add(video.uploadedBy?.toString());
        });

        // Build recommendation query
        const recommendations = [];
        const excludeIds = exclude ? [exclude] : [];
        excludeIds.push(...Array.from(watchedVideoIds));

        // 1. Videos from subscribed channels (40% weight)
        if (subscribedChannels.length > 0) {
            const subscribedVideos = await Video.find({
                uploadedBy: { $in: subscribedChannels },
                _id: { $nin: excludeIds },
                isPublished: true
            })
                .populate('uploadedBy', 'username channelName profilePicture')
                .sort({ createdAt: -1 })
                .limit(Math.floor(limit * 0.4));

            recommendations.push(...subscribedVideos);
            excludeIds.push(...subscribedVideos.map(v => v._id.toString()));
        }

        // 2. Videos from same categories (30% weight)
        if (watchedCategories.size > 0) {
            const categoryVideos = await Video.find({
                category: { $in: Array.from(watchedCategories) },
                _id: { $nin: excludeIds },
                isPublished: true
            })
                .populate('uploadedBy', 'username channelName profilePicture')
                .sort({ views: -1, createdAt: -1 })
                .limit(Math.floor(limit * 0.3));

            recommendations.push(...categoryVideos);
            excludeIds.push(...categoryVideos.map(v => v._id.toString()));
        }

        // 3. Trending videos (20% weight)
        const trendingVideos = await Video.find({
            _id: { $nin: excludeIds },
            isPublished: true,
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        })
            .populate('uploadedBy', 'username channelName profilePicture')
            .sort({ views: -1, likes: -1 })
            .limit(Math.floor(limit * 0.2));

        recommendations.push(...trendingVideos);
        excludeIds.push(...trendingVideos.map(v => v._id.toString()));

        // 4. Fill remaining with popular videos (10% weight)
        const remainingSlots = limit - recommendations.length;
        if (remainingSlots > 0) {
            const popularVideos = await Video.find({
                _id: { $nin: excludeIds },
                isPublished: true
            })
                .populate('uploadedBy', 'username channelName profilePicture')
                .sort({ views: -1 })
                .limit(remainingSlots);

            recommendations.push(...popularVideos);
        }

        // Shuffle to avoid predictable ordering
        const shuffled = recommendations
            .sort(() => Math.random() - 0.5)
            .slice(0, limit);

        res.json({
            recommendations: shuffled,
            count: shuffled.length
        });
    } catch (error) {
        console.error('Get recommendations error:', error);
        res.status(500).json({ message: 'Error fetching recommendations' });
    }
};

// Get Similar Videos (for video page sidebar)
exports.getSimilarVideos = async (req, res) => {
    try {
        const videoId = req.params.videoId;
        const { limit = 10 } = req.query;

        // Get the current video
        const currentVideo = await Video.findById(videoId);

        if (!currentVideo) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Find similar videos based on:
        // 1. Same category
        // 2. Same uploader
        // 3. Similar tags (if any)

        const similarVideos = await Video.find({
            _id: { $ne: videoId },
            isPublished: true,
            $or: [
                { category: currentVideo.category },
                { uploadedBy: currentVideo.uploadedBy },
                { tags: { $in: currentVideo.tags || [] } }
            ]
        })
            .populate('uploadedBy', 'username channelName profilePicture')
            .sort({ views: -1, createdAt: -1 })
            .limit(limit * 2); // Get more to allow filtering

        // Score and sort by relevance
        const scoredVideos = similarVideos.map(video => {
            let score = 0;

            // Same category: +3 points
            if (video.category === currentVideo.category) score += 3;

            // Same uploader: +5 points
            if (video.uploadedBy._id.toString() === currentVideo.uploadedBy.toString()) score += 5;

            // Matching tags: +1 point per tag
            if (currentVideo.tags && video.tags) {
                const matchingTags = video.tags.filter(tag =>
                    currentVideo.tags.includes(tag)
                ).length;
                score += matchingTags;
            }

            // Recent videos: +2 points if within last 30 days
            const daysSinceUpload = (Date.now() - new Date(video.createdAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceUpload <= 30) score += 2;

            // Popular videos: +1 point per 1000 views
            score += Math.floor(video.views / 1000);

            return { video, score };
        });

        // Sort by score and take top results
        const topSimilar = scoredVideos
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.video);

        res.json({
            similar: topSimilar,
            count: topSimilar.length
        });
    } catch (error) {
        console.error('Get similar videos error:', error);
        res.status(500).json({ message: 'Error fetching similar videos' });
    }
};

// Get Recommended Videos for Non-Authenticated Users
exports.getPublicRecommendations = async (req, res) => {
    try {
        const { limit = 20, category } = req.query;

        const query = { isPublished: true };
        if (category && category !== 'all') {
            query.category = category;
        }

        // For non-authenticated users, show trending and popular videos
        const videos = await Video.find(query)
            .populate('uploadedBy', 'username channelName profilePicture')
            .sort({ views: -1, createdAt: -1 })
            .limit(limit);

        res.json({
            recommendations: videos,
            count: videos.length
        });
    } catch (error) {
        console.error('Get public recommendations error:', error);
        res.status(500).json({ message: 'Error fetching recommendations' });
    }
};

// Get Channel Recommendations (channels user might like)
exports.getChannelRecommendations = async (req, res) => {
    try {
        const userId = req.userId;
        const { limit = 10 } = req.query;

        // Get user's subscribed channels
        const user = await User.findById(userId).select('subscribedChannels');
        const subscribedChannels = user?.subscribedChannels || [];

        // Get channels with most subscribers that user hasn't subscribed to
        const recommendations = await User.find({
            _id: { $nin: [...subscribedChannels, userId] }
        })
            .select('username channelName profilePicture subscribers')
            .sort({ 'subscribers.length': -1 })
            .limit(limit);

        // Add subscriber count
        const channelsWithCount = recommendations.map(channel => ({
            ...channel.toObject(),
            subscriberCount: channel.subscribers?.length || 0
        }));

        res.json({
            channels: channelsWithCount,
            count: channelsWithCount.length
        });
    } catch (error) {
        console.error('Get channel recommendations error:', error);
        res.status(500).json({ message: 'Error fetching channel recommendations' });
    }
};