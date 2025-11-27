import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, FileText, LogOut, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const HamburgerMenu: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const { signOut, role } = useAuth();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    const menuItems = [
        ...(role === 'admin' ? [
            {
                icon: Users,
                label: 'Gerenciar Usuários',
                onClick: async () => {
                    setIsOpen(false);
                    navigate('/manage-users');
                }
            }
        ] : []),
        ...(role === 'admin' ? [{
            icon: FileText,
            label: 'Logs',
            onClick: async () => {
                setIsOpen(false);
                navigate('/logs');
            }
        }] : []),
        {
            icon: LogOut,
            label: 'Sair',
            onClick: async () => {
                setIsOpen(false);
                await handleLogout();
            }
        }
    ];

    return (
        <>
            {/* Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative z-50 flex items-center justify-center w-10 h-10 text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm"
                aria-label="Menu"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-out Menu */}
            <div
                className={`fixed top-0 right-0 h-full w-72 bg-slate-800 border-l border-slate-700 shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white">Menu</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <nav className="space-y-2">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={item.onClick}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all group"
                                >
                                    <Icon size={20} className="group-hover:scale-110 transition-transform" />
                                    <span className="font-medium">{item.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </div>
        </>
    );
};
