import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const CreatePlaylistModal = ({ isOpen, onClose, onPlaylistCreated }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isPublic: true,
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            toast.error('Please enter a playlist name');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/playlists', formData);
            toast.success('Playlist created successfully!');
            onPlaylistCreated(response.data.playlist);
            onClose();
            setFormData({ name: '', description: '', isPublic: true });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create playlist');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
            <div className="glass-card rounded-2xl max-w-md w-full p-6 animate-in slide-in-from-bottom-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold">Create Playlist</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full smooth-transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Playlist Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold mb-2">
                            Playlist Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="My awesome playlist"
                            className="input-field"
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold mb-2">
                            Description (optional)
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Tell us about this playlist..."
                            rows="3"
                            className="input-field resize-none"
                            disabled={loading}
                        />
                    </div>

                    {/* Privacy */}
                    <div className="flex items-center justify-between p-4 glass rounded-xl">
                        <div>
                            <p className="font-semibold">Public Playlist</p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Anyone can view this playlist
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isPublic}
                                onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                className="sr-only peer"
                                disabled={loading}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn-primary"
                        >
                            {loading ? (
                                <span>Creating...</span>
                            ) : (
                                <>
                                    <Plus size={20} />
                                    <span>Create</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePlaylistModal;