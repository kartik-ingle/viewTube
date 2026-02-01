import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/formatDate';
import { formatViews, formatDuration } from '../../utils/formatViews';

const VideoCard = ({ video }) => {
    if (!video) return null;

    return (
        <Link to={`/video/${video._id}`} className="flex flex-col gap-3 group">
            {/* Thumbnail Container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-white/5 video-card-shadow">
                <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover smooth-transition group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/320x180?text=No+Thumbnail';
                    }}
                />

                {/* Duration Badge */}
                {video.duration > 0 && (
                    <span className="absolute bottom-2 right-2 glass px-1.5 py-0.5 rounded-md text-[11px] font-bold tracking-wider">
                        {formatDuration(video.duration)}
                    </span>
                )}

                {/* Play Icon Overlay on Hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 smooth-transition flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center scale-90 group-hover:scale-100 smooth-transition">
                        <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                    </div>
                </div>
            </div>

            {/* Video Info */}
            <div className="flex gap-3 px-1">
                {/* Channel Avatar */}
                <img
                    src={video.uploadedBy?.profilePicture || 'https://via.placeholder.com/36'}
                    alt={video.uploadedBy?.channelName}
                    className="w-10 h-10 rounded-full object-cover flex-shrink-0 border border-white/10 hover:opacity-80 smooth-transition"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/36';
                    }}
                />

                <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-[15px] leading-snug line-clamp-2 text-white/95 group-hover:text-white smooth-transition">
                        {video.title}
                    </h3>

                    <div className="mt-1 flex flex-col gap-0.5">
                        <p className="text-[13px] text-gray-400 hover:text-white smooth-transition">
                            {video.uploadedBy?.channelName}
                        </p>
                        <div className="flex items-center gap-1.5 text-[13px] text-gray-500 font-medium whitespace-nowrap">
                            <span>{formatViews(video.views)}</span>
                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                            <span>{formatDate(video.createdAt)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default VideoCard;