/**
 * Página de Alteração de Senha - ChangePassword.tsx
 * 
 * Permite que qualquer usuário autenticado (admin ou user) altere sua própria senha.
 */

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Save } from 'lucide-react';

export const ChangePassword: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'As senhas não coincidem.' });
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres.' });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            });

            if (error) throw error;

            setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
            setPassword('');
            setConfirmPassword('');

            // Redirecionar após 2 segundos
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (error: any) {
            console.error('Error updating password:', error);
            setMessage({ type: 'error', text: error.message || 'Erro ao atualizar senha.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto pt-10">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
            >
                <ArrowLeft size={20} />
                Voltar ao Dashboard
            </button>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <Lock size={32} className="text-primary" />
                    <h2 className="text-2xl font-bold text-white">Alterar Senha</h2>
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

                <form onSubmit={handleUpdatePassword} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nova Senha
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
                            Confirmar Nova Senha
                        </label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                            required
                            placeholder="Repita a nova senha"
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-red-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
                    >
                        {loading ? 'Salvando...' : (
                            <>
                                <Save size={20} />
                                Salvar Nova Senha
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};
