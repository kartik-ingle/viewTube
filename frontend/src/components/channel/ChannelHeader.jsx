import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Edit } from 'lucide-react';
import { formatSubscribers } from '../../utils/formatViews';
import { formatFullDate } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const ChannelHeader = ({ channel, videosCount, onSubscribeChange }) => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [isSubscribed, setIsSubscribed] = useState(
        channel?.subscribers?.includes(user?.id) || false
    );
    const [subscribersCount, setSubscribersCount] = useState(
        channel?.subscribers?.length || 0
    );

    const isOwner = user?.id === (channel?._id || channel?.id);

    const handleSubscribe = async () => {
        if (!isAuthenticated) {
            toast.error('Please sign in to subscribe');
            navigate('/login');
            return;
        }

        try {
            await api.put(`/users/${channel._id || channel.id}/subscribe`);

            if (isSubscribed) {
                setSubscribersCount(subscribersCount - 1);
                setIsSubscribed(false);
                toast.success('Unsubscribed');
            } else {
                setSubscribersCount(subscribersCount + 1);
                setIsSubscribed(true);
                toast.success('Subscribed!');
            }

            // Notify parent component
            if (onSubscribeChange) {
                onSubscribeChange(!isSubscribed);
            }
        } catch (error) {
            console.error('Subscribe error:', error);
            toast.error('Failed to subscribe');
        }
    };

    if (!channel) {
        return null;
    }

    return (
        <div className="bg-secondary border-b border-gray-800">
            <div className="max-w-7xl mx-auto p-6">
                {/* Channel Banner (Optional - for future use) */}
                {channel.bannerImage && (
                    <div className="w-full h-48 mb-6 rounded-lg overflow-hidden">
                        <img
                            src={channel.bannerImage}
                            alt={`${channel.channelName} banner`}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}

                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                    {/* Channel Avatar */}
                    <img
                        src={channel.profilePicture}
                        alt={channel.channelName}
                        className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover flex-shrink-0 border-4 border-gray-700"
                        onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/128';
                        }}
                    />

                    {/* Channel Info */}
                    <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div className="flex-1">
                                <h1 className="text-2xl md:text-3xl font-bold">
                                    {channel.channelName}
                                </h1>

                                <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-400">
                                    <span className="font-medium">@{channel.username}</span>
                                    <span>•</span>
                                    <span>{formatSubscribers(subscribersCount)}</span>
                                    <span>•</span>
                                    <span>{videosCount} videos</span>
                                </div>

                                {channel.channelDescription && (
                                    <p className="mt-3 text-sm md:text-base text-gray-300 max-w-3xl">
                                        {channel.channelDescription}
                                    </p>
                                )}

                                <p className="text-xs text-gray-500 mt-2">
                                    Joined {formatFullDate(channel.createdAt)}
                                </p>
                            </div>

                            {/* Action Button */}
                            <div className="flex-shrink-0">
                                {isOwner ? (
                                    <button
                                        onClick={() => navigate('/profile/edit')}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-hover hover:bg-gray-600 rounded-full transition-colors font-medium"
                                    >
                                        <Edit size={20} />
                                        <span>Edit Profile</span>
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSubscribe}
                                        className={`px-8 py-2.5 rounded-full font-semibold transition-colors ${isSubscribed
                                            ? 'bg-hover hover:bg-gray-600 text-white'
                                            : 'bg-primary hover:bg-red-700 text-white'
                                            }`}
                                    >
                                        {isSubscribed ? 'Subscribed' : 'Subscribe'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Channel Stats (Optional - can add more stats) */}
                <div className="flex gap-6 mt-6 pt-6 border-t border-gray-700">
                    <div className="text-center">
                        <p className="text-2xl font-bold">{subscribersCount}</p>
                        <p className="text-sm text-gray-400">Subscribers</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">{videosCount}</p>
                        <p className="text-sm text-gray-400">Videos</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold">
                            {channel.totalViews || 0}
                        </p>
                        <p className="text-sm text-gray-400">Total Views</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChannelHeader;