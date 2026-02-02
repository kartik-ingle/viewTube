import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

const Layout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-black via-gray-900 to-black">
            {/* Navbar - Sticky at top */}
            <Navbar onMenuClick={toggleSidebar} />

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                onClose={closeSidebar}
                onToggle={toggleSidebar}
            />

            {/* Main Content - Offset by sidebar width */}
            <main
                className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-out pt-16
                    ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}
            >
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;