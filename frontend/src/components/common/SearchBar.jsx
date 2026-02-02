import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, TrendingUp, Clock, ArrowRight, Video } from 'lucide-react';
import api from '../../utils/api';

const SearchBar = ({ isMobile = false }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('search') || '');
    const [suggestions, setSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const searchRef = useRef(null);
    const inputRef = useRef(null);

    // Load recent searches from localStorage
    useEffect(() => {
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        setRecentSearches(recent);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions from backend
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (!query.trim() || query.length < 2) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const response = await api.get('/videos/search', {
                    params: { q: query, limit: 5 }
                });

                // Extract unique suggestions from video titles
                const uniqueSuggestions = [...new Set(
                    response.data.videos
                        .map(v => v.title)
                        .filter(title => title.toLowerCase().includes(query.toLowerCase()))
                )].slice(0, 5);

                setSuggestions(uniqueSuggestions);
            } catch (error) {
                console.error('Failed to fetch suggestions:', error);
                setSuggestions([]);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const handleSearch = (searchQuery) => {
        const searchTerm = searchQuery || query;
        if (!searchTerm.trim()) return;

        // Save to recent searches
        const recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const updated = [searchTerm, ...recent.filter(s => s !== searchTerm)].slice(0, 10);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
        setRecentSearches(updated);

        // Navigate to search results
        navigate(`/?search=${encodeURIComponent(searchTerm)}`);
        setShowDropdown(false);
        setQuery(searchTerm);
        inputRef.current?.blur();
    };

    const handleKeyDown = (e) => {
        const items = query.length >= 2 ? suggestions : recentSearches;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < items.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0) {
                handleSearch(items[selectedIndex]);
            } else {
                handleSearch();
            }
        } else if (e.key === 'Escape') {
            setShowDropdown(false);
            inputRef.current?.blur();
        }
    };

    const clearRecentSearches = () => {
        localStorage.removeItem('recentSearches');
        setRecentSearches([]);
    };

    const removeRecentSearch = (searchTerm) => {
        const updated = recentSearches.filter(s => s !== searchTerm);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
        setRecentSearches(updated);
    };

    const HighlightedText = ({ text, highlight }) => {
        if (!highlight.trim()) {
            return <span>{text}</span>;
        }

        // Escape special regex characters
        const escapeRegExp = (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };

        const parts = text.split(new RegExp(`(${escapeRegExp(highlight)})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={i} className="text-white font-bold">{part}</span>
                    ) : (
                        <span key={i} className="text-gray-400">{part}</span>
                    )
                )}
            </span>
        );
    };

    return (
        <div
            ref={searchRef}
            className={`relative z-50 ${isMobile ? 'w-full' : 'flex-1 max-w-2xl'}`}
        >
            {/* Search Input */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                    <Search size={20} className="text-gray-500 group-focus-within:text-red-500 smooth-transition" />
                </div>

                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search videos, channels, playlists..."
                    className={`w-full pl-12 pr-12 py-2.5 sm:py-3 glass rounded-full text-white placeholder-gray-500 
                        focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:bg-black/40 smooth-transition
                        ${isMobile ? 'text-base' : 'text-sm'}`}
                />

                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setSuggestions([]);
                            inputRef.current?.focus();
                        }}
                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-white smooth-transition"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Dropdown with Suggestions */}
            {showDropdown && (
                <div className={`absolute top-full mt-2 w-full glass-dark rounded-2xl overflow-hidden shadow-2xl border border-white/10 animate-in fade-in slide-in-from-top-2
                    ${isMobile ? 'fixed left-0 right-0 mx-4 w-auto mt-1' : ''}`}>

                    {/* Loading State */}
                    {loading && (
                        <div className="px-4 py-4 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                            <span>Searching...</span>
                        </div>
                    )}

                    {/* Suggestions (when typing) */}
                    {!loading && query.length >= 2 && suggestions.length > 0 && (
                        <div>
                            <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5">
                                Suggestions
                            </div>
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSearch(suggestion)}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`w-full text-left px-4 py-3 hover:bg-white/5 smooth-transition flex items-center gap-3 group ${selectedIndex === index ? 'bg-white/5' : ''
                                        }`}
                                >
                                    <Search size={16} className={`text-gray-500 group-hover:text-red-400 ${selectedIndex === index ? 'text-red-400' : ''}`} />
                                    <span className="flex-1 truncate text-sm">
                                        <HighlightedText text={suggestion} highlight={query} />
                                    </span>
                                    <div className="opacity-0 group-hover:opacity-100 smooth-transition -rotate-45">
                                        <ArrowRight size={14} className="text-gray-600" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* No Results */}
                    {!loading && query.length >= 2 && suggestions.length === 0 && (
                        <div className="px-4 py-6 text-center">
                            <p className="text-sm text-gray-400">No suggestions found for "{query}"</p>
                            <button
                                onClick={() => handleSearch()}
                                className="mt-2 text-sm text-red-500 hover:text-red-400 font-semibold flex items-center justify-center gap-1 mx-auto"
                            >
                                <Search size={14} />
                                Search for it
                            </button>
                        </div>
                    )}

                    {/* Recent Searches (when not typing) */}
                    {!loading && query.length < 2 && recentSearches.length > 0 && (
                        <div>
                            <div className="px-4 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 flex items-center justify-between">
                                <span>Recent Searches</span>
                                <button
                                    onClick={clearRecentSearches}
                                    className="text-red-500 hover:text-red-400 hover:underline text-[10px]"
                                >
                                    Clear all
                                </button>
                            </div>
                            {recentSearches.map((searchTerm, index) => (
                                <div
                                    key={index}
                                    onMouseEnter={() => setSelectedIndex(index)}
                                    className={`flex items-center gap-3 px-4 py-3 hover:bg-white/5 smooth-transition group cursor-pointer ${selectedIndex === index ? 'bg-white/5' : ''
                                        }`}
                                    onClick={() => handleSearch(searchTerm)}
                                >
                                    <Clock size={16} className="text-gray-500 group-hover:text-red-400" />
                                    <span className="flex-1 text-left truncate text-sm text-gray-300 group-hover:text-white">{searchTerm}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeRecentSearch(searchTerm);
                                        }}
                                        className="p-1 hover:bg-white/10 rounded-full text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 smooth-transition"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Empty State / Trending */}
                    {!loading && query.length < 2 && recentSearches.length === 0 && (
                        <div className="px-4 py-6 text-center">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                                <TrendingUp size={18} className="text-red-500" />
                            </div>
                            <p className="text-sm text-gray-400 font-medium">Trending Searches</p>
                            <div className="mt-3 flex flex-wrap justify-center gap-2">
                                {['Music', 'Gaming', 'News', 'Live'].map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => handleSearch(tag)}
                                        className="text-xs px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-gray-300 hover:text-white smooth-transition border border-white/5"
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;