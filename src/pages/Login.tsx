/**
 * Página de Login - Login.tsx
 * 
 * Página de autenticação de usuários.
 * Permite que usuários façam login com email e senha.
 * Registra a atividade de login no banco de dados.
 */

import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';

/**
 * Componente Login
 * 
 * Funcionalidades:
 * - Formulário de login com email e senha
 * - Validação de credenciais via Supabase Auth
 * - Registro de log de login
 * - Exibição de erros
 * - Redirecionamento para dashboard após login bem-sucedido
 */
export const Login: React.FC = () => {
    // Estados do formulário
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    /**
     * Handler do formulário de login
     * 
     * Fluxo:
     * 1. Previne comportamento padrão do form
     * 2. Ativa estado de loading
     * 3. Tenta autenticar com Supabase
     * 4. Se sucesso, registra log de login
     * 5. Redireciona para dashboard
     * 6. Se erro, exibe mensagem
     * 
     * @param e - Evento do formulário
     */
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Tentar fazer login com Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // Se houver erro, exibe mensagem
            setError(error.message);
            setLoading(false);
        } else if (data.user) {
            // Se login bem-sucedido, registra log de atividade
            try {
                await supabase.from('activity_logs').insert({
                    user_id: data.user.id,
                    action: 'user_login',
                    app_id: null,
                    app_name: null,
                    details: {
                        email: data.user.email,
                        timestamp: new Date().toISOString()
                    }
                });
            } catch (logError) {
                console.error('Error logging activity:', logError);
            }

            // Redireciona para dashboard
            navigate('/dashboard');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[70vh] gap-8">
            {/* Header com Logo e Título */}
            <div className="flex flex-col items-center gap-4 animate-fade-in-down">
                <img
                    src={logo}
                    alt="Santamérica"
                    className="w-28 h-28 drop-shadow-2xl hover:scale-105 transition-transform duration-300"
                />
                <h1 className="text-4xl font-bold text-white tracking-[0.2em] drop-shadow-lg">
                    SANTADECK
                </h1>
            </div>

            {/* Card de Login */}
            <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl w-full max-w-[360px] relative overflow-hidden group">
                {/* Efeito de brilho no topo do card */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50"></div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Mensagem de Erro */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-3 rounded-xl text-sm text-center animate-shake">
                            {error}
                        </div>
                    )}

                    {/* Campo de Email */}
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm shadow-inner"
                            placeholder="seu@email.com"
                            required
                        />
                    </div>

                    {/* Campo de Senha */}
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-400 ml-1 uppercase tracking-wider">
                            Senha
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all text-sm shadow-inner"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    {/* Botão de Submit */}
                    <div className="pt-2 flex justify-center">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-32 py-2.5 bg-white hover:bg-gray-100 text-red-900 font-bold rounded-full shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-wide"
                        >
                            {loading ? '...' : 'Entrar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
