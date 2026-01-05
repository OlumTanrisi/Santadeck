import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserCog, ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AppData {
    id: string;
    name: string;
}

interface Department {
    id: string;
    name: string;
}



export const EditUser: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [availableApps, setAvailableApps] = useState<AppData[]>([]);
    const [selectedApps, setSelectedApps] = useState<string[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch Apps
            const { data: appsData, error: appsError } = await supabase
                .from('apps')
                .select('id, name')
                .order('name');

            if (appsError) throw appsError;
            setAvailableApps(appsData || []);

            // Fetch Departments
            const { data: deptsData, error: deptsError } = await supabase
                .from('departments')
                .select('id, name')
                .order('name');

            if (deptsError) throw deptsError;
            setDepartments(deptsData || []);

            // Fetch User Profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (profileError) throw profileError;

            if (profileData) {
                setFullName(profileData.full_name || '');
                setRole(profileData.role as 'admin' | 'user');
                setSelectedDepartment(profileData.department_id || '');
            }

            // Fetch User Permissions
            const { data: permData, error: permError } = await supabase
                .from('user_app_permissions')
                .select('app_id')
                .eq('user_id', id);

            if (permError) throw permError;

            if (permData) {
                setSelectedApps(permData.map(p => p.app_id));
            }

        } catch (error: any) {
            console.error('Error fetching data:', error);
            setMessage({ type: 'error', text: 'Erro ao carregar dados do usuário.' });
            toast.error('Erro ao carregar dados do usuário.');
        } finally {
            setLoading(false);
        }
    };

    const handleAppToggle = (appId: string) => {
        setSelectedApps(prev =>
            prev.includes(appId)
                ? prev.filter(id => id !== appId)
                : [...prev, appId]
        );
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);

        try {
            // Update Profile
            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    role,
                    department_id: selectedDepartment || null
                })
                .eq('id', id);

            if (profileError) throw profileError;

            // Update Permissions
            // First, delete existing
            const { error: deleteError } = await supabase
                .from('user_app_permissions')
                .delete()
                .eq('user_id', id);

            if (deleteError) throw deleteError;

            // Then insert new ones
            if (selectedApps.length > 0) {
                const { error: insertError } = await supabase
                    .from('user_app_permissions')
                    .insert(
                        selectedApps.map(appId => ({
                            user_id: id,
                            app_id: appId
                        }))
                    );

                if (insertError) throw insertError;
            }

            setMessage({ type: 'success', text: 'Usuário atualizado com sucesso!' });
            toast.success('Usuário atualizado com sucesso!');
        } catch (error: any) {
            console.error('Error updating user:', error);
            setMessage({ type: 'error', text: error.message || 'Erro ao atualizar usuário' });
            toast.error('Erro ao atualizar usuário: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="text-center text-white py-20">Carregando...</div>;
    }

    return (
        <div className="w-full max-w-2xl mx-auto">
            <button
                onClick={() => navigate('/manage-users')}
                className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Voltar para Gerenciar Usuários
            </button>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <UserCog size={32} className="text-primary" />
                    <h2 className="text-3xl font-bold text-white">Editar Usuário</h2>
                </div>

                {message && (
                    <div
                        className={`mb-6 p-4 rounded-lg ${message.type === 'success'
                            ? 'bg-green-500/20 border border-green-500 text-green-300'
                            : 'bg-red-500/20 border border-red-500 text-red-300'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nome Completo
                        </label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Tipo de Usuário
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        >
                            <option value="user">Usuário Padrão</option>
                            <option value="admin">Administrador</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Setor
                        </label>
                        <select
                            value={selectedDepartment}
                            onChange={(e) => setSelectedDepartment(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                        >
                            <option value="">Selecione um setor (opcional)</option>
                            {departments.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Permissões de Acesso (Aplicativos)
                        </label>
                        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 max-h-60 overflow-y-auto">
                            {availableApps.length === 0 ? (
                                <p className="text-gray-500 text-sm">Nenhum aplicativo cadastrado.</p>
                            ) : (
                                <div className="space-y-2">
                                    {availableApps.map(app => (
                                        <label key={app.id} className="flex items-center space-x-3 cursor-pointer hover:bg-slate-800 p-2 rounded transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={selectedApps.includes(app.id)}
                                                onChange={() => handleAppToggle(app.id)}
                                                className="form-checkbox h-5 w-5 text-primary rounded border-gray-600 bg-slate-700 focus:ring-primary"
                                            />
                                            <span className="text-gray-300">{app.name}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-primary hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                    >
                        {saving ? 'Salvando...' : (
                            <>
                                <Save size={20} />
                                Salvar Alterações
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
