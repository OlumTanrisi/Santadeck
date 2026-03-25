/**
 * Contexto de Autenticação - AuthContext.tsx
 * 
 * Gerencia o estado global de autenticação da aplicação.
 * Fornece informações sobre:
 * - Sessão do usuário
 * - Dados do usuário
 * - Role (função) do usuário
 * - Estado de carregamento
 * - Função de logout
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';


/**
 * Interface que define o tipo do contexto de autenticação
 */
interface AuthContextType {
    session: Session | null;        // Sessão atual do Supabase
    user: User | null;              // Dados do usuário autenticado
    role: 'admin' | 'user' | null;  // Função do usuário (admin ou user)
    loading: boolean;               // Estado de carregamento
    signOut: () => Promise<void>;   // Função para fazer logout
}

/**
 * Criação do contexto com valores padrão
 */
const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    role: null,
    loading: true,
    signOut: async () => { },
});

/**
 * Provider do Contexto de Autenticação
 * 
 * Componente que envolve a aplicação e fornece o contexto de autenticação
 * para todos os componentes filhos.
 * 
 * Responsabilidades:
 * - Buscar sessão inicial
 * - Escutar mudanças de autenticação
 * - Buscar role do usuário
 * - Verificar se conta está ativa
 * - Fornecer função de logout
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // Estados do contexto
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<'admin' | 'user' | null>(null);
    const [loading, setLoading] = useState(true);

    const checkSession = async () => {
        try {
            // Fetch session from Auth Gateway (proxied via Nginx /auth/session)
            // Note: credentials: 'include' is crucial for sending the cookie
            const res = await fetch('/auth/session', {
                headers: { 'Accept': 'application/json' },
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();

                // 1. Sync with local Supabase client FIRST
                if (data.supabaseAccessToken) {
                    const { error: syncError } = await supabase.auth.setSession({
                        access_token: data.supabaseAccessToken,
                        refresh_token: data.session?.refresh_hash || ''
                    });
                    if (syncError) console.error('Supabase sync error:', syncError);
                    else console.log('✅ Supabase client synchronized');
                }

                // 2. Then update global state
                setSession(data.session);
                setUser(data.user);

                if (data.user) fetchUserRole(data.user.id);
            } else {
                // 401 or 403
                setSession(null);
                setUser(null);
                setRole(null);
            }
        } catch (error) {
            console.error('Failed to check session', error);
            setSession(null);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Effect que roda uma vez ao montar o componente
     */
    useEffect(() => {
        checkSession();
        // Setup simple polling for session validity? or rely on user action failure?
        // Let's poll every minute
        const interval = setInterval(checkSession, 60000);
        return () => clearInterval(interval);
    }, []);


    /**
     * Busca a role (função) do usuário no banco de dados
     * 
     * @param userId - ID do usuário
     */
    const fetchUserRole = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching role:', error);
                setRole('user');
            } else {
                setRole(data?.role as 'admin' | 'user');
            }
        } catch (err) {
            console.error('Error in fetchUserRole:', err);
            setRole('user');
        }
    };

    /**
     * Função de Logout
     */
    const signOut = async () => {
        try {
            await fetch('/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            // Clear local Supabase session too
            await supabase.auth.signOut();

            setUser(null);
            setSession(null);
            setRole('user');
            localStorage.setItem('login_message', 'Sessão encerrada com sucesso.');
            window.location.href = '/login';
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

/**
 * Hook customizado para usar o contexto de autenticação
 * 
 * @returns Objeto com session, user, role, loading e signOut
 * 
 * Uso:
 * ```tsx
 * const { user, role, signOut } = useAuth();
 * ```
 */
export const useAuth = () => useContext(AuthContext);
