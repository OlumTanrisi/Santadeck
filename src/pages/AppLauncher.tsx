import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';

interface AppData {
    id: string;
    name: string;
    url: string;
}

export const AppLauncher: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [app, setApp] = useState<AppData | null>(null);
    const [loading, setLoading] = useState(true);
    const [key, setKey] = useState(0); // To force iframe reload

    useEffect(() => {
        const fetchApp = async () => {
            if (!id) return;
            try {
                const { data, error } = await supabase
                    .from('apps')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (error) throw error;
                setApp(data);
            } catch (error) {
                console.error('Error fetching app:', error);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchApp();
    }, [id, navigate]);

    if (loading) return <div className="text-white text-center py-20">Carregando aplicativo...</div>;
    if (!app) return null;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">Voltar</span>
                    </button>
                    <div className="h-6 w-px bg-slate-600 mx-2"></div>
                    <h2 className="text-lg font-bold text-white">{app.name}</h2>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setKey(k => k + 1)}
                        className="p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Recarregar"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <a
                        href={app.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                        title="Abrir em nova aba"
                    >
                        <ExternalLink size={18} />
                    </a>
                </div>
            </div>

            <div className="flex-1 bg-white rounded-xl overflow-hidden shadow-2xl relative">
                <iframe
                    key={key}
                    src={app.url}
                    title={app.name}
                    className="w-full h-full border-0"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                />
            </div>
        </div>
    );
};
