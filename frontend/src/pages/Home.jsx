import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import VideoGrid from '../components/video/VideoGrid';
import { Video, Search, Filter, X, Clock, Calendar, SlidersHorizontal, ArrowUp, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const SORT_OPTIONS = [
    { id: 'recommended', name: '✨ For You', icon: '✨' },
    { id: 'recent', name: 'Most Recent', icon: '🕐' },
    { id: 'popular', name: 'Most Popular', icon: '🔥' },
    { id: 'rating', name: 'Top Rated', icon: '⭐' },
    { id: 'oldest', name: 'Oldest', icon: '📅' },
];

const UPLOAD_DATE_OPTIONS = [
    { id: 'all', name: 'Any time', days: null },
    { id: 'today', name: 'Today', days: 1 },
    { id: 'week', name: 'This week', days: 7 },
    { id: 'month', name: 'This month', days: 30 },
    { id: 'year', name: 'This year', days: 365 },
];

const DURATION_OPTIONS = [
    { id: 'all', name: 'Any duration', min: 0, max: Infinity },
    { id: 'short', name: 'Short (< 4 min)', min: 0, max: 240 },
    { id: 'medium', name: 'Medium (4-20 min)', min: 240, max: 1200 },
    { id: 'long', name: 'Long (> 20 min)', min: 1200, max: Infinity },
];

const Home = () => {
    const { isAuthenticated } = useAuth();
    const [videos, setVideos] = useState([]);
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');
    const [showBackToTop, setShowBackToTop] = useState(false);

    // Filter states
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recommended');
    const [uploadDate, setUploadDate] = useState(searchParams.get('uploadDate') || 'all');
    const [duration, setDuration] = useState(searchParams.get('duration') || 'all');

    // UI states
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Scroll listener for Back to Top
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Fetch videos from backend
    const fetchVideos = useCallback(async () => {
        setLoading(true);
        try {
            let response;

            if (searchQuery) {
                // Search mode
                response = await api.get('/videos', { params: { search: searchQuery } });
            } else if (sortBy === 'recommended' && isAuthenticated) {
                // Personalized recommendations
                response = await api.get('/recommendations');
            } else {
                // Regular video listing
                response = await api.get('/videos');
            }

            setVideos(response.data.videos || response.data.recommendations || []);
        } catch (error) {
            console.error('Failed to fetch videos:', error);
            toast.error('Failed to load videos');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, sortBy, isAuthenticated]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    // Apply client-side filters and sorting
    useEffect(() => {
        let result = [...videos];

        // Filter by upload date
        if (uploadDate !== 'all') {
            const dateOption = UPLOAD_DATE_OPTIONS.find(opt => opt.id === uploadDate);
            if (dateOption?.days) {
                const cutoffDate = new Date();
                cutoffDate.setDate(cutoffDate.getDate() - dateOption.days);
                result = result.filter(video => new Date(video.createdAt) >= cutoffDate);
            }
        }

        // Filter by duration
        if (duration !== 'all') {
            const durationOption = DURATION_OPTIONS.find(opt => opt.id === duration);
            if (durationOption) {
                result = result.filter(video =>
                    video.duration >= durationOption.min && video.duration < durationOption.max
                );
            }
        }

        // Sort videos (skip if already using recommendations)
        if (sortBy !== 'recommended') {
            switch (sortBy) {
                case 'popular':
                    result.sort((a, b) => (b.views || 0) - (a.views || 0));
                    break;
                case 'rating':
                    result.sort((a, b) => {
                        const ratingA = (a.likes?.length || 0) - (a.dislikes?.length || 0);
                        const ratingB = (b.likes?.length || 0) - (b.dislikes?.length || 0);
                        return ratingB - ratingA;
                    });
                    break;
                case 'oldest':
                    result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    break;
                case 'recent':
                default:
                    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                    break;
            }
        }

        setFilteredVideos(result);
    }, [videos, sortBy, uploadDate, duration]);

    // Update URL params
    const updateFilters = (key, value) => {
        const params = new URLSearchParams(searchParams);
        if (value === 'all' || value === 'recommended' || !value) {
            params.delete(key);
        } else {
            params.set(key, value);
        }
        setSearchParams(params);
    };

    const handleSortChange = (sort) => {
        setSortBy(sort);
        updateFilters('sort', sort);
    };

    const handleUploadDateChange = (date) => {
        setUploadDate(date);
        updateFilters('uploadDate', date);
    };

    const handleDurationChange = (dur) => {
        setDuration(dur);
        updateFilters('duration', dur);
    };

    const clearAllFilters = () => {
        setSortBy('recommended');
        setUploadDate('all');
        setDuration('all');
        setSearchParams({});
    };

    const activeFiltersCount =
        (sortBy !== 'recommended' ? 1 : 0) +
        (uploadDate !== 'all' ? 1 : 0) +
        (duration !== 'all' ? 1 : 0);

    return (
        <div className="w-full min-h-screen relative bg-gradient-to-br from-[#0a0a0a] via-[#0b0b0f] to-[#09090b]">
            <div className="max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 pb-3">
                {/* Search Header */}
                {searchQuery && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 rounded-full bg-red-600/10 flex items-center justify-center border border-red-600/20">
                                <Search size={24} className="text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold">
                                    Results for <span className="text-red-500">"{searchQuery}"</span>
                                </h2>
                                <p className="text-sm text-gray-400 mt-1">
                                    Found {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'}
                                </p>
                            </div>
                        </div>
                        <div className="divider" />
                    </div>
                )}

                {/* Personalized Header */}
                {!searchQuery && sortBy === 'recommended' && isAuthenticated && (
                    <div className="mb-6 animate-in fade-in">
                        <div className="flex items-center gap-3">
                            <Sparkles size={28} className="text-yellow-500" />
                            <div>
                                <h2 className="text-2xl font-bold">Recommended for you</h2>
                                <p className="text-sm text-gray-400">Based on your watch history and preferences</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Filter Controls Row */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <span>Videos</span>
                            <span className="text-sm font-normal text-gray-400">
                                ({filteredVideos.length})
                            </span>
                        </h3>

                        <div className="flex items-center gap-2">
                            {activeFiltersCount > 0 && (
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-2 px-3 py-2 glass rounded-full hover:bg-white/10 smooth-transition text-sm group"
                                >
                                    <X size={16} className="group-hover:text-red-500 transition-colors" />
                                    <span>Clear ({activeFiltersCount})</span>
                                </button>
                            )}

                            <button
                                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full smooth-transition font-semibold ${showAdvancedFilters || activeFiltersCount > 0
                                    ? 'bg-red-600/20 text-red-500 border border-red-600/30'
                                    : 'glass hover:bg-white/10'
                                    }`}
                            >
                                <SlidersHorizontal size={18} />
                                <span className="hidden sm:inline">Filters</span>
                                {activeFiltersCount > 0 && (
                                    <span className="px-2 py-0.5 bg-red-600 rounded-full text-white text-xs font-bold">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Advanced Filters Panel */}
                    {showAdvancedFilters && (
                        <div className="glass rounded-2xl p-4 mb-4 border border-white/10 animate-in fade-in slide-in-from-top-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* Sort By */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                        <SlidersHorizontal size={14} />
                                        Sort By
                                    </label>
                                    <div className="space-y-1.5">
                                        {SORT_OPTIONS.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => handleSortChange(option.id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm smooth-transition flex items-center gap-2 ${sortBy === option.id
                                                    ? 'bg-red-600/20 text-red-500 border border-red-600/30 font-semibold'
                                                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                                                    }`}
                                            >
                                                <span>{option.icon}</span>
                                                {option.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Upload Date */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                        <Calendar size={14} />
                                        Upload Date
                                    </label>
                                    <div className="space-y-1.5">
                                        {UPLOAD_DATE_OPTIONS.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => handleUploadDateChange(option.id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm smooth-transition ${uploadDate === option.id
                                                    ? 'bg-red-600/20 text-red-500 border border-red-600/30 font-semibold'
                                                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                                                    }`}
                                            >
                                                {option.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Duration */}
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-2">
                                        <Clock size={14} />
                                        Duration
                                    </label>
                                    <div className="space-y-1.5">
                                        {DURATION_OPTIONS.map((option) => (
                                            <button
                                                key={option.id}
                                                onClick={() => handleDurationChange(option.id)}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm smooth-transition ${duration === option.id
                                                    ? 'bg-red-600/20 text-red-500 border border-red-600/30 font-semibold'
                                                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                                                    }`}
                                            >
                                                {option.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Videos Grid */}
                {!loading && filteredVideos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-in fade-in">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600/20 to-purple-600/20 flex items-center justify-center mb-6 animate-pulse">
                            <Video size={40} className="text-gray-500" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-gray-200">No videos found</h3>
                        <p className="text-gray-400 max-w-md mb-8">
                            {searchQuery
                                ? `We couldn't find any videos matching "${searchQuery}".`
                                : `There are no videos matching your current filters.`}
                        </p>
                        {activeFiltersCount > 0 && (
                            <button onClick={clearAllFilters} className="btn-primary">
                                <X size={20} />
                                Clear All Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <VideoGrid videos={filteredVideos} loading={loading} />
                )}
            </div>

            {/* Back to Top Button */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-8 right-8 p-3 rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 hover:bg-red-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 z-50 ${showBackToTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
                    }`}
            >
                <ArrowUp size={24} />
            </button>
        </div>
    );
};

export default Home;