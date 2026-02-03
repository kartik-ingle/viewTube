import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload as UploadIcon } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const EditProfile = () => {
    const navigate = useNavigate();
    const { user, updateUser, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        channelName: user?.channelName || '',
        channelDescription: user?.channelDescription || '',
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(user?.profilePicture || '');
    const [loading, setLoading] = useState(false);

    // Redirect if not authenticated
    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image must be less than 5MB');
                return;
            }
            setProfilePicture(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const updateFormData = new FormData();
            updateFormData.append('channelName', formData.channelName);
            updateFormData.append('channelDescription', formData.channelDescription);

            if (profilePicture) {
                updateFormData.append('profilePicture', profilePicture);
            }

            const response = await api.put('/users/me', updateFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const updatedUser = response.data.user;
            updateUser(updatedUser);
            toast.success('Profile updated successfully!');

            // Use the ID from the response for redirection to avoid stale state issues
            navigate(`/channel/${updatedUser.id || updatedUser._id || updatedUser}`);
        } catch (error) {
            console.error('Update error:', error);
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-8 pb-3 animate-in fade-in duration-500">
            <div className="mb-8">
                <h1 className="text-3xl font-black tracking-tight">Edit Profile</h1>
                <p className="text-gray-400 text-sm font-medium mt-1">Manage your channel identity and presence</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 glass-dark p-6 sm:p-10 rounded-[2rem] shadow-2xl border border-white/5">
                {/* Profile Picture Section */}
                <div>
                    <label className="block text-sm font-bold text-gray-300 mb-6 tracking-wide uppercase">
                        Channel Branding
                    </label>
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                        <div className="relative group">
                            <div className="p-1 glass rounded-full ring-4 ring-primary/20">
                                <img
                                    src={previewUrl}
                                    alt="Profile preview"
                                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover shadow-2xl transition-transform group-hover:scale-[1.02] duration-500"
                                    onError={(e) => {
                                        e.target.src = 'https://via.placeholder.com/160';
                                    }}
                                />
                            </div>
                            <div className="absolute inset-1 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 smooth-transition flex items-center justify-center pointer-events-none">
                                <UploadIcon size={24} className="text-white" />
                            </div>
                        </div>

                        <div className="flex-1 text-center sm:text-left">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="profile-picture"
                                disabled={loading}
                            />
                            <label
                                htmlFor="profile-picture"
                                className="btn-primary cursor-pointer inline-flex items-center gap-2 px-8 py-3 text-sm"
                            >
                                <UploadIcon size={18} />
                                <span>Update Picture</span>
                            </label>
                            <p className="text-[12px] text-gray-500 mt-4 leading-relaxed">
                                Recommended: Square image, 800x800px.<br />
                                JPG, PNG, or GIF up to 5MB.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Channel Name */}
                <div>
                    <label
                        htmlFor="channelName"
                        className="block text-sm font-medium mb-2"
                    >
                        Channel Name
                    </label>
                    <input
                        type="text"
                        id="channelName"
                        name="channelName"
                        value={formData.channelName}
                        onChange={handleChange}
                        className="input-field"
                        required
                        disabled={loading}
                    />
                </div>

                {/* Channel Description */}
                <div>
                    <label
                        htmlFor="channelDescription"
                        className="block text-sm font-medium mb-2"
                    >
                        Channel Description
                    </label>
                    <textarea
                        id="channelDescription"
                        name="channelDescription"
                        value={formData.channelDescription}
                        onChange={handleChange}
                        rows="5"
                        className="input-field resize-none"
                        placeholder="Tell viewers about your channel"
                        disabled={loading}
                    />
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate(`/channel/${user?._id || user?.id}`)}
                        disabled={loading}
                        className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;