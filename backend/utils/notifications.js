const Notification = require('../models/Notification');

// Helper function to create notifications
const createNotification = async ({
    recipient,
    sender,
    type,
    message,
    resourceId = null,
    resourceType = null,
    link = '',
    thumbnail = ''
}) => {
    try {
        // Don't send notification to yourself
        if (recipient.toString() === sender.toString()) {
            return null;
        }

        const notification = new Notification({
            recipient,
            sender,
            type,
            message,
            resourceId,
            resourceType,
            link,
            thumbnail
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Create notification error:', error);
        return null;
    }
};

module.exports = { createNotification };