import { useState, useEffect } from 'react';
import api from '../utils/api';
import VideoGrid from '../components/video/VideoGrid';
import { TrendingUp, Clock, Eye, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const TIME_RANGES = [
    { id: 'today', name: 'Today', icon: Clock },
    { id: 'week', name: 'This Week', icon: Calendar },
    { id: 'month', name: 'This Month', icon: Calendar },
    { id: 'all', name: 'All Time', icon: TrendingUp },
];

const Trending = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('week');

    useEffect(() => {
        fetchTrendingVideos();
    }, [timeRange]);

    const fetchTrendingVideos = async () => {
        setLoading(true);
        try {
            const response = await api.get('/videos');
            let allVideos = response.data.videos;

            // Filter by time range
            const now = new Date();
            const filteredVideos = allVideos.filter((video) => {
                const videoDate = new Date(video.createdAt);
                const diffTime = Math.abs(now - videoDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                switch (timeRange) {
                    case 'today':
                        return diffDays <= 1;
                    case 'week':
                        return diffDays <= 7;
                    case 'month':
                        return diffDays <= 30;
                    case 'all':
                    default:
                        return true;
                }
            });

            // Sort by views (trending = most viewed)
            const sortedVideos = filteredVideos.sort((a, b) => (b.views || 0) - (a.views || 0));

            setVideos(sortedVideos.slice(0, 50)); // Top 50
        } catch (error) {
            console.error('Failed to fetch trending videos:', error);
            toast.error('Failed to load trending videos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-3 animate-in fade-in">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center">
                        <TrendingUp size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Trending</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Most popular videos {timeRange === 'all' ? 'of all time' : timeRange === 'today' ? 'today' : `this ${timeRange}`}
                        </p>
                    </div>
                </div>

                {/* Time Range Filter */}
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2">
                    {TIME_RANGES.map((range) => {
                        const Icon = range.icon;
                        return (
                            <button
                                key={range.id}
                                onClick={() => setTimeRange(range.id)}
                                className={`px-4 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap smooth-transition active:scale-95 flex items-center gap-2 ${timeRange === range.id
                                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg'
                                    : 'glass hover:bg-white/10 text-gray-300'
                                    }`}
                            >
                                <Icon size={16} />
                                <span>{range.name}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Stats Banner */}
            {!loading && videos.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-600/20 flex items-center justify-center">
                            <Eye size={24} className="text-red-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {videos.reduce((sum, v) => sum + (v.views || 0), 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 font-medium">Total Views</p>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center">
                            <TrendingUp size={24} className="text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{videos.length}</p>
                            <p className="text-xs text-gray-400 font-medium">Trending Videos</p>
                        </div>
                    </div>

                    <div className="glass-card rounded-2xl p-5 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {videos.reduce((sum, v) => sum + (v.likes?.length || 0), 0).toLocaleString()}
                            </p>
                            <p className="text-xs text-gray-400 font-medium">Total Likes</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Videos Grid */}
            {!loading && videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-600/20 to-red-600/20 flex items-center justify-center mb-6">
                        <TrendingUp size={40} className="text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-200">No trending videos yet</h3>
                    <p className="text-gray-400 max-w-md">
                        Check back later to see what's trending {timeRange === 'all' ? '' : timeRange === 'today' ? 'today' : `this ${timeRange}`}!
                    </p>
                </div>
            ) : (
                <VideoGrid videos={videos} loading={loading} />
            )}
        </div>
    );
};

export default Trending;