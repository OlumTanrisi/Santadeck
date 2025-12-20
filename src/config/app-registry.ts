/**
 * ==============================================================================
 * App Registry - Configuração Centralizada de Apps
 * ==============================================================================
 * 
 * Este arquivo define todos os apps secundários que podem ser acessados
 * através do Santadeck. Use-o como fonte de verdade para:
 * - Gerar blocos NGINX
 * - Configurar menus/links
 * - Setup de CI/CD
 */

export interface AppConfig {
    /** Identificador único do app */
    id: string;

    /** Nome de exibição */
    name: string;

    /** Descrição curta */
    description: string;

    /** Ícone (emoji ou nome de ícone do Lucide) */
    icon: string;

    /** Path relativo (ex: /inventario) */
    path: string;

    /** Porta de desenvolvimento local */
    devPort: number;

    /** Caminho do build de produção no servidor */
    prodPath: string;

    /** Se true, requer autenticação via AuthGuard */
    requiresAuth: boolean;

    /** Roles permitidos (vazio = todos autenticados) */
    allowedRoles: ('admin' | 'user')[];

    /** Se o app está ativo */
    enabled: boolean;

    /** Projeto Supabase associado (se diferente do Santadeck) */
    supabaseProject?: {
        url: string;
        name: string;
    };
}

/**
 * Lista de todos os apps registrados
 */
export const APP_REGISTRY: AppConfig[] = [
    {
        id: 'inventario',
        name: 'Inventário',
        description: 'Gestão de materiais de escritório e placas',
        icon: '📦',
        path: '/inventario',
        devPort: 5174,
        prodPath: '/var/www/inventario/dist',
        requiresAuth: true,
        allowedRoles: [], // Todos os autenticados
        enabled: true,
        supabaseProject: {
            url: 'https://ohrhqposebxvjjllpbzi.supabase.co',
            name: 'Inventário Supabase',
        },
    },
    {
        id: 'crm',
        name: 'CRM',
        description: 'Gestão de relacionamento com clientes',
        icon: '👥',
        path: '/crm',
        devPort: 5175,
        prodPath: '/var/www/crm/dist',
        requiresAuth: true,
        allowedRoles: [],
        enabled: false, // Ainda não implementado
    },
    {
        id: 'financeiro',
        name: 'Financeiro',
        description: 'Gestão financeira e relatórios',
        icon: '💰',
        path: '/financeiro',
        devPort: 5176,
        prodPath: '/var/www/financeiro/dist',
        requiresAuth: true,
        allowedRoles: ['admin'], // Apenas admins
        enabled: false, // Ainda não implementado
    },
    {
        id: 'rh',
        name: 'RH',
        description: 'Recursos Humanos e gestão de pessoal',
        icon: '👔',
        path: '/rh',
        devPort: 5177,
        prodPath: '/var/www/rh/dist',
        requiresAuth: true,
        allowedRoles: ['admin'],
        enabled: false,
    },
];

/**
 * Retorna apenas apps ativos
 */
export function getEnabledApps(): AppConfig[] {
    return APP_REGISTRY.filter(app => app.enabled);
}

/**
 * Retorna apps que o usuário pode acessar baseado na role
 */
export function getAppsForRole(role: 'admin' | 'user'): AppConfig[] {
    return getEnabledApps().filter(app => {
        // Se não tem restrição de role, qualquer autenticado pode acessar
        if (app.allowedRoles.length === 0) return true;
        // Senão, verifica se a role está na lista
        return app.allowedRoles.includes(role);
    });
}

/**
 * Busca app pelo path
 */
export function getAppByPath(path: string): AppConfig | undefined {
    return APP_REGISTRY.find(app => app.path === path);
}

/**
 * Gera bloco NGINX para um app (útil para automação)
 */
export function generateNginxBlock(app: AppConfig): string {
    return `
# ${app.name} - ${app.description}
location ${app.path} {
    alias ${app.prodPath};
    try_files $uri $uri/ ${app.path}/index.html;
    
    location ~* ^${app.path}/assets/.*\\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        alias ${app.prodPath};
        try_files $uri =404;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
`.trim();
}

/**
 * Gera todos os blocos NGINX para apps ativos
 */
export function generateAllNginxBlocks(): string {
    const blocks = getEnabledApps().map(generateNginxBlock);
    return blocks.join('\n\n');
}
