import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import { formatDate } from '../../utils/formatDate';
import { formatViews, formatDuration } from '../../utils/formatViews';
import { Sparkles } from 'lucide-react';

const RecommendedVideos = ({ currentVideoId, limit = 10 }) => {
    const navigate = useNavigate();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRecommendations();
    }, [currentVideoId]);

    const fetchRecommendations = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/recommendations/similar/${currentVideoId}`, {
                params: { limit }
            });
            setVideos(response.data.similar);
        } catch (error) {
            console.error('Failed to fetch recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoClick = (videoId) => {
        navigate(`/video/${videoId}`);
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="skeleton h-24 rounded-xl"></div>
                ))}
            </div>
        );
    }

    if (videos.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
                <Sparkles size={20} className="text-yellow-500" />
                <h3 className="font-bold text-lg">Recommended</h3>
            </div>

            {videos.map((video) => (
                <div
                    key={video._id}
                    onClick={() => handleVideoClick(video._id || video.id)}
                    className="flex gap-3 group hover:bg-white/5 p-2 rounded-xl smooth-transition cursor-pointer"
                >
                    {/* Thumbnail */}
                    <div className="relative w-40 aspect-video flex-shrink-0 rounded-lg overflow-hidden bg-black">
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

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-gray-300 smooth-transition">
                            {video.title}
                        </h4>
                        <Link
                            to={`/channel/${video.uploadedBy?._id || video.uploadedBy?.id || video.uploadedBy}`}
                            className="text-xs text-gray-400 mt-1 hover:text-white smooth-transition relative z-10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {video.uploadedBy?.channelName}
                        </Link>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                            <span>{formatViews(video.views)}</span>
                            <span>•</span>
                            <span>{formatDate(video.createdAt)}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default RecommendedVideos;