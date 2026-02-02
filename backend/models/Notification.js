const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['subscribe', 'like', 'comment', 'reply', 'video_upload'],
        required: true
    },
    message: {
        type: String,
        required: true
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'resourceType'
    },
    resourceType: {
        type: String,
        enum: ['Video', 'Comment', 'User']
    },
    link: {
        type: String,
        default: ''
    },
    isRead: {
        type: Boolean,
        default: false,
        index: true
    },
    thumbnail: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);