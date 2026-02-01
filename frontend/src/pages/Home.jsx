import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import VideoCard from '../components/video/VideoCard.jsx';
import { Video } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');

    const fetchVideos = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await api.get('/videos', { params });
            setVideos(response.data.videos);
        } catch (error) {
            console.error('Failed to fetch videos:', error);
            toast.error('Failed to load videos');
        } finally {
            setLoading(false);
        }
    }, [searchQuery]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    return (
        <div className="max-w-[2400px] mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            {searchQuery && (
                <h2 className="text-2xl font-bold mb-4">
                    Search results for "{searchQuery}"
                </h2>
            )}
            {videos.length > 0 ? (
                <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-x-4 gap-y-8 sm:gap-x-5 sm:gap-y-10">
                    {videos.map((video) => (
                        <VideoCard key={video._id} video={video} />
                    ))}
                </div>
            ) : (
                !loading && (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                        <Video size={64} className="text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No videos found</h3>
                        <p className="text-gray-400 max-w-md">
                            {searchQuery
                                ? `We couldn't find anything matching "${searchQuery}". Try different keywords.`
                                : "There are no videos available yet. Be the first to upload one!"}
                        </p>
                    </div>
                )
            )}
        </div>
    );
};

export default Home;