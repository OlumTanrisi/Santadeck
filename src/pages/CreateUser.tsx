import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AppData {
    id: string;
    name: string;
}

interface Department {
    id: string;
    name: string;
}

export const CreateUser: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState<'user' | 'admin'>('user');
    const [availableApps, setAvailableApps] = useState<AppData[]>([]);
    const [selectedApps, setSelectedApps] = useState<string[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchApps();
        fetchDepartments();
    }, []);

    const fetchApps = async () => {
        const { data } = await supabase.from('apps').select('id, name').order('name');
        if (data) setAvailableApps(data);
    };

    const fetchDepartments = async () => {
        const { data } = await supabase.from('departments').select('id, name').order('name');
        if (data) setDepartments(data);
    };

    const handleAppToggle = (appId: string) => {
        setSelectedApps(prev =>
            prev.includes(appId)
                ? prev.filter(id => id !== appId)
                : [...prev, appId]
        );
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.rpc('create_user_by_admin', {
                email,
                password,
                full_name: fullName,
                user_role: role,
                department_id: selectedDepartment || null,
                app_ids: selectedApps
            });

            if (error) throw error;

            // Log user creation
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            if (currentUser) {
                await supabase.from('activity_logs').insert({
                    user_id: currentUser.id,
                    action: 'user_created',
                    app_id: null,
                    app_name: null,
                    details: {
                        created_user_email: email,
                        created_user_name: fullName,
                        timestamp: new Date().toISOString()
                    }
                });
            }

            setMessage({ type: 'success', text: 'Usuário criado com sucesso!' });
            toast.success('Usuário criado com sucesso!');
            setEmail('');
            setPassword('');
            setFullName('');
            setRole('user');
            setSelectedDepartment('');
            setSelectedApps([]);
        } catch (error: any) {
            console.error('Error creating user:', error);
            setMessage({ type: 'error', text: error.message || 'Erro ao criar usuário' });
            toast.error('Erro ao criar usuário: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Voltar ao Dashboard
            </button>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <UserPlus size={32} className="text-primary" />
                    <h2 className="text-3xl font-bold text-white">Criar Novo Usuário</h2>
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

                <form onSubmit={handleCreateUser} className="space-y-6">
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
                            placeholder="Digite o nome completo"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            required
                            placeholder="usuario@exemplo.com"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Senha
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            required
                            placeholder="Mínimo 6 caracteres"
                            minLength={6}
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
                        disabled={loading}
                        className="w-full bg-primary hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? 'Criando...' : 'Criar Usuário'}
                    </button>
                </form>
            </div>
        </div>
    );
};
