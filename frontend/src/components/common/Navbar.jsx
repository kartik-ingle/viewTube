import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Video, Bell, User, LogOut, Settings, Upload, ListVideo, Search as SearchIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import SearchBar from './SearchBar';
import NotificationBell from '../notifications/NotificationBell';
import NotificationPanel from '../notifications/NotificationPanel';

const Navbar = ({ onMenuClick }) => {
    const { isAuthenticated, user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
        setProfileMenuOpen(false);
        setMobileMenuOpen(false);
    };

    return (
        <>
            <nav className="sticky top-0 z-50 glass-dark border-b border-white/10 backdrop-blur-xl">
                <div className="max-w-[2560px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Left Section - Menu + Logo */}
                        <div className="flex items-center gap-3">
                            {/* Menu Button for Sidebar Toggle */}
                            <button
                                onClick={onMenuClick}
                                className="p-2.5 glass hover:bg-white/10 rounded-full smooth-transition"
                                aria-label="Toggle menu"
                            >
                                <Menu size={20} />
                            </button>

                            {/* Logo */}
                            <Link
                                to="/"
                                className="flex items-center gap-2 font-bold text-xl hover:text-red-500 smooth-transition flex-shrink-0"
                            >
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center">
                                    <Video size={20} className="text-white" />
                                </div>
                                <span className="hidden sm:inline bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                                    VideoHub
                                </span>
                            </Link>
                        </div>

                        {/* Desktop Search Bar */}
                        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
                            <SearchBar />
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden md:flex items-center gap-3">
                            {isAuthenticated ? (
                                <>
                                    {/* Upload Button */}
                                    <Link
                                        to="/upload"
                                        className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 rounded-full smooth-transition font-semibold"
                                    >
                                        <Upload size={18} />
                                        <span>Upload</span>
                                    </Link>

                                    {/* Notifications - UPDATED */}
                                    <NotificationBell
                                        onClick={() => setShowNotifications(true)}
                                    />

                                    {/* Profile Menu */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                                            className="flex items-center gap-2 p-1 glass hover:bg-white/10 rounded-full smooth-transition"
                                        >
                                            <img
                                                src={user?.profilePicture || 'https://via.placeholder.com/40'}
                                                alt={user?.username}
                                                className="w-8 h-8 rounded-full object-cover border-2 border-white/10"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/40';
                                                }}
                                            />
                                        </button>

                                        {/* Profile Dropdown */}
                                        {profileMenuOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40"
                                                    onClick={() => setProfileMenuOpen(false)}
                                                />
                                                <div className="absolute right-0 mt-2 w-64 glass rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-50 animate-in fade-in slide-in-from-top-2">
                                                    {/* Profile Header */}
                                                    <div className="p-4 border-b border-white/10">
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={user?.profilePicture || 'https://via.placeholder.com/48'}
                                                                alt={user?.username}
                                                                className="w-12 h-12 rounded-full object-cover"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold truncate">{user?.channelName}</p>
                                                                <p className="text-sm text-gray-400 truncate">@{user?.username}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Menu Items */}
                                                    <div className="py-2">
                                                        <Link
                                                            to={`/channel/${user?._id || user?.id}`}
                                                            onClick={() => setProfileMenuOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 smooth-transition"
                                                        >
                                                            <User size={18} className="text-gray-400" />
                                                            <span>Your Channel</span>
                                                        </Link>

                                                        <Link
                                                            to="/playlists"
                                                            onClick={() => setProfileMenuOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 smooth-transition"
                                                        >
                                                            <ListVideo size={18} className="text-gray-400" />
                                                            <span>Your Playlists</span>
                                                        </Link>

                                                        {/* ADDED: Notifications Link */}
                                                        <Link
                                                            to="/notifications"
                                                            onClick={() => setProfileMenuOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 smooth-transition"
                                                        >
                                                            <Bell size={18} className="text-gray-400" />
                                                            <span>Notifications</span>
                                                        </Link>

                                                        <Link
                                                            to="/profile/edit"
                                                            onClick={() => setProfileMenuOpen(false)}
                                                            className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 smooth-transition"
                                                        >
                                                            <Settings size={18} className="text-gray-400" />
                                                            <span>Settings</span>
                                                        </Link>
                                                    </div>

                                                    {/* Logout */}
                                                    <div className="border-t border-white/10">
                                                        <button
                                                            onClick={handleLogout}
                                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-600/20 text-red-500 smooth-transition"
                                                        >
                                                            <LogOut size={18} />
                                                            <span>Sign Out</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="px-6 py-2 glass hover:bg-white/10 rounded-full smooth-transition font-semibold"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-6 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-full smooth-transition font-semibold"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex md:hidden items-center gap-2">
                            {/* Mobile Search Icon */}
                            <button
                                onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
                                className="p-2.5 glass hover:bg-white/10 rounded-full smooth-transition"
                            >
                                <SearchIcon size={20} />
                            </button>

                            {/* ADDED: Mobile Notification Bell */}
                            {isAuthenticated && (
                                <NotificationBell
                                    onClick={() => setShowNotifications(true)}
                                />
                            )}

                            {/* Profile Picture or Sign In for Mobile */}
                            {isAuthenticated ? (
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="flex items-center gap-2 p-1 glass hover:bg-white/10 rounded-full smooth-transition"
                                >
                                    <img
                                        src={user?.profilePicture || 'https://via.placeholder.com/40'}
                                        alt={user?.username}
                                        className="w-8 h-8 rounded-full object-cover border-2 border-white/10"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/40';
                                        }}
                                    />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    className="p-2.5 glass hover:bg-white/10 rounded-full smooth-transition"
                                >
                                    <User size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mobile Search Bar */}
                    {mobileSearchOpen && (
                        <div className="md:hidden pb-4 animate-in fade-in slide-in-from-top-2">
                            <SearchBar isMobile={true} />
                        </div>
                    )}
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden glass-dark border-t border-white/10 animate-in fade-in slide-in-from-top-2">
                        <div className="px-4 py-4 space-y-2">
                            {isAuthenticated ? (
                                <>
                                    {/* Profile Section */}
                                    <Link
                                        to={`/channel/${user?._id || user?.id}`}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 p-3 glass hover:bg-white/10 rounded-xl smooth-transition"
                                    >
                                        <img
                                            src={user?.profilePicture || 'https://via.placeholder.com/40'}
                                            alt={user?.username}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                        <div className="flex-1">
                                            <p className="font-semibold">{user?.channelName}</p>
                                            <p className="text-xs text-gray-400">@{user?.username}</p>
                                        </div>
                                    </Link>

                                    <div className="divider my-2" />

                                    <Link
                                        to="/upload"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-3 py-3 glass hover:bg-white/10 rounded-xl smooth-transition"
                                    >
                                        <Upload size={20} className="text-gray-400" />
                                        <span>Upload Video</span>
                                    </Link>

                                    <Link
                                        to="/playlists"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-3 py-3 glass hover:bg-white/10 rounded-xl smooth-transition"
                                    >
                                        <ListVideo size={20} className="text-gray-400" />
                                        <span>Your Playlists</span>
                                    </Link>

                                    {/* ADDED: Mobile Notifications Link */}
                                    <Link
                                        to="/notifications"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-3 py-3 glass hover:bg-white/10 rounded-xl smooth-transition"
                                    >
                                        <Bell size={20} className="text-gray-400" />
                                        <span>Notifications</span>
                                    </Link>

                                    <Link
                                        to="/profile/edit"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="flex items-center gap-3 px-3 py-3 glass hover:bg-white/10 rounded-xl smooth-transition"
                                    >
                                        <Settings size={20} className="text-gray-400" />
                                        <span>Settings</span>
                                    </Link>

                                    <div className="divider my-2" />

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-3 hover:bg-red-600/20 text-red-500 rounded-xl smooth-transition"
                                    >
                                        <LogOut size={20} />
                                        <span>Sign Out</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full text-center px-6 py-3 glass hover:bg-white/10 rounded-xl smooth-transition font-semibold"
                                    >
                                        Sign In
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="block w-full text-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 rounded-xl smooth-transition font-semibold"
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </nav>

            {/* ADDED: Notification Panel */}
            <NotificationPanel
                isOpen={showNotifications}
                onClose={() => setShowNotifications(false)}
            />
        </>
    );
};

export default Navbar;