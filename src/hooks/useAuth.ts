import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface UserPermissions {
  role: string | null;
  permissions: string[];
  hasPermission: (code: string) => boolean;
}

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Buscar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchPermissions(session.user.id);
      else setLoading(false);
    });

    // Escutar mudanças de autenticação (login/logout)
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchPermissions(session.user.id);
      else {
        setRole(null);
        setPermissions([]);
        setLoading(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function fetchPermissions(userId: string) {
    try {
      const { data, error } = await supabase.rpc('get_user_permissions', { user_id: userId });
      if (error) throw error;

      if (data && data.length > 0) {
        setRole(data[0].role_name);
        setPermissions(data[0].permissions || []);
      }
    } catch (err) {
      console.error('Erro ao buscar permissões:', err);
    } finally {
      setLoading(false);
    }
  }

  const hasPermission = (code: string) => permissions.includes(code);

  return { user, role, permissions, hasPermission, loading };
}