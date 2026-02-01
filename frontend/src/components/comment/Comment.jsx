import { useState } from 'react';
import { ThumbsUp, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/formatDate';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const Comment = ({ comment, onDelete, onLike }) => {
    const { user } = useAuth();
    const [isLiked, setIsLiked] = useState(
        comment.likes?.includes(user?.id) || false
    );
    const [likesCount, setLikesCount] = useState(comment.likes?.length || 0);

    const handleLike = async () => {
        try {
            await api.put(`/comments/${comment._id}/like`);
            setIsLiked(!isLiked);
            setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
            if (onLike) onLike();
        } catch (error) {
            toast.error('Failed to like comment');
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            try {
                await api.delete(`/comments/${comment._id}`);
                toast.success('Comment deleted');
                if (onDelete) onDelete(comment._id);
            } catch (error) {
                toast.error('Failed to delete comment');
            }
        }
    };

    const isOwner = user?.id === comment.userId?._id;

    return (
        <div className="flex gap-3 py-3">
            {/* Avatar */}
            <img
                src={comment.userId?.profilePicture || 'https://via.placeholder.com/40'}
                alt={comment.userId?.username}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/40';
                }}
            />

            {/* Comment Content */}
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                        {comment.userId?.username || 'Unknown User'}
                    </span>
                    <span className="text-xs text-gray-400">
                        {formatDate(comment.createdAt)}
                    </span>
                </div>

                <p className="text-sm mt-1 whitespace-pre-wrap">{comment.text}</p>

                {/* Actions */}
                <div className="flex items-center gap-4 mt-2">
                    <button
                        onClick={handleLike}
                        className={`flex items-center gap-1 text-sm transition-colors ${isLiked ? 'text-primary' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <ThumbsUp size={16} fill={isLiked ? 'currentColor' : 'none'} />
                        <span>{likesCount}</span>
                    </button>

                    {isOwner && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={16} />
                            <span>Delete</span>
                        </button>
                    )}
                </div>

                {/* Replies (if any) */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 mt-4 space-y-3">
                        {comment.replies.map((reply) => (
                            <Comment
                                key={reply._id}
                                comment={reply}
                                onDelete={onDelete}
                                onLike={onLike}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Comment;