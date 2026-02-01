import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ListVideo, Lock, Globe, Trash2, MoreVertical } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import PlaylistCard from '../components/playlist/PlaylistCard';
import CreatePlaylistModal from '../components/playlist/CreatePlaylistModal';
import Loading from '../components/common/Loading';

const Playlists = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [menuOpen, setMenuOpen] = useState(null);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchPlaylists();
    }, [isAuthenticated]);

    const fetchPlaylists = async () => {
        setLoading(true);
        try {
            const response = await api.get('/playlists/user/me');
            setPlaylists(response.data.playlists);
        } catch (error) {
            console.error('Failed to fetch playlists:', error);
            toast.error('Failed to load playlists');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaylistCreated = (newPlaylist) => {
        setPlaylists([newPlaylist, ...playlists]);
    };

    const handleDeletePlaylist = async (playlistId, playlistName) => {
        if (!window.confirm(`Are you sure you want to delete "${playlistName}"?`)) {
            return;
        }

        try {
            await api.delete(`/playlists/${playlistId}`);
            setPlaylists(playlists.filter(p => p._id !== playlistId));
            toast.success('Playlist deleted');
            setMenuOpen(null);
        } catch (error) {
            toast.error('Failed to delete playlist');
        }
    };

    const filteredPlaylists = playlists.filter(playlist => {
        if (filter === 'public') return playlist.isPublic;
        if (filter === 'private') return !playlist.isPublic;
        return true;
    });

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in">
            {/* Header */}
            <div className="mb-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                            <ListVideo size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Your Playlists</h1>
                            <p className="text-gray-400 text-sm mt-1">
                                {playlists.length} {playlists.length === 1 ? 'playlist' : 'playlists'}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary"
                    >
                        <Plus size={20} />
                        <span>New Playlist</span>
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm smooth-transition ${filter === 'all'
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        All ({playlists.length})
                    </button>
                    <button
                        onClick={() => setFilter('public')}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm smooth-transition flex items-center gap-2 ${filter === 'public'
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Globe size={16} />
                        <span>Public ({playlists.filter(p => p.isPublic).length})</span>
                    </button>
                    <button
                        onClick={() => setFilter('private')}
                        className={`px-4 py-2 rounded-lg font-semibold text-sm smooth-transition flex items-center gap-2 ${filter === 'private'
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        <Lock size={16} />
                        <span>Private ({playlists.filter(p => !p.isPublic).length})</span>
                    </button>
                </div>
            </div>

            {/* Playlists Grid */}
            {filteredPlaylists.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center mb-6">
                        <ListVideo size={40} className="text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-200">
                        {filter === 'all'
                            ? 'No playlists yet'
                            : `No ${filter} playlists`}
                    </h3>
                    <p className="text-gray-400 max-w-md mb-8">
                        {filter === 'all'
                            ? 'Create your first playlist to organize your favorite videos'
                            : `You don't have any ${filter} playlists yet`}
                    </p>
                    {filter === 'all' && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary"
                        >
                            <Plus size={20} />
                            <span>Create Playlist</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-x-4 gap-y-8">
                    {filteredPlaylists.map((playlist) => (
                        <div key={playlist._id} className="relative group">
                            <PlaylistCard playlist={playlist} />

                            {/* Quick Actions Menu */}
                            <div className="absolute top-2 right-2 z-10">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setMenuOpen(menuOpen === playlist._id ? null : playlist._id);
                                    }}
                                    className="p-2 bg-black/70 hover:bg-black/90 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 smooth-transition"
                                >
                                    <MoreVertical size={18} />
                                </button>

                                {menuOpen === playlist._id && (
                                    <div className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2">
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                navigate(`/playlist/${playlist._id}`);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-white/10 smooth-transition text-sm font-medium"
                                        >
                                            View Playlist
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDeletePlaylist(playlist._id, playlist.name);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-red-600/20 text-red-500 smooth-transition text-sm font-medium border-t border-white/5"
                                        >
                                            <div className="flex items-center gap-2">
                                                <Trash2 size={16} />
                                                <span>Delete</span>
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Playlist Modal */}
            <CreatePlaylistModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onPlaylistCreated={handlePlaylistCreated}
            />

            {/* Click outside to close menu */}
            {menuOpen && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => setMenuOpen(null)}
                />
            )}
        </div>
    );
};

export default Playlists;