import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HamburgerMenu } from '../components/HamburgerMenu';
import skyline from '../assets/skyline.png';
import logo from '../assets/logo.png';

interface MainLayoutProps {
    children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    return (
        <div className="h-screen w-full relative flex flex-col bg-slate-900 text-white overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url(${skyline})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center bottom',
                    backgroundRepeat: 'no-repeat'
                }}
            />

            {/* Header */}
            {!isLoginPage && (
                <header className="relative z-10 p-6 flex items-center justify-between">
                    <Link to="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity group">
                        <img src={logo} alt="Santamérica Logo" className="h-12 w-auto drop-shadow-lg group-hover:scale-105 transition-transform" />
                        <h1 className="text-2xl font-bold tracking-widest text-white drop-shadow-md">
                            SANTADECK
                        </h1>
                    </Link>

                    <HamburgerMenu />
                </header>
            )}

            {/* Content */}
            <main className="relative z-0 flex-1 flex flex-col p-6 overflow-auto">
                {children}
            </main>
        </div>
    );
};
