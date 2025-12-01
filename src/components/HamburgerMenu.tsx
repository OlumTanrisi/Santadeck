/**
 * Componente HamburgerMenu - Menu Lateral Deslizante
 * 
 * Menu hambúrguer que aparece no canto superior direito.
 * Exibe:
 * - Informações do usuário logado
 * - Opções de navegação (apenas para admins)
 * - Botão de logout
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, FileText, LogOut, Users, UserCircle, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Componente HamburgerMenu
 * 
 * Menu lateral que desliza da direita.
 * Inclui backdrop com blur quando aberto.
 * 
 * Funcionalidades:
 * - Toggle de abertura/fechamento
 * - Exibe perfil do usuário
 * - Menu contextual baseado em role
 * - Navegação para páginas admin
 * - Logout
 */
export const HamburgerMenu: React.FC = () => {
    // Estado para controlar se o menu está aberto
    const [isOpen, setIsOpen] = useState(false);

    const navigate = useNavigate();
    const { signOut, role, user } = useAuth();

    /**
     * Função de logout
     * Chama a função signOut do contexto e redireciona para login
     */
    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    /**
     * Itens do menu
     * Array dinâmico que muda baseado na role do usuário
     * Admins veem opções extras
     */
    const menuItems = [
        // Opção "Gerenciar Usuários" - apenas para admins
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

        // Opção "Logs" - apenas para admins
        ...(role === 'admin' ? [{
            icon: FileText,
            label: 'Logs',
            onClick: async () => {
                setIsOpen(false);
                navigate('/logs');
            }
        }] : []),

        // Opção "Alterar Senha" - disponível para todos
        {
            icon: Lock,
            label: 'Alterar Senha',
            onClick: async () => {
                setIsOpen(false);
                navigate('/change-password');
            }
        },

        // Opção "Sair" - disponível para todos
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
            {/* Botão Hambúrguer */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative z-50 flex items-center justify-center w-10 h-10 text-gray-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-all backdrop-blur-sm"
                aria-label="Menu"
            >
                {/* Ícone muda entre Menu e X baseado no estado */}
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop - Fundo escuro com blur quando menu está aberto */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
                    onClick={() => setIsOpen(false)} // Fecha ao clicar fora
                />
            )}

            {/* Menu Deslizante */}
            <div
                className={`fixed top-0 right-0 h-full w-72 bg-slate-800 border-l border-slate-700 shadow-2xl z-[9999] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="p-6">
                    {/* Header do Menu */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-white">Menu</h2>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Seção de Perfil do Usuário */}
                    {user && (
                        <div className="flex items-center gap-3 mb-6 p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                            {/* Avatar com ícone */}
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0">
                                <UserCircle size={24} />
                            </div>
                            {/* Informações do usuário */}
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-bold text-white truncate">
                                    {user.user_metadata?.full_name || 'Usuário'}
                                </span>
                                <span className="text-xs text-gray-400 truncate" title={user.email}>
                                    {user.email}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Navegação - Itens do Menu */}
                    <nav className="space-y-2">
                        {menuItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={item.onClick}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all group"
                                >
                                    {/* Ícone com efeito de escala no hover */}
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
