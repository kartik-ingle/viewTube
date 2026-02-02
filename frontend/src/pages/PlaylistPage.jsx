import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Play, Edit, Trash2, Lock, Globe, Share2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/formatDate';
import { formatDuration } from '../utils/formatViews';
import Loading from '../components/common/Loading';

const PlaylistPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ name: '', description: '', isPublic: true });

    useEffect(() => {
        fetchPlaylist();
    }, [id]);

    const fetchPlaylist = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/playlists/${id}`);
            setPlaylist(response.data.playlist);
            setEditForm({
                name: response.data.playlist.name,
                description: response.data.playlist.description,
                isPublic: response.data.playlist.isPublic,
            });
        } catch (error) {
            console.error('Failed to fetch playlist:', error);
            toast.error('Failed to load playlist');
            navigate('/playlists');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this playlist?')) {
            return;
        }

        try {
            await api.delete(`/playlists/${id}`);
            toast.success('Playlist deleted');
            navigate('/playlists');
        } catch (error) {
            toast.error('Failed to delete playlist');
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/playlists/${id}`, editForm);
            toast.success('Playlist updated');
            setIsEditing(false);
            fetchPlaylist();
        } catch (error) {
            toast.error('Failed to update playlist');
        }
    };

    const handleRemoveVideo = async (videoId) => {
        if (!window.confirm('Remove this video from the playlist?')) {
            return;
        }

        try {
            await api.delete(`/playlists/${id}/videos/${videoId}`);
            toast.success('Video removed');
            fetchPlaylist();
        } catch (error) {
            toast.error('Failed to remove video');
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: playlist.name,
                text: `Check out this playlist: ${playlist.name}`,
                url: url,
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        }
    };

    const playAll = () => {
        if (playlist.videos.length > 0) {
            navigate(`/video/${playlist.videos[0]._id}?playlist=${id}`);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!playlist) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-400">Playlist not found</p>
            </div>
        );
    }

    const isOwner = user?.id === playlist.userId?.id;
    const thumbnailUrl = playlist.thumbnailUrl || playlist.videos?.[0]?.thumbnailUrl || 'https://via.placeholder.com/400x225?text=Empty+Playlist';

    return (
        <div className="max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-8 pb-3 animate-in fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Playlist Info Sidebar */}
                <div className="lg:col-span-1">
                    <div className="glass-card rounded-2xl overflow-hidden sticky top-20">
                        {/* Thumbnail */}
                        <div className="relative aspect-video">
                            <img
                                src={thumbnailUrl}
                                alt={playlist.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/400x225?text=Empty+Playlist';
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

                            {/* Video Count */}
                            <div className="absolute bottom-4 left-4 right-4">
                                <div className="flex items-center justify-between text-white">
                                    <div className="flex items-center gap-2">
                                        <Play size={20} className="fill-white" />
                                        <span className="font-bold">{playlist.videos?.length || 0} videos</span>
                                    </div>
                                    {!playlist.isPublic && (
                                        <div className="flex items-center gap-1 px-2 py-1 bg-black/50 rounded-lg">
                                            <Lock size={14} />
                                            <span className="text-xs font-bold">Private</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Info */}
                        <div className="p-6">
                            {isEditing ? (
                                <form onSubmit={handleUpdate} className="space-y-4">
                                    <input
                                        type="text"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        className="input-field"
                                        placeholder="Playlist name"
                                    />
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        className="input-field resize-none"
                                        rows="3"
                                        placeholder="Description"
                                    />
                                    <div className="flex items-center justify-between p-3 glass rounded-xl">
                                        <span className="text-sm font-semibold">Public</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={editForm.isPublic}
                                                onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                        </label>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="flex-1 btn-secondary text-sm"
                                        >
                                            Cancel
                                        </button>
                                        <button type="submit" className="flex-1 btn-primary text-sm">
                                            Save
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <h1 className="text-2xl font-bold mb-2">{playlist.name}</h1>

                                    <Link
                                        to={`/channel/${playlist.userId?.id}`}
                                        className="flex items-center gap-2 text-gray-400 hover:text-white smooth-transition mb-4"
                                    >
                                        <img
                                            src={playlist.userId?.profilePicture}
                                            alt={playlist.userId?.username}
                                            className="w-6 h-6 rounded-full"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/24';
                                            }}
                                        />
                                        <span className="text-sm font-medium">{playlist.userId?.username}</span>
                                    </Link>

                                    {playlist.description && (
                                        <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                                            {playlist.description}
                                        </p>
                                    )}

                                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-6">
                                        <span>{formatDate(playlist.createdAt)}</span>
                                        <span>•</span>
                                        <span>{playlist.isPublic ? 'Public' : 'Private'}</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2">
                                        {playlist.videos?.length > 0 && (
                                            <button
                                                onClick={playAll}
                                                className="w-full btn-primary"
                                            >
                                                <Play size={20} className="fill-white" />
                                                <span>Play All</span>
                                            </button>
                                        )}

                                        <button
                                            onClick={handleShare}
                                            className="w-full btn-secondary"
                                        >
                                            <Share2 size={18} />
                                            <span>Share</span>
                                        </button>

                                        {isOwner && (
                                            <>
                                                <button
                                                    onClick={() => setIsEditing(true)}
                                                    className="w-full btn-secondary"
                                                >
                                                    <Edit size={18} />
                                                    <span>Edit Playlist</span>
                                                </button>

                                                <button
                                                    onClick={handleDelete}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-full smooth-transition font-semibold border border-red-600/20"
                                                >
                                                    <Trash2 size={18} />
                                                    <span>Delete Playlist</span>
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Videos List */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4">
                        Videos ({playlist.videos?.length || 0})
                    </h2>

                    {!playlist.videos || playlist.videos.length === 0 ? (
                        <div className="glass-card rounded-2xl p-12 text-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <Play size={32} className="text-gray-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No videos yet</h3>
                            <p className="text-gray-400">
                                {isOwner
                                    ? 'Add videos to this playlist by clicking the "Add to Playlist" button on any video'
                                    : 'This playlist is empty'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {playlist.videos.map((video, index) => (
                                <div
                                    key={video._id}
                                    className="glass-card rounded-xl p-3 hover:bg-white/[0.08] smooth-transition group"
                                >
                                    <div className="flex gap-3">
                                        {/* Index */}
                                        <div className="flex-shrink-0 w-8 text-center text-gray-400 font-bold pt-2">
                                            {index + 1}
                                        </div>

                                        {/* Thumbnail */}
                                        <Link
                                            to={`/video/${video._id}?playlist=${id}`}
                                            className="flex-shrink-0"
                                        >
                                            <div className="relative w-40 aspect-video rounded-lg overflow-hidden bg-black">
                                                <img
                                                    src={video.thumbnailUrl}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 smooth-transition"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/160x90?text=No+Thumbnail';
                                                    }}
                                                />
                                                {video.duration > 0 && (
                                                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-[10px] font-bold rounded">
                                                        {formatDuration(video.duration)}
                                                    </span>
                                                )}
                                            </div>
                                        </Link>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <Link
                                                to={`/video/${video._id}?playlist=${id}`}
                                                className="font-semibold text-sm line-clamp-2 hover:text-gray-300 smooth-transition"
                                            >
                                                {video.title}
                                            </Link>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {video.uploadedBy?.channelName || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {video.views?.toLocaleString() || 0} views
                                            </p>
                                        </div>

                                        {/* Remove Button (Owner Only) */}
                                        {isOwner && (
                                            <button
                                                onClick={() => handleRemoveVideo(video._id)}
                                                className="flex-shrink-0 p-2 opacity-0 group-hover:opacity-100 hover:bg-red-600/20 text-red-500 rounded-lg smooth-transition"
                                                title="Remove from playlist"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PlaylistPage;