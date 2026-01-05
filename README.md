# 🎮 SANTADECK

**SANTADECK** é uma plataforma centralizada de gerenciamento de aplicativos para a Imobiliária Santamérica, inspirada no conceito do Steam, mas voltada para ferramentas internas da empresa.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19.2.0-61dafb)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178c6)
![Supabase](https://img.shields.io/badge/Supabase-2.84.0-3ecf8e)

---

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Uso](#-uso)
- [Arquitetura](#-arquitetura)
- [Banco de Dados](#-banco-de-dados)
- [Autenticação e Autorização](#-autenticação-e-autorização)
- [Componentes Principais](#-componentes-principais)
- [Páginas](#-páginas)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🎯 Sobre o Projeto

O SANTADECK foi desenvolvido para centralizar o acesso a todos os aplicativos e ferramentas utilizados pela equipe da Imobiliária Santamérica. A plataforma oferece:

- **Interface Unificada**: Acesso a todos os aplicativos em um único lugar
- **Gestão de Usuários**: Controle de permissões e acessos
- **Logs de Atividade**: Rastreamento de ações dos usuários
- **Suporte a Diferentes Tipos de Apps**: Web apps e links úteis
- **Design Moderno**: Interface inspirada em plataformas de jogos modernas

---

## ✨ Funcionalidades

### Para Usuários
- ✅ Login seguro com autenticação via Supabase
- ✅ Dashboard com aplicativos disponíveis
- ✅ Visualização de apps em cards interativos
- ✅ Lançamento de aplicativos web em iframe
- ✅ Acesso a links úteis
- ✅ Interface responsiva e moderna

### Para Administradores
- ✅ Criação e gerenciamento de usuários
- ✅ Adição, edição e exclusão de aplicativos
- ✅ Controle de permissões por usuário
- ✅ Ativação/desativação de contas
- ✅ Visualização de logs de atividade
- ✅ Gerenciamento de tipos de aplicativos (Web App, Link Útil)

---

## 🛠 Tecnologias Utilizadas

### Frontend
- **React 19.2.0** - Biblioteca JavaScript para construção de interfaces
- **TypeScript 5.9.3** - Superset tipado do JavaScript
- **React Router DOM 7.9.6** - Roteamento de páginas
- **Vite 7.2.4** - Build tool e dev server
- **Tailwind CSS 4.1.17** - Framework CSS utilitário

### Backend & Infraestrutura
- **Supabase** - Backend as a Service (BaaS)
  - Autenticação
  - Banco de dados PostgreSQL
  - Row Level Security (RLS)
  - Real-time subscriptions

### Bibliotecas Adicionais
- **Lucide React** - Ícones modernos
- **@supabase/supabase-js** - Cliente JavaScript do Supabase

---

## 📁 Estrutura do Projeto

```
Santadeck/
├── public/                      # Arquivos públicos estáticos
├── src/
│   ├── assets/                  # Imagens e recursos
│   │   ├── logo.png            # Logo da Santamérica
│   │   └── skyline.png         # Imagem de fundo
│   ├── components/              # Componentes reutilizáveis
│   │   ├── AppCard.tsx         # Card de aplicativo
│   │   └── HamburgerMenu.tsx   # Menu lateral
│   ├── contexts/                # Contextos React
│   │   └── AuthContext.tsx     # Contexto de autenticação
│   ├── layouts/                 # Layouts de página
│   │   └── MainLayout.tsx      # Layout principal
│   ├── lib/                     # Bibliotecas e configurações
│   │   └── supabase.ts         # Cliente Supabase
│   ├── pages/                   # Páginas da aplicação
│   │   ├── AppLauncher.tsx     # Lançador de aplicativos
│   │   ├── CreateUser.tsx      # Criação de usuários
│   │   ├── Dashboard.tsx       # Dashboard principal
│   │   ├── EditUser.tsx        # Edição de usuários
│   │   ├── Login.tsx           # Página de login
│   │   ├── Logs.tsx            # Visualização de logs
│   │   ├── ManageUsers.tsx     # Gerenciamento de usuários
│   │   └── Register.tsx        # Registro de usuários
│   ├── App.tsx                  # Componente raiz
│   ├── main.tsx                 # Ponto de entrada
│   └── index.css                # Estilos globais
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 📦 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- Conta no **Supabase** (gratuita)

---

## 🚀 Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd Santadeck
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**

Crie um arquivo `.env` na raiz do projeto com suas credenciais:

```env
VITE_SUPABASE_URL=SUA_URL_DO_SUPABASE
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANONIMA
```

4. **Execute o projeto**
```bash
npm run dev
```

O aplicativo estará disponível em `http://localhost:5173`

---

## ⚙️ Configuração

### Configuração do Supabase

#### 1. Criar Projeto no Supabase
- Acesse [supabase.com](https://supabase.com)
- Crie um novo projeto
- Anote a URL e a chave anônima

#### 2. Criar Tabelas

Execute os seguintes comandos SQL no editor SQL do Supabase:

```sql
-- Tabela de setores
CREATE TABLE departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de perfis de usuários
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de aplicativos
CREATE TABLE apps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  icon_url TEXT,
  type TEXT DEFAULT 'web' CHECK (type IN ('web', 'link')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Atualização para suportar App Externo (Executar se a tabela já existir)
-- ALTER TABLE apps DROP CONSTRAINT apps_type_check;
-- ALTER TABLE apps ADD CONSTRAINT apps_type_check CHECK (type IN ('web', 'link', 'external'));

-- Tabela de permissões de usuários por app
CREATE TABLE user_app_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  app_id UUID REFERENCES apps(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, app_id)
);

-- Tabela de logs de atividade
CREATE TABLE activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  app_id UUID REFERENCES apps(id) ON DELETE SET NULL,
  app_name TEXT,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. Configurar Row Level Security (RLS)

```sql
-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_app_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Usuários podem ver próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins podem ver todos os perfis" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para apps
CREATE POLICY "Usuários podem ver apps" ON apps
  FOR SELECT USING (true);

CREATE POLICY "Admins podem gerenciar apps" ON apps
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para user_app_permissions
CREATE POLICY "Admins podem gerenciar permissões" ON user_app_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Políticas para activity_logs
CREATE POLICY "Usuários podem inserir logs" ON activity_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os logs" ON activity_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

#### 4. Criar Função para Deletar Usuários

```sql
CREATE OR REPLACE FUNCTION delete_user_by_admin(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Verificar se o usuário atual é admin
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Apenas administradores podem excluir usuários';
  END IF;

  -- Deletar o perfil (cascade irá deletar permissões)
  DELETE FROM profiles WHERE id = target_user_id;
  
  -- Deletar o usuário da autenticação
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para criar usuário por admin (contornando restrição de signup)
CREATE OR REPLACE FUNCTION create_user_by_admin(
  email TEXT,
  password TEXT,
  full_name TEXT,
  user_role TEXT,
  department_id UUID,
  app_ids UUID[]
) RETURNS void AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Verificar admin
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Acesso negado';
  END IF;

  -- Criar no auth
  INSERT INTO auth.users (email, password, email_confirmed_at, raw_user_meta_data)
  VALUES (email, crypt(password, gen_salt('bf')), now(), jsonb_build_object('full_name', full_name, 'role', user_role))
  RETURNING id INTO new_user_id;

  -- Atualizar profile (trigger handle_new_user cria o perfil, aqui atualizamos o departamento)
  UPDATE profiles 
  SET department_id = create_user_by_admin.department_id 
  WHERE id = new_user_id;

  -- Inserir permissões
  IF app_ids IS NOT NULL THEN
    INSERT INTO user_app_permissions (user_id, app_id)
    SELECT new_user_id, UNNEST(app_ids);
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### 5. Criar Trigger para Novos Usuários

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 📖 Uso

### Login
1. Acesse a aplicação
2. Faça login com suas credenciais
3. Será redirecionado para o dashboard

### Dashboard
- Visualize todos os aplicativos disponíveis
- Clique em um card para abrir o aplicativo
- Use o menu hambúrguer para acessar outras funcionalidades

### Administração (apenas para admins)
- **Adicionar App**: Clique em "Adicionar App" no dashboard
- **Gerenciar Usuários**: Acesse via menu hambúrguer
- **Visualizar Logs**: Acesse via menu hambúrguer

---

## 🏗 Arquitetura

### Fluxo de Autenticação
1. Usuário faz login via Supabase Auth
2. AuthContext gerencia o estado de autenticação
3. ProtectedRoute valida acesso às rotas
4. Role-based access control (RBAC) para funcionalidades admin

### Fluxo de Dados
```
Componente → Supabase Client → PostgreSQL → Row Level Security → Resposta
```

### Tipos de Aplicativos
- **Web App**: Aplicativos web que podem ser exibidos em iframe
- **Link Útil**: Links externos que abrem em nova aba

---

## 🗄 Banco de Dados

### Tabelas Principais

#### `profiles`
Armazena informações dos usuários
- `id`: UUID (chave primária, referência a auth.users)
- `full_name`: Nome completo
- `role`: Função (admin/user)
- `is_active`: Status da conta
- `created_at`: Data de criação

#### `apps`
Armazena os aplicativos cadastrados
- `id`: UUID (chave primária)
- `name`: Nome do aplicativo
- `description`: Descrição
- `url`: URL ou caminho
- `icon_url`: URL do ícone
- `type`: Tipo (web/link)
- `created_at`: Data de criação

#### `user_app_permissions`
Controla quais usuários têm acesso a quais apps
- `id`: UUID (chave primária)
- `user_id`: Referência ao usuário
- `app_id`: Referência ao app
- `created_at`: Data de criação

#### `activity_logs`
Registra todas as atividades dos usuários
- `id`: UUID (chave primária)
- `user_id`: Referência ao usuário
- `action`: Tipo de ação
- `app_id`: Referência ao app (se aplicável)
- `app_name`: Nome do app
- `details`: Detalhes em JSON
- `created_at`: Data/hora da ação

---

## 🔐 Autenticação e Autorização

### Níveis de Acesso

#### Usuário Comum
- Visualizar apps permitidos
- Abrir aplicativos
- Fazer logout

#### Administrador
- Todas as permissões de usuário comum
- Criar, editar e excluir aplicativos
- Gerenciar usuários
- Visualizar logs de atividade
- Controlar permissões de acesso

### Ações Registradas em Logs
- `user_login`: Login do usuário
- `user_logout`: Logout do usuário
- `app_opened`: Abertura de aplicativo
- `app_created`: Criação de aplicativo
- `app_updated`: Atualização de aplicativo
- `app_deleted`: Exclusão de aplicativo
- `user_created`: Criação de usuário
- `user_updated`: Atualização de usuário
- `user_deleted`: Exclusão de usuário

---

## 🧩 Componentes Principais

### `AppCard`
Card visual para exibir aplicativos no dashboard
- Props: `app`, `isAdmin`, `onDelete`, `onEdit`
- Funcionalidades: Hover effects, botões de edição/exclusão para admins

### `HamburgerMenu`
Menu lateral deslizante
- Exibe informações do usuário
- Links para gerenciamento (apenas admins)
- Botão de logout

### `AuthContext`
Contexto de autenticação global
- Gerencia sessão do usuário
- Controla role (admin/user)
- Fornece função de logout

### `MainLayout`
Layout principal da aplicação
- Header com logo e menu
- Background com imagem da cidade
- Container responsivo para conteúdo

---

## 📄 Páginas

### `Login`
- Autenticação de usuários
- Validação de credenciais
- Registro de log de login

### `Dashboard`
- Exibição de aplicativos em carrossel
- Seção de links úteis
- Modal de adicionar/editar apps (admin)

### `AppLauncher`
- Renderização de apps em iframe
- Detecção de bloqueio de iframe
- Instruções para apps de rede
- Botão para abrir em nova aba

### `ManageUsers`
- Listagem de usuários
- Ativação/desativação de contas
- Edição e exclusão de usuários

### `CreateUser`
- Formulário de criação de usuário
- Seleção de role
- Atribuição de permissões de apps

### `EditUser`
- Edição de informações do usuário
- Alteração de role
- Gerenciamento de permissões

### `Logs`
- Visualização de atividades
- Filtros por tipo de ação
- Informações detalhadas de cada log

---

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto é propriedade da **Imobiliária Santamérica** e é de uso interno.

---

## 👥 Equipe

Desenvolvido para a Imobiliária Santamérica

---

## 📞 Suporte

Para suporte ou dúvidas, entre em contato com a equipe de TI da Santamérica.

---

**SANTADECK** - Centralizando o acesso às ferramentas da Santamérica 🏢
