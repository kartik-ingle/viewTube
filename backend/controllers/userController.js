const User = require('../models/User');

// Get User/Channel Info
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('subscribers', 'username profilePicture')
            .populate('subscribedChannels', 'username channelName profilePicture');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Get user error:', error);

        // Handle invalid MongoDB ObjectId
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(500).json({ message: 'Error fetching user' });
    }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
    try {
        const { channelName, channelDescription } = req.body;

        const updateData = {};
        if (channelName) updateData.channelName = channelName;
        if (channelDescription) updateData.channelDescription = channelDescription;

        // If profile picture is uploaded
        if (req.file) {
            updateData.profilePicture = req.file.path;
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            updateData,
            { new: true }
        ).select('-password');

        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
};

// Subscribe to Channel
exports.subscribeToChannel = async (req, res) => {
    try {
        const channelId = req.params.id;
        const userId = req.userId;

        if (channelId === userId) {
            return res.status(400).json({ message: 'Cannot subscribe to your own channel' });
        }

        const channel = await User.findById(channelId);
        const user = await User.findById(userId);

        if (!channel) {
            return res.status(404).json({ message: 'Channel not found' });
        }

        const isSubscribed = channel.subscribers.includes(userId);

        if (isSubscribed) {
            // Unsubscribe
            channel.subscribers = channel.subscribers.filter(
                id => id.toString() !== userId
            );
            user.subscribedChannels = user.subscribedChannels.filter(
                id => id.toString() !== channelId
            );
        } else {
            // Subscribe
            channel.subscribers.push(userId);
            user.subscribedChannels.push(channelId);
        }

        await channel.save();
        await user.save();

        res.json({
            message: isSubscribed ? 'Unsubscribed successfully' : 'Subscribed successfully',
            isSubscribed: !isSubscribed,
            subscriberCount: channel.subscribers.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Error subscribing to channel' });
    }
};