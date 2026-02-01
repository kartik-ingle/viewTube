const mongoose = require('mongoose');

const historySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    videoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
        required: true
    },
    watchedAt: {
        type: Date,
        default: Date.now
    },
    watchDuration: {
        type: Number, // seconds watched
        default: 0
    }
}, {
    timestamps: true
});

// Index to prevent duplicate entries for same user-video combo
historySchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('History', historySchema);