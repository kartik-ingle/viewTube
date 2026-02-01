const Playlist = require('../models/Playlist');
const Video = require('../models/Video');

// Create Playlist
exports.createPlaylist = async (req, res) => {
    try {
        const { name, description, isPublic } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Playlist name is required' });
        }

        const playlist = new Playlist({
            name: name.trim(),
            description: description || '',
            userId: req.userId,
            isPublic: isPublic !== undefined ? isPublic : true,
        });

        await playlist.save();

        res.status(201).json({
            message: 'Playlist created successfully',
            playlist
        });
    } catch (error) {
        console.error('Create playlist error:', error);
        res.status(500).json({ message: 'Error creating playlist' });
    }
};

// Get All Playlists by User
exports.getPlaylistsByUser = async (req, res) => {
    try {
        const userId = req.params.userId;

        // If userId is 'me', use the authenticated user's ID
        const targetUserId = userId === 'me' ? req.userId : userId;

        // If requesting own playlists, show all. Otherwise, only public ones
        const query = { userId: targetUserId };
        if (req.userId !== targetUserId) {
            query.isPublic = true;
        }

        const playlists = await Playlist.find(query)
            .populate('userId', 'username channelName profilePicture _id') // ADD _id here
            .populate('videos', 'title thumbnailUrl duration views')
            .sort({ createdAt: -1 });

        res.json({ playlists });
    } catch (error) {
        console.error('Get playlists error:', error);
        res.status(500).json({ message: 'Error fetching playlists' });
    }
};

// Get Single Playlist
exports.getPlaylistById = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id)
            .populate('userId', 'username channelName profilePicture')
            .populate('videos');

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Check if playlist is private and user is not owner
        if (!playlist.isPublic && playlist.userId._id.toString() !== req.userId) {
            return res.status(403).json({ message: 'This playlist is private' });
        }

        res.json({ playlist });
    } catch (error) {
        console.error('Get playlist error:', error);
        res.status(500).json({ message: 'Error fetching playlist' });
    }
};

// Update Playlist
exports.updatePlaylist = async (req, res) => {
    try {
        const { name, description, isPublic } = req.body;
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Check ownership
        if (playlist.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to update this playlist' });
        }

        if (name) playlist.name = name.trim();
        if (description !== undefined) playlist.description = description;
        if (isPublic !== undefined) playlist.isPublic = isPublic;

        await playlist.save();

        res.json({
            message: 'Playlist updated successfully',
            playlist
        });
    } catch (error) {
        console.error('Update playlist error:', error);
        res.status(500).json({ message: 'Error updating playlist' });
    }
};

// Delete Playlist
exports.deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Check ownership
        if (playlist.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to delete this playlist' });
        }

        await playlist.deleteOne();

        res.json({ message: 'Playlist deleted successfully' });
    } catch (error) {
        console.error('Delete playlist error:', error);
        res.status(500).json({ message: 'Error deleting playlist' });
    }
};

// Add Video to Playlist
exports.addVideoToPlaylist = async (req, res) => {
    try {
        const { videoId } = req.body;
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Check ownership
        if (playlist.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to modify this playlist' });
        }

        // Check if video exists
        const video = await Video.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        // Check if video already in playlist
        if (playlist.videos.includes(videoId)) {
            return res.status(400).json({ message: 'Video already in playlist' });
        }

        playlist.videos.push(videoId);

        // Set playlist thumbnail to first video's thumbnail if not set
        if (!playlist.thumbnailUrl && video.thumbnailUrl) {
            playlist.thumbnailUrl = video.thumbnailUrl;
        }

        await playlist.save();

        res.json({
            message: 'Video added to playlist',
            playlist
        });
    } catch (error) {
        console.error('Add video error:', error);
        res.status(500).json({ message: 'Error adding video to playlist' });
    }
};

// Remove Video from Playlist
exports.removeVideoFromPlaylist = async (req, res) => {
    try {
        const { videoId } = req.params;
        const playlist = await Playlist.findById(req.params.id);

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        // Check ownership
        if (playlist.userId.toString() !== req.userId) {
            return res.status(403).json({ message: 'Not authorized to modify this playlist' });
        }

        playlist.videos = playlist.videos.filter(
            id => id.toString() !== videoId
        );

        await playlist.save();

        res.json({
            message: 'Video removed from playlist',
            playlist
        });
    } catch (error) {
        console.error('Remove video error:', error);
        res.status(500).json({ message: 'Error removing video from playlist' });
    }
};

// Get all public playlists
exports.getAllPublicPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ isPublic: true })
            .populate('userId', 'username channelName profilePicture _id') // ADD _id here
            .populate('videos', 'title thumbnailUrl')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ playlists });
    } catch (error) {
        console.error('Get public playlists error:', error);
        res.status(500).json({ message: 'Error fetching playlists' });
    }
};