import { useState, useEffect } from 'react';
import { Calendar, Clock, Scissors, XCircle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchAppointments = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*, service:services(name, price), barber:profiles!appointments_barber_id_fkey(name)')
        .eq('client_id', user.id)
        .order('date', { ascending: false })
        .order('time_slot', { ascending: false });

      if (!error && data) {
        setAppointments(data);
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

  const handleCancel = async (id: string) => {
    if (!confirm('Tem certeza que deseja cancelar este agendamento?')) return;

    setCancellingId(id);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (!error) {
        await fetchAppointments();
      }
    } catch (err) {
      console.error('Erro ao cancelar agendamento:', err);
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-gold-400 animate-spin" />
      </div>
    );
  }

  const upcoming = appointments.filter(a => a.status === 'scheduled');
  const past = appointments.filter(a => a.status !== 'scheduled');

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      <Header title="Meus Agendamentos" />

      <main className="px-5 mt-4 space-y-6">
        {/* Agendamentos Ativos */}
        <section>
          <h3 className="text-sm font-bold text-ink-100 mb-3">Próximos Agendamentos</h3>
          {upcoming.length === 0 ? (
            <div className="card p-6 text-center text-ink-400">
              <p className="text-sm font-medium">Nenhum agendamento ativo.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((apt) => (
                <div key={apt.id} className="card p-4 border border-gold-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full gold-gradient text-ink-950">
                      Confirmado
                    </span>
                    <span className="text-xs text-ink-300 flex items-center gap-1">
                      <Calendar size={13} className="text-gold-400" />
                      {apt.date} às {apt.time_slot}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 my-2">
                    <div className="h-10 w-10 rounded-xl bg-ink-800 border border-white/5 flex items-center justify-center">
                      <Scissors size={18} className="text-gold-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink-100">{apt.service?.name}</p>
                      <p className="text-xs text-ink-300">com {apt.barber?.name}</p>
                    </div>
                    <p className="font-display text-lg gold-text">R${apt.price}</p>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-end">
                    <button
                      disabled={cancellingId === apt.id}
                      onClick={() => handleCancel(apt.id)}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
                    >
                      {cancellingId === apt.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <XCircle size={14} />
                      )}
                      Cancelar Agendamento
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Histórico */}
        {past.length > 0 && (
          <section>
            <h3 className="text-sm font-bold text-ink-100 mb-3">Histórico / Cancelados</h3>
            <div className="space-y-2.5">
              {past.map((apt) => (
                <div key={apt.id} className="card p-3.5 flex items-center gap-3 opacity-60">
                  <div className="h-9 w-9 rounded-xl bg-ink-850 flex items-center justify-center shrink-0">
                    <Scissors size={16} className="text-ink-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-200">{apt.service?.name}</p>
                    <p className="text-xs text-ink-400">{apt.date} • {apt.time_slot}</p>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    apt.status === 'cancelled' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                  }`}>
                    {apt.status === 'cancelled' ? 'Cancelado' : 'Concluído'}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}