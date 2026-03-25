/**
 * Componente Principal da Aplicação - App.tsx
 * 
 * Este é o componente raiz que configura:
 * - Roteamento da aplicação
 * - Contexto de autenticação
 * - Rotas protegidas
 * - Redirecionamentos baseados em autenticação
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MainLayout } from './layouts/MainLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { AppLauncher } from './pages/AppLauncher';
import { CreateUser } from './pages/CreateUser';
import { ManageUsers } from './pages/ManageUsers';
import { EditUser } from './pages/EditUser';
import { Logs } from './pages/Logs';
import { ChangePassword } from './pages/ChangePassword';
import { ManageDepartments } from './pages/ManageDepartments';

/**
 * Componente de Rota Protegida
 * 
 * Protege rotas que requerem autenticação e/ou permissões de admin.
 * 
 * @param children - Componentes filhos a serem renderizados se autorizado
 * @param requireAdmin - Se true, requer que o usuário seja admin
 * 
 * Fluxo:
 * 1. Verifica se está carregando dados de autenticação
 * 2. Se não houver sessão, redireciona para login
 * 3. Se requireAdmin=true e usuário não for admin, redireciona para dashboard
 * 4. Se tudo OK, renderiza o conteúdo dentro do MainLayout
 */
const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { session, loading, role } = useAuth();

  // Exibe loading enquanto verifica autenticação
  if (loading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Carregando...</div>;
  }

  // Redireciona para login se não estiver autenticado
  if (!session) {
    return <Navigate to="/login" />;
  }

  // Redireciona para dashboard se não for admin mas a rota requer admin
  if (requireAdmin && role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  // Renderiza o conteúdo protegido dentro do layout
  return <MainLayout>{children}</MainLayout>;
};

import { useEffect } from 'react';

/**
 * Componente que lida com o redirecionamento baseado no parâmetro 'return'.
 * Se houver um parâmetro 'return', ele redireciona para lá.
 * Caso contrário, vai para o fallback (ex: /dashboard).
 * 
 * Se o 'return' for uma URL absoluta (contendo http), usa window.location.href.
 */
const ReturnRedirect = ({ fallback }: { fallback: string }) => {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('return');

  useEffect(() => {
    if (returnUrl) {
      // Use window.location.href for ALL return URLs to ensure they are 
      // processed by the Nginx gateway even if they refer to other subpath apps.
      window.location.href = returnUrl;
    }
  }, [returnUrl]);

  if (!returnUrl) {
    return <Navigate to={fallback} />;
  }

  return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Redirecionando...</div>;
};

/**
 * Componente de Rotas da Aplicação
 *
 * Define todas as rotas disponíveis e suas proteções.
 * Usa o hook useAuth para verificar o estado de autenticação.
 */
function AppRoutes() {
  const { session } = useAuth();

  return (
    <Routes>
      {/* Rota de Login - Redireciona de volta se já estiver logado */}
      <Route
        path="/login"
        element={!session ? <MainLayout><Login /></MainLayout> : <ReturnRedirect fallback="/dashboard" />}
      />

      {/* Rota de Registro - Redireciona de volta se já estiver logado */}
      <Route
        path="/register"
        element={!session ? <MainLayout><Register /></MainLayout> : <ReturnRedirect fallback="/dashboard" />}
      />

      {/* Dashboard - Rota protegida, acessível a todos os usuários autenticados */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Criar Usuário - Rota protegida, apenas para admins */}
      <Route
        path="/create-user"
        element={
          <ProtectedRoute requireAdmin={true}>
            <CreateUser />
          </ProtectedRoute>
        }
      />

      {/* Gerenciar Usuários - Rota protegida, apenas para admins */}
      <Route
        path="/manage-users"
        element={
          <ProtectedRoute requireAdmin={true}>
            <ManageUsers />
          </ProtectedRoute>
        }
      />

      {/* Editar Usuário - Rota protegida, apenas para admins */}
      <Route
        path="/edit-user/:id"
        element={
          <ProtectedRoute requireAdmin={true}>
            <EditUser />
          </ProtectedRoute>
        }
      />

      {/* Logs - Rota protegida, apenas para admins */}
      <Route
        path="/logs"
        element={
          <ProtectedRoute requireAdmin={true}>
            <Logs />
          </ProtectedRoute>
        }
      />

      {/* Lançador de App - Rota protegida, acessível a todos os usuários autenticados */}
      <Route
        path="/app/:id"
        element={
          <ProtectedRoute>
            <AppLauncher />
          </ProtectedRoute>
        }
      />

      {/* Alterar Senha - Rota protegida, acessível a todos os usuários autenticados */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Gerenciar Setores - Rota protegida, apenas para admins */}
      <Route
        path="/manage-departments"
        element={
          <ProtectedRoute requireAdmin={true}>
            <ManageDepartments />
          </ProtectedRoute>
        }
      />

      {/* Rota raiz - Redireciona baseado no estado de autenticação */}
      <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}

import { Toaster } from 'react-hot-toast';

/**
 * Componente App Principal
 * 
 * Envolve toda a aplicação com:
 * - AuthProvider: Fornece contexto de autenticação global
 * - Router: Habilita roteamento SPA
 * - AppRoutes: Define todas as rotas da aplicação
 * - Toaster: Provê notificações toast globais
 */
function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

