import { useState, useEffect } from 'react';
import { X, Plus, Check } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const AddToPlaylistModal = ({ isOpen, onClose, videoId, videoTitle }) => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showCreateNew, setShowCreateNew] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchPlaylists();
        }
    }, [isOpen]);

    const fetchPlaylists = async () => {
        try {
            const response = await api.get('/playlists/user/me');
            setPlaylists(response.data.playlists);
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
        }
    };

    const handleAddToPlaylist = async (playlistId) => {
        try {
            await api.post(`/playlists/${playlistId}/videos`, { videoId });
            toast.success('Added to playlist!');
            fetchPlaylists();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to playlist');
        }
    };

    const handleRemoveFromPlaylist = async (playlistId) => {
        try {
            await api.delete(`/playlists/${playlistId}/videos/${videoId}`);
            toast.success('Removed from playlist');
            fetchPlaylists();
        } catch (error) {
            toast.error('Failed to remove from playlist');
        }
    };

    const handleCreateAndAdd = async (e) => {
        e.preventDefault();
        if (!newPlaylistName.trim()) return;

        setLoading(true);
        try {
            const createResponse = await api.post('/playlists', {
                name: newPlaylistName,
                isPublic: true,
            });

            await api.post(`/playlists/${createResponse.data.playlist._id}/videos`, { videoId });

            toast.success('Playlist created and video added!');
            setNewPlaylistName('');
            setShowCreateNew(false);
            fetchPlaylists();
        } catch (error) {
            toast.error('Failed to create playlist');
        } finally {
            setLoading(false);
        }
    };

    const isVideoInPlaylist = (playlist) => {
        return playlist.videos.some(v => v._id === videoId || v === videoId);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="glass-card rounded-2xl max-w-md w-full max-h-[80vh] flex flex-col animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold">Save to playlist</h2>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-1">{videoTitle}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full smooth-transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Playlists List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {playlists.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <p className="mb-4">You don't have any playlists yet</p>
                            <button
                                onClick={() => setShowCreateNew(true)}
                                className="btn-primary mx-auto"
                            >
                                <Plus size={18} />
                                <span>Create Your First Playlist</span>
                            </button>
                        </div>
                    ) : (
                        playlists.map((playlist) => {
                            const inPlaylist = isVideoInPlaylist(playlist);
                            return (
                                <button
                                    key={playlist._id}
                                    onClick={() =>
                                        inPlaylist
                                            ? handleRemoveFromPlaylist(playlist._id)
                                            : handleAddToPlaylist(playlist._id)
                                    }
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 smooth-transition"
                                >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${inPlaylist ? 'bg-red-600 border-red-600' : 'border-gray-600'
                                        }`}>
                                        {inPlaylist && <Check size={14} className="text-white" />}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-semibold text-sm">{playlist.name}</p>
                                        <p className="text-xs text-gray-400">{playlist.videos.length} videos</p>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>

                {/* Create New Playlist */}
                <div className="p-4 border-t border-white/10">
                    {showCreateNew ? (
                        <form onSubmit={handleCreateAndAdd} className="space-y-3">
                            <input
                                type="text"
                                value={newPlaylistName}
                                onChange={(e) => setNewPlaylistName(e.target.value)}
                                placeholder="Enter playlist name"
                                className="input-field"
                                autoFocus
                                disabled={loading}
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateNew(false);
                                        setNewPlaylistName('');
                                    }}
                                    className="flex-1 btn-secondary text-sm py-2"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 btn-primary text-sm py-2"
                                    disabled={loading || !newPlaylistName.trim()}
                                >
                                    {loading ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setShowCreateNew(true)}
                            className="w-full flex items-center justify-center gap-2 p-3 glass hover:bg-white/10 rounded-xl smooth-transition font-semibold"
                        >
                            <Plus size={20} />
                            <span>Create New Playlist</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddToPlaylistModal;