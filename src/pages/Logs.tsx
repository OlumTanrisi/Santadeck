import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, User, Clock, Monitor } from 'lucide-react';

interface ActivityLog {
    id: string;
    user_id: string;
    action: string;
    app_id: string | null;
    app_name: string | null;
    details: any;
    created_at: string;
    user_name?: string;
    profiles: { full_name: string } | null; // Add profiles to the interface for type safety
}

export const Logs: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'app_opened' | 'user_login'>('all');

    useEffect(() => {
        fetchLogs();
    }, [filter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);

            // Fetch logs with user information
            let query = supabase
                .from('activity_logs')
                .select(`
                    *,
                    profiles:user_id (
                        full_name
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(100);

            if (filter !== 'all') {
                query = query.eq('action', filter);
            }

            const { data, error } = await query;

            if (error) throw error;

            // Transform data to include user name
            const logsWithUserNames = data?.map(log => ({
                ...log,
                user_name: log.profiles?.full_name || 'Usuário Desconhecido'
            })) || [];

            setLogs(logsWithUserNames);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionLabel = (action: string) => {
        switch (action) {
            case 'app_opened':
                return 'Abriu Aplicativo';
            case 'user_login':
                return 'Login';
            case 'user_logout':
                return 'Logout';
            default:
                return action;
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'app_opened':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/50';
            case 'user_login':
                return 'bg-green-500/20 text-green-300 border-green-500/50';
            case 'user_logout':
                return 'bg-orange-500/20 text-orange-300 border-orange-500/50';
            default:
                return 'bg-gray-500/20 text-gray-300 border-gray-500/50';
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).format(date);
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <FileText size={32} className="text-primary" />
                    <h2 className="text-3xl font-bold text-white">Logs de Atividade</h2>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFilter('app_opened')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'app_opened'
                            ? 'bg-primary text-white'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            }`}
                    >
                        Apps Abertos
                    </button>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                {loading ? (
                    <div className="text-center text-gray-400 py-12">Carregando logs...</div>
                ) : logs.length === 0 ? (
                    <div className="text-center text-gray-400 py-12">Nenhum log encontrado.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-900/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Usuário
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Ação
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Aplicativo
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Data/Hora
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <User size={16} className="text-gray-500" />
                                                <span className="text-sm text-white font-medium">
                                                    {log.user_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)}`}>
                                                {getActionLabel(log.action)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.app_name ? (
                                                <div className="flex items-center gap-2">
                                                    <Monitor size={16} className="text-gray-500" />
                                                    <span className="text-sm text-gray-300">{log.app_name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-gray-500">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <Clock size={16} className="text-gray-500" />
                                                <span className="text-sm text-gray-400">{formatDate(log.created_at)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
