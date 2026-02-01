import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Trash2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import VideoPlayer from '../components/video/VideoPlayer';
import CommentSection from '../components/comment/CommentSection';
import { formatDate } from '../utils/formatDate';
import { formatViews, formatSubscribers } from '../utils/formatViews';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';

const VideoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);
    const [isDisliked, setIsDisliked] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [dislikesCount, setDislikesCount] = useState(0);
    const [subscribersCount, setSubscribersCount] = useState(0);

    useEffect(() => {
        if (id) {
            fetchVideo();
            incrementView();
            addToHistory();
        }
    }, [id]);

    const fetchVideo = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/videos/${id}`);
            const videoData = response.data.video;
            console.log('[DEBUG] Fetched Video Data:', videoData);
            setVideo(videoData);

            setLikesCount(videoData.likes?.length || 0);
            setDislikesCount(videoData.dislikes?.length || 0);
            setSubscribersCount(videoData.uploadedBy?.subscribers?.length || 0);

            if (user) {
                setIsLiked(videoData.likes?.includes(user.id) || false);
                setIsDisliked(videoData.dislikes?.includes(user.id) || false);
                setIsSubscribed(
                    videoData.uploadedBy?.subscribers?.includes(user.id) || false
                );
            }
        } catch (error) {
            console.error('Failed to fetch video:', error);
            toast.error('Failed to load video');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const incrementView = async () => {
        try {
            await api.put(`/videos/${id}/view`);
        } catch (error) {
            console.error('Failed to increment view:', error);
        }
    };

    const addToHistory = async () => {
        if (!isAuthenticated) return;

        try {
            await api.post('/history', { videoId: id });
        } catch (error) {
            console.error('Failed to add to history:', error);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to like videos');
            return;
        }

        try {
            await api.put(`/videos/${id}/like`);

            if (isLiked) {
                setLikesCount(likesCount - 1);
                setIsLiked(false);
            } else {
                setLikesCount(likesCount + 1);
                setIsLiked(true);
                if (isDisliked) {
                    setDislikesCount(dislikesCount - 1);
                    setIsDisliked(false);
                }
            }
        } catch (error) {
            toast.error('Failed to like video');
        }
    };

    const handleDislike = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to dislike videos');
            return;
        }

        try {
            await api.put(`/videos/${id}/dislike`);

            if (isDisliked) {
                setDislikesCount(dislikesCount - 1);
                setIsDisliked(false);
            } else {
                setDislikesCount(dislikesCount + 1);
                setIsDisliked(true);
                if (isLiked) {
                    setLikesCount(likesCount - 1);
                    setIsLiked(false);
                }
            }
        } catch (error) {
            toast.error('Failed to dislike video');
        }
    };

    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to subscribe');
            return;
        }

        try {
            await api.put(`/users/${video.uploadedBy._id}/subscribe`);

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

    const handleShare = () => {
        const url = window.location.href;

        // Check if Web Share API is available
        if (navigator.share) {
            navigator.share({
                title: video.title,
                text: `Check out this video: ${video.title}`,
                url: url,
            }).catch(() => { });
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleShareWhatsApp = () => {
        const url = window.location.href;
        const text = `Check out this video: ${video.title}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' - ' + url)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this video?')) {
            return;
        }

        try {
            await api.delete(`/videos/${id}`);
            toast.success('Video deleted successfully');
            navigate('/');
        } catch (error) {
            toast.error('Failed to delete video');
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (!video) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-gray-400">Video not found</p>
            </div>
        );
    }

    const isOwner = user?.id === video.uploadedBy?._id;

    return (
        <div className="max-w-[1800px] mx-auto p-0 sm:p-4 lg:p-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Main Video Section */}
                <div className="flex-1 min-w-0">
                    {/* Video Player Container */}
                    <div className="sm:rounded-2xl overflow-hidden bg-black shadow-2xl shadow-black/50">
                        <VideoPlayer url={video.videoUrl} />
                    </div>

                    {/* Content Section */}
                    <div className="px-4 sm:px-0">
                        <h1 className="text-xl sm:text-2xl font-bold mt-4 line-clamp-2 leading-tight">
                            {video.title}
                        </h1>

                        {/* Actions bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pb-6 border-b border-white/5">
                            {/* Channel & Subscribe */}
                            <div className="flex items-center justify-between sm:justify-start gap-4">
                                <Link to={`/channel/${video.uploadedBy._id}`} className="flex items-center gap-3 group">
                                    <img
                                        src={video.uploadedBy.profilePicture}
                                        alt={video.uploadedBy.channelName}
                                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-white/10 group-hover:opacity-80 smooth-transition"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-bold text-[15px] sm:text-base group-hover:text-gray-300 smooth-transition">
                                            {video.uploadedBy.channelName}
                                        </span>
                                        <span className="text-[12px] sm:text-[13px] text-gray-400 font-medium">
                                            {formatSubscribers(subscribersCount)} subscribers
                                        </span>
                                    </div>
                                </Link>

                                {!isOwner && (
                                    <button
                                        onClick={handleSubscribe}
                                        className={`ml-2 px-6 py-2 rounded-full font-bold text-sm smooth-transition active:scale-95 ${isSubscribed
                                            ? 'bg-hover hover:bg-white/20'
                                            : 'bg-white text-black hover:bg-gray-200'
                                            }`}
                                    >
                                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                    </button>
                                )}
                            </div>

                            {/* Interaction Buttons */}
                            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1 sm:pb-0">
                                <div className="flex items-center bg-white/5 rounded-full p-0.5 border border-white/5">
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-90 ${isLiked ? 'text-white' : 'text-gray-300 hover:bg-white/10'}`}
                                    >
                                        <ThumbsUp size={19} fill={isLiked ? 'white' : 'none'} className={isLiked ? 'text-white' : ''} />
                                        <span className="text-sm font-bold">{likesCount}</span>
                                    </button>
                                    <div className="w-[1px] h-6 bg-white/10 mx-0.5" />
                                    <button
                                        onClick={handleDislike}
                                        className={`flex items-center px-4 py-2 rounded-full transition-all active:scale-90 ${isDisliked ? 'text-white' : 'text-gray-300 hover:bg-white/10'}`}
                                    >
                                        <ThumbsDown size={19} fill={isDisliked ? 'white' : 'none'} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full transition-all active:scale-95 font-bold text-sm"
                                >
                                    <Share2 size={19} />
                                    <span>Share</span>
                                </button>

                                {isOwner && (
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 px-5 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-full transition-all active:scale-95 font-bold text-sm border border-red-600/20"
                                    >
                                        <Trash2 size={18} />
                                        <span>Delete</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Description Box */}
                        <div className="mt-6 p-4 rounded-2xl bg-white/5 hover:bg-white/[0.08] smooth-transition border border-white/5">
                            <div className="flex items-center gap-3 text-sm font-bold mb-2">
                                <span>{formatViews(video.views)} views</span>
                                <span>{formatDate(video.createdAt)}</span>
                            </div>
                            <p className="text-[14px] leading-relaxed whitespace-pre-wrap text-gray-200">
                                {video.description || 'No description available'}
                            </p>
                        </div>

                        {/* Comments Section */}
                        <div className="mt-8">
                            <CommentSection videoId={id} />
                        </div>
                    </div>
                </div>

                {/* Sidebar - Related Videos */}
                <div className="w-full lg:w-[400px] xl:w-[440px] px-4 sm:px-0">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-[17px]">Suggested for you</h3>
                    </div>

                    {/* Placeholder for related videos list */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-center p-12 glass rounded-2xl border-dashed border-2 border-white/5">
                            <div className="text-center">
                                <p className="text-gray-400 font-medium italic">Personalizing your feed...</p>
                                <p className="text-xs text-gray-500 mt-2">More videos coming soon!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPage;