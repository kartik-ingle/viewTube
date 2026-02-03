import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Playlists from './pages/Playlists';
import PlaylistPage from './pages/PlaylistPage';
import Notifications from './pages/Notifications';
import { useAppUsageTracker } from './hooks/useAppUsageTracker';

import { useAuth } from './context/AuthContext';

// Layout Components
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Pages
import Home from './pages/Home';
import VideoPage from './pages/VideoPage';
import Upload from './pages/Upload';
import Channel from './pages/Channel';
import History from './pages/History';
import Login from './pages/Login';
import Register from './pages/Register';
import EditProfile from './pages/EditProfile';
import ErrorPage from './pages/ErrorPage';
import Trending from './pages/Trending';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize app usage tracking (tracks time spent in app)
  const { isAuthenticated } = useAuth();
  { useAppUsageTracker(isAuthenticated) }


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Router>
      <div className="min-h-screen bg-dark text-white">
        {/* Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#282828',
              color: '#fff',
              border: '1px solid #3F3F3F',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          {/* Auth Routes (No Navbar/Sidebar) */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Main Routes (With Navbar/Sidebar) */}
          <Route
            path="/*"
            element={
              <div className="flex flex-col h-screen">
                {/* Navbar */}
                <Navbar onMenuClick={toggleSidebar} />

                {/* Main Content Area */}
                <div className="flex flex-1 pt-16 overflow-hidden relative">
                  {/* Sidebar */}
                  <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />

                  {/* Main Content */}
                  <main
                    className={`flex-1 overflow-y-auto smooth-transition min-h-[calc(100vh-64px)] pb-20 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
                      }`}
                  >
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/video/:id" element={<VideoPage />} />
                      <Route path="/upload" element={<Upload />} />
                      <Route path="/channel/:id" element={<Channel />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/profile/edit" element={<EditProfile />} />
                      <Route path="/trending" element={<Trending />} />
                      <Route path="/playlists" element={<Playlists />} />
                      <Route path="/playlist/:id" element={<PlaylistPage />} />
                      <Route path="/notifications" element={<Notifications />} />

                      {/* 404 Page */}
                      <Route path="*" element={<ErrorPage />} />
                    </Routes>
                  </main>
                </div>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
