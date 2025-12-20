/**
 * Página de Login - Login.tsx
 * 
 * Página de autenticação de usuários.
 * Permite que usuários façam login com email e senha.
 * Registra a atividade de login no banco de dados.
 * 
 * ATUALIZADO: Agora também cria sessão no BFF para apps secundários
 * e suporta redirect de volta para apps como /inventario após login.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { createBFFSession, getRedirectPath } from '../lib/bff-session';

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

    // Verifica mensagens de erro persistidas no localStorage
    useEffect(() => {
        const checkMessage = () => {
            const message = localStorage.getItem('login_message');
            if (message) {
                setError(message);
                localStorage.removeItem('login_message');
                return true;
            }
            return false;
        };

        // Verificar imediatamente
        if (!checkMessage()) {
            // Se não encontrou, verificar novamente após um curto delay
            // (para casos onde o signOut causa re-render)
            const timer = setTimeout(checkMessage, 100);
            return () => clearTimeout(timer);
        }
    }, []);

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

        // Limpar mensagens residuais de sessões anteriores
        localStorage.removeItem('login_message');

        try {
            // 1. Tentar fazer login com Supabase Auth
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            if (data.user) {
                // 2. Verificar se o usuário está ativo e se já tem sessão ativa
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('is_active, current_session_id')
                    .eq('id', data.user.id)
                    .single();

                console.log('📋 DEBUG - Profile:', profile);
                console.log('📋 DEBUG - current_session_id:', profile?.current_session_id);
                console.log('📋 DEBUG - Erro perfil:', profileError);

                if (profileError) {
                    console.error('Erro ao verificar perfil:', profileError);
                }

                // Verificar se conta está inativa
                if (profile && profile.is_active === false) {
                    setError('Sua conta está inativa. Entre em contato com o administrador.');
                    await supabase.auth.signOut();
                    setLoading(false);
                    return;
                }

                // 3. Verificar Sessão Única - BLOQUEAR se já está logado em outro dispositivo
                if (profile && profile.current_session_id) {
                    console.log('⚠️ BLOQUEANDO - Conta já possui sessão ativa:', profile.current_session_id);
                    // Salvar mensagem ANTES do signOut (para persistir em caso de re-render)
                    localStorage.setItem('login_message', '⚠️ Esta conta já está conectada em outro dispositivo. Faça logout no outro dispositivo para continuar.');
                    // Cancelar apenas esta sessão local (não afeta outros dispositivos)
                    await supabase.auth.signOut({ scope: 'local' });
                    // Também tentar setar diretamente
                    setError('⚠️ Esta conta já está conectada em outro dispositivo. Faça logout no outro dispositivo para continuar.');
                    setLoading(false);
                    return;
                }

                console.log('✅ Nenhuma sessão ativa encontrada, prosseguindo com login...');

                // 4. Se não tem sessão ativa, criar uma nova
                const generateUUID = () => {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                        const r = Math.random() * 16 | 0;
                        const v = c === 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                };
                const sessionId = generateUUID();
                console.log('🔐 Novo Session ID gerado:', sessionId);

                // Salvar sessão no banco de dados
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ current_session_id: sessionId })
                    .eq('id', data.user.id);

                if (updateError) {
                    console.error('❌ Erro ao salvar sessão:', updateError);
                } else {
                    console.log('✅ Session ID salvo no banco de dados');
                }

                // Salvar no localStorage
                localStorage.setItem('santadeck_session_id', sessionId);
                console.log('💾 Session ID salvo no localStorage');

                // 5. Registrar log de atividade
                const { error: logError } = await supabase.from('activity_logs').insert({
                    user_id: data.user.id,
                    action: 'user_login',
                    app_id: null,
                    app_name: null,
                    details: {
                        email: data.user.email,
                        timestamp: new Date().toISOString(),
                        session_id: sessionId
                    }
                });

                if (logError) {
                    console.error('❌ Erro ao registrar log de login:', logError);
                } else {
                    console.log('✅ Log de login registrado com sucesso');
                }

                // 6. Criar sessão no BFF para apps secundários
                // Isso cria o cookie HttpOnly que será usado por Inventário, CRM, etc.
                try {
                    const accessToken = data.session?.access_token;
                    if (accessToken) {
                        const bffResult = await createBFFSession(
                            data.user.id,
                            data.user.email || '',
                            accessToken
                        );
                        if (bffResult.success) {
                            console.log('✅ Sessão BFF criada com sucesso');
                        } else {
                            console.warn('⚠️ Falha ao criar sessão BFF:', bffResult.error);
                            // Não bloqueia o login, apenas loga o erro
                        }
                    }
                } catch (bffError) {
                    console.error('❌ Erro ao criar sessão BFF:', bffError);
                    // Não bloqueia o login principal
                }

                // 7. Verificar se há redirect para app secundário (ex: /inventario)
                const redirectPath = getRedirectPath();
                if (redirectPath) {
                    console.log('🔄 Redirecionando para app secundário:', redirectPath);
                    window.location.href = redirectPath;
                } else {
                    // 8. Redireciona para dashboard (comportamento padrão)
                    console.log('🚀 Redirecionando para dashboard...');
                    navigate('/dashboard');
                }
            }
        } catch (error: any) {
            console.error('Login error:', error);
            setError(error.message || 'Erro ao realizar login');
            setLoading(false);
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
