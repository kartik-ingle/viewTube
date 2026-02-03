import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, History, Video, ListVideo, ChevronLeft, ChevronRight, Sparkles, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();
    const [watchTime, setWatchTime] = useState({ formatted: '0h 0m' });

    const menuItems = [
        { label: 'Home', path: '/', icon: Home, badge: null },
        { label: 'Trending', path: '/trending', icon: TrendingUp, badge: 'Hot' },
    ];

    const authMenuItems = [
        { label: 'History', path: '/history', icon: History },
        { label: 'Playlists', path: '/playlists', icon: ListVideo },
        { label: 'Your Videos', path: `/channel/${user?._id || user?.id}`, icon: Video },
    ];

    const fetchAppUsage = async () => {
        try {
            const response = await api.get('/app-usage/today');
            setWatchTime(response.data);
        } catch (error) {
            console.error('Failed to fetch app usage:', error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchAppUsage();

            // Refresh app usage every 30 seconds
            const interval = setInterval(fetchAppUsage, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            {/* Toggle Button - Desktop Only (Outside sidebar) */}
            <button
                onClick={onClose}
                className={`hidden lg:flex fixed top-20 w-8 h-8 bg-gradient-to-br from-red-600 to-pink-600 
                    rounded-full items-center justify-center shadow-lg hover:shadow-red-500/50 
                    hover:scale-110 smooth-transition z-50 group transition-all duration-300 ease-out
                    ${isOpen ? 'left-[248px]' : 'left-[64px]'}`}
                aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
                {isOpen ? (
                    <ChevronLeft size={16} className="text-white group-hover:scale-110 smooth-transition" />
                ) : (
                    <ChevronRight size={16} className="text-white group-hover:scale-110 smooth-transition" />
                )}
            </button>

            {/* Sidebar Container */}
            <aside
                className={`fixed left-0 top-16 h-[calc(100vh-64px)] glass-dark border-r border-white/10 z-40 
                    transition-all duration-300 ease-out overflow-hidden
                    ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}
            >

                <div className="flex flex-col h-full py-4 px-3 overflow-y-auto hide-scrollbar">
                    {/* Sidebar Header */}
                    {isOpen && (
                        <div className="px-4 mb-4 animate-in fade-in slide-in-from-left duration-300">
                            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Menu
                            </h2>
                        </div>
                    )}

                    {/* Main Menu */}
                    <div className="space-y-1.5">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    className={`relative flex items-center gap-4 px-4 py-3 rounded-xl smooth-transition group 
                                        ${isActive
                                            ? 'bg-gradient-to-r from-red-600/20 to-pink-600/20 text-white font-semibold border border-red-600/30 shadow-lg shadow-red-600/10'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/10 border border-transparent'
                                        }`}
                                >
                                    {/* Active Indicator */}
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-red-500 to-pink-500 rounded-r-full" />
                                    )}

                                    {/* Icon with glow effect on active */}
                                    <div className={`relative ${isActive ? 'animate-pulse-slow' : ''}`}>
                                        <Icon
                                            size={22}
                                            className={`smooth-transition ${isActive
                                                ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                                : 'group-hover:scale-110 group-hover:text-red-400'
                                                }`}
                                        />
                                    </div>

                                    {/* Label */}
                                    <span
                                        className={`text-[14.5px] whitespace-nowrap overflow-hidden transition-all duration-300 font-medium
                                            ${isOpen ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0'}`}
                                    >
                                        {item.label}
                                    </span>

                                    {/* Badge */}
                                    {item.badge && isOpen && (
                                        <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-red-600 to-pink-600 text-[10px] font-bold rounded-full animate-in fade-in slide-in-from-right">
                                            {item.badge}
                                        </span>
                                    )}

                                    {/* Tooltip on hover when collapsed */}
                                    {!isOpen && (
                                        <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg 
                                            opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden lg:block pointer-events-none 
                                            whitespace-nowrap z-50 shadow-xl border border-white/10">
                                            {item.label}
                                            {item.badge && (
                                                <span className="ml-2 px-1.5 py-0.5 bg-red-600 rounded text-[9px]">
                                                    {item.badge}
                                                </span>
                                            )}
                                            {/* Tooltip Arrow */}
                                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Divider */}
                    {isAuthenticated && (
                        <div className="my-4">
                            <div className={`h-px bg-gradient-to-r from-transparent via-white/10 to-transparent 
                                transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-50'}`} />
                        </div>
                    )}

                    {/* Authenticated Menu */}
                    {isAuthenticated && (
                        <div className="space-y-1.5">
                            {/* Section Header */}
                            {isOpen && (
                                <div className="px-4 mb-3 mt-2 animate-in fade-in slide-in-from-left duration-300">
                                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                        <Sparkles size={12} />
                                        Library
                                    </h2>
                                </div>
                            )}

                            {authMenuItems.map((item, index) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                        className={`relative flex items-center gap-4 px-4 py-3 rounded-xl smooth-transition group 
                                            ${isActive
                                                ? 'bg-gradient-to-r from-red-600/20 to-pink-600/20 text-white font-semibold border border-red-600/30 shadow-lg shadow-red-600/10'
                                                : 'text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/10 border border-transparent'
                                            }`}
                                    >
                                        {/* Active Indicator */}
                                        {isActive && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-red-500 to-pink-500 rounded-r-full" />
                                        )}

                                        {/* Icon */}
                                        <div className={`relative ${isActive ? 'animate-pulse-slow' : ''}`}>
                                            <Icon
                                                size={22}
                                                className={`smooth-transition ${isActive
                                                    ? 'text-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                                    : 'group-hover:scale-110 group-hover:text-red-400'
                                                    }`}
                                            />
                                        </div>

                                        {/* Label */}
                                        <span
                                            className={`text-[14.5px] whitespace-nowrap overflow-hidden transition-all duration-300 font-medium
                                                ${isOpen ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0'}`}
                                        >
                                            {item.label}
                                        </span>

                                        {/* Tooltip */}
                                        {!isOpen && (
                                            <div className="absolute left-full ml-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg 
                                                opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden lg:block pointer-events-none 
                                                whitespace-nowrap z-50 shadow-xl border border-white/10">
                                                {item.label}
                                                {/* Tooltip Arrow */}
                                                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900" />
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Footer - App Usage Time */}
                    {isOpen && isAuthenticated && (
                        <div className="mt-4 pt-4 border-t border-white/10 px-4 animate-in fade-in slide-in-from-bottom duration-300">
                            <div className="flex items-center gap-3 p-3 glass rounded-xl hover:bg-white/5 smooth-transition cursor-pointer group">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600/20 to-pink-600/20 flex items-center justify-center group-hover:scale-105 smooth-transition">
                                    <Clock size={18} className="text-red-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                        Screen Time Today
                                    </p>
                                    <p className="text-sm font-bold text-white">
                                        {watchTime.formatted}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Gradient Overlay at bottom for fade effect */}
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
            </aside>
        </>
    );
};

export default Sidebar;