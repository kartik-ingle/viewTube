import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import VideoCard from '../components/video/VideoCard';
import Loading from '../components/common/Loading';
import { useAuth } from '../context/AuthContext';

const History = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Redirect if not authenticated
    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await api.get('/history');
            setHistory(response.data.history);
        } catch (error) {
            console.error('Failed to fetch history:', error);
            toast.error('Failed to load history');
        } finally {
            setLoading(false);
        }
    };

    const handleClearHistory = async () => {
        if (!window.confirm('Are you sure you want to clear all watch history?')) {
            return;
        }

        try {
            await api.delete('/history');
            setHistory([]);
            toast.success('History cleared');
        } catch (error) {
            toast.error('Failed to clear history');
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="p-4">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Watch History</h1>
                {history.length > 0 && (
                    <button
                        onClick={handleClearHistory}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                    >
                        <Trash2 size={20} />
                        <span>Clear All History</span>
                    </button>
                )}
            </div>

            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
                    <p className="text-xl">No watch history yet</p>
                    <p className="text-sm mt-2">Videos you watch will appear here</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {history.map((item) => (
                        <VideoCard key={item._id} video={item.videoId} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;