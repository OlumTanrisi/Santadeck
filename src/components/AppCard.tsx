import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Trash2, Edit2 } from 'lucide-react';

interface AppData {
    id: string;
    name: string;
    description: string;
    icon_url?: string;
}

interface AppCardProps {
    app: AppData;
    isAdmin?: boolean;
    onDelete?: (id: string) => void;
    onEdit?: (id: string) => void;
}

export const AppCard: React.FC<AppCardProps> = ({ app, isAdmin, onDelete, onEdit }) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/app/${app.id}`);
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onDelete && window.confirm('Tem certeza que deseja excluir este app?')) {
            onDelete(app.id);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
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
                {/* Ícone */}
                <div className="flex-shrink-0">
                    {app.icon_url ? (
                        <div className="w-14 h-14 rounded-xl bg-slate-700/50 p-2 group-hover:scale-110 transition-transform duration-300">
                            <img src={app.icon_url} alt={app.name} className="w-full h-full object-contain" />
                        </div>
                    ) : (
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Box className="text-primary" size={28} />
                        </div>
                    )}
                </div>

                {/* Conteúdo */}
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

            {/* Botões Admin - aparecem no hover */}
            {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0">
                    <button
                        onClick={handleEdit}
                        className="bg-blue-500/90 hover:bg-blue-500 text-white p-2 rounded-lg transition-all shadow-lg backdrop-blur-sm hover:scale-110"
                        title="Editar app"
                    >
                        <Edit2 size={14} />
                    </button>
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
