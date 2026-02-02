import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Trash2, Eye, Calendar, ListPlus } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import VideoPlayer from '../components/video/VideoPlayer';
import CommentSection from '../components/comment/CommentSection';
import { formatDate } from '../utils/formatDate';
import { formatViews, formatSubscribers } from '../utils/formatViews';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import AddToPlaylistModal from '../components/playlist/AddToPlaylistModal';

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
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);

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
            setVideo(videoData);

            setLikesCount(videoData.likes?.length || 0);
            setDislikesCount(videoData.dislikes?.length || 0);
            setSubscribersCount(videoData.uploadedBy?.subscribers?.length || 0);

            if (user) {
                const userId = user.id || user._id; // Handle both potential ID properties
                setIsLiked(videoData.likes?.some(id => id.toString() === userId.toString()) || false);
                setIsDisliked(videoData.dislikes?.some(id => id.toString() === userId.toString()) || false);
                // uploadedBy.subscribers is an array of IDs based on our backend logic analysis
                setIsSubscribed(
                    videoData.uploadedBy?.subscribers?.some(id => id.toString() === userId.toString()) || false
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
            await api.put(`/users/${video.uploadedBy.id}/subscribe`);

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

        if (navigator.share) {
            navigator.share({
                title: video.title,
                text: `Check out this video: ${video.title}`,
                url: url,
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleShareWhatsApp = () => {
        const url = window.location.href;
        const text = `Check out: ${video.title}`;
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

    const isOwner = user?.id === video.uploadedBy?.id;

    return (
        <div className="max-w-[1920px] mx-auto px-0 sm:px-4 lg:px-6 py-0 sm:py-6 pb-3 animate-in fade-in">
            <div className="flex flex-col xl:flex-row gap-6">
                {/* Main Video Section */}
                <div className="flex-1 min-w-0">
                    {/* Video Player */}
                    <div className="sm:rounded-2xl overflow-hidden bg-black shadow-2xl">
                        <VideoPlayer url={video.videoUrl} />
                    </div>

                    {/* Video Info Container */}
                    <div className="px-4 sm:px-0 mt-4 space-y-4">
                        {/* Title */}
                        <h1 className="text-lg sm:text-xl lg:text-2xl font-bold leading-tight">
                            {video.title}
                        </h1>

                        {/* Channel Info & Actions Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            {/* Channel Info */}
                            <div className="flex items-center gap-3">
                                <Link to={`/channel/${video.uploadedBy.id}`} className="flex-shrink-0">
                                    <img
                                        src={video.uploadedBy.profilePicture}
                                        alt={video.uploadedBy.channelName}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-white/10 hover:border-white/30 smooth-transition"
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }}
                                    />
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link
                                        to={`/channel/${video.uploadedBy.id}`}
                                        className="font-bold text-[15px] hover:text-gray-300 smooth-transition block truncate"
                                    >
                                        {video.uploadedBy.channelName}
                                    </Link>
                                    <p className="text-xs text-gray-400 font-medium">
                                        {formatSubscribers(subscribersCount)}
                                    </p>
                                </div>
                                {!isOwner && (
                                    <button
                                        onClick={handleSubscribe}
                                        className={`px-5 py-2 rounded-full font-bold text-sm smooth-transition active:scale-95 ${isSubscribed
                                            ? 'bg-white/10 hover:bg-white/15 text-white'
                                            : 'bg-white text-black hover:bg-gray-200'
                                            }`}
                                    >
                                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                    </button>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 flex-wrap">
                                {/* Like/Dislike */}
                                <div className="flex items-center glass rounded-full overflow-hidden">
                                    <button
                                        onClick={handleLike}
                                        className={`flex items-center gap-2 px-4 py-2 smooth-transition ${isLiked ? 'text-white' : 'text-gray-300 hover:bg-white/5'
                                            }`}
                                    >
                                        <ThumbsUp size={18} fill={isLiked ? 'white' : 'none'} />
                                        <span className="text-sm font-bold">{likesCount}</span>
                                    </button>
                                    <div className="w-px h-6 bg-white/10" />
                                    <button
                                        onClick={handleDislike}
                                        className={`flex items-center px-4 py-2 smooth-transition ${isDisliked ? 'text-white' : 'text-gray-300 hover:bg-white/5'
                                            }`}
                                    >
                                        <ThumbsDown size={18} fill={isDisliked ? 'white' : 'none'} />
                                    </button>
                                </div>

                                {/* Share */}
                                <button
                                    onClick={handleShare}
                                    className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 rounded-full smooth-transition active:scale-95 font-semibold text-sm"
                                >
                                    <Share2 size={18} />
                                    <span className="hidden sm:inline">Share</span>
                                </button>

                                {/* Add to Playlist Button */}
                                {isAuthenticated && (
                                    <button
                                        onClick={() => setShowAddToPlaylist(true)}
                                        className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 border border-white/5 rounded-full smooth-transition active:scale-95 font-semibold text-sm"
                                    >
                                        <ListPlus size={19} />
                                        <span className="hidden sm:inline">Save</span>
                                    </button>
                                )}

                                {/* Delete (Owner Only) */}
                                {isOwner && (
                                    <button
                                        onClick={handleDelete}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-full smooth-transition active:scale-95 font-semibold text-sm border border-red-600/20"
                                    >
                                        <Trash2 size={18} />
                                        <span className="hidden sm:inline">Delete</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Description Box */}
                        <div className="glass-card rounded-2xl p-4 hover:bg-white/[0.06] smooth-transition">
                            <div className="flex items-center gap-4 text-sm font-semibold mb-3">
                                <div className="flex items-center gap-1.5">
                                    <Eye size={16} className="text-gray-400" />
                                    <span>{formatViews(video.views)}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={16} className="text-gray-400" />
                                    <span>{formatDate(video.createdAt)}</span>
                                </div>
                            </div>
                            <p className={`text-sm leading-relaxed whitespace-pre-wrap text-gray-300 ${!showFullDescription ? 'line-clamp-3' : ''
                                }`}>
                                {video.description || 'No description available'}
                            </p>
                            {video.description && video.description.length > 150 && (
                                <button
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="text-sm font-semibold text-gray-400 hover:text-white mt-2 smooth-transition"
                                >
                                    {showFullDescription ? 'Show less' : 'Show more'}
                                </button>
                            )}
                        </div>

                        {/* Comments */}
                        <div className="pt-6">
                            <CommentSection videoId={id} />
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="w-full xl:w-[400px] px-4 sm:px-0">
                    <h3 className="font-bold text-lg mb-4">Suggested videos</h3>
                    <div className="glass-card rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-gray-400 font-medium">Curating your feed...</p>
                        <p className="text-xs text-gray-600 mt-1">Check back soon!</p>
                    </div>
                </div>
            </div>
            {/* Add to Playlist Modal */}
            <AddToPlaylistModal
                isOpen={showAddToPlaylist}
                onClose={() => setShowAddToPlaylist(false)}
                videoId={id}
                videoTitle={video.title}
            />
        </div>
    );
};

export default VideoPage;