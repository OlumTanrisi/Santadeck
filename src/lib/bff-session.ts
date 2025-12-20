/**
 * ==============================================================================
 * Serviço de Sessão do BFF
 * ==============================================================================
 * 
 * Este serviço gerencia a comunicação com o BFF para criar/destruir
 * a sessão HttpOnly que será usada pelos apps secundários.
 * 
 * IMPORTANTE: Este serviço deve ser chamado APÓS o login bem-sucedido
 * via Supabase Auth no Santadeck.
 */

// ==============================================================================
// Tipos
// ==============================================================================

interface BFFUser {
    id: string;
    email: string;
    role: 'admin' | 'user';
    fullName: string;
}

interface LoginResponse {
    success: boolean;
    user?: BFFUser;
    error?: string;
}

// ==============================================================================
// Configuração
// ==============================================================================

// URL do BFF - em produção usa path relativo (mesmo domínio)
// Em desenvolvimento pode apontar para servidor local
const BFF_URL = import.meta.env.VITE_BFF_URL || '';

// ==============================================================================
// Funções
// ==============================================================================

/**
 * Cria uma sessão no BFF após login bem-sucedido no Supabase
 * 
 * @param userId - ID do usuário do Supabase
 * @param email - Email do usuário
 * @param accessToken - Token de acesso do Supabase (para verificação)
 * @returns Resposta com sucesso/erro
 */
export async function createBFFSession(
    userId: string,
    email: string,
    accessToken: string
): Promise<LoginResponse> {
    try {
        const response = await fetch(`${BFF_URL}/api/auth/login`, {
            method: 'POST',
            credentials: 'include', // IMPORTANTE: para receber o cookie
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                email,
                accessToken,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Sessão BFF criada com sucesso');
            return { success: true, user: data.user };
        } else {
            const errorData = await response.json().catch(() => ({}));
            console.error('❌ Erro ao criar sessão BFF:', errorData);
            return {
                success: false,
                error: errorData.error || 'Falha ao criar sessão'
            };
        }
    } catch (error) {
        console.error('❌ Erro de rede ao criar sessão BFF:', error);
        return {
            success: false,
            error: 'Erro de conexão com o servidor'
        };
    }
}

/**
 * Destroi a sessão no BFF durante logout
 * 
 * @returns true se sucesso, false caso contrário
 */
export async function destroyBFFSession(): Promise<boolean> {
    try {
        const response = await fetch(`${BFF_URL}/api/auth/logout`, {
            method: 'POST',
            credentials: 'include', // IMPORTANTE: para enviar e limpar o cookie
        });

        if (response.ok) {
            console.log('✅ Sessão BFF destruída com sucesso');
            return true;
        } else {
            console.error('❌ Erro ao destruir sessão BFF');
            return false;
        }
    } catch (error) {
        console.error('❌ Erro de rede ao destruir sessão BFF:', error);
        return false;
    }
}

/**
 * Verifica se existe uma sessão válida no BFF
 * (Útil para verificação manual, não necessário no fluxo normal)
 * 
 * @returns Dados do usuário se autenticado, null caso contrário
 */
export async function checkBFFSession(): Promise<BFFUser | null> {
    try {
        const response = await fetch(`${BFF_URL}/api/auth/session`, {
            method: 'GET',
            credentials: 'include',
        });

        if (response.ok) {
            const data = await response.json();
            return data.user;
        }

        return null;
    } catch (error) {
        console.error('Erro ao verificar sessão BFF:', error);
        return null;
    }
}

/**
 * Extrai o parâmetro de redirect da URL
 * Usado para redirecionar de volta para apps secundários após login
 * 
 * @returns Path de redirect ou null se não existir
 */
export function getRedirectPath(): string | null {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');

    if (redirect) {
        // Validar que o redirect é para um path local (segurança)
        try {
            const url = new URL(redirect, window.location.origin);
            // Só permitir redirects para o mesmo domínio
            if (url.origin === window.location.origin) {
                return redirect;
            }
        } catch {
            // Se for um path relativo, é válido
            if (redirect.startsWith('/')) {
                return redirect;
            }
        }
    }

    return null;
}

/**
 * Redireciona para o path de retorno após login
 * Se não houver redirect, permanece no dashboard
 */
export function handlePostLoginRedirect(): void {
    const redirectPath = getRedirectPath();

    if (redirectPath) {
        console.log('🔄 Redirecionando para:', redirectPath);
        window.location.href = redirectPath;
    }
    // Se não há redirect, o fluxo normal do Santadeck continua
}
