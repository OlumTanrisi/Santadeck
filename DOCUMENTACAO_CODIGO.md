# Documentação de Código - SANTADECK

Este documento fornece explicações detalhadas sobre as principais funções e variáveis do código.

## Dashboard.tsx - Funções Principais

### `fetchApps()`
**Descrição**: Busca os aplicativos do banco de dados baseado nas permissões do usuário.

**Lógica**:
- Se o usuário for **admin**: busca TODOS os aplicativos
- Se o usuário for **comum**: 
  1. Primeiro busca as permissões do usuário na tabela `user_app_permissions`
  2. Depois busca apenas os apps para os quais o usuário tem permissão

**Variáveis**:
- `query`: Query do Supabase que será executada
- `permissions`: Lista de permissões do usuário
- `appIds`: Array com IDs dos apps permitidos

---

### `handleAddApp(e)`
**Descrição**: Adiciona um novo aplicativo ao sistema (apenas admins).

**Parâmetros**:
- `e`: Evento do formulário

**Fluxo**:
1. Previne comportamento padrão do formulário
2. Insere novo app na tabela `apps`
3. Registra log da ação na tabela `activity_logs`
4. Fecha o modal
5. Limpa os campos do formulário
6. Atualiza a lista de apps

**Variáveis usadas**:
- `newAppName`: Nome do novo app
- `newAppDesc`: Descrição do novo app
- `newAppUrl`: URL do novo app
- `newAppIcon`: URL do ícone
- `appType`: Tipo do app ('web' ou 'link')

---

### `handleEditApp(appId)`
**Descrição**: Prepara o formulário de edição com os dados do app selecionado.

**Parâmetros**:
- `appId`: ID do aplicativo a ser editado

**Fluxo**:
1. Busca o app na lista pelo ID
2. Preenche os estados de edição com os dados do app
3. Abre o modal de edição

---

### `handleUpdateApp(e)`
**Descrição**: Atualiza um aplicativo existente.

**Parâmetros**:
- `e`: Evento do formulário

**Fluxo**:
1. Busca dados antigos do app (para o log)
2. Atualiza o app no banco
3. Registra log com dados antigos e novos
4. Fecha modal e limpa estados
5. Atualiza lista de apps

---

### `handleDeleteApp(appId)`
**Descrição**: Exclui um aplicativo do sistema.

**Parâmetros**:
- `appId`: ID do aplicativo a ser excluído

**Fluxo**:
1. Busca dados do app antes de excluir (para o log)
2. Deleta o app do banco
3. Registra log da exclusão
4. Remove o app da lista local
5. Exibe mensagem de sucesso

**Importante**: O log salva os dados do app deletado em `details.deleted_app` para histórico.

---

### `handleScroll()`
**Descrição**: Atualiza o indicador ativo do carrossel baseado na posição do scroll.

**Lógica**:
1. Obtém a posição atual do scroll
2. Calcula a largura de um card
3. Calcula o índice do card visível
4. Atualiza o estado `activeIndex`

---

### `scrollToIndex(index)`
**Descrição**: Rola o carrossel para um card específico.

**Parâmetros**:
- `index`: Índice do card para o qual rolar

**Lógica**:
1. Calcula a posição de scroll necessária
2. Usa `scrollTo` com comportamento suave

---

## AppLauncher.tsx - Funções Principais

### `isNetworkPath(url)`
**Descrição**: Verifica se uma URL é um caminho de rede.

**Parâmetros**:
- `url`: URL a ser verificada

**Retorna**: `true` se for caminho de rede (começa com `\\` ou `//`)

---

### `handleCopyPath()`
**Descrição**: Copia o caminho do app para a área de transferência.

**Fluxo**:
1. Usa `navigator.clipboard.writeText()`
2. Ativa estado `copied` por 2 segundos
3. Exibe feedback visual

---

## AuthContext.tsx - Funções Principais

### `fetchUserRole(userId)`
**Descrição**: Busca a role e status de ativação do usuário.

**Parâmetros**:
- `userId`: ID do usuário

**Fluxo**:
1. Busca dados na tabela `profiles`
2. Verifica se `is_active` é `false`
3. Se inativo, faz logout e exibe alerta
4. Se ativo, define a role
5. Em caso de erro, usa 'user' como fallback

---

### `signOut()`
**Descrição**: Realiza logout do usuário.

**Fluxo**:
1. Registra log de logout
2. Chama `supabase.auth.signOut()`
3. Limpa estados locais (session, user, role)

---

## ManageUsers.tsx - Funções Principais

### `handleToggleStatus(userId, currentStatus)`
**Descrição**: Ativa ou desativa uma conta de usuário.

**Parâmetros**:
- `userId`: ID do usuário
- `currentStatus`: Status atual (true/false)

**Fluxo**:
1. Atualiza `is_active` para o oposto do valor atual
2. Atualiza a lista local de usuários
3. Exibe erro se houver problema

**Importante**: Usuários inativos não conseguem fazer login (verificado no AuthContext).

---

### `handleDeleteUser(userId, userName)`
**Descrição**: Exclui permanentemente um usuário.

**Parâmetros**:
- `userId`: ID do usuário
- `userName`: Nome do usuário (para confirmação)

**Fluxo**:
1. Solicita confirmação
2. Chama função RPC `delete_user_by_admin` no Supabase
3. Remove usuário da lista local
4. Exibe mensagem de sucesso

**Importante**: Esta ação é irreversível e deleta:
- Registro na tabela `profiles`
- Registro na tabela `auth.users`
- Permissões associadas (cascade)

---

## CreateUser.tsx - Funções Principais

### `handleCreateUser(e)`
**Descrição**: Cria um novo usuário no sistema.

**Parâmetros**:
- `e`: Evento do formulário

**Fluxo**:
1. Valida se as senhas coincidem
2. Cria usuário via `supabase.auth.admin.createUser()`
3. Insere permissões de apps selecionados
4. Registra log da criação
5. Redireciona para gerenciamento de usuários

**Variáveis importantes**:
- `selectedApps`: Set com IDs dos apps selecionados
- `fullName`: Nome completo do usuário
- `email`: Email do usuário
- `password`: Senha do usuário
- `selectedRole`: Role selecionada ('admin' ou 'user')

---

## Logs.tsx - Funções Principais

### `fetchLogs()`
**Descrição**: Busca logs de atividade do banco de dados.

**Fluxo**:
1. Busca logs da tabela `activity_logs`
2. Faz join com `profiles` para obter nome do usuário
3. Ordena por data (mais recentes primeiro)
4. Limita a 100 registros

---

### `getActionLabel(action)`
**Descrição**: Retorna um rótulo legível para cada tipo de ação.

**Parâmetros**:
- `action`: Código da ação (ex: 'user_login')

**Retorna**: String com descrição amigável

**Mapeamento**:
- `user_login` → "Login"
- `user_logout` → "Logout"
- `app_opened` → "Abriu App"
- `app_created` → "Criou App"
- `app_updated` → "Atualizou App"
- `app_deleted` → "Deletou App"
- `user_created` → "Criou Usuário"
- `user_updated` → "Atualizou Usuário"

---

## Variáveis de Estado Importantes

### Dashboard
- `apps`: Array com todos os aplicativos
- `loading`: Indica se está carregando dados
- `showAddModal`: Controla visibilidade do modal de adicionar
- `showEditModal`: Controla visibilidade do modal de editar
- `activeIndex`: Índice do card ativo no carrossel
- `myApps`: Apps filtrados (exclui links úteis)
- `usefulLinks`: Apenas links úteis

### AuthContext
- `session`: Sessão atual do Supabase
- `user`: Dados do usuário autenticado
- `role`: Função do usuário ('admin' ou 'user')
- `loading`: Indica se está carregando dados de autenticação

### AppLauncher
- `app`: Dados do aplicativo sendo exibido
- `key`: Chave para forçar reload do iframe
- `copied`: Indica se o caminho foi copiado
- `iframeError`: Indica se houve erro ao carregar iframe

---

## Tipos de Aplicativos

### Web App (`type: 'web'`)
- Aplicativos web que podem ser exibidos em iframe
- Exemplos: sistemas internos, dashboards
- Renderizados dentro da plataforma

### Link Útil (`type: 'link'`)
- Links externos que abrem em nova aba
- Exemplos: sites externos, documentação
- Exibidos na seção "Links Úteis" do dashboard

---

## Logs de Atividade

Todas as ações importantes são registradas na tabela `activity_logs`:

### Estrutura do Log
```typescript
{
  user_id: string,      // ID do usuário que realizou a ação
  action: string,       // Tipo de ação
  app_id: string,       // ID do app (se aplicável)
  app_name: string,     // Nome do app (para referência)
  details: {            // Detalhes específicos da ação
    timestamp: string,
    // ... outros campos específicos
  }
}
```

### Ações Registradas
1. **user_login**: Quando usuário faz login
2. **user_logout**: Quando usuário faz logout
3. **app_opened**: Quando usuário abre um app
4. **app_created**: Quando admin cria um app
5. **app_updated**: Quando admin atualiza um app (salva dados antigos e novos)
6. **app_deleted**: Quando admin deleta um app (salva dados do app deletado)
7. **user_created**: Quando admin cria um usuário
8. **user_updated**: Quando admin atualiza um usuário

---

## Permissões e Segurança

### Row Level Security (RLS)
O Supabase usa RLS para garantir que:
- Usuários comuns só veem seus próprios dados
- Admins têm acesso total
- Logs só podem ser inseridos pelo próprio usuário
- Apps são visíveis para todos, mas só admins podem modificar

### Verificações de Permissão
- **Frontend**: Verifica `role` antes de exibir botões/opções
- **Backend**: RLS garante que mesmo requisições diretas sejam bloqueadas
- **Rotas**: `ProtectedRoute` verifica autenticação e role

---

## Fluxo de Dados

### Login
```
Login.tsx → Supabase Auth → AuthContext → Dashboard
```

### Buscar Apps
```
Dashboard → fetchApps() → Supabase → user_app_permissions → apps → Dashboard
```

### Abrir App
```
AppCard → navigate(/app/:id) → AppLauncher → fetchApp() → Supabase → Renderiza
```

### Criar Usuário
```
CreateUser → Supabase Admin API → profiles → user_app_permissions → activity_logs
```

---

## Boas Práticas Implementadas

1. **Separação de Responsabilidades**: Cada componente tem uma função clara
2. **Reutilização**: Componentes como `AppCard` são reutilizáveis
3. **Contexto Global**: `AuthContext` evita prop drilling
4. **Tipagem**: TypeScript garante type safety
5. **Logs**: Todas as ações importantes são registradas
6. **Feedback Visual**: Loading states, mensagens de erro, confirmações
7. **Segurança**: RLS no backend, verificações no frontend
8. **UX**: Animações, transições, estados de hover

---

## Troubleshooting Comum

### Usuário não vê apps
**Causa**: Falta de permissões em `user_app_permissions`
**Solução**: Admin deve adicionar permissões na página de edição de usuário

### Iframe não carrega
**Causa**: Site bloqueia iframe (X-Frame-Options)
**Solução**: Sistema detecta e oferece botão para abrir em nova aba

### Usuário não consegue fazer login
**Causas possíveis**:
1. Conta inativa (`is_active = false`)
2. Credenciais incorretas
3. Usuário não existe

**Solução**: Verificar status da conta em "Gerenciar Usuários"

---

Esta documentação cobre as principais funções e conceitos do SANTADECK.
Para mais detalhes, consulte os comentários inline no código.
