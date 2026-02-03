import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ThumbsUp,
    ThumbsDown,
    Share2,
    Trash2,
    Eye,
    Calendar,
    ListPlus
} from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import VideoPlayer from '../components/video/VideoPlayer';
import CommentSection from '../components/comment/CommentSection';
import { formatDate } from '../utils/formatDate';
import { formatViews, formatSubscribers } from '../utils/formatViews';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import AddToPlaylistModal from '../components/playlist/AddToPlaylistModal';
import RecommendedVideos from '../components/video/RecommendedVideos';

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
            const res = await api.get(`/videos/${id}`);
            const v = res.data.video;

            setVideo(v);
            setLikesCount(v.likes?.length || 0);
            setDislikesCount(v.dislikes?.length || 0);
            setSubscribersCount(v.uploadedBy?.subscribers?.length || 0);

            if (user) {
                const uid = user.id || user._id;
                setIsLiked(v.likes?.some(i => i.toString() === uid.toString()));
                setIsDisliked(v.dislikes?.some(i => i.toString() === uid.toString()));
                setIsSubscribed(
                    v.uploadedBy?.subscribers?.some(i => i.toString() === uid.toString())
                );
            }
        } catch {
            toast.error('Failed to load video');
            navigate('/');
        } finally {
            setLoading(false);
        }
    };

    const incrementView = async () => {
        try {
            await api.put(`/videos/${id}/view`);
        } catch { }
    };

    const addToHistory = async () => {
        if (!isAuthenticated) return;
        try {
            await api.post('/history', { videoId: id });
        } catch { }
    };

    const handleLike = async () => {
        if (!isAuthenticated) return toast.error('Please sign in to like videos');
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
        } catch {
            toast.error('Failed to like video');
        }
    };

    const handleDislike = async () => {
        if (!isAuthenticated) return toast.error('Please sign in to dislike videos');
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
        } catch {
            toast.error('Failed to dislike video');
        }
    };

    const handleSubscribe = async () => {
        if (!isAuthenticated) return toast.error('Please sign in to subscribe');
        try {
            const uploadedByUserId = video.uploadedBy?._id || video.uploadedBy?.id || video.uploadedBy;
            await api.put(`/users/${uploadedByUserId}/subscribe`);
            if (isSubscribed) {
                setSubscribersCount(subscribersCount - 1);
                setIsSubscribed(false);
                toast.success('Unsubscribed');
            } else {
                setSubscribersCount(subscribersCount + 1);
                setIsSubscribed(true);
                toast.success('Subscribed!');
            }
        } catch {
            toast.error('Failed to subscribe');
        }
    };

    const handleShare = () => {
        const url = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: video.title,
                text: `Check out this video: ${video.title}`,
                url
            }).catch(() => { });
        } else {
            navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Delete this video?')) return;
        try {
            await api.delete(`/videos/${id}`);
            toast.success('Video deleted');
            navigate('/');
        } catch {
            toast.error('Failed to delete video');
        }
    };

    if (loading) return <Loading />;
    if (!video) return null;

    const currentUserId = user?.id || user?._id;
    const uploadedById = video.uploadedBy?._id || video.uploadedBy?.id;
    const isOwner = currentUserId && uploadedById && currentUserId.toString() === uploadedById.toString();

    return (
        <div className="max-w-[1800px] mx-auto px-0 sm:px-6 py-6">
            <div className="flex flex-col xl:flex-row gap-8">

                {/* MAIN */}
                <div className="flex-1 min-w-0">
                    <div className="rounded-none sm:rounded-xl overflow-hidden bg-black">
                        <VideoPlayer url={video.videoUrl} />
                    </div>

                    <div className="px-4 sm:px-0 mt-6 space-y-5">
                        <h1 className="text-xl sm:text-2xl font-semibold leading-snug">
                            {video.title}
                        </h1>

                        {/* Channel & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Link to={`/channel/${video.uploadedBy?._id || video.uploadedBy?.id || video.uploadedBy}`}>
                                    <img
                                        src={video.uploadedBy.profilePicture}
                                        alt={video.uploadedBy.channelName}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                </Link>
                                <div>
                                    <Link
                                        to={`/channel/${video.uploadedBy?._id || video.uploadedBy?.id || video.uploadedBy}`}
                                        className="font-medium hover:underline"
                                    >
                                        {video.uploadedBy.channelName}
                                    </Link>
                                    <p className="text-xs text-gray-400">
                                        {formatSubscribers(subscribersCount)}
                                    </p>
                                </div>

                                {!isOwner && (
                                    <button
                                        onClick={handleSubscribe}
                                        className={`ml-2 px-4 py-1.5 rounded-full text-sm font-medium
                                        ${isSubscribed
                                                ? 'bg-neutral-800 text-white'
                                                : 'bg-white text-black'
                                            }`}
                                    >
                                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center bg-neutral-800 rounded-full">
                                    <button
                                        onClick={handleLike}
                                        className="px-4 py-2 flex items-center gap-2 hover:bg-neutral-700 rounded-l-full"
                                    >
                                        <ThumbsUp size={18} fill={isLiked ? 'white' : 'none'} />
                                        <span className="text-sm">{likesCount}</span>
                                    </button>
                                    <button
                                        onClick={handleDislike}
                                        className="px-4 py-2 hover:bg-neutral-700 rounded-r-full"
                                    >
                                        <ThumbsDown size={18} fill={isDisliked ? 'white' : 'none'} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleShare}
                                    className="px-4 py-2 bg-neutral-800 rounded-full text-sm hover:bg-neutral-700"
                                >
                                    <Share2 size={18} />
                                </button>

                                {isAuthenticated && (
                                    <button
                                        onClick={() => setShowAddToPlaylist(true)}
                                        className="px-4 py-2 bg-neutral-800 rounded-full text-sm hover:bg-neutral-700"
                                    >
                                        <ListPlus size={18} />
                                    </button>
                                )}

                                {isOwner && (
                                    <button
                                        onClick={handleDelete}
                                        className="px-4 py-2 bg-neutral-800 text-red-400 rounded-full hover:bg-neutral-700"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-neutral-900 rounded-xl p-4">
                            <div className="flex gap-6 text-sm text-gray-400 mb-2">
                                <span className="flex items-center gap-1">
                                    <Eye size={15} /> {formatViews(video.views)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={15} /> {formatDate(video.createdAt)}
                                </span>
                            </div>

                            <p className={`text-sm leading-relaxed
                            ${!showFullDescription && 'line-clamp-3'}`}>
                                {video.description || 'No description available'}
                            </p>

                            {video.description?.length > 150 && (
                                <button
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="mt-2 text-sm text-gray-400 hover:text-white"
                                >
                                    {showFullDescription ? 'Show less' : 'Show more'}
                                </button>
                            )}
                        </div>

                        <CommentSection videoId={id} />
                    </div>
                </div>

                {/* SIDEBAR */}
                <div className="w-full xl:w-[380px] px-4 sm:px-0">
                    <div className="bg-neutral-900 rounded-xl p-3">
                        <RecommendedVideos currentVideoId={id} limit={15} />
                    </div>
                </div>
            </div>

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
