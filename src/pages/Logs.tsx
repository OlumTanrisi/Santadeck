import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, ArrowLeft, User, Clock, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface LogEntry {
    id: string;
    created_at: string;
    user_email: string;
    action: string;
    details?: string;
}

export const Logs: React.FC = () => {
    const navigate = useNavigate();
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            // For now, we'll create a simple logs display
            // In a real implementation, you would fetch from a logs table
            const { data: { user } } = await supabase.auth.getUser();

            // Mock logs for demonstration
            const mockLogs: LogEntry[] = [
                {
                    id: '1',
                    created_at: new Date().toISOString(),
                    user_email: user?.email || 'unknown',
                    action: 'Login',
                    details: 'Usuário fez login no sistema'
                },
                {
                    id: '2',
                    created_at: new Date(Date.now() - 3600000).toISOString(),
                    user_email: user?.email || 'unknown',
                    action: 'Visualizou Dashboard',
                    details: 'Acessou a página principal'
                }
            ];

            setLogs(mockLogs);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Voltar ao Dashboard
            </button>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <FileText size={32} className="text-primary" />
                    <h2 className="text-3xl font-bold text-white">Logs do Sistema</h2>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-12">
                        Carregando logs...
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">
                        Nenhum log encontrado
                    </div>
                ) : (
                    <div className="space-y-3">
                        {logs.map((log) => (
                            <div
                                key={log.id}
                                className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <Activity size={18} className="text-primary" />
                                            <h3 className="text-white font-semibold">{log.action}</h3>
                                        </div>

                                        {log.details && (
                                            <p className="text-gray-400 text-sm mb-2 ml-7">
                                                {log.details}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-4 ml-7 text-xs text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <User size={14} />
                                                <span>{log.user_email}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                <span>{formatDate(log.created_at)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
