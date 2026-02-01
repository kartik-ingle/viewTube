import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Edit } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import VideoCard from '../components/video/VideoCard';
import PlaylistCard from '../components/playlist/PlaylistCard';
import Loading from '../components/common/Loading';
import { formatSubscribers } from '../utils/formatViews';
import { formatFullDate } from '../utils/formatDate';
import { useAuth } from '../context/AuthContext';

const Channel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribersCount, setSubscribersCount] = useState(0);
    const [activeTab, setActiveTab] = useState('videos'); // 'videos' or 'playlists'

    useEffect(() => {
        if (id) {
            fetchChannelData();
        }
    }, [id]);

    const fetchChannelData = async () => {
        setLoading(true);
        try {
            // Fetch channel info
            const channelResponse = await api.get(`/users/${id}`);
            const channelData = channelResponse.data.user;

            if (!channelData) {
                throw new Error('Channel not found');
            }

            setChannel(channelData);
            setSubscribersCount(channelData.subscribers?.length || 0);

            if (user) {
                setIsSubscribed(
                    channelData.subscribers?.includes(user.id) || false
                );
            }

            // Fetch channel videos
            try {
                const videosResponse = await api.get(`/videos/user/${id}`);
                setVideos(videosResponse.data.videos || []);
            } catch (videoError) {
                console.log('Error fetching videos:', videoError);
                setVideos([]);
            }

            // Fetch channel playlists
            try {
                const playlistsResponse = await api.get(`/playlists/user/${id}`);
                setPlaylists(playlistsResponse.data.playlists || []);
            } catch (playlistError) {
                console.log('Error fetching playlists:', playlistError);
                setPlaylists([]);
            }
        } catch (error) {
            console.error('Failed to fetch channel:', error);
            toast.error(error.response?.data?.message || 'Failed to load channel');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to subscribe');
            return;
        }

        try {
            await api.put(`/users/${id}/subscribe`);

            if (isSubscribed) {
                setSubscribersCount(subscribersCount - 1);
                setIsSubscribed(false);
                toast.success('Unsubscribed');
            } else {
                setSubscribersCount(subscribersCount + 1);
                setIsSubscribed(true);
                toast.success('Subscribed!');
            }
        } catch (error) {
            toast.error('Failed to subscribe');
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!channel) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-400">Channel not found</p>
            </div>
        );
    }

    const isOwner = user?.id === channel._id;

    return (
        <div className="animate-in fade-in">
            {/* Channel Header */}
            <div className="glass-dark border-b border-white/5">
                <div className="max-w-7xl mx-auto p-6">
                    <div className="flex items-start gap-6">
                        {/* Channel Avatar */}
                        <img
                            src={channel.profilePicture}
                            alt={channel.channelName}
                            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white/10"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/128';
                            }}
                        />

                        {/* Channel Info */}
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl font-bold">{channel.channelName}</h1>

                            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-400">
                                <span className="font-medium">@{channel.username}</span>
                                <span>•</span>
                                <span>{formatSubscribers(subscribersCount)}</span>
                                <span>•</span>
                                <span>{videos.length} videos</span>
                                {playlists.length > 0 && (
                                    <>
                                        <span>•</span>
                                        <span>{playlists.length} playlists</span>
                                    </>
                                )}
                            </div>

                            {channel.channelDescription && (
                                <p className="mt-3 text-sm text-gray-300 max-w-3xl">
                                    {channel.channelDescription}
                                </p>
                            )}

                            <p className="text-xs text-gray-500 mt-2">
                                Joined {formatFullDate(channel.createdAt)}
                            </p>

                            {/* Action Button */}
                            <div className="mt-4">
                                {isOwner ? (
                                    <button
                                        onClick={() => navigate('/profile/edit')}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-white/10 hover:bg-white/15 rounded-full smooth-transition font-semibold"
                                    >
                                        <Edit size={20} />
                                        <span>Edit Profile</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubscribe}
                                        className={`px-8 py-2.5 rounded-full font-bold smooth-transition ${isSubscribed
                                            ? 'bg-white/10 hover:bg-white/15 text-white'
                                            : 'bg-white text-black hover:bg-gray-200'
                                            }`}
                                    >
                                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-6 mt-6">
                <div className="flex items-center gap-8 border-b border-white/10">
                    <button
                        onClick={() => setActiveTab('videos')}
                        className={`pb-4 font-semibold smooth-transition relative ${activeTab === 'videos' ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Videos
                        {activeTab === 'videos' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                        )}
                    </button>

                    <button
                        onClick={() => setActiveTab('playlists')}
                        className={`pb-4 font-semibold smooth-transition relative ${activeTab === 'playlists' ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        Playlists
                        {activeTab === 'playlists' && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"></div>
                        )}
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {activeTab === 'videos' ? (
                    // Videos Tab
                    videos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p className="text-xl font-semibold text-gray-300">No videos yet</p>
                            {isOwner && (
                                <p className="text-sm text-gray-400 mt-2">
                                    Upload your first video to get started!
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {videos.map((video) => (
                                <VideoCard key={video._id} video={video} />
                            ))}
                        </div>
                    )
                ) : (
                    // Playlists Tab
                    playlists.length === 0 ? (
                        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <p className="text-xl font-semibold text-gray-300">No playlists yet</p>
                            {isOwner && (
                                <p className="text-sm text-gray-400 mt-2">
                                    Create a playlist to organize your videos!
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {playlists.map((playlist) => (
                                <PlaylistCard key={playlist._id} playlist={playlist} />
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default Channel;