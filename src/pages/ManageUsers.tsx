import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, ArrowLeft, Edit, Trash2, Power, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
    id: string;
    full_name: string;
    role: string;
    is_active: boolean;
}

export const ManageUsers: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name');

            if (error) throw error;
            setUsers(profiles || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!window.confirm(`Tem certeza que deseja EXCLUIR permanentemente o usuário "${userName}"? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            const { error } = await supabase.rpc('delete_user_by_admin', { target_user_id: userId });
            if (error) throw error;

            setUsers(users.filter(u => u.id !== userId));
            alert('Usuário excluído com sucesso.');
        } catch (error: any) {
            console.error('Error deleting user:', error);
            alert('Erro ao excluir usuário: ' + error.message);
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ is_active: !currentStatus })
                .eq('id', userId);

            if (error) throw error;

            setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
        } catch (error: any) {
            console.error('Error updating status:', error);
            alert('Erro ao atualizar status: ' + error.message);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    Voltar ao Dashboard
                </button>
                <button
                    onClick={() => navigate('/create-user')}
                    className="bg-primary hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors shadow-lg flex items-center gap-2"
                >
                    <Users size={20} />
                    Novo Usuário
                </button>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <Users size={32} className="text-primary" />
                    <h2 className="text-3xl font-bold text-white">Gerenciar Usuários</h2>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-12">Carregando usuários...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-xs uppercase bg-slate-900/50 text-gray-400">
                                <tr>
                                    <th className="px-6 py-3 rounded-tl-lg">Nome</th>
                                    <th className="px-6 py-3">Função</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 rounded-tr-lg text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-white">
                                            {user.full_name || 'Sem nome'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'admin'
                                                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/50'
                                                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                                                }`}>
                                                {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleStatus(user.id, user.is_active)}
                                                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-colors ${user.is_active !== false
                                                        ? 'bg-green-500/20 text-green-300 border border-green-500/50 hover:bg-green-500/30'
                                                        : 'bg-red-500/20 text-red-300 border border-red-500/50 hover:bg-red-500/30'
                                                    }`}
                                                title={user.is_active !== false ? "Clique para inativar" : "Clique para ativar"}
                                            >
                                                {user.is_active !== false ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                                {user.is_active !== false ? 'Ativo' : 'Inativo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/edit-user/${user.id}`)}
                                                    className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleToggleStatus(user.id, user.is_active)}
                                                    className={`p-2 rounded-lg transition-colors ${user.is_active !== false
                                                            ? 'text-orange-400 hover:text-orange-300 hover:bg-orange-500/10'
                                                            : 'text-green-400 hover:text-green-300 hover:bg-green-500/10'
                                                        }`}
                                                    title={user.is_active !== false ? "Inativar" : "Ativar"}
                                                >
                                                    <Power size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.full_name)}
                                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    title="Excluir Permanentemente"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
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
