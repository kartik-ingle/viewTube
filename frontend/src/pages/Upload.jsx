import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Upload as UploadIcon, X, FileVideo, Image as ImageIcon } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Upload = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
            category: 'General',
            tags: '',
        },
    });

    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Redirect if not authenticated
    if (!isAuthenticated) {
        navigate('/login');
        return null;
    }

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 100 * 1024 * 1024) {
                toast.error('Video file must be less than 100MB');
                return;
            }
            setVideoFile(file);
        }
    };

    const handleThumbnailChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Thumbnail must be less than 5MB');
                return;
            }
            setThumbnailFile(file);
        }
    };

    const onSubmit = async (data) => {
        if (!videoFile) {
            toast.error('Please select a video file');
            return;
        }

        if (!thumbnailFile) {
            toast.error('Please select a thumbnail');
            return;
        }

        setUploading(true);
        setUploadProgress(10);

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('video', videoFile);
            uploadFormData.append('thumbnail', thumbnailFile);
            uploadFormData.append('title', data.title);
            uploadFormData.append('description', data.description);
            uploadFormData.append('category', data.category);
            uploadFormData.append('tags', data.tags);

            setUploadProgress(30);

            const response = await api.post('/videos/upload', uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setUploadProgress(30 + (percentCompleted * 0.7));
                },
            });

            toast.success('Video uploaded successfully!');
            navigate(`/video/${response.data.video._id}`);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.response?.data?.message || 'Failed to upload video');
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <UploadIcon className="text-primary" size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Upload Video</h1>
                    <p className="text-gray-400 text-sm font-medium">Share your story with the ViewTube community</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 glass-dark p-6 sm:p-10 rounded-[2rem] shadow-2xl border border-white/5 relative overflow-hidden">
                {/* Decorative background element */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[120px] rounded-full -mr-32 -mt-32 pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Video File Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-300">
                            Video File <span className="text-primary">*</span>
                        </label>
                        <div className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all ${videoFile ? 'border-green-500 bg-green-500/5' : 'border-gray-700 hover:border-primary hover:bg-primary/5'}`}>
                            <input
                                type="file"
                                accept="video/*"
                                onChange={handleVideoChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                id="video-upload"
                                disabled={uploading}
                            />
                            <div className="flex flex-col items-center">
                                {videoFile ? (
                                    <>
                                        <FileVideo size={48} className="text-green-500 mb-3" />
                                        <p className="text-sm font-medium text-green-500 truncate max-w-full px-4">{videoFile.name}</p>
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setVideoFile(null);
                                            }}
                                            className="mt-2 text-xs text-red-400 hover:text-red-300 transition-colors"
                                        >
                                            Change Video
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <UploadIcon size={48} className="text-gray-500 mb-3" />
                                        <p className="text-lg font-medium mb-1">Select video to upload</p>
                                        <p className="text-xs text-gray-400">MP4, MOV, AVI (Max 100MB)</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Thumbnail Upload */}
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-300">
                            Thumbnail <span className="text-primary">*</span>
                        </label>
                        <div className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition-all min-h-[160px] flex items-center justify-center ${thumbnailFile ? 'border-green-500 bg-green-500/5' : 'border-gray-700 hover:border-primary hover:bg-primary/5'}`}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleThumbnailChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                id="thumbnail-upload"
                                disabled={uploading}
                            />
                            <div className="w-full">
                                {thumbnailFile ? (
                                    <div className="relative group">
                                        <img
                                            src={URL.createObjectURL(thumbnailFile)}
                                            alt="Thumbnail preview"
                                            className="w-full aspect-video object-cover rounded-lg"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                                            <p className="text-xs text-white font-medium">Click to change</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <ImageIcon size={48} className="text-gray-500 mb-3" />
                                        <p className="text-lg font-medium mb-1">Pick a thumbnail</p>
                                        <p className="text-xs text-gray-400">JPG, PNG (Max 5MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-300 mb-2">
                            Title <span className="text-primary">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            {...register('title', { required: 'Title is required' })}
                            placeholder="Add a title that describes your video"
                            className={`input-field bg-dark border-gray-700 focus:ring-2 focus:ring-primary/20 ${errors.title ? 'border-red-500' : ''}`}
                            disabled={uploading}
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            {...register('description')}
                            placeholder="Tell viewers about your video"
                            rows="4"
                            className="input-field bg-dark border-gray-700 focus:ring-2 focus:ring-primary/20 resize-none"
                            disabled={uploading}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="block text-sm font-semibold text-gray-300 mb-2">
                                Category
                            </label>
                            <select
                                id="category"
                                {...register('category')}
                                className="input-field bg-dark border-gray-700 focus:ring-2 focus:ring-primary/20"
                                disabled={uploading}
                            >
                                <option value="General">General</option>
                                <option value="Education">Education</option>
                                <option value="Entertainment">Entertainment</option>
                                <option value="Gaming">Gaming</option>
                                <option value="Music">Music</option>
                                <option value="News">News</option>
                                <option value="Sports">Sports</option>
                                <option value="Technology">Technology</option>
                                <option value="Travel">Travel</option>
                                <option value="Vlog">Vlog</option>
                            </select>
                        </div>

                        {/* Tags */}
                        <div>
                            <label htmlFor="tags" className="block text-sm font-semibold text-gray-300 mb-2">
                                Tags
                            </label>
                            <input
                                type="text"
                                id="tags"
                                {...register('tags')}
                                placeholder="e.g. tutorial, react, coding"
                                className="input-field bg-dark border-gray-700 focus:ring-2 focus:ring-primary/20"
                                disabled={uploading}
                            />
                        </div>
                    </div>
                </div>

                {/* Upload Progress */}
                {uploading && (
                    <div className="bg-dark/50 rounded-2xl p-6 border border-gray-800">
                        <div className="flex items-center justify-between mb-3 text-sm font-medium">
                            <span className="flex items-center gap-2">
                                <UploadIcon size={16} className="animate-bounce" />
                                {uploadProgress < 100 ? 'Uploading video...' : 'Finalizing...'}
                            </span>
                            <span className="text-primary font-bold">{Math.round(uploadProgress)}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                            <div
                                className="bg-primary h-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-800">
                    <button
                        type="submit"
                        disabled={uploading}
                        className="btn-primary flex-1 py-4 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                    >
                        {uploading ? 'Processing...' : 'Publish Video'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        disabled={uploading}
                        className="btn-secondary px-8 py-4 font-semibold active:scale-[0.98]"
                    >
                        Discard
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Upload;