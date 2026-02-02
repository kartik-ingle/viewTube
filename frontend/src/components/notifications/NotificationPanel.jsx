import { useState, useEffect } from 'react';
import { X, Check, Trash2, Settings, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/formatDate';

const NotificationPanel = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // all, unread

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, filter]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const params = filter === 'unread' ? { unreadOnly: true } : {};
            const response = await api.get('/notifications', { params });
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
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

    if (!isOpen) return null;

    return (
        <>
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-in fade-in"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="fixed right-0 top-16 bottom-0 w-full sm:w-96 glass-dark border-l border-white/10 z-50 flex flex-col animate-in slide-in-from-right">
                {/* Header */}
                <div className="p-4 border-b border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold">Notifications</h2>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/10 rounded-full smooth-transition"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-semibold smooth-transition ${filter === 'all'
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('unread')}
                            className={`flex-1 px-3 py-1.5 rounded-lg text-sm font-semibold smooth-transition ${filter === 'unread'
                                ? 'bg-white/10 text-white'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            Unread
                        </button>
                    </div>
                </div>

                {/* Actions */}
                {notifications.length > 0 && (
                    <div className="px-4 py-2 border-b border-white/10 flex gap-2">
                        <button
                            onClick={handleMarkAllAsRead}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold glass hover:bg-white/10 rounded-lg smooth-transition"
                        >
                            <Check size={14} />
                            <span>Mark all read</span>
                        </button>
                        <button
                            onClick={handleClearAll}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-600/10 rounded-lg smooth-transition"
                        >
                            <Trash2 size={14} />
                            <span>Clear all</span>
                        </button>
                    </div>
                )}

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Bell size={28} className="text-gray-600" />
                            </div>
                            <h3 className="text-lg font-bold mb-2">No notifications</h3>
                            <p className="text-sm text-gray-400">
                                {filter === 'unread'
                                    ? 'You have no unread notifications'
                                    : "You're all caught up!"}
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-white/5">
                            {notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    className={`group relative ${!notification.isRead ? 'bg-white/5' : ''
                                        }`}
                                >
                                    <Link
                                        to={notification.link}
                                        onClick={() => {
                                            if (!notification.isRead) {
                                                handleMarkAsRead(notification._id);
                                            }
                                            onClose();
                                        }}
                                        className="block p-4 hover:bg-white/5 smooth-transition"
                                    >
                                        <div className="flex gap-3">
                                            {/* Avatar or Thumbnail */}
                                            <div className="flex-shrink-0">
                                                {notification.thumbnail ? (
                                                    <img
                                                        src={notification.thumbnail}
                                                        alt=""
                                                        className="w-12 h-12 rounded-lg object-cover"
                                                        onError={(e) => {
                                                            e.target.src = notification.sender?.profilePicture || 'https://via.placeholder.com/48';
                                                        }}
                                                    />
                                                ) : (
                                                    <img
                                                        src={notification.sender?.profilePicture || 'https://via.placeholder.com/48'}
                                                        alt={notification.sender?.username}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                        onError={(e) => {
                                                            e.target.src = 'https://via.placeholder.com/48';
                                                        }}
                                                    />
                                                )}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-2">
                                                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                                    <div className="flex-1">
                                                        <p className="text-sm">
                                                            <span className="font-bold">{notification.sender?.username || 'Unknown User'}</span>
                                                            {' '}
                                                            <span className="text-gray-300">{notification.message}</span>
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {formatDate(notification.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Unread indicator */}
                                            {!notification.isRead && (
                                                <div className="flex-shrink-0">
                                                    <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                                </div>
                                            )}
                                        </div>
                                    </Link>

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDelete(notification._id);
                                        }}
                                        className="absolute top-4 right-4 p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-600/20 text-red-500 rounded-lg smooth-transition"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default NotificationPanel;