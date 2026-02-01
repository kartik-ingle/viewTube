import { Link } from 'react-router-dom';
import { Home, AlertCircle } from 'lucide-react';

const ErrorPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4 text-center">
            <div className="bg-secondary p-12 rounded-2xl shadow-2xl max-w-lg w-full glass">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-500/20 p-4 rounded-full">
                        <AlertCircle size={64} className="text-primary" />
                    </div>
                </div>

                <h1 className="text-7xl font-bold text-primary mb-2">404</h1>
                <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>

                <p className="text-gray-400 mb-8 leading-relaxed">
                    Oops! The page you're looking for doesn't exist or has been moved.
                    Let's get you back on track.
                </p>

                <Link
                    to="/"
                    className="btn-primary inline-flex items-center gap-2"
                >
                    <Home size={20} />
                    Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default ErrorPage;
