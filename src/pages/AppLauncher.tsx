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
                            <a
                                href={app.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-gray-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                title="Abrir em nova aba"
                            >
                                <ExternalLink size={18} />
                            </a>
                        </>
                    )}
                </div>
            </div>

            <div className="flex-1 bg-slate-800/50 rounded-xl overflow-hidden shadow-2xl relative border border-slate-700">
                {isNetwork ? (
                    <div className="flex items-center justify-center h-full p-8">
                        <div className="max-w-2xl w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 text-center">
                            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FolderOpen size={40} className="text-blue-400" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-4">Aplicativo de Rede</h3>
                            <p className="text-gray-400 mb-6">
                                Este aplicativo está localizado em uma pasta de rede. Siga os passos abaixo:
                            </p>

                            <div className="bg-slate-900 border border-slate-600 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-400 mb-3 font-semibold">Caminho do aplicativo:</p>
                                <div className="flex items-center justify-between gap-4 mb-4">
                                    <code className="text-sm text-green-400 break-all flex-1 text-left bg-slate-950 p-3 rounded border border-slate-700">
                                        {app.url}
                                    </code>
                                    <button
                                        onClick={handleCopyPath}
                                        className="flex items-center gap-2 px-4 py-3 bg-primary hover:bg-red-700 text-white rounded-lg transition-colors whitespace-nowrap font-medium"
                                    >
                                        {copied ? (
                                            <>
                                                <CheckCircle size={18} />
                                                Copiado!
                                            </>
                                        ) : (
                                            <>
                                                <Copy size={18} />
                                                Copiar Caminho
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 text-left mb-6">
                                <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0 mt-1">1</span>
                                        <div className="flex-1">
                                            <h4 className="text-white font-semibold mb-2">Copie o caminho</h4>
                                            <p className="text-gray-400 text-sm">Clique no botão "Copiar Caminho" acima</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0 mt-1">2</span>
                                        <div className="flex-1">
                                            <h4 className="text-white font-semibold mb-2">Abra o "Executar" do Windows</h4>
                                            <p className="text-gray-400 text-sm mb-2">Pressione <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Win</kbd> + <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">R</kbd></p>
                                            <p className="text-gray-500 text-xs">Ou pesquise por "Executar" no menu Iniciar</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <span className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0 mt-1">3</span>
                                        <div className="flex-1">
                                            <h4 className="text-white font-semibold mb-2">Cole e execute</h4>
                                            <p className="text-gray-400 text-sm mb-2">Cole o caminho (<kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">V</kbd>) e pressione <kbd className="px-2 py-1 bg-slate-700 rounded text-xs">Enter</kbd></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <p className="text-blue-300 text-sm font-semibold mb-2">💡 Dica Rápida:</p>
                                <p className="text-gray-400 text-sm">
                                    Você também pode colar o caminho diretamente na barra de endereços do Explorador de Arquivos (Win + E).
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="w-full h-full bg-white">
                        <iframe
                            key={key}
                            src={app.url}
                            title={app.name}
                            className="w-full h-full border-0"
                            sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
