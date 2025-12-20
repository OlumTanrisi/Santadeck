/**
 * ==============================================================================
 * AppQuickMenu - Menu Rápido de Apps Secundários
 * ==============================================================================
 * 
 * Componente que exibe os apps secundários disponíveis para o usuário.
 * Usa o APP_REGISTRY como fonte de dados e filtra baseado na role do usuário.
 * 
 * Uso no Dashboard:
 * ```tsx
 * <AppQuickMenu />
 * ```
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getAppsForRole, type AppConfig } from '../config/app-registry';

export const AppQuickMenu: React.FC = () => {
    const { role } = useAuth();

    // Buscar apps disponíveis para a role do usuário
    const availableApps = getAppsForRole(role || 'user');

    // Se não há apps disponíveis, não renderiza nada
    if (availableApps.length === 0) {
        return null;
    }

    /**
     * Navega para o app em nova aba ou mesma aba
     */
    const handleAppClick = (app: AppConfig, newTab: boolean = false) => {
        if (newTab) {
            window.open(app.path, '_blank');
        } else {
            window.location.href = app.path;
        }
    };

    return (
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="text-2xl">🚀</span>
                    Apps Disponíveis
                </h3>
                <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-1 rounded">
                    {availableApps.length} {availableApps.length === 1 ? 'app' : 'apps'}
                </span>
            </div>

            {/* Grid de Apps */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {availableApps.map((app) => (
                    <button
                        key={app.id}
                        onClick={() => handleAppClick(app)}
                        className="group bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 
                                 hover:border-primary/50 rounded-xl p-4 text-left transition-all 
                                 duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10"
                    >
                        {/* Ícone */}
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">
                            {app.icon}
                        </div>

                        {/* Nome */}
                        <h4 className="font-semibold text-white text-sm mb-1 group-hover:text-primary 
                                     transition-colors flex items-center gap-1">
                            {app.name}
                            <ExternalLink
                                size={12}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                        </h4>

                        {/* Descrição */}
                        <p className="text-xs text-slate-400 line-clamp-2">
                            {app.description}
                        </p>
                    </button>
                ))}
            </div>

            {/* Footer com dica */}
            <p className="text-xs text-slate-500 mt-4 text-center">
                Clique em um app para acessar. Sua sessão será mantida automaticamente.
            </p>
        </div>
    );
};

export default AppQuickMenu;
