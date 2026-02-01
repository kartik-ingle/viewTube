import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import VideoCard from '../components/video/VideoCard';
import Loading from '../components/common/Loading';
import { formatSubscribers } from '../utils/formatViews';
import { formatFullDate } from '../utils/formatDate';
import { useAuth } from '../context/AuthContext';
import { Edit } from 'lucide-react';

const Channel = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [channel, setChannel] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscribersCount, setSubscribersCount] = useState(0);

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
            setChannel(channelResponse.data.user);
            setSubscribersCount(channelResponse.data.user.subscribers?.length || 0);

            if (user) {
                setIsSubscribed(
                    channelResponse.data.user.subscribers?.includes(user.id) || false
                );
            }

            // Fetch channel videos
            const videosResponse = await api.get(`/videos/user/${id}`);
            setVideos(videosResponse.data.videos);
        } catch (error) {
            console.error('Failed to fetch channel:', error);
            toast.error('Failed to load channel');
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
        <div className="animate-in fade-in duration-500">
            {/* Channel Header */}
            <div className="relative overflow-hidden bg-white/5 border-b border-white/5">
                {/* Optional Banner Placeholder */}
                <div className="h-32 sm:h-48 lg:h-64 bg-gradient-to-r from-red-900/20 via-black to-blue-900/20" />

                <div className="max-w-[2400px] mx-auto px-4 sm:px-8 pb-8 sm:pb-12">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 -mt-12 sm:-mt-16 relative z-10">
                        {/* Channel Avatar */}
                        <div className="p-1 glass rounded-full ring-4 ring-black">
                            <img
                                src={channel.profilePicture}
                                alt={channel.channelName}
                                className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-full object-cover shadow-2xl"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/160';
                                }}
                            />
                        </div>

                        {/* Channel Info */}
                        <div className="flex-1 text-center sm:text-left pt-2">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight">{channel.channelName}</h1>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 mt-2 text-gray-400 font-medium text-sm sm:text-[15px]">
                                <span>@{channel.username}</span>
                                <span className="w-1 h-1 rounded-full bg-gray-600 hidden sm:block" />
                                <span>{formatSubscribers(subscribersCount)} subscribers</span>
                                <span className="w-1 h-1 rounded-full bg-gray-600 hidden sm:block" />
                                <span>{videos.length} videos</span>
                            </div>

                            {channel.channelDescription && (
                                <p className="mt-4 text-[14px] sm:text-[15px] text-gray-300 max-w-2xl leading-relaxed line-clamp-2 sm:line-clamp-none">
                                    {channel.channelDescription}
                                </p>
                            )}

                            {/* Actions Group */}
                            <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                                {isOwner ? (
                                    <button
                                        onClick={() => navigate('/profile/edit')}
                                        className="btn-secondary active:scale-95"
                                    >
                                        <Edit size={18} />
                                        <span>Customize channel</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubscribe}
                                        className={`px-8 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 ${isSubscribed
                                            ? 'bg-hover hover:bg-white/10 text-white'
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

            {/* Channel Content (Videos) */}
            <div className="max-w-[2400px] mx-auto p-4 sm:p-8">
                <div className="flex items-center gap-4 mb-8 border-b border-white/5">
                    <button className="px-4 py-3 border-b-2 border-white font-bold text-sm tracking-wide">VIDEOS</button>
                    <button className="px-4 py-3 text-gray-400 hover:text-white font-bold text-sm tracking-wide smooth-transition disabled:opacity-30">ABOUT</button>
                </div>

                {videos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-400">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <Video size={40} className="text-gray-600" />
                        </div>
                        <p className="text-xl font-bold text-white/80">No videos yet</p>
                        {isOwner && (
                            <p className="text-sm mt-3 text-gray-500">
                                Share your first masterpiece with the world!
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10">
                        {videos.map((video) => (
                            <VideoCard key={video._id} video={video} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Channel;