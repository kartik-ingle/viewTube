import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Video, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onMenuClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${searchQuery}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 right-0 glass-dark z-50">
            <div className="flex items-center justify-between px-4 h-16">
                {/* Left Section */}
                <div className="flex items-center gap-2 lg:gap-4">
                    <button
                        onClick={onMenuClick}
                        className="p-2 hover:bg-white/10 rounded-full transition-all active:scale-90"
                    >
                        <Menu size={24} />
                    </button>

                    <Link to="/" className="flex items-center gap-2 smooth-transition hover:opacity-80">
                        <Video className="text-primary fill-current" size={32} />
                        <span className="text-xl font-bold tracking-tight hidden sm:block">ViewTube</span>
                    </Link>
                </div>

                {/* Center Section - Search (Responsive) */}
                <form onSubmit={handleSearch} className="flex-1 max-w-[720px] mx-4 hidden xs:block">
                    <div className="flex group">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 bg-white/5 border border-white/10 rounded-l-full px-5 py-2 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all text-[15px] placeholder:text-gray-500"
                        />
                        <button
                            type="submit"
                            className="bg-white/5 border border-l-0 border-white/10 rounded-r-full px-5 hover:bg-white/10 transition-all flex items-center justify-center text-gray-400 group-focus-within:border-primary/50"
                        >
                            <Search size={18} />
                        </button>
                    </div>
                </form>

                {/* Right Section */}
                <div className="flex items-center gap-1 sm:gap-3">
                    <button className="p-2 hover:bg-white/10 rounded-full transition-all xs:hidden">
                        <Search size={20} />
                    </button>

                    {isAuthenticated ? (
                        <>
                            <Link
                                to="/upload"
                                className="p-2 sm:px-4 sm:py-2 hover:bg-white/10 rounded-full sm:rounded-lg flex items-center gap-2 transition-all active:scale-95"
                                title="Create"
                            >
                                <Video size={20} />
                                <span className="hidden md:block font-medium">Create</span>
                            </Link>

                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center p-1 hover:bg-white/10 rounded-full transition-all"
                                >
                                    <img
                                        src={user?.profilePicture || '/default-avatar.png'}
                                        alt={user?.username}
                                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                                        onError={(e) => {
                                            e.target.src = 'https://via.placeholder.com/32';
                                        }}
                                    />
                                </button>

                                {showUserMenu && (
                                    <div className="absolute right-0 mt-3 w-64 glass rounded-2xl shadow-2xl overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-5 py-4 flex flex-col gap-0.5 border-b border-white/5 bg-white/5">
                                            <p className="font-bold truncate text-[15px]">{user?.username}</p>
                                            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
                                        </div>

                                        <Link
                                            to={`/channel/${user?.id}`}
                                            className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition-all text-sm font-medium"
                                            onClick={() => setShowUserMenu(false)}
                                        >
                                            <User size={18} />
                                            <span>Your channel</span>
                                        </Link>

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setShowUserMenu(false);
                                            }}
                                            className="flex items-center gap-3 px-5 py-3 hover:bg-white/10 transition-all w-full text-left text-sm font-medium border-t border-white/5"
                                        >
                                            <LogOut size={18} />
                                            <span>Sign out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="flex items-center gap-2 border border-white/10 hover:border-primary/50 hover:bg-primary/10 text-primary-content px-4 py-1.5 rounded-full transition-all font-medium text-sm"
                        >
                            <User size={18} className="text-primary" />
                            <span className="text-white">Sign in</span>
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;