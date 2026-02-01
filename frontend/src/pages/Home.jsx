import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import VideoGrid from '../components/video/VideoGrid';
import { Video, Search, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
    { id: 'all', name: 'All', icon: '🎬' },
    { id: 'Education', name: 'Education', icon: '📚' },
    { id: 'Entertainment', name: 'Entertainment', icon: '🎭' },
    { id: 'Gaming', name: 'Gaming', icon: '🎮' },
    { id: 'Music', name: 'Music', icon: '🎵' },
    { id: 'News', name: 'News', icon: '📰' },
    { id: 'Sports', name: 'Sports', icon: '⚽' },
    { id: 'Technology', name: 'Technology', icon: '💻' },
    { id: 'Travel', name: 'Travel', icon: '✈️' },
    { id: 'Vlog', name: 'Vlog', icon: '📹' },
];

const SORT_OPTIONS = [
    { id: 'recent', name: 'Most Recent' },
    { id: 'popular', name: 'Most Popular' },
    { id: 'oldest', name: 'Oldest' },
];

const Home = () => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const searchQuery = searchParams.get('search');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'recent');
    const [showFilters, setShowFilters] = useState(false);

    const fetchVideos = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (selectedCategory !== 'all') params.category = selectedCategory;
            params.sort = sortBy;

            const response = await api.get('/videos', { params });
            let fetchedVideos = response.data.videos;

            // Client-side sorting (since backend might not support all sort options)
            if (sortBy === 'popular') {
                fetchedVideos.sort((a, b) => (b.views || 0) - (a.views || 0));
            } else if (sortBy === 'oldest') {
                fetchedVideos.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            }

            setVideos(fetchedVideos);
        } catch (error) {
            console.error('Failed to fetch videos:', error);
            toast.error('Failed to load videos');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCategory, sortBy]);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        const params = new URLSearchParams(searchParams);
        if (category === 'all') {
            params.delete('category');
        } else {
            params.set('category', category);
        }
        setSearchParams(params);
    };

    const handleSortChange = (sort) => {
        setSortBy(sort);
        const params = new URLSearchParams(searchParams);
        params.set('sort', sort);
        setSearchParams(params);
    };

    return (
        <div className="max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in">
            {/* Search Header */}
            {searchQuery && (
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-red-600/10 flex items-center justify-center">
                            <Search size={20} className="text-red-500" />
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-2xl font-bold">
                                Search results for "{searchQuery}"
                            </h2>
                            <p className="text-sm text-gray-400 mt-0.5">
                                {videos.length} {videos.length === 1 ? 'video' : 'videos'} found
                            </p>
                        </div>
                    </div>
                    <div className="divider" />
                </div>
            )}

            {/* Category Filter Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <span>Categories</span>
                        <span className="text-sm font-normal text-gray-400">
                            ({videos.length} videos)
                        </span>
                    </h3>

                    {/* Mobile Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="lg:hidden flex items-center gap-2 px-4 py-2 glass rounded-full hover:bg-white/10 smooth-transition"
                    >
                        <Filter size={18} />
                        <span className="text-sm font-semibold">Filters</span>
                    </button>
                </div>

                {/* Category Pills - Horizontal Scroll */}
                <div className={`overflow-x-auto hide-scrollbar pb-3 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                    <div className="flex gap-2 min-w-max">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => handleCategoryChange(category.id)}
                                className={`px-4 py-2 rounded-full font-semibold text-sm whitespace-nowrap smooth-transition active:scale-95 flex items-center gap-2 ${selectedCategory === category.id
                                        ? 'bg-white text-black'
                                        : 'glass hover:bg-white/10 text-white'
                                    }`}
                            >
                                <span>{category.icon}</span>
                                <span>{category.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sort Options */}
                <div className={`flex items-center gap-2 mt-3 ${showFilters ? 'block' : 'hidden lg:flex'}`}>
                    <span className="text-sm text-gray-400 font-medium">Sort by:</span>
                    {SORT_OPTIONS.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => handleSortChange(option.id)}
                            className={`px-3 py-1.5 rounded-full text-sm font-semibold smooth-transition ${sortBy === option.id
                                    ? 'bg-red-600/20 text-red-500 border border-red-600/30'
                                    : 'glass hover:bg-white/10 text-gray-400'
                                }`}
                        >
                            {option.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Videos Grid */}
            {!loading && videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-red-600/20 to-purple-600/20 flex items-center justify-center mb-6 animate-pulse">
                        <Video size={40} className="text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-200">No videos found</h3>
                    <p className="text-gray-400 max-w-md mb-8">
                        {searchQuery
                            ? `We couldn't find any videos matching "${searchQuery}" in ${selectedCategory === 'all' ? 'any category' : selectedCategory}.`
                            : `There are no ${selectedCategory === 'all' ? '' : selectedCategory} videos available yet.`}
                    </p>
                    {!searchQuery && selectedCategory === 'all' && (
                        <a href="/upload" className="btn-primary">
                            <Video size={20} />
                            Upload Your First Video
                        </a>
                    )}
                </div>
            ) : (
                <VideoGrid videos={videos} loading={loading} />
            )}
        </div>
    );
};

export default Home;