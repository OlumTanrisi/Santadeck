import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from 'lucide-react';

interface AppData {
    id: string;
    name: string;
    description: string;
    icon_url?: string;
}

interface AppCardProps {
    app: AppData;
}

export const AppCard: React.FC<AppCardProps> = ({ app }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/app/${app.id}`)}
            className="group bg-gradient-to-br from-red-950/50 to-slate-900/50 backdrop-blur-sm border border-red-900/30 hover:border-red-500/50 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-red-900/20 hover:-translate-y-1 flex flex-col items-center text-center gap-4"
        >
            <div className="w-20 h-20 bg-red-900/20 rounded-2xl flex items-center justify-center p-4 group-hover:bg-red-800/30 transition-colors border border-red-900/20">
                {app.icon_url ? (
                    <img src={app.icon_url} alt={app.name} className="w-full h-full object-contain drop-shadow-md" />
                ) : (
                    <Box className="w-10 h-10 text-red-200 group-hover:text-white transition-colors" />
                )}
            </div>

            <div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-red-400 transition-colors">{app.name}</h3>
                <p className="text-sm text-gray-400 line-clamp-2 group-hover:text-gray-300">{app.description}</p>
            </div>
        </div>
    );
};
