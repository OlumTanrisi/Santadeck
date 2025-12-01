/**
 * Componente AppCard - Card de Aplicativo
 * 
 * Exibe um card visual para cada aplicativo no dashboard.
 * Inclui:
 * - Ícone do aplicativo
 * - Nome e descrição
 * - Efeitos visuais de hover
 * - Botões de edição/exclusão (apenas para admins)
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Trash2, Edit2 } from 'lucide-react';

/**
 * Interface que define os dados de um aplicativo
 */
interface AppData {
    id: string;          // ID único do aplicativo
    name: string;        // Nome do aplicativo
    description: string; // Descrição do aplicativo
    icon_url?: string;   // URL do ícone (opcional)
}

/**
 * Props do componente AppCard
 */
interface AppCardProps {
    app: AppData;                          // Dados do aplicativo
    isAdmin?: boolean;                     // Se o usuário atual é admin
    onDelete?: (id: string) => void;       // Callback para deletar app
    onEdit?: (id: string) => void;         // Callback para editar app
}

/**
 * Componente AppCard
 * 
 * Renderiza um card interativo para um aplicativo.
 * 
 * Funcionalidades:
 * - Clique no card abre o aplicativo
 * - Hover mostra efeitos visuais
 * - Admins veem botões de editar/excluir
 * 
 * @param app - Dados do aplicativo
 * @param isAdmin - Se o usuário é admin
 * @param onDelete - Função chamada ao deletar
 * @param onEdit - Função chamada ao editar
 */
export const AppCard: React.FC<AppCardProps> = ({ app, isAdmin, onDelete, onEdit }) => {
    const navigate = useNavigate();

    /**
     * Navega para a página de lançamento do aplicativo
     */
    const handleCardClick = () => {
        navigate(`/app/${app.id}`);
    };

    /**
     * Handler para deletar o aplicativo
     * Previne propagação do evento para não abrir o app
     * Solicita confirmação antes de deletar
     */
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // Impede que o clique abra o app
        if (onDelete && window.confirm('Tem certeza que deseja excluir este app?')) {
            onDelete(app.id);
        }
    };

    /**
     * Handler para editar o aplicativo
     * Previne propagação do evento para não abrir o app
     */
    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation(); // Impede que o clique abra o app
        if (onEdit) {
            onEdit(app.id);
        }
    };

    return (
        <div
            onClick={handleCardClick}
            className="group relative bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 border border-slate-700/50 hover:border-primary/40 rounded-2xl p-5 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10 cursor-pointer overflow-hidden"
        >
            {/* Efeito de brilho no hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative flex items-start gap-4">
                {/* Ícone do Aplicativo */}
                <div className="flex-shrink-0">
                    {app.icon_url ? (
                        // Se houver URL de ícone, exibe a imagem
                        <div className="w-14 h-14 rounded-xl bg-slate-700/50 p-2 group-hover:scale-110 transition-transform duration-300">
                            <img src={app.icon_url} alt={app.name} className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        // Se não houver ícone, exibe ícone padrão
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Box className="text-primary" size={28} />
                        </div>
                    )}
                </div>

                {/* Conteúdo: Nome e Descrição */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-lg mb-1 truncate group-hover:text-primary transition-colors">
                        {app.name}
                    </h3>
                    {app.description && (
                        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                            {app.description}
                        </p>
                    )}
                </div>
            </div>

            {/* Botões Admin - aparecem apenas no hover e apenas para admins */}
            {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                    {/* Botão de Editar */}
                    <button
                        onClick={handleEdit}
                        className="bg-blue-500/90 hover:bg-blue-500 text-white p-2 rounded-lg transition-all shadow-lg backdrop-blur-sm hover:scale-110"
                        title="Editar app"
                    >
                        <Edit2 size={14} />
                    </button>
                    {/* Botão de Excluir */}
                    <button
                        onClick={handleDelete}
                        className="bg-red-500/90 hover:bg-red-500 text-white p-2 rounded-lg transition-all shadow-lg backdrop-blur-sm hover:scale-110"
                        title="Excluir app"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            )}

            {/* Indicador de hover na parte inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
        </div>
    );
};
