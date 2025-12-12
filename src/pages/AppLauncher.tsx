import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowLeft, ExternalLink, RefreshCw, FolderOpen, Copy, CheckCircle } from 'lucide-react';

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
    const [key, setKey] = useState(0);
    const [copied, setCopied] = useState(false);

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

                // Log the app access
                const { data: { user } } = await supabase.auth.getUser();
                if (user && data) {
                    await supabase.from('activity_logs').insert({
                        user_id: user.id,
                        action: 'app_opened',
                        app_id: data.id,
                        app_name: data.name,
                        details: {
                            url: data.url,
                            timestamp: new Date().toISOString()
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching app:', error);
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };

        fetchApp();
    }, [id, navigate]);

    const isNetworkPath = (url: string) => {
        return url.startsWith('\\\\') || url.startsWith('//');
    };

    const handleCopyPath = () => {
        if (app) {
            navigator.clipboard.writeText(app.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (loading) return <div className="text-white text-center py-20">Carregando aplicativo...</div>;
    if (!app) return null;

    const isNetwork = isNetworkPath(app.url);

    return (
        <div className="flex flex-col h-full min-h-[80vh]">
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
                    {!isNetwork && (
                        <>
                            <button
                                onClick={() => setKey(k => k + 1)}
                                className="p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                title="Recarregar"
                            >
                                <RefreshCw size={18} />
                            </button>
                        </>
                    )}
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

            <div className="flex-1 bg-slate-800/50 rounded-xl overflow-hidden shadow-2xl relative border border-slate-700">
                {isNetwork ? (
                    <div className="flex items-center justify-center h-full p-4 overflow-y-auto">
                        <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-xl p-6 text-center">
                            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FolderOpen className="w-8 h-8 text-blue-400" />
                            </div>

                            <h3 className="text-lg font-bold text-white mb-2">Aplicativo de Rede</h3>
                            <p className="text-sm text-gray-400 mb-4">
                                Siga os passos abaixo para executar:
                            </p>

                            <div className="bg-slate-900 border border-slate-600 rounded-lg p-3 mb-4">
                                <p className="text-xs text-gray-400 mb-2 font-medium">Caminho:</p>
                                <div className="flex flex-col gap-2">
                                    <code className="text-xs text-green-400 break-all text-left bg-slate-950 p-2 rounded border border-slate-700">
                                        {app.url}
                                    </code>
                                    <button
                                        onClick={handleCopyPath}
                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm"
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle size={16} />
                                                Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={16} />
                                                Copiar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-left mb-4">
                                <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0 text-xs">1</span>
                                        <p className="text-xs text-gray-400 flex-1">Copie o caminho acima</p>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0 text-xs">2</span>
                                        <p className="text-xs text-gray-400 flex-1">Pressione <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs">Win+R</kbd></p>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <span className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0 text-xs">3</span>
                                        <p className="text-xs text-gray-400 flex-1">Cole e pressione Enter</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full bg-white relative">
                        <iframe
                            key={key}
                            src={app.url}
                            title={app.name}
                            className="w-full h-full border-0"
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
