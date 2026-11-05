import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);
    const location = useLocation();

    useEffect(() => {
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen w-full bg-atmosphere overflow-hidden relative select-none">
            {/* Overlay móvil */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-[#112250]/60 z-40 lg:hidden backdrop-blur-sm transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar isSidebarOpen={isSidebarOpen} />

            <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0 relative z-10">
                <Topbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />

                <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative custom-scrollbar">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;