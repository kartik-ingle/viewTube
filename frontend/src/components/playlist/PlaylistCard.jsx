import { Link } from 'react-router-dom';
import { Play, Lock } from 'lucide-react';

const PlaylistCard = ({ playlist }) => {
    const thumbnailUrl = playlist.thumbnailUrl || playlist.videos?.[0]?.thumbnailUrl || 'https://via.placeholder.com/320x180?text=Empty+Playlist';

    // Handle both populated and non-populated cases - User model transforms _id to id
    const creatorId = typeof playlist.userId === 'object' ? (playlist.userId?.id || playlist.userId?._id) : playlist.userId;
    const creatorUsername = typeof playlist.userId === 'object' ? playlist.userId?.username : 'Unknown';

    return (
        <Link to={`/playlist/${playlist._id || playlist.id}`} className="group">
            <div className="relative aspect-video rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-black video-card-shadow">
                <img
                    src={thumbnailUrl}
                    alt={playlist.name}
                    className="w-full h-full object-cover smooth-transition group-hover:scale-105"
                    onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/320x180?text=Empty+Playlist';
                    }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80"></div>

                {/* Video Count Badge */}
                <div className="absolute top-2 right-2 px-3 py-1 bg-black/80 backdrop-blur-sm rounded-lg flex items-center gap-1.5">
                    <Play size={14} className="fill-white" />
                    <span className="text-xs font-bold">{playlist.videos?.length || 0}</span>
                </div>

                {/* Privacy Badge */}
                {!playlist.isPublic && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg flex items-center gap-1">
                        <Lock size={12} />
                        <span className="text-[10px] font-bold">Private</span>
                    </div>
                )}

                {/* Play All Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 smooth-transition">
                    <div className="px-4 py-2 bg-white/90 text-black font-bold rounded-full flex items-center gap-2">
                        <Play size={18} className="fill-black" />
                        <span>Play All</span>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="mt-3 px-1">
                <h3 className="font-bold text-base leading-tight line-clamp-2 group-hover:text-gray-300 smooth-transition">
                    {playlist.name}
                </h3>
                {playlist.description && (
                    <p className="text-sm text-gray-400 mt-1 line-clamp-1">
                        {playlist.description}
                    </p>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1.5">
                    {/* FIXED: Conditionally render link only if we have a valid creator ID */}
                    {creatorId ? (
                        <Link
                            to={`/channel/${creatorId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-gray-300 smooth-transition font-medium"
                        >
                            {creatorUsername}
                        </Link>
                    ) : (
                        <span className="font-medium">{creatorUsername}</span>
                    )}
                    {playlist.videos?.length > 0 && (
                        <>
                            <span>•</span>
                            <span>{playlist.videos.length} videos</span>
                        </>
                    )}
                </div>
            </div>
        </Link>
    );
};

export default PlaylistCard;