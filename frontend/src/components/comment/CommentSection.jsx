import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import Comment from './Comment';

const CommentSection = ({ videoId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        fetchComments();
    }, [videoId]);

    const fetchComments = async () => {
        try {
            const response = await api.get(`/comments/video/${videoId}`);
            setComments(response.data.comments);
        } catch (error) {
            console.error('Failed to fetch comments:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newComment.trim()) {
            toast.error('Please enter a comment');
            return;
        }

        const tempId = Date.now().toString();
        const textToSubmit = newComment;
        const tempComment = {
            _id: tempId,
            text: textToSubmit,
            userId: {
                ...user,
                _id: user.id || user._id // Ensure _id is present even if user only has id
            },
            createdAt: new Date().toISOString(),
            likes: [],
            replies: []
        };

        // Optimistic update
        setComments([tempComment, ...comments]);
        setNewComment('');

        try {
            const response = await api.post('/comments', {
                videoId,
                text: textToSubmit,
            });

            setComments((prevComments) =>
                prevComments.map((c) =>
                    c._id === tempId ? response.data.comment : c
                )
            );
            toast.success('Comment added!');
        } catch (error) {
            setComments((prevComments) =>
                prevComments.filter((c) => c._id !== tempId)
            );
            toast.error('Failed to add comment');
            setNewComment(textToSubmit);
        }
    };

    const handleDelete = (commentId) => {
        setComments(comments.filter((c) => c._id !== commentId));
    };

    return (
        <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">
                {comments.length} Comments
            </h2>

            {/* Add Comment Form */}
            {isAuthenticated ? (
                <form onSubmit={handleSubmit} className="mb-6">
                    <div className="flex gap-3">
                        <img
                            src={user?.profilePicture || 'https://via.placeholder.com/40'}
                            alt={user?.username}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/40';
                            }}
                        />
                        <div className="flex-1">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                className="w-full bg-transparent border-b border-gray-700 pb-2 focus:outline-none focus:border-white transition-colors"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    type="button"
                                    onClick={() => setNewComment('')}
                                    className="px-4 py-2 text-sm hover:bg-hover rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !newComment.trim()}
                                    className="px-4 py-2 text-sm bg-primary hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Posting...' : 'Comment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            ) : (
                <p className="text-gray-400 mb-6">
                    Please sign in to leave a comment
                </p>
            )}

            {/* Comments List */}
            <div className="space-y-4">
                {comments.map((comment) => (
                    <Comment
                        key={comment._id}
                        comment={comment}
                        onDelete={handleDelete}
                        onLike={fetchComments}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommentSection;