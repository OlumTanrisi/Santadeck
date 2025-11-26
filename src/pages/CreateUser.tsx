import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserPlus, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CreateUser: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                    full_name: fullName
                }
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Usuário criado com sucesso!' });
            setEmail('');
            setPassword('');
            setFullName('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erro ao criar usuário' });
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
