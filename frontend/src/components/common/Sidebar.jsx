import { Link, useLocation } from 'react-router-dom';
import { Home, TrendingUp, History, Video, User, ListVideo } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, onClose }) => {
    const location = useLocation();
    const { isAuthenticated, user } = useAuth();

    const menuItems = [
        { label: 'Home', path: '/', icon: Home },
        { label: 'Trending', path: '/trending', icon: TrendingUp },
    ];

    const authMenuItems = [
        { label: 'History', path: '/history', icon: History },
        { label: 'Playlists', path: '/playlists', icon: ListVideo },
        { label: 'Your Videos', path: `/channel/${user?.id}`, icon: Video },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed left-0 top-16 h-[calc(100vh-64px)] glass-dark border-r border-white/5 z-40 transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0 lg:w-20'
                    }`}
            >
                <div className="flex flex-col h-full py-3 px-3 overflow-y-auto hide-scrollbar">
                    {/* Main Menu */}
                    <div className="space-y-1">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={`flex items-center gap-5 px-4 py-3 rounded-2xl smooth-transition group mb-1 ${isActive
                                        ? 'bg-white/10 text-white font-semibold'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                        }`}
                                >
                                    <Icon
                                        size={22}
                                        className={`smooth-transition ${isActive ? 'text-primary' : 'group-hover:scale-110'}`}
                                    />
                                    <span
                                        className={`text-[14px] whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0'
                                            }`}
                                    >
                                        {item.label}
                                    </span>

                                    {!isOpen && (
                                        <div className="absolute left-20 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block pointer-events-none whitespace-nowrap z-50">
                                            {item.label}
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Authenticated Menu */}
                    {isAuthenticated && (
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
                            {authMenuItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;

                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        onClick={onClose}
                                        className={`flex items-center gap-5 px-4 py-3 rounded-2xl smooth-transition group mb-1 ${isActive
                                            ? 'bg-white/10 text-white font-semibold'
                                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        <Icon
                                            size={22}
                                            className={`smooth-transition ${isActive ? 'text-primary' : 'group-hover:scale-110'}`}
                                        />
                                        <span
                                            className={`text-[14px] whitespace-nowrap overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'lg:opacity-0 lg:w-0'
                                                }`}
                                        >
                                            {item.label}
                                        </span>

                                        {!isOpen && (
                                            <div className="absolute left-20 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity hidden lg:block pointer-events-none whitespace-nowrap z-50">
                                                {item.label}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-white/5">
                        <div className={`px-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'lg:opacity-0 lg:h-0 overflow-hidden'}`}>
                            <p className="text-[11px] text-gray-500">© 2026 ViewTube LLC</p>
                            <p className="text-[11px] text-gray-600 mt-1">Premium Video Sharing</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;