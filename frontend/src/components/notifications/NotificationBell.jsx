import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const NotificationBell = ({ onClick, unreadCount: propUnreadCount }) => {
    const { isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(propUnreadCount || 0);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUnreadCount();

            // Poll for new notifications every 30 seconds
            const interval = setInterval(fetchUnreadCount, 30000);
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    };

    if (!isAuthenticated) return null;

    return (
        <button
            onClick={onClick}
            className="relative p-2 hover:bg-white/10 rounded-full smooth-transition"
            aria-label="Notifications"
        >
            <Bell size={22} />
            {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            )}
        </button>
    );
};

export default NotificationBell;