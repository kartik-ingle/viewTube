import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Filter } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/formatDate';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';

const Notifications = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        fetchNotifications();
    }, [isAuthenticated, filter]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const params = filter === 'unread' ? { unreadOnly: true } : {};
            const response = await api.get('/notifications', { params });
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            toast.error('Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/mark-all-read');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
            toast.success('All marked as read');
        } catch (error) {
            toast.error('Failed to mark all as read');
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(notifications.filter(n => n._id !== id));
            toast.success('Notification deleted');
        } catch (error) {
            toast.error('Failed to delete notification');
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm('Clear all notifications?')) return;

        try {
            await api.delete('/notifications');
            setNotifications([]);
            toast.success('All notifications cleared');
        } catch (error) {
            toast.error('Failed to clear notifications');
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'subscribe':
                return '👤';
            case 'like':
                return '❤️';
            case 'comment':
                return '💬';
            case 'reply':
                return '↩️';
            case 'video_upload':
                return '🎥';
            default:
                return '🔔';
        }
    };

    if (loading) {
        return <Loading />;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <Bell size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">Notifications</h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Stay updated with your latest activity
                        </p>
                    </div>
                </div>

                {/* Filters & Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold smooth-transition ${filter === 'all'
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold smooth-transition ${filter === 'unread'
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Unread
                        </button>
                    </div>

                    {/* Actions */}
                    {notifications.length > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleMarkAllAsRead}
                                className="flex items-center gap-2 px-4 py-2 glass hover:bg-white/10 rounded-lg smooth-transition text-sm font-semibold"
                            >
                                <Check size={16} />
                                <span>Mark all read</span>
                            </button>
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-red-600/10 text-red-500 rounded-lg smooth-transition text-sm font-semibold"
                            >
                                <Trash2 size={16} />
                                <span>Clear all</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center mb-6">
                        <Bell size={40} className="text-gray-500" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2 text-gray-200">No notifications</h3>
                    <p className="text-gray-400 max-w-md">
                        {filter === 'unread'
                            ? 'You have no unread notifications'
                            : "You're all caught up!"}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`glass-card rounded-2xl overflow-hidden group ${!notification.isRead ? 'border-l-4 border-l-red-600' : ''
                                }`}
                        >
                            <Link
                                to={notification.link}
                                onClick={() => {
                                    if (!notification.isRead) {
                                        handleMarkAsRead(notification._id);
                                    }
                                }}
                                className="block p-4 hover:bg-white/5 smooth-transition"
                            >
                                <div className="flex gap-4">
                                    {/* Icon/Avatar/Thumbnail */}
                                    <div className="flex-shrink-0">
                                        {notification.thumbnail ? (
                                            <div className="relative">
                                                <img
                                                    src={notification.thumbnail}
                                                    alt=""
                                                    className="w-16 h-16 rounded-xl object-cover"
                                                    onError={(e) => {
                                                        e.target.src = notification.sender?.profilePicture || 'https://via.placeholder.com/64';
                                                    }}
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-900 border-2 border-gray-800 flex items-center justify-center text-sm">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="relative">
                                                <img
                                                    src={notification.sender?.profilePicture || 'https://via.placeholder.com/64'}
                                                    alt={notification.sender?.username}
                                                    className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/64';
                                                    }}
                                                />
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-900 border-2 border-gray-800 flex items-center justify-center text-sm">
                                                    {getNotificationIcon(notification.type)}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm sm:text-base">
                                            <span className="font-bold">{notification.sender?.username || 'Unknown User'}</span>
                                            {' '}
                                            <span className="text-gray-300">{notification.message}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {formatDate(notification.createdAt)}
                                        </p>
                                    </div>

                                    {/* Unread Indicator */}
                                    {!notification.isRead && (
                                        <div className="flex-shrink-0">
                                            <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div>
                                        </div>
                                    )}
                                </div>
                            </Link>

                            {/* Actions */}
                            <div className="flex items-center gap-2 px-4 pb-4 opacity-0 group-hover:opacity-100 smooth-transition">
                                {!notification.isRead && (
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleMarkAsRead(notification._id);
                                        }}
                                        className="text-xs font-semibold px-3 py-1.5 glass hover:bg-white/10 rounded-lg smooth-transition"
                                    >
                                        Mark as read
                                    </button>
                                )}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDelete(notification._id);
                                    }}
                                    className="text-xs font-semibold px-3 py-1.5 hover:bg-red-600/10 text-red-500 rounded-lg smooth-transition"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Notifications;