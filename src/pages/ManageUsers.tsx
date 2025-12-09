import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, ArrowLeft, Edit, Trash2, Power, CheckCircle, XCircle, Key, ChevronDown, Filter, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    role: string;
    is_active: boolean;
    department_id?: string;
    departments?: {
        name: string;
    };
}

interface Department {
    id: string;
    name: string;
}

export const ManageUsers: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]); // Todos os usuários (sem filtro)
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [changingPassword, setChangingPassword] = useState<string | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    useEffect(() => {
        fetchDepartments();
        fetchUsers();
    }, []);

    // Filtrar usuários quando o departamento selecionado mudar
    useEffect(() => {
        if (selectedDepartment === 'all') {
            setUsers(allUsers);
        } else {
            setUsers(allUsers.filter(u => u.department_id === selectedDepartment));
        }
    }, [selectedDepartment, allUsers]);

    const fetchDepartments = async () => {
        try {
            const { data, error } = await supabase
                .from('departments')
                .select('id, name')
                .order('name');

            if (error) throw error;
            setDepartments(data || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            console.log('Tentando buscar usuários com RPC...');

            // Tentar usar função RPC primeiro
            const { data, error } = await supabase.rpc('get_users_with_emails');

            if (error) {
                console.error('Erro na RPC get_users_with_emails:', error);

                // FALLBACK: Buscar sem emails se a RPC falhar
                console.log('Usando fallback: buscando sem RPC...');
                const { data: profiles, error: profilesError } = await supabase
                    .from('profiles')
                    .select(`
                        id,
                        full_name,
                        role,
                        is_active,
                        department_id,
                        departments (
                            name
                        )
                    `)
                    .order('full_name');

                if (profilesError) throw profilesError;

                // Mapear sem emails (temporário)
                const mappedUsers = (profiles || []).map((profile: any) => ({
                    id: profile.id,
                    email: 'Email indisponível',
                    full_name: profile.full_name,
                    role: profile.role,
                    is_active: profile.is_active,
                    department_id: profile.department_id,
                    departments: profile.departments
                }));

                setAllUsers(mappedUsers);
                setUsers(mappedUsers);
                console.log('Usuários carregados (sem emails):', mappedUsers.length);
                return;
            }

            console.log('Dados recebidos da RPC:', data);

            // Mapear os dados para o formato esperado
            const mappedUsers = (data || []).map((user: any) => ({
                id: user.id,
                email: user.email,
                full_name: user.full_name,
                role: user.role,
                is_active: user.is_active,
                department_id: user.department_id,
                departments: user.department_name ? { name: user.department_name } : undefined
            }));

            setAllUsers(mappedUsers);
            setUsers(mappedUsers);
            console.log('Usuários carregados com sucesso:', mappedUsers.length);
        } catch (error) {
            console.error('Error fetching users:', error);
            alert('Erro ao carregar usuários. Verifique o console.');
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

            // Log user deletion
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                await supabase.from('activity_logs').insert({
                    user_id: currentUser.id,
                    action: 'user_deleted',
                    app_id: null,
                    app_name: null,
                    details: {
                        deleted_user_id: userId,
                        deleted_user_name: userName,
                        timestamp: new Date().toISOString()
                    }
                });
            }

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

    const handleChangePassword = async (userId: string) => {
        if (!newPassword || newPassword.length < 6) {
            alert('A senha deve ter no mínimo 6 caracteres');
            return;
        }

        try {
            const { error } = await supabase.rpc('change_user_password', {
                target_user_id: userId,
                new_password: newPassword
            });

            if (error) throw error;

            alert('Senha alterada com sucesso!');
            setChangingPassword(null);
            setNewPassword('');
        } catch (error: any) {
            console.error('Error changing password:', error);
            alert('Erro ao alterar senha: ' + error.message);
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
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Users size={32} className="text-primary" />
                        <h2 className="text-3xl font-bold text-white">Gerenciar Usuários</h2>
                    </div>

                    {/* Filtro por Setor Moderno */}
                    <div className="relative">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white hover:border-primary transition-all min-w-[240px] justify-between group"
                        >
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-slate-800 rounded-lg group-hover:bg-primary/20 transition-colors">
                                    <Filter size={14} className="text-gray-400 group-hover:text-primary transition-colors" />
                                </div>
                                <span className="text-sm font-medium text-gray-200">
                                    {selectedDepartment === 'all'
                                        ? 'Todos os Setores'
                                        : departments.find(d => d.id === selectedDepartment)?.name || 'Todos os Setores'}
                                </span>
                            </div>
                            <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${isFilterOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isFilterOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsFilterOpen(false)}
                                />
                                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="p-1.5">
                                        <button
                                            onClick={() => {
                                                setSelectedDepartment('all');
                                                setIsFilterOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group ${selectedDepartment === 'all'
                                                ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                                : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                                                }`}
                                        >
                                            <span className="font-medium">Todos os Setores</span>
                                            {selectedDepartment === 'all' && <Check size={16} />}
                                        </button>

                                        <div className="h-px bg-slate-700/50 my-1.5 mx-2" />

                                        <div className="max-h-[280px] overflow-y-auto custom-scrollbar space-y-0.5">
                                            {departments.map(dept => (
                                                <button
                                                    key={dept.id}
                                                    onClick={() => {
                                                        setSelectedDepartment(dept.id);
                                                        setIsFilterOpen(false);
                                                    }}
                                                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center justify-between group ${selectedDepartment === dept.id
                                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                                        : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                                                        }`}
                                                >
                                                    <span className="font-medium">{dept.name}</span>
                                                    {selectedDepartment === dept.id && <Check size={16} />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="text-center text-gray-400 py-12">Carregando usuários...</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-gray-300">
                            <thead className="text-xs uppercase bg-slate-900/50 text-gray-400">
                                <tr>
                                    <th className="px-6 py-3 rounded-tl-lg">Nome</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Setor</th>
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
                                            <span className="text-gray-400 text-sm">
                                                {user.email}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-400 text-sm">
                                                {user.departments?.name || 'Sem setor'}
                                            </span>
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
                                                    onClick={() => setChangingPassword(user.id)}
                                                    className="p-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                                    title="Alterar Senha"
                                                >
                                                    <Key size={18} />
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

            {/* Modal de Alterar Senha */}
            {changingPassword && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full">
                        <h3 className="text-2xl font-bold text-white mb-6">Alterar Senha</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Nova Senha
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                    placeholder="Mínimo 6 caracteres"
                                    minLength={6}
                                    autoFocus
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleChangePassword(changingPassword)}
                                    className="flex-1 bg-primary hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors"
                                >
                                    Alterar Senha
                                </button>
                                <button
                                    onClick={() => {
                                        setChangingPassword(null);
                                        setNewPassword('');
                                    }}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
