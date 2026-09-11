import { Star, Crown, ChevronRight, Scissors, Calendar, Heart, Settings, Bell, CreditCard, HelpCircle, LogOut, Award } from 'lucide-react';
import Header from '@/components/Header';
import { appointments } from '@/data';
import type { TabKey } from '@/types';

interface ProfilePageProps {
  onNavigate: (tab: TabKey) => void;
}

export default function ProfilePage({ onNavigate }: ProfilePageProps) {
  const upcoming = appointments.filter((a) => a.status === 'upcoming');
  const completed = appointments.filter((a) => a.status === 'completed');

  return (
    <div className="min-h-screen pb-24">
      <Header title="Perfil" />

      {/* Profile card */}
      <section className="px-5 mt-4">
        <div className="card p-5">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl gold-gradient flex items-center justify-center shrink-0">
              <span className="font-display text-2xl text-ink-950">JM</span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-ink-100">João Martins</h3>
              <p className="text-xs text-ink-300">joao.martins@email.com</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold-500/10 border border-gold-500/20">
                  <Crown size={11} className="text-gold-400" />
                  <span className="text-[10px] font-semibold text-gold-400">Prata</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={11} className="text-gold-400 fill-gold-400" />
                  <span className="text-[10px] text-ink-200">347 pts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 px-5 mt-4">
        {[
          { icon: Scissors, label: 'Cortes', value: '14' },
          { icon: Calendar, label: 'Visitas', value: '14' },
          { icon: Award, label: 'Fidelidade', value: '8m' },
        ].map((stat) => (
          <div key={stat.label} className="card p-3 text-center">
            <stat.icon size={18} className="text-gold-400 mx-auto mb-1" />
            <p className="font-display text-xl text-ink-100 tracking-wide">{stat.value}</p>
            <p className="text-[10px] text-ink-300">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Upcoming appointment */}
      {upcoming.length > 0 && (
        <section className="px-5 mt-6">
          <h3 className="text-sm font-bold text-ink-100 mb-3">Próximo agendamento</h3>
          <div className="rounded-2xl p-4 bg-gradient-to-br from-gold-500/10 to-transparent border border-gold-500/20">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gold-400" />
                <span className="text-sm font-semibold text-ink-100">{upcoming[0].date}</span>
                <span className="text-xs text-ink-300">às {upcoming[0].time}</span>
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
                <p className="text-sm font-medium text-ink-100">{upcoming[0].service}</p>
                <p className="text-xs text-ink-300">com {upcoming[0].barber}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* History */}
      <section className="px-5 mt-6">
        <h3 className="text-sm font-bold text-ink-100 mb-3">Histórico de visitas</h3>
        <div className="space-y-2.5">
          {completed.map((apt) => (
            <div key={apt.id} className="card card-hover p-3.5 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-ink-800 border border-white/5 flex items-center justify-center shrink-0">
                <Scissors size={18} className="text-gold-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-100">{apt.service}</p>
                <p className="text-xs text-ink-300">{apt.barber} • {apt.date} às {apt.time}</p>
              </div>
              <div className="flex items-center gap-0.5 shrink-0">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={11} className="text-gold-400 fill-gold-400" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Menu */}
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
        <button className="w-full card p-4 flex items-center justify-center gap-2 active:scale-95 transition-transform">
          <LogOut size={18} className="text-red-400" />
          <span className="text-sm font-semibold text-red-400">Sair da conta</span>
        </button>
      </section>

      <p className="text-center text-[10px] text-ink-500 mt-6">Coast Barber Shop v1.0.0</p>
    </div>
  );
}
