import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, AlertCircle, Loader2, Plus } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { TabKey } from '@/types';

interface AppointmentDetails {
  id: string;
  date: string;
  time_slot: string;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  services: { name: string } | null;
  barber: { name: string; avatar_url: string } | null;
}

interface AppointmentsPageProps {
  onNavigate?: (tab: TabKey) => void;
}

export default function AppointmentsPage({ onNavigate }: AppointmentsPageProps) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          date,
          time_slot,
          price,
          status,
          services ( name ),
          barber:profiles!appointments_barber_id_fkey ( name, avatar_url )
        `)
        .eq('client_id', user.id)
        .order('date', { ascending: false });

      if (!error && data) {
        setAppointments(data as unknown as AppointmentDetails[]);
      }
    } catch (err) {
      console.error('Erro ao buscar agendamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;

    setCancellingId(id);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (!error) {
        setAppointments((prev) =>
          prev.map((app) => (app.id === id ? { ...app, status: 'cancelled' } : app))
        );
      } else {
        alert('Não foi possível cancelar o agendamento.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancellingId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pb-24">
        <Header title="Meus Agendamentos" />
        <div className="px-5 mt-12 text-center">
          <AlertCircle className="w-12 h-12 text-gold-400 mx-auto mb-3 opacity-80" />
          <h3 className="text-base font-bold text-ink-100 mb-1">Faça login para continuar</h3>
          <p className="text-xs text-ink-400 mb-6">Você precisa estar conectado para visualizar seus agendamentos.</p>
          <button
            onClick={() => onNavigate && onNavigate('profile')}
            className="w-full py-3 rounded-xl gold-gradient text-ink-950 font-bold text-sm"
          >
            Ir para o Perfil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      <Header title="Meus Agendamentos" />

      <main className="px-5 mt-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-ink-400 font-medium">Histórico e Próximos Horários</p>
          <button
            onClick={() => onNavigate && onNavigate('book')}
            className="flex items-center gap-1 text-xs font-bold text-gold-400 bg-gold-500/10 hover:bg-gold-500/20 px-3 py-1.5 rounded-lg border border-gold-400/20 transition-all"
          >
            <Plus size={14} /> Novo
          </button>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="p-8 text-center bg-ink-850 rounded-2xl border border-white/5 mt-4">
            <Calendar className="w-10 h-10 text-ink-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-ink-200">Nenhum agendamento encontrado</p>
            <p className="text-xs text-ink-400 mt-1 mb-4">Reserve um horário com nossos profissionais.</p>
            <button
              onClick={() => onNavigate && onNavigate('book')}
              className="py-2.5 px-5 rounded-xl gold-gradient text-ink-950 font-bold text-xs"
            >
              Agendar Agora
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-ink-850 border border-white/5 space-y-3 relative overflow-hidden"
              >
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <Scissors size={15} className="text-gold-400" />
                    <span className="text-sm font-bold text-ink-100">
                      {app.services?.name || 'Serviço'}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      app.status === 'scheduled'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                        : app.status === 'completed'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}
                  >
                    {app.status === 'scheduled' ? 'Agendado' : app.status === 'completed' ? 'Concluído' : 'Cancelado'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-ink-300">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-ink-400" />
                    <span>{app.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={13} className="text-ink-400" />
                    <span>{app.time_slot}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <User size={13} className="text-ink-400" />
                    <span>Barbeiro: {app.barber?.name || 'Profissional'}</span>
                  </div>
                </div>

                {app.status === 'scheduled' && (
                  <div className="pt-2 border-t border-white/5 flex justify-end">
                    <button
                      disabled={cancellingId === app.id}
                      onClick={() => handleCancelAppointment(app.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold px-2 py-1 rounded transition-colors disabled:opacity-50"
                    >
                      {cancellingId === app.id ? 'Cancelando...' : 'Cancelar Agendamento'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}