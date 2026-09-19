import { useState, useEffect } from 'react';
import { 
  Scissors, CheckCircle2, Loader2, AlertCircle, 
  Trash2, PlusCircle, CalendarDays, Clock, History, 
  ChevronDown, ChevronUp, ChevronRight 
} from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { syncAppointmentToGoogleCalendar } from '@/lib/googleCalendar';
import type { Service, TabKey } from '@/types';

interface Barber {
  id: string;
  name: string;
  avatar_url?: string;
}

interface Appointment {
  id: string;
  date: string;
  time_slot: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  service: { name: string; price: number; duration: number };
  barber: { name: string };
}

interface BookPageProps {
  onNavigate: (tab: TabKey, serviceId?: string) => void;
  preselectedServiceId?: string;
}

const AVAILABLE_TIMES = [
  '09:00', '10:00', '11:00', '13:00', '14:00', 
  '15:00', '16:00', '17:00', '18:00', '19:00'
];

export default function BookPage({ preselectedServiceId }: BookPageProps) {
  const { user } = useAuth();

  // Estados de dados
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Estados do formulário expansível
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(!!preselectedServiceId);
  const [selectedService, setSelectedService] = useState<string>(preselectedServiceId || '');
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Feedback e carregamento
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Carrega agendamentos, serviços e barbeiros
  const loadPageData = async () => {
    setLoadingData(true);
    try {
      const { data: servs } = await supabase.from('services').select('*').order('price');
      if (servs) setServices(servs);

      const { data: barbs } = await supabase.from('profiles').select('*').ilike('role', 'barbeiro');
      if (barbs) setBarbers(barbs);

      if (user) {
        const { data: apts, error: aptsError } = await supabase
          .from('appointments')
          .select('*, service:services(name, price, duration), barber:profiles(name)')
          .eq('client_id', user.id)
          .order('date', { ascending: false })
          .order('time_slot', { ascending: false });

        if (!aptsError && apts) {
          setAppointments(apts as any);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, [user]);

  // Atualiza a seleção e abre o form caso venha pré-selecionado da Home
  useEffect(() => {
    if (preselectedServiceId) {
      setSelectedService(preselectedServiceId);
      setIsBookingOpen(true);
    }
  }, [preselectedServiceId]);

  // Separação dos agendamentos
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const upcomingAppointments = appointments
    .filter((a) => a.status === 'scheduled' && a.date >= todayStr)
    .sort((a, b) => (a.date + a.time_slot).localeCompare(b.date + b.time_slot));
  
  const pastAppointments = appointments.filter(
    (a) => a.status !== 'scheduled' || a.date < todayStr
  );

  const nextAppointment = upcomingAppointments[0];

  // Criar agendamento
  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!user) {
      setErrorMessage('Você precisa estar logado para agendar.');
      return;
    }

    if (!selectedService || !selectedBarber || !selectedDate || !selectedTime) {
      setErrorMessage('Por favor, preencha todos os campos do agendamento.');
      return;
    }

    setSubmitting(true);

    try {
      const { data, error } = await supabase.from('appointments').insert({
        client_id: user.id,
        service_id: selectedService,
        barber_id: selectedBarber,
        date: selectedDate,
        time_slot: selectedTime,
        status: 'scheduled'
      }).select('*, service:services(name, duration), barber:profiles(name)').single();

      if (error) throw error;

      // Sincronização preparada com Google Agenda
      if (data) {
        const serviceObj = services.find(s => s.id === selectedService);
        const barberObj = barbers.find(b => b.id === selectedBarber);
        const durationMinutes = serviceObj?.duration || 30;
        const startISO = `${selectedDate}T${selectedTime}:00-03:00`;
        const endDate = new Date(new Date(startISO).getTime() + durationMinutes * 60000);

        await syncAppointmentToGoogleCalendar({
          summary: `Barbearia: ${serviceObj?.name || 'Agendamento'}`,
          description: `Cliente: ${user.email} | Barbeiro: ${barberObj?.name || ''}`,
          startDateTime: startISO,
          endDateTime: endDate.toISOString(),
          clientEmail: user.email,
        });
      }

      setSuccessMessage('Agendamento realizado com sucesso!');
      setSelectedService('');
      setSelectedBarber('');
      setSelectedDate('');
      setSelectedTime('');
      setIsBookingOpen(false);

      await loadPageData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Erro ao agendar:', err);
      setErrorMessage(err.message || 'Erro ao realizar agendamento.');
    } finally {
      setSubmitting(false);
    }
  };

  // Cancelar agendamento
  const handleCancelAppointment = async (id: string) => {
    if (!confirm('Deseja realmente cancelar este agendamento?')) return;

    setCancellingId(id);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', id);

      if (error) throw error;
      await loadPageData();
    } catch (err) {
      console.error('Erro ao cancelar:', err);
      alert('Não foi possível cancelar o agendamento.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="min-h-screen pb-28">
      <Header title="Agendamento" />

      <main className="px-5 mt-3 space-y-6">
        {/* Banner de Feedback - Sucesso */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-fade-in shadow-lg">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-xs text-emerald-400/60 hover:text-emerald-400">✕</button>
          </div>
        )}

        {/* Banner de Feedback - Erro */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {loadingData ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-ink-300">
            <Loader2 size={28} className="animate-spin text-gold-400" />
            <span className="text-xs font-medium">Carregando agendamentos...</span>
          </div>
        ) : (
          <>
            {/* 1. TOPO DA TELA: PRÓXIMO AGENDAMENTO (Oculta completamente se não houver agendamentos futuros) */}
            {nextAppointment && (
              <section className="animate-slide-up space-y-3">
                <h3 className="text-xs font-bold text-gold-400 tracking-wider uppercase flex items-center gap-1.5">
                  <CalendarDays size={14} /> Próximo Agendamento
                </h3>
                <div className="rounded-2xl p-5 bg-gradient-to-br from-gold-500/15 via-ink-900 to-ink-950 border border-gold-500/40 shadow-xl relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full gold-gradient text-ink-950">
                      Confirmado
                    </span>
                    <span className="text-xs text-ink-200 font-semibold flex items-center gap-1.5">
                      <Clock size={13} className="text-gold-400" />
                      {nextAppointment.date} às {nextAppointment.time_slot}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 my-3">
                    <div className="h-12 w-12 rounded-xl gold-gradient flex items-center justify-center text-ink-950 shrink-0 shadow-md">
                      <Scissors size={22} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-base font-bold text-ink-100 truncate">
                        {nextAppointment.service?.name}
                      </h4>
                      <p className="text-xs text-ink-300">
                        Com <span className="text-gold-400 font-medium">{nextAppointment.barber?.name}</span>
                      </p>
                    </div>
                    <span className="font-display text-lg gold-text font-bold">
                      R${nextAppointment.service?.price}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                    <button
                      onClick={() => handleCancelAppointment(nextAppointment.id)}
                      disabled={cancellingId === nextAppointment.id}
                      className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 active:scale-95 transition-all"
                    >
                      {cancellingId === nextAppointment.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <Trash2 size={13} />
                      )}
                      Cancelar
                    </button>
                  </div>
                </div>

                {/* Outros agendamentos futuros, se houver mais de 1 */}
                {upcomingAppointments.length > 1 && (
                  <div className="space-y-2 pt-1">
                    <h4 className="text-[11px] font-bold text-ink-300 uppercase tracking-wider">
                      Outros Serviços Agendados ({upcomingAppointments.length - 1})
                    </h4>
                    {upcomingAppointments.slice(1).map((apt) => (
                      <div key={apt.id} className="card p-3.5 flex items-center justify-between border-white/5">
                        <div className="flex items-center gap-3">
                          <Scissors size={15} className="text-gold-400" />
                          <div>
                            <p className="text-xs font-semibold text-ink-100">{apt.service?.name}</p>
                            <p className="text-[10px] text-ink-400">{apt.date} às {apt.time_slot} • {apt.barber?.name}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleCancelAppointment(apt.id)}
                          className="text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* 2. MEIO DA TELA: FORMULÁRIO DE NOVO AGENDAMENTO */}
            <section className="pt-1">
              <div className="card border-gold-500/30 overflow-hidden transition-all">
                <button
                  onClick={() => setIsBookingOpen(!isBookingOpen)}
                  className="w-full p-4 flex items-center justify-between bg-gradient-to-r from-ink-900 to-ink-950 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg gold-gradient flex items-center justify-center text-ink-950 shrink-0">
                      <PlusCircle size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-ink-100">Agendar Serviço</h3>
                      <p className="text-[11px] text-ink-400">Escolha o serviço, barbeiro, data e horário</p>
                    </div>
                  </div>
                  {isBookingOpen ? (
                    <ChevronUp size={18} className="text-gold-400" />
                  ) : (
                    <ChevronDown size={18} className="text-ink-400" />
                  )}
                </button>

                {isBookingOpen && (
                  <div className="p-5 border-t border-white/5 animate-fade-in">
                    <form onSubmit={handleCreateAppointment} className="space-y-4">
                      {/* 1. Serviço */}
                      <div>
                        <label className="block text-xs font-semibold text-ink-300 mb-1.5">
                          1. Escolha o Serviço
                        </label>
                        <select
                          value={selectedService}
                          onChange={(e) => setSelectedService(e.target.value)}
                          required
                          className="w-full bg-ink-900 border border-white/10 rounded-xl p-3 text-xs text-ink-100 focus:border-gold-500 focus:outline-none"
                        >
                          <option value="">Selecione um serviço...</option>
                          {services.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name} - R${s.price} ({s.duration} min)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 2. Barbeiro */}
                      <div>
                        <label className="block text-xs font-semibold text-ink-300 mb-1.5">
                          2. Escolha o Barbeiro
                        </label>
                        <select
                          value={selectedBarber}
                          onChange={(e) => setSelectedBarber(e.target.value)}
                          required
                          className="w-full bg-ink-900 border border-white/10 rounded-xl p-3 text-xs text-ink-100 focus:border-gold-500 focus:outline-none"
                        >
                          <option value="">Selecione o profissional...</option>
                          {barbers.map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 3. Data */}
                      <div>
                        <label className="block text-xs font-semibold text-ink-300 mb-1.5">
                          3. Selecione a Data
                        </label>
                        <input
                          type="date"
                          min={todayStr}
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          required
                          className="w-full bg-ink-900 border border-white/10 rounded-xl p-3 text-xs text-ink-100 focus:border-gold-500 focus:outline-none"
                        />
                      </div>

                      {/* 4. Horário */}
                      <div>
                        <label className="block text-xs font-semibold text-ink-300 mb-1.5">
                          4. Escolha o Horário
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {AVAILABLE_TIMES.map((time) => (
                            <button
                              type="button"
                              key={time}
                              onClick={() => setSelectedTime(time)}
                              className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                                selectedTime === time
                                  ? 'gold-gradient text-ink-950 border-gold-500 shadow-sm'
                                  : 'bg-ink-900 border-white/5 text-ink-300 hover:border-gold-500/30'
                              }`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3.5 rounded-xl gold-gradient text-ink-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform mt-3"
                      >
                        {submitting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          'Finalizar e Agendar Serviço'
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </section>

            {/* 3. PARTE INFERIOR: CARD DE HISTÓRICO DE AGENDAMENTOS */}
            {pastAppointments.length > 0 && (
              <section className="pt-2">
                <div className="card p-5 border-white/5 bg-ink-900/40 space-y-3">
                  <h4 className="text-xs font-bold text-ink-300 uppercase tracking-wider flex items-center gap-1.5">
                    <History size={14} className="text-gold-400" /> Histórico de Serviços
                  </h4>
                  <div className="space-y-2">
                    {pastAppointments.map((apt) => (
                      <div 
                        key={apt.id} 
                        className="p-3 rounded-xl bg-ink-950/60 border border-white/5 flex items-center justify-between opacity-85"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-white/5 flex items-center justify-center text-ink-300 shrink-0">
                            <Scissors size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-ink-100">{apt.service?.name}</p>
                            <p className="text-[10px] text-ink-400">
                              {apt.date} • {apt.barber?.name}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          apt.status === 'completed' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {apt.status === 'completed' ? 'Concluído' : 'Cancelado'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}