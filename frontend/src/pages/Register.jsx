import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Video } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const navigate = useNavigate();
    const { register: registerAuth, isAuthenticated } = useAuth();
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        defaultValues: {
            username: '',
            email: '',
            password: '',
            confirmPassword: '',
            channelName: '',
        },
    });
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const password = watch('password');

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    const onSubmit = async (data) => {
        setApiError('');
        setLoading(true);

        const { confirmPassword: _, ...registerData } = data;
        const result = await registerAuth(registerData);

        if (result.success) {
            navigate('/');
        } else {
            setApiError(result.error);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    <Video className="text-primary" size={48} />
                    <h1 className="text-3xl font-bold">ViewTube</h1>
                </div>

                {/* Register Form */}
                <div className="bg-secondary rounded-lg p-8 shadow-xl">
                    <h2 className="text-2xl font-bold mb-6 text-center">
                        Create your account
                    </h2>

                    {apiError && (
                        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-4 text-sm text-center">
                            {apiError}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Username */}
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium mb-2"
                            >
                                Username
                            </label>
                            <input
                                type="text"
                                id="username"
                                {...register('username', {
                                    required: 'Username is required',
                                    minLength: {
                                        value: 3,
                                        message: 'Username must be at least 3 characters',
                                    },
                                })}
                                placeholder="Choose a username"
                                className={`input-field ${errors.username ? 'border-red-500' : ''}`}
                                disabled={loading}
                            />
                            {errors.username && (
                                <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                {...register('email', {
                                    required: 'Email is required',
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: 'Invalid email address',
                                    },
                                })}
                                placeholder="Enter your email"
                                className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                                disabled={loading}
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                            )}
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
                                {...register('channelName', {
                                    required: 'Channel name is required',
                                })}
                                placeholder="Name your channel"
                                className={`input-field ${errors.channelName ? 'border-red-500' : ''}`}
                                disabled={loading}
                            />
                            {errors.channelName && (
                                <p className="text-red-500 text-xs mt-1">{errors.channelName.message}</p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium mb-2"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: {
                                        value: 6,
                                        message: 'Password must be at least 6 characters',
                                    },
                                })}
                                placeholder="Create a password"
                                className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                                disabled={loading}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-medium mb-2"
                            >
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                {...register('confirmPassword', {
                                    required: 'Please confirm your password',
                                    validate: (value) =>
                                        value === password || 'Passwords do not match',
                                })}
                                placeholder="Confirm your password"
                                className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                                disabled={loading}
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </form>

                    {/* Login Link */}
                    <p className="text-center text-sm text-gray-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;