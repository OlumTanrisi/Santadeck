/**
 * Componente MainLayout - Layout Principal
 * 
 * Layout base usado em todas as páginas da aplicação.
 * Fornece:
 * - Background com imagem da cidade
 * - Header com logo e menu (exceto na página de login)
 * - Container responsivo para conteúdo
 */

import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { HamburgerMenu } from '../components/HamburgerMenu';
import skyline from '../assets/skyline.png';
import logo from '../assets/logo.png';

/**
 * Props do MainLayout
 */
interface MainLayoutProps {
    children: React.ReactNode; // Conteúdo a ser renderizado dentro do layout
}

/**
 * Componente MainLayout
 * 
 * Estrutura básica de todas as páginas:
 * - Background fixo com imagem da cidade (opacidade reduzida)
 * - Header com logo clicável e menu hambúrguer
 * - Área de conteúdo principal com scroll
 * 
 * O header é ocultado na página de login para dar mais destaque ao formulário.
 * 
 * @param children - Componentes filhos a serem renderizados
 */
export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
    const location = useLocation();

    // Verifica se está na página de login
    const isLoginPage = location.pathname === '/login';

    return (
        <div className="h-screen w-full relative flex flex-col bg-slate-900 text-white overflow-hidden">
            {/* Background Image - Imagem de fundo da cidade */}
            <div
                className="absolute inset-0 z-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: `url(${skyline})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center bottom',
                    backgroundRepeat: 'no-repeat'
                }}
            />

            {/* Header - Exibido em todas as páginas exceto login */}
            {!isLoginPage && (
                <header className="relative z-10 p-6 flex items-center justify-between">
                    {/* Logo e Título - Clicável, redireciona para dashboard */}
                    <Link to="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity group">
                        <img
                            src={logo}
                            alt="Santamérica Logo"
                            className="h-12 w-auto drop-shadow-lg group-hover:scale-105 transition-transform"
                        />
                        <h1 className="text-2xl font-bold tracking-widest text-white drop-shadow-md">
                            SANTADECK
                        </h1>
                    </Link>

                    {/* Menu Hambúrguer */}
                    <HamburgerMenu />
                </header>
            )}

            {/* Content - Área principal de conteúdo */}
            <main className="relative z-0 flex-1 flex flex-col p-6 overflow-auto">
                {children}
            </main>

            {/* Marca d'água / Copyright */}
            <footer className="relative z-10 py-2 text-center">
                <p className="text-xs text-gray-500 tracking-wide">
                    IMOBILIÁRIA SANTAMÉRICA LTDA © 2025
                </p>
            </footer>
        </div>
    );
};
