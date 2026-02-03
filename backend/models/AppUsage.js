const mongoose = require('mongoose');

const appUsageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    duration: {
        type: Number, // Duration in seconds
        required: true,
        default: 0
    },
    sessionDate: {
        type: Date,
        required: true,
        index: true
    },
    sessionStartTime: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient daily queries
appUsageSchema.index({ userId: 1, sessionDate: 1 });

module.exports = mongoose.model('AppUsage', appUsageSchema);