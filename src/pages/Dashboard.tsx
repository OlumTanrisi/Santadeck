/**
 * Página Dashboard - Dashboard.tsx
 * 
 * Página principal da aplicação onde os usuários visualizam e acessam seus aplicativos.
 * 
 * Funcionalidades:
 * - Exibição de aplicativos em carrossel
 * - Seção separada para links úteis
 * - Adicionar/editar/excluir apps (apenas admins)
 * - Controle de permissões por usuário
 * - Navegação por indicadores (dots)
 * - Scroll horizontal com mouse wheel
 */

import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { AppCard } from '../components/AppCard';
import { Plus, X, ExternalLink, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { logActivity } from '../lib/activity';

/**
 * Interface que define a estrutura de dados de um aplicativo
 */
interface AppData {
    id: string;              // ID único do aplicativo
    name: string;            // Nome do aplicativo
    description: string;     // Descrição do aplicativo
    url: string;             // URL ou caminho do aplicativo
    icon_url?: string;       // URL do ícone (opcional)
    type?: 'web' | 'link' | 'external';   // Tipo: web app, link útil ou app externo
}

/**
 * Componente Dashboard
 * 
 * Página principal que exibe todos os aplicativos disponíveis para o usuário.
 * Admins veem todos os apps e podem gerenciá-los.
 * Usuários comuns veem apenas apps para os quais têm permissão.
 */
export const Dashboard: React.FC = () => {
    // Contexto de autenticação
    const { role, user } = useAuth();

    // Estados principais
    const [apps, setApps] = useState<AppData[]>([]);           // Lista de aplicativos
    const [loading, setLoading] = useState(true);              // Estado de carregamento
    const [showAddModal, setShowAddModal] = useState(false);   // Controle do modal de adicionar

    // Estados do formulário de novo app
    const [newAppName, setNewAppName] = useState('');
    const [newAppDesc, setNewAppDesc] = useState('');
    const [newAppUrl, setNewAppUrl] = useState('');
    const [newAppIcon, setNewAppIcon] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [appType, setAppType] = useState<'web' | 'link' | 'external'>('web');

    // Estados do formulário de edição
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAppId, setEditingAppId] = useState<string | null>(null);
    const [editAppName, setEditAppName] = useState('');
    const [editAppDesc, setEditAppDesc] = useState('');
    const [editAppUrl, setEditAppUrl] = useState('');
    const [editAppIcon, setEditAppIcon] = useState('');
    const [editSelectedFile, setEditSelectedFile] = useState<File | null>(null);
    const [editAppType, setEditAppType] = useState<'web' | 'link' | 'external'>('web');

    // Estados do carrossel
    const [activeIndex, setActiveIndex] = useState(0);                    // Índice do card ativo
    const scrollContainerRef = useRef<HTMLDivElement>(null);              // Referência ao container de scroll

    /**
     * Handler de scroll do carrossel
     * Atualiza o índice ativo baseado na posição do scroll
     */
    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollLeft = container.scrollLeft;
            const cardWidth = container.querySelector('div')?.offsetWidth || 0;
            const gap = 24; // gap-6 = 24px
            const index = Math.round(scrollLeft / (cardWidth + gap));
            setActiveIndex(Math.min(index, myApps.length - 1));
        }

    };

    const scrollToIndex = (index: number) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = container.querySelector('div')?.offsetWidth || 0;
            const gap = 24; // gap-6 = 24px
            container.scrollTo({
                left: index * (cardWidth + gap),
                behavior: 'smooth'
            });
        }
    };

    const uploadIcon = async (file: File) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `icons/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('app-icons')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from('app-icons')
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleEditApp = (appId: string) => {
        const app = apps.find(a => a.id === appId);
        if (app) {
            setEditingAppId(appId);
            setEditAppName(app.name);
            setEditAppDesc(app.description || '');
            setEditAppUrl(app.url);
            setEditAppIcon(app.icon_url || '');
            setEditSelectedFile(null);
            setEditAppType((app.type as any) || 'web');
            setShowEditModal(true);
        }
    };

    const handleUpdateApp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAppId) return;

        try {
            // Buscar dados antigos antes de atualizar
            const oldApp = apps.find(a => a.id === editingAppId);

            let iconUrl = editAppIcon;
            if (editSelectedFile) {
                iconUrl = await uploadIcon(editSelectedFile);
            }

            const { error } = await supabase
                .from('apps')
                .update({
                    name: editAppName,
                    description: editAppDesc,
                    url: editAppUrl,
                    icon_url: iconUrl || null,
                    type: editAppType
                })
                .eq('id', editingAppId);

            if (error) throw error;

            // Log da ação de editar app
            if (user && oldApp) {
                await supabase.from('activity_logs').insert({
                    user_id: user.id,
                    action: 'app_updated',
                    app_id: editingAppId,
                    app_name: editAppName,
                    details: {
                        old_data: {
                            name: oldApp.name,
                            description: oldApp.description,
                            url: oldApp.url,
                            icon_url: oldApp.icon_url,
                            type: oldApp.type
                        },
                        new_data: {
                            name: editAppName,
                            description: editAppDesc,
                            url: editAppUrl,
                            icon_url: iconUrl || null,
                            type: editAppType
                        },
                        timestamp: new Date().toISOString()
                    }
                });
            }

            setShowEditModal(false);
            setEditingAppId(null);
            setEditAppName('');
            setEditAppDesc('');
            setEditAppUrl('');
            setEditAppIcon('');
            setEditSelectedFile(null);
            setEditAppType('web');
            fetchApps();
            toast.success('App atualizado com sucesso!');
        } catch (error) {
            toast.error('Erro ao atualizar app: ' + (error as any).message);
        }
    };

    const fetchApps = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('apps')
                .select('*')
                .order('created_at', { ascending: false });

            if (role !== 'admin' && user) {
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
            let iconUrl = newAppIcon;
            if (selectedFile) {
                iconUrl = await uploadIcon(selectedFile);
            }

            const { error } = await supabase.from('apps').insert([{
                name: newAppName,
                description: newAppDesc,
                url: newAppUrl,
                icon_url: iconUrl || null,
                type: appType
            }]);

            if (error) throw error;

            // Log da ação de adicionar app
            if (user) {
                await supabase.from('activity_logs').insert({
                    user_id: user.id,
                    action: 'app_created',
                    app_name: newAppName,
                    details: {
                        name: newAppName,
                        description: newAppDesc,
                        url: newAppUrl,
                        icon_url: iconUrl || null,
                        type: appType,
                        timestamp: new Date().toISOString()
                    }
                });
            }

            setShowAddModal(false);
            setNewAppName('');
            setNewAppDesc('');
            setNewAppUrl('');
            setNewAppIcon('');
            setSelectedFile(null);
            setAppType('web');
            fetchApps();
            toast.success('App adicionado com sucesso!');
        } catch (error) {
            toast.error('Erro ao adicionar app: ' + (error as any).message);
        }
    };

    const handleDeleteApp = async (appId: string) => {
        try {
            // Buscar dados do app antes de excluir
            const appToDelete = apps.find(app => app.id === appId);

            const { error } = await supabase
                .from('apps')
                .delete()
                .eq('id', appId);

            if (error) throw error;

            // Log da ação de excluir app
            if (user && appToDelete) {
                await supabase.from('activity_logs').insert({
                    user_id: user.id,
                    action: 'app_deleted',
                    app_id: null, // App foi deletado, não podemos referenciar o ID
                    app_name: appToDelete.name,
                    details: {
                        original_app_id: appId, // Salvamos o ID nos detalhes para referência
                        deleted_app: {
                            name: appToDelete.name,
                            description: appToDelete.description,
                            url: appToDelete.url,
                            icon_url: appToDelete.icon_url,
                            type: appToDelete.type
                        },
                        timestamp: new Date().toISOString()
                    }
                });
            }

            setApps(apps.filter(app => app.id !== appId));
            toast.success('Item excluído com sucesso!');
        } catch (error) {
            console.error('Error deleting app:', error);
            toast.error('Erro ao excluir item: ' + (error as any).message);
        }
    };

    const myApps = apps.filter(app => app.type !== 'link');
    const usefulLinks = apps.filter(app => app.type === 'link');

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col h-full">
            <div className="flex-1">
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
                        {myApps.length === 0 ? (
                            <div className="text-gray-400 text-center py-20">
                                {role === 'admin'
                                    ? 'Nenhum aplicativo cadastrado.'
                                    : 'Você não tem acesso a nenhum aplicativo.'}
                            </div>
                        ) : (
                            <>
                                <div
                                    ref={scrollContainerRef}
                                    onScroll={handleScroll}
                                    onWheel={(e) => {
                                        if (scrollContainerRef.current) {
                                            // Se o scroll for vertical, move horizontalmente
                                            if (e.deltaY !== 0) {
                                                // Previne o scroll da página apenas se estiver rolando o carrossel
                                                // e ainda houver conteúdo para rolar
                                                const container = scrollContainerRef.current;
                                                const isAtStart = container.scrollLeft === 0;
                                                const isAtEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth;

                                                if (!(isAtStart && e.deltaY < 0) && !(isAtEnd && e.deltaY > 0)) {
                                                    // Opcional: e.preventDefault() aqui pode ser agressivo, 
                                                    // mas ajuda a focar no carrossel. 
                                                    // Vamos apenas mover o scrollLeft.
                                                    container.scrollLeft += e.deltaY;
                                                }
                                            }
                                        }
                                    }}
                                    className="flex gap-6 overflow-x-auto snap-x snap-proximity pb-8 pt-4 scrollbar-hide px-1"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    {myApps.map(app => (
                                        <div key={app.id} className="w-full sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)] lg:w-[280px] flex-shrink-0 snap-start">
                                            <AppCard
                                                app={app}
                                                isAdmin={role === 'admin'}
                                                onDelete={handleDeleteApp}
                                                onEdit={handleEditApp}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {myApps.length > 1 && (
                                    <div className="flex justify-center gap-2.5 mt-6">
                                        {myApps.map((_, index) => (
                                            <button
                                                key={index}
                                                onClick={() => scrollToIndex(index)}
                                                className={`transition-all duration-300 rounded-full ${index === activeIndex
                                                    ? 'w-10 h-2.5 bg-primary shadow-lg shadow-primary/50'
                                                    : 'w-2.5 h-2.5 bg-white/20 hover:bg-white/40 hover:scale-125'
                                                    }`}
                                                aria-label={`Ir para app ${index + 1}`}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Useful Links Section */}
            {!loading && (usefulLinks.length > 0 || role === 'admin') && (
                <div className="mt-12 pt-8 border-t border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <LinkIcon size={24} className="text-primary" />
                        Links Úteis
                    </h3>

                    {usefulLinks.length === 0 ? (
                        <p className="text-gray-500 text-sm">Nenhum link útil cadastrado.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {usefulLinks.map(link => (
                                <div key={link.id} className="group relative">
                                    <a
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => {
                                            if (user) {
                                                logActivity(user.id, 'app_opened', link.id, link.name, { type: 'link' });
                                            }
                                        }}
                                        className="block bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-primary/50 rounded-lg p-4 transition-all hover:-translate-y-1 hover:shadow-lg h-full"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            {link.icon_url ? (
                                                <img src={link.icon_url} alt={link.name} className="w-6 h-6 object-contain" />
                                            ) : (
                                                <div className="w-6 h-6 bg-slate-700 rounded flex items-center justify-center text-primary">
                                                    <ExternalLink size={14} />
                                                </div>
                                            )}
                                            <span className="font-medium text-white text-sm truncate" title={link.name}>
                                                {link.name}
                                            </span>
                                        </div>
                                        {link.description && (
                                            <p className="text-xs text-gray-400 line-clamp-2">
                                                {link.description}
                                            </p>
                                        )}
                                    </a>
                                    {role === 'admin' && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                if (window.confirm('Tem certeza que deseja excluir este link?')) {
                                                    handleDeleteApp(link.id);
                                                }
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                                            title="Excluir link"
                                        >
                                            <X size={12} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Add App Modal */}
            {showAddModal && role === 'admin' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowAddModal(false)}
                            className="absolute top-3 right-3 text-gray-400 hover:text-white p-3 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                            aria-label="Fechar"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-xl font-bold text-white mb-6 pr-12 pointer-events-none">Novo App</h3>

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
                                <label className="block text-sm text-gray-300 mb-2">Tipo</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${appType === 'web' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-900 border-slate-700 text-gray-400 hover:bg-slate-800'}`}>
                                        <input
                                            type="radio"
                                            name="appType"
                                            value="web"
                                            checked={appType === 'web'}
                                            onChange={() => setAppType('web')}
                                            className="hidden"
                                        />
                                        <span className="font-medium text-sm">App Web</span>
                                    </label>
                                    <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${appType === 'link' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-900 border-slate-700 text-gray-400 hover:bg-slate-800'}`}>
                                        <input
                                            type="radio"
                                            name="appType"
                                            value="link"
                                            checked={appType === 'link'}
                                            onChange={() => setAppType('link')}
                                            className="hidden"
                                        />
                                        <span className="font-medium text-sm">Link Útil</span>
                                    </label>
                                    <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${appType === 'external' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-900 border-slate-700 text-gray-400 hover:bg-slate-800'}`}>
                                        <input
                                            type="radio"
                                            name="appType"
                                            value="external"
                                            checked={appType === 'external'}
                                            onChange={() => setAppType('external')}
                                            className="hidden"
                                        />
                                        <span className="font-medium text-sm">App Externo</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">
                                    URL
                                </label>
                                <input
                                    type="text"
                                    value={newAppUrl}
                                    onChange={e => setNewAppUrl(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="https://..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Ícone do Aplicativo</label>
                                <div
                                    className="group relative w-full h-32 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center transition-all hover:border-primary/50 hover:bg-slate-800/50 cursor-pointer overflow-hidden"
                                    onClick={() => document.getElementById('new-icon-upload')?.click()}
                                >
                                    {selectedFile || newAppIcon ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <img
                                                src={selectedFile ? URL.createObjectURL(selectedFile) : newAppIcon}
                                                className="w-16 h-16 object-contain rounded-lg shadow-lg"
                                                alt="Preview"
                                            />
                                            <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                                {selectedFile ? selectedFile.name : 'Ícone por URL'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedFile(null);
                                                    setNewAppIcon('');
                                                }}
                                                className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full text-white hover:bg-red-600 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-primary transition-colors text-center px-4">
                                            <Plus size={32} />
                                            <span className="text-sm font-medium">Clique para subir PNG</span>
                                            <span className="text-xs text-gray-600">ou arraste um arquivo aqui</span>
                                        </div>
                                    )}
                                    <input
                                        id="new-icon-upload"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                </div>
                                {!selectedFile && !newAppIcon && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const url = window.prompt('Insira a URL do ícone:');
                                            if (url) setNewAppIcon(url);
                                        }}
                                        className="mt-2 text-xs text-primary hover:underline"
                                    >
                                        Preferir usar uma URL externa?
                                    </button>
                                )}
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

            {/* Edit App Modal */}
            {showEditModal && role === 'admin' && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X size={24} />
                        </button>

                        <h3 className="text-xl font-bold text-white mb-6">Editar Item</h3>

                        <form onSubmit={handleUpdateApp} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Nome</label>
                                <input
                                    type="text"
                                    value={editAppName}
                                    onChange={e => setEditAppName(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">Descrição</label>
                                <input
                                    type="text"
                                    value={editAppDesc}
                                    onChange={e => setEditAppDesc(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Tipo</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${editAppType === 'web' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-900 border-slate-700 text-gray-400 hover:bg-slate-800'}`}>
                                        <input
                                            type="radio"
                                            name="editAppType"
                                            value="web"
                                            checked={editAppType === 'web'}
                                            onChange={() => setEditAppType('web')}
                                            className="hidden"
                                        />
                                        <span className="font-medium text-sm">App Web</span>
                                    </label>
                                    <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${editAppType === 'link' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-900 border-slate-700 text-gray-400 hover:bg-slate-800'}`}>
                                        <input
                                            type="radio"
                                            name="editAppType"
                                            value="link"
                                            checked={editAppType === 'link'}
                                            onChange={() => setEditAppType('link')}
                                            className="hidden"
                                        />
                                        <span className="font-medium text-sm">Link Útil</span>
                                    </label>
                                    <label className={`flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${editAppType === 'external' ? 'bg-primary/20 border-primary text-white' : 'bg-slate-900 border-slate-700 text-gray-400 hover:bg-slate-800'}`}>
                                        <input
                                            type="radio"
                                            name="editAppType"
                                            value="external"
                                            checked={editAppType === 'external'}
                                            onChange={() => setEditAppType('external')}
                                            className="hidden"
                                        />
                                        <span className="font-medium text-sm">App Externo</span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-1">
                                    URL
                                </label>
                                <input
                                    type="text"
                                    value={editAppUrl}
                                    onChange={e => setEditAppUrl(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="https://..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-300 mb-2">Ícone do Aplicativo</label>
                                <div
                                    className="group relative w-full h-32 bg-slate-900 border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center transition-all hover:border-primary/50 hover:bg-slate-800/50 cursor-pointer overflow-hidden"
                                    onClick={() => document.getElementById('edit-icon-upload')?.click()}
                                >
                                    {editSelectedFile || editAppIcon ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <img
                                                src={editSelectedFile ? URL.createObjectURL(editSelectedFile) : editAppIcon}
                                                className="w-16 h-16 object-contain rounded-lg shadow-lg"
                                                alt="Preview"
                                            />
                                            <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                                {editSelectedFile ? editSelectedFile.name : 'Ícone atual'}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setEditSelectedFile(null);
                                                    setEditAppIcon('');
                                                }}
                                                className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full text-white hover:bg-red-600 transition-colors"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-primary transition-colors text-center px-4">
                                            <Plus size={32} />
                                            <span className="text-sm font-medium">Clique para subir PNG</span>
                                            <span className="text-xs text-gray-600">ou arraste um arquivo aqui</span>
                                        </div>
                                    )}
                                    <input
                                        id="edit-icon-upload"
                                        type="file"
                                        accept="image/png,image/jpeg,image/webp"
                                        onChange={e => setEditSelectedFile(e.target.files?.[0] || null)}
                                        className="hidden"
                                    />
                                </div>
                                {!editSelectedFile && !editAppIcon && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const url = window.prompt('Insira a URL do ícone:');
                                            if (url) setEditAppIcon(url);
                                        }}
                                        className="mt-2 text-xs text-primary hover:underline"
                                    >
                                        Preferir usar uma URL externa?
                                    </button>
                                )}
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                >
                                    Atualizar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
