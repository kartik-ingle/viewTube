import VideoCard from './VideoCard';
import Loading from '../common/Loading';

const VideoGrid = ({ videos, loading }) => {
    if (loading) {
        return <Loading />;
    }

    if (!videos || videos.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {videos.map((video) => (
                <VideoCard key={video._id} video={video} />
            ))}
        </div>
    );
};

export default VideoGrid;