const Comment = require('../models/Comment');
const createNotification = require('../utils/notifications');
const Video = require('../models/Video');

// Add Comment
exports.addComment = async (req, res) => {
    try {
        const { videoId, text, parentComment } = req.body;

        if (!text || !videoId) {
            return res.status(400).json({ message: 'Text and videoId are required' });
        }

        const comment = new Comment({
            videoId,
            userId: req.userId,
            text,
            parentComment: parentComment || null
        });

        await comment.save();
        await comment.populate('userId', 'username profilePicture');

        if (parentComment) {
            const parentCommentDoc = await Comment.findById(parentComment).populate('userId', '_id');
            if (parentCommentDoc) {
                await createNotification({
                    recipient: parentCommentDoc.userId._id,
                    sender: req.userId,
                    type: 'reply',
                    message: 'replied to your comment',
                    resourceId: videoId,
                    resourceType: 'Video',
                    link: `/video/${videoId}`
                })
            }
        } else {
            const video = await Video.findById(videoId).populate('uploadedBy', '_id');
            if (video) {
                await createNotification({
                    recipient: video.uploadedBy._id,
                    sender: req.userId,
                    type: 'comment',
                    message: 'commented on your video',
                    resourceId: videoId,
                    resourceType: 'Video',
                    link: `/video/${videoId}`,
                    thumbnail: video.thumbnailUrl
                });
            }
        }

        res.status(201).json({
            message: 'Comment added successfully',
            comment
        });
    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({ message: 'Error adding comment' });
    }
};

// Get Comments by Video
exports.getCommentsByVideo = async (req, res) => {
    try {
        const comments = await Comment.find({
            videoId: req.params.videoId,
            parentComment: null // Only get top-level comments
        })
            .populate('userId', 'username profilePicture channelName')
            .sort({ createdAt: -1 });

        // Get replies for each comment
        const commentsWithReplies = await Promise.all(
            comments.map(async (comment) => {
                const replies = await Comment.find({ parentComment: comment._id })
                    .populate('userId', 'username profilePicture channelName')
                    .sort({ createdAt: 1 });

                return {
                    ...comment.toObject(),
                    replies
                };
            })
        );

        res.json({ comments: commentsWithReplies });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
};

// Delete Comment
exports.deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user owns the comment
        if (comment.userId.toString() !== req.userId) {
            console.log(`[COMMENT-AUTH] Ownership mismatch: comment.userId(${comment.userId}) !== req.userId(${req.userId})`);
            return res.status(403).json({ message: 'Not authorized to delete this comment' });
        }

        // Also delete all replies
        await Comment.deleteMany({ parentComment: comment._id });
        await comment.deleteOne();

        res.json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment' });
    }
};

// Like Comment
exports.likeComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const userId = req.userId;
        const likeIndex = comment.likes.indexOf(userId);

        if (likeIndex > -1) {
            comment.likes.splice(likeIndex, 1); // Unlike
        } else {
            comment.likes.push(userId); // Like
        }

        await comment.save();

        res.json({
            message: likeIndex > -1 ? 'Comment unliked' : 'Comment liked',
            likes: comment.likes.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error liking comment' });
    }
};