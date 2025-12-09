import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { FileText, User, Clock, Monitor, Link as LinkIcon, Trash2, Search, Calendar, X } from 'lucide-react';

interface ActivityLog {
    id: string;
    user_id: string;
    action: string;
    app_id: string | null;
    app_name: string | null;
    details: any;
    created_at: string;
    user_name?: string;
    department_name?: string;
    profiles: {
        full_name: string;
        departments?: {
            name: string;
        };
    } | null;
}

export const Logs: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'app_opened' | 'user_login' | 'app_audit' | 'user_audit'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    useEffect(() => {
        fetchLogs();
    }, [filter, dateFilter]);

    const fetchLogs = async () => {
        try {
            setLoading(true);

            // Fetch logs with user and department information
            let query = supabase
                .from('activity_logs')
                .select(`
                    *,
                    profiles:user_id (
                        full_name,
                        departments (
                            name
                        )
                    )
                `)
                .order('created_at', { ascending: false })
                .limit(500);

            if (filter !== 'all') {
                if (filter === 'app_audit') {
                    query = query.in('action', ['app_created', 'app_updated', 'app_deleted']);
                } else if (filter === 'user_audit') {
                    query = query.in('action', ['user_created', 'user_deleted', 'user_login', 'user_logout']);
                } else {
                    query = query.eq('action', filter);
                }
            }

            if (dateFilter) {
                const [year, month, day] = dateFilter.split('-').map(Number);

                // Create dates in local time
                const startDate = new Date(year, month - 1, day);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(year, month - 1, day);
                endDate.setHours(23, 59, 59, 999);

                query = query
                    .gte('created_at', startDate.toISOString())
                    .lte('created_at', endDate.toISOString());
            }

            const { data, error } = await query;

            if (error) throw error;

            // Transform data to include user name and department
            const logsWithUserNames = data?.map(log => ({
                ...log,
                user_name: log.profiles?.full_name || 'Usuário Desconhecido',
                department_name: log.profiles?.departments?.name || 'Sem setor'
            })) || [];

            setLogs(logsWithUserNames);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionLabel = (log: ActivityLog) => {
        const action = log.action;
        const details = log.details || {};

        // Determinar o tipo do item (app ou link)
        let type = 'web'; // default
        if (action === 'app_created') type = details.type;
        else if (action === 'app_updated') type = details.new_data?.type;
        else if (action === 'app_deleted') type = details.deleted_app?.type;

        const isLink = type === 'link';
        const itemLabel = isLink ? 'Link' : 'App';

        switch (action) {
            case 'app_opened':
                return 'Abriu Aplicativo';
            case 'user_login':
                return 'Login';
            case 'user_logout':
                return 'Logout';
            case 'app_created':
                return `${itemLabel} Criado`;
            case 'app_updated':
                return `${itemLabel} Atualizado`;
            case 'app_deleted':
                return `${itemLabel} Excluído`;
            case 'user_created':
                return 'Usuário Criado';
            case 'user_deleted':
                return 'Usuário Excluído';
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
            case 'app_created':
                return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50';
            case 'app_updated':
                return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50';
            case 'app_deleted':
                return 'bg-red-500/20 text-red-300 border-red-500/50';
            case 'user_created':
                return 'bg-purple-500/20 text-purple-300 border-purple-500/50';
            case 'user_deleted':
                return 'bg-red-500/20 text-red-300 border-red-500/50';
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

    const filteredLogs = logs.filter(log => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            log.user_name?.toLowerCase().includes(term) ||
            log.department_name?.toLowerCase().includes(term)
        );
    });

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <FileText size={32} className="text-primary" />
                    <h2 className="text-3xl font-bold text-white">Logs de Atividade</h2>
                </div>

                <div className="flex gap-2 flex-wrap">
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
                        onClick={() => setFilter('user_audit')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'user_audit'
                            ? 'bg-primary text-white'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            }`}
                    >
                        Usuários
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
                    <button
                        onClick={() => setFilter('app_audit')}
                        className={`px-4 py-2 rounded-lg transition-colors ${filter === 'app_audit'
                            ? 'bg-primary text-white'
                            : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            }`}
                    >
                        Auditoria de Apps
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nome ou setor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-primary placeholder-gray-500"
                    />
                </div>

                <div className="flex gap-4">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-primary [color-scheme:dark]"
                        />
                    </div>

                    {(searchTerm || dateFilter) && (
                        <button
                            onClick={() => { setSearchTerm(''); setDateFilter(''); }}
                            className="flex items-center gap-2 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                            <X size={20} />
                            <span className="hidden md:inline">Limpar</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
                {loading ? (
                    <div className="text-center text-gray-400 py-12">Carregando logs...</div>
                ) : filteredLogs.length === 0 ? (
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
                                        Setor
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
                                {filteredLogs.map((log) => (
                                    <React.Fragment key={log.id}>
                                        <tr
                                            className={`hover:bg-slate-700/30 transition-colors ${(log.action === 'user_created' || log.action === 'user_deleted') ? 'cursor-pointer' : ''}`}
                                            onClick={() => {
                                                if (log.action === 'user_created' || log.action === 'user_deleted') {
                                                    setExpandedLogId(expandedLogId === log.id ? null : log.id);
                                                }
                                            }}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <User size={16} className="text-gray-500" />
                                                    <span className="text-sm text-white font-medium">
                                                        {log.user_name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-400">
                                                    {log.department_name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${getActionColor(log.action)} ${(log.action === 'user_created' || log.action === 'user_deleted') ? 'cursor-pointer' : ''}`}
                                                >
                                                    {getActionLabel(log)}
                                                    {(log.action === 'user_created' || log.action === 'user_deleted') && (
                                                        <span className="ml-1 text-[10px]">🔍</span>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {log.app_name ? (
                                                    <div className="flex items-center gap-2">
                                                        {log.action === 'app_deleted' ? (
                                                            <Trash2 size={16} className="text-red-400" />
                                                        ) : log.details?.type === 'link' || log.details?.new_data?.type === 'link' ? (
                                                            <LinkIcon size={16} className="text-blue-400" />
                                                        ) : (
                                                            <Monitor size={16} className="text-gray-500" />
                                                        )}
                                                        <span className={`text-sm ${log.action === 'app_deleted' ? 'text-red-400 line-through' : 'text-gray-300'}`}>
                                                            {log.app_name}
                                                        </span>
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
                                        {/* Linha expandida com detalhes */}
                                        {expandedLogId === log.id && (log.action === 'user_created' || log.action === 'user_deleted') && (
                                            <tr className="bg-slate-900/50">
                                                <td colSpan={5} className="px-6 py-4">
                                                    <div className="flex items-center gap-4 text-sm">
                                                        <span className="text-gray-500 font-medium">Detalhes:</span>
                                                        {log.action === 'user_created' && log.details && (
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-purple-300">
                                                                    <strong>Usuário criado:</strong> {log.details.created_user_name}
                                                                </span>
                                                                <span className="text-gray-400">
                                                                    <strong>Email:</strong> {log.details.created_user_email}
                                                                </span>
                                                            </div>
                                                        )}
                                                        {log.action === 'user_deleted' && log.details && (
                                                            <div className="flex items-center gap-4">
                                                                <span className="text-red-300">
                                                                    <strong>Usuário excluído:</strong> {log.details.deleted_user_name}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
