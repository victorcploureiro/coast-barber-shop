import { useState, useEffect } from 'react';
import { 
  Star, Crown, ChevronRight, Scissors, Calendar, Heart, Settings, 
  Bell, CreditCard, HelpCircle, LogOut, Award, Loader2, Mail, Lock, User as UserIcon, Phone 
} from 'lucide-react';
import Header from '@/components/Header';
import { BRAND_CONFIG } from '@/config/brand';
import type { TabKey } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface ProfilePageProps {
  onNavigate: (tab: TabKey) => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut } = useAuth();

  // Estados para o Formulário de Auth
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estados de dados do Usuário Logado
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userAppointments, setUserAppointments] = useState<any[]>([]);

  // Buscar perfil e agendamentos reais do usuário
  useEffect(() => {
    if (!user) return;

    async function loadUserData() {
      try {
        // 1. Dados do perfil
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) setUserProfile(profile);

        // 2. Agendamentos
        const { data: apts } = await supabase
          .from('appointments')
          .select('*, service:services(name), barber:profiles!appointments_barber_id_fkey(name)')
          .eq('client_id', user.id)
          .order('date', { ascending: false });

        if (apts) setUserAppointments(apts);
      } catch (err) {
        console.error('Erro ao carregar dados do perfil:', err);
      }
    }

    loadUserData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(email, password, name, phone);
        if (error) throw error;
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) throw error;
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocorreu um erro na autenticação.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    );
  }

  // --- TELA DE AUTENTICAÇÃO (SE NÃO ESTIVER LOGADO) ---
  if (!user) {
    return (
      <div className="min-h-screen pb-24 px-5 flex flex-col justify-center animate-fade-in">
        <div className="text-center mb-8">
          <div className="h-24 w-24 mx-auto rounded-full border-2 border-gold-500/30 overflow-hidden mb-3 bg-zinc-900 flex items-center justify-center p-2 shadow-xl">
            <img src="/logo.png" alt="Coast Barber Shop" className="w-full h-full object-contain" onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }} />
            <Scissors size={32} className="text-gold-400" />
          </div>
          <h2 className="text-2xl font-bold text-ink-100">{BRAND_CONFIG.name}</h2>
          <p className="text-xs gold-text font-medium mt-1 tracking-wider uppercase">O Clássico Nunca Morre</p>
        </div>

        <div className="card p-6">
          <div className="flex border-b border-white/5 mb-6">
            <button
              onClick={() => { setIsSignUp(false); setErrorMsg(null); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${
                !isSignUp ? 'text-gold-400' : 'text-ink-400'
              }`}
            >
              Entrar
              {!isSignUp && <div className="absolute bottom-0 left-0 right-0 h-0.5 gold-gradient" />}
            </button>
            <button
              onClick={() => { setIsSignUp(true); setErrorMsg(null); }}
              className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${
                isSignUp ? 'text-gold-400' : 'text-ink-400'
              }`}
            >
              Criar Conta
              {isSignUp && <div className="absolute bottom-0 left-0 right-0 h-0.5 gold-gradient" />}
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="relative">
                  <UserIcon size={18} className="absolute left-3.5 top-3.5 text-ink-400" />
                  <input
                    type="text"
                    required
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-ink-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-ink-100 focus:outline-none focus:border-gold-500/50"
                  />
                </div>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-3.5 text-ink-400" />
                  <input
                    type="tel"
                    required
                    placeholder="Seu WhatsApp"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-ink-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-ink-100 focus:outline-none focus:border-gold-500/50"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail size={18} className="absolute left-3.5 top-3.5 text-ink-400" />
              <input
                type="email"
                required
                placeholder="Seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-ink-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-ink-100 focus:outline-none focus:border-gold-500/50"
              />
            </div>

            <div className="relative">
              <Lock size={18} className="absolute left-3.5 top-3.5 text-ink-400" />
              <input
                type="password"
                required
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-ink-900 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-ink-100 focus:outline-none focus:border-gold-500/50"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl gold-gradient text-ink-950 font-bold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : (isSignUp ? 'Cadastrar' : 'Entrar')}
            </button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
            <span className="relative px-3 bg-ink-900 text-[11px] text-ink-400 uppercase tracking-wider">ou continue com</span>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full py-3 rounded-xl card card-hover flex items-center justify-center gap-3 text-sm font-medium text-ink-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"/>
            </svg>
            Entrar com Google
          </button>
        </div>
      </div>
    );
  }

  // --- TELA DE PERFIL (QUANDO LOGADO) ---
  const displayName = userProfile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Cliente';
  const displayEmail = user.email || '';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

  const upcomingApts = userAppointments.filter(a => a.status === 'scheduled');
  const completedApts = userAppointments.filter(a => a.status === 'completed');

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      <Header title="Perfil" />

      {/* Cartão de Perfil */}
      <section className="px-5 mt-4">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl gold-gradient flex items-center justify-center shrink-0 shadow-lg shadow-gold-500/10">
              <span className="font-display text-2xl text-ink-950 font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-ink-100 truncate">{displayName}</h3>
              <p className="text-xs text-ink-300 truncate">{displayEmail}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/20">
                  <Crown size={11} className="text-gold-400" />
                  <span className="text-[10px] font-semibold text-gold-400">Membro</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={11} className="text-gold-400 fill-gold-400" />
                  <span className="text-[10px] text-ink-200">100 pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="grid grid-cols-3 gap-3 px-5 mt-4">
        {[
          { icon: Scissors, label: 'Cortes', value: completedApts.length.toString() },
          { icon: Calendar, label: 'Visitas', value: completedApts.length.toString() },
          { icon: Award, label: 'Fidelidade', value: 'Ativo' },
        ].map((stat) => (
          <div key={stat.label} className="card p-3 text-center">
            <stat.icon size={18} className="text-gold-400 mx-auto mb-1" />
            <p className="font-display text-xl text-ink-100 tracking-wide">{stat.value}</p>
            <p className="text-[10px] text-ink-300">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Próximo Agendamento */}
      {upcomingApts.length > 0 && (
        <section className="px-5 mt-6">
          <h3 className="text-sm font-bold text-ink-100 mb-3">Próximo agendamento</h3>
          <div className="rounded-2xl p-4 bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gold-400" />
                <span className="text-sm font-semibold text-ink-100">{upcomingApts[0].date}</span>
                <span className="text-xs text-ink-300">às {upcomingApts[0].time_slot}</span>
              </div>
              <span className="text-[10px] font-semibold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
                CONFIRMADO
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-ink-800 border border-white/5 flex items-center justify-center">
                <Scissors size={18} className="text-gold-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-100">{upcomingApts[0].service?.name || 'Serviço'}</p>
                <p className="text-xs text-ink-300">com {upcomingApts[0].barber?.name || 'Barbeiro'}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Menu de Configurações */}
      <section className="px-5 mt-6">
        <div className="card overflow-hidden divide-y divide-white/5">
          {[
            { icon: Heart, label: 'Favoritos', action: () => {} },
            { icon: CreditCard, label: 'Métodos de pagamento', action: () => {} },
            { icon: Bell, label: 'Notificações', action: () => {} },
            { icon: Settings, label: 'Configurações', action: () => {} },
            { icon: HelpCircle, label: 'Ajuda e suporte', action: () => {} },
          ].map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full p-4 flex items-center gap-3 active:bg-ink-800 transition-colors"
            >
              <item.icon size={18} className="text-ink-300" />
              <span className="flex-1 text-left text-sm text-ink-100">{item.label}</span>
              <ChevronRight size={16} className="text-ink-400" />
            </button>
          ))}
        </div>
      </section>

      {/* Logout */}
      <section className="px-5 mt-4">
        <button 
          onClick={signOut}
          className="w-full card p-4 flex items-center justify-center gap-2 active:scale-95 transition-transform border border-red-500/20"
        >
          <LogOut size={18} className="text-red-400" />
          <span className="text-sm font-semibold text-red-400">Sair da conta</span>
        </button>
      </section>

      <p className="text-center text-[10px] text-ink-500 mt-6">{BRAND_CONFIG.name} v1.0.0</p>
    </div>
  );
}