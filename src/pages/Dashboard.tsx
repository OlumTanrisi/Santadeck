import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { AppCard } from '../components/AppCard';
import { Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AppData {
    id: string;
    name: string;
    description: string;
    url: string;
    icon_url?: string;
}

export const Dashboard: React.FC = () => {
    const { role, user } = useAuth();
    const [apps, setApps] = useState<AppData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);

    // New App Form State
    const [newAppName, setNewAppName] = useState('');
    const [newAppDesc, setNewAppDesc] = useState('');
    const [newAppUrl, setNewAppUrl] = useState('');
    const [newAppIcon, setNewAppIcon] = useState('');
    const [appType, setAppType] = useState<'web' | 'network'>('web');

    const fetchApps = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('apps')
                .select('*')
                .order('created_at', { ascending: false });

            if (role !== 'admin' && user) {
                // For regular users, filter by permissions
                // We can't easily do a join with permissions in a simple select if RLS is strict,
                // but we can use the `user_app_permissions` table to get allowed IDs.
                // Or, if we set up RLS on `apps` table correctly, we could just select *.
                // However, the current RLS on `apps` (if any) might not be set up for this specific logic yet.
                // Let's assume we need to fetch permissions first or use a join.

                // Better approach: Fetch permissions for this user and then fetch those apps.
                const { data: permissions, error: permError } = await supabase
                    .from('user_app_permissions')
                    .select('app_id')
                    .eq('user_id', user.id);

                if (permError) throw permError;

                const appIds = permissions.map(p => p.app_id);

                if (appIds.length === 0) {
                    setApps([]);
                    setLoading(false);
                    return;
                }

                query = supabase
                    .from('apps')
                    .select('*')
                    .in('id', appIds)
                    .order('created_at', { ascending: false });
            }

            const { data, error } = await query;

            if (error) throw error;
            setApps(data || []);
        } catch (error) {
            console.error('Error fetching apps:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchApps();
        }
    }, [user, role]);

    const handleAddApp = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { error } = await supabase.from('apps').insert([{
                name: newAppName,
                description: newAppDesc,
                url: newAppUrl,
                icon_url: newAppIcon || null
            }]);

            if (error) throw error;

            setShowAddModal(false);
            setNewAppName('');
            setNewAppDesc('');
            setNewAppUrl('');
            setNewAppIcon('');
            setAppType('web');
            fetchApps();
        } catch (error) {
            alert('Erro ao adicionar app: ' + (error as any).message);
        }
    };

    const handleDeleteApp = async (appId: string) => {
        try {
            const { error } = await supabase
                .from('apps')
                .delete()
                .eq('id', appId);

            if (error) throw error;

            setApps(apps.filter(app => app.id !== appId));
            alert('Aplicativo excluído com sucesso!');
        } catch (error) {
            console.error('Error deleting app:', error);
            alert('Erro ao excluir aplicativo: ' + (error as any).message);
        }
    };

    return (
        <div className="w-full max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">Meus Aplicativos</h2>
                {role === 'admin' && (
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg"
                    >
                        <Plus size={20} />
                        Adicionar App
                    </button>
                )}
            </div>

            {loading ? (
                <div className="text-white text-center py-20">Carregando apps...</div>
            ) : (
                <>
                    {apps.length === 0 ? (
                        <div className="text-gray-400 text-center py-20">
                            {role === 'admin'
                                ? 'Nenhum aplicativo cadastrado.'
                                : 'Você não tem acesso a nenhum aplicativo. Contate o administrador.'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {apps.map(app => (
                                <AppCard
                                    key={app.id}
                                    app={app}
                                    isAdmin={role === 'admin'}
                                    onDelete={handleDeleteApp}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Add App Modal */}
            {showAddModal && role === 'admin' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-xl font-bold text-white mb-6">Novo Aplicativo</h3>

                        <form onSubmit={handleAddApp} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={newAppName}
                                    onChange={e => setNewAppName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    value={newAppDesc}
                                    onChange={e => setNewAppDesc(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Tipo de Aplicativo</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="appType"
                                            value="web"
                                            checked={appType === 'web'}
                                            onChange={() => setAppType('web')}
                                            className="text-primary focus:ring-primary"
                                        />
                                        <span className="text-gray-300">Web (URL)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="appType"
                                            value="network"
                                            checked={appType === 'network'}
                                            onChange={() => setAppType('network')}
                                            className="text-primary focus:ring-primary"
                                        />
                                        <span className="text-gray-300">Rede (Executável)</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">
                                    {appType === 'web' ? 'URL do App' : 'Caminho de Rede'}
                                </label>
                                <input
                                    type="text"
                                    value={newAppUrl}
                                    onChange={e => setNewAppUrl(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder={appType === 'web' ? 'https://...' : '\\\\servidor.local\\projeto$\\apps\\inventario.exe'}
                                    required
                                />
                                {appType === 'network' && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Exemplo: \\servidor.local\projeto$\apps\inventario.exe
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">URL do Ícone (Opcional)</label>
                                <input
                                    type="url"
                                    value={newAppIcon}
                                    onChange={e => setNewAppIcon(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-primary hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Salvar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
