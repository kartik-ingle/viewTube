import { useNavigate, Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { formatViews, formatDuration } from '../../utils/formatViews';
import { Play } from 'lucide-react';

const VideoCard = ({ video }) => {
    const navigate = useNavigate();
    if (!video) return null;

    const handleCardClick = () => {
        navigate(`/video/${video._id || video.id}`);
    };

    return (
        <div
            onClick={handleCardClick}
            className="flex flex-col gap-3 group cursor-pointer"
        >
            {/* Thumbnail Container */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-black video-card-shadow">
                <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover smooth-transition group-hover:scale-[1.05] group-hover:brightness-110"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/320x180?text=No+Thumbnail';
                    }}
                />

                {/* Duration Badge */}
                {video.duration > 0 && (
                    <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-bold tracking-wide">
                        {formatDuration(video.duration)}
                    </div>
                )}

                {/* Play Icon Overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 smooth-transition flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-red-600/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 smooth-transition shadow-xl">
                        <Play size={24} className="text-white fill-white ml-1" />
                    </div>
                </div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 smooth-transition pointer-events-none" />
            </div>

            {/* Video Info */}
            <div className="flex gap-3 px-0.5">
                {/* Channel Avatar */}
                <Link
                    to={`/channel/${video.uploadedBy?._id || video.uploadedBy?.id || video.uploadedBy}`}
                    className="flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                >
                    <img
                        src={video.uploadedBy?.profilePicture || 'https://via.placeholder.com/36'}
                        alt={video.uploadedBy?.channelName}
                        className="w-9 h-9 rounded-full object-cover border-2 border-white/10 hover:border-white/30 smooth-transition hover:scale-110"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/36';
                        }}
                    />
                </Link>

                <div className="flex flex-col min-w-0 flex-1">
                    <h3 className="font-semibold text-[14px] sm:text-[15px] leading-tight line-clamp-2 text-white/95 group-hover:text-white smooth-transition mb-1">
                        {video.title}
                    </h3>

                    <Link
                        to={`/channel/${video.uploadedBy?._id || video.uploadedBy?.id || video.uploadedBy}`}
                        className="text-[13px] text-gray-400 hover:text-white smooth-transition truncate"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {video.uploadedBy?.channelName}
                    </Link>

                    <div className="flex items-center gap-1.5 text-[12px] text-gray-500 font-medium mt-0.5">
                        <span>{formatViews(video.views)}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span>{formatDate(video.createdAt)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoCard;