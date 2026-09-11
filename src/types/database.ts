export type RoleName = 'admin' | 'barbeiro' | 'recepcionista' | 'cliente';

export interface Profile {
  id: string;
  name: string;
  phone: string | null;
  role_id: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: RoleName;
  description: string;
  is_custom: boolean;
}

export interface Permission {
  id: string;
  code: string;
  description: string;
  category: string;
}

export interface UserAuthContext {
  user: any;
  role: RoleName | null;
  permissions: string[];
  loading: boolean;
  hasPermission: (code: string) => boolean;
}