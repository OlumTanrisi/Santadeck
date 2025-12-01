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

    /**
     * Effect que roda uma vez ao montar o componente
     * Busca a sessão inicial e configura listener de mudanças de autenticação
     */
    useEffect(() => {
        // Buscar sessão inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Configurar listener para mudanças de autenticação
        // Isso detecta login, logout, refresh de token, etc.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchUserRole(session.user.id);
            } else {
                setRole(null);
                setLoading(false);
            }
        });

        // Cleanup: cancelar subscription ao desmontar
        return () => subscription.unsubscribe();
    }, []);

    /**
     * Busca a role (função) do usuário no banco de dados
     * 
     * @param userId - ID do usuário
     * 
     * Também verifica se a conta está ativa. Se não estiver,
     * faz logout automático e exibe mensagem.
     */
    const fetchUserRole = async (userId: string) => {
        try {
            console.log('Buscando role para usuário:', userId);
            const { data, error } = await supabase
                .from('profiles')
                .select('role, is_active')
                .eq('id', userId)
                .single();

            console.log('Resultado fetchUserRole:', { data, error });

            if (error) {
                console.error('Error fetching role:', error);
                setRole('user'); // Fallback para 'user' em caso de erro
            } else {
                // Verificar se a conta está ativa
                if (data.is_active === false) {
                    await signOut();
                    alert('Sua conta foi inativada. Entre em contato com o administrador.');
                    return;
                }
                console.log('Definindo role como:', data?.role);
                setRole(data?.role as 'admin' | 'user');
            }
        } catch (err) {
            console.error('Error in fetchUserRole:', err);
            setRole('user'); // Fallback para 'user' em caso de erro
        } finally {
            setLoading(false);
        }
    };

    /**
     * Função de Logout
     * 
     * Realiza as seguintes ações:
     * 1. Registra log de logout no banco
     * 2. Faz logout no Supabase
     * 3. Limpa estados locais
     */
    const signOut = async () => {
        // Registrar log de logout antes de sair
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                await supabase.from('activity_logs').insert({
                    user_id: user.id,
                    action: 'user_logout',
                    app_id: null,
                    app_name: null,
                    details: {
                        timestamp: new Date().toISOString()
                    }
                });
            }
        } catch (logError) {
            console.error('Error logging logout activity:', logError);
        }

        // Fazer logout no Supabase
        await supabase.auth.signOut();

        // Limpar estados locais
        setRole(null);
        setSession(null);
        setUser(null);
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
