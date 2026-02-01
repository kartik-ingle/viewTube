const History = require('../models/History');

// Add to History
exports.addToHistory = async (req, res) => {
    try {
        const { videoId, watchDuration } = req.body;

        // Update or create history entry
        const history = await History.findOneAndUpdate(
            { userId: req.userId, videoId },
            {
                watchedAt: Date.now(),
                watchDuration: watchDuration || 0
            },
            { upsert: true, new: true }
        );

        res.json({ message: 'Added to history', history });
    } catch (error) {
        res.status(500).json({ message: 'Error adding to history' });
    }
};

// Get User History
exports.getUserHistory = async (req, res) => {
    try {
        let historyItems = await History.find({ userId: req.userId })
            .populate({
                path: 'videoId',
                populate: {
                    path: 'uploadedBy',
                    select: 'username channelName profilePicture'
                }
            })
            .sort({ watchedAt: -1 })
            .limit(50);

        // Filter out entries where video was deleted
        const filteredHistory = historyItems.filter(item => item.videoId !== null);

        res.json({ history: filteredHistory });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching history' });
    }
};

// Clear History
exports.clearHistory = async (req, res) => {
    try {
        await History.deleteMany({ userId: req.userId });
        res.json({ message: 'History cleared successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error clearing history' });
    }
};

// Delete Single History Entry
exports.deleteHistoryEntry = async (req, res) => {
    try {
        await History.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });
        res.json({ message: 'History entry deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting history entry' });
    }
};