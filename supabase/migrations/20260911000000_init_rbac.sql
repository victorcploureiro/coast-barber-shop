-- 1. Criar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Roles (Cargos flexíveis)
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  is_custom BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insere os cargos padrão
INSERT INTO public.roles (name, description, is_custom) VALUES
  ('admin', 'Dono/Administrador total do sistema', false),
  ('barber', 'Barbeiro/Atendente', false),
  ('client', 'Cliente final', false)
ON CONFLICT (name) DO NOTHING;

-- 3. Tabela de Permissões
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL
);

-- Insere as permissões base do sistema
INSERT INTO public.permissions (code, description, category) VALUES
  ('view_agenda', 'Visualizar agenda de cortes', 'Agenda'),
  ('manage_appointments', 'Agendar e cancelar horários', 'Agenda'),
  ('manage_services', 'Gerenciar serviços e preços', 'Serviços'),
  ('view_reports', 'Visualizar relatórios financeiros', 'Financeiro'),
  ('manage_store', 'Gerenciar produtos e estoque', 'Loja'),
  ('manage_roles', 'Criar e gerenciar cargos e permissões', 'Acessos')
ON CONFLICT (code) DO NOTHING;

-- 4. Tabela de Junção (Role <-> Permissions Matrix)
CREATE TABLE IF NOT EXISTS public.role_permissions (
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 5. Tabela de Perfis de Usuários
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  role_id UUID REFERENCES public.roles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ativar Row Level Security
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;