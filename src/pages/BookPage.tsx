import { useState, useEffect } from 'react';
import { 
  Scissors, CheckCircle2, Loader2, AlertCircle, 
  Trash2, CalendarDays, Clock, History, Check, UserCheck, ChevronDown, Sparkles, Flame, Palette, Eye, Crown
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

const categoryOrder: string[] = ['cabelo', 'barba', 'combo', 'quimica', 'cuidados'];

const categoryLabels: Record<string, string> = {
  cabelo: 'Cabelo & Estilo',
  barba: 'Barba & Ritual',
  combo: 'Combos Exclusivos',
  quimica: 'Tratamentos Químicos',
  cuidados: 'Cuidados & Waxing',
};

export default function BookPage({ preselectedServiceId }: BookPageProps) {
  const { user } = useAuth();

  // Dados
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Controle de Categorias Abertas (Accordion)
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Seleções do Agendamento
  const [selectedService, setSelectedService] = useState<string>(preselectedServiceId || '');
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  // Estados de feedback
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

  // Atualiza a seleção e abre a categoria quando houver serviço pré-selecionado
  useEffect(() => {
    if (preselectedServiceId && services.length > 0) {
      setSelectedService(preselectedServiceId);
      const targetService = services.find(s => s.id === preselectedServiceId);
      if (targetService?.category) {
        const catKey = targetService.category.toLowerCase();
        setOpenCategories({ [catKey]: true });
      }
    } else {
      // Se não houver pré-seleção, mantém todas colapsadas/fechadas
      setOpenCategories({});
    }
  }, [preselectedServiceId, services]);

  const toggleCategory = (catKey: string) => {
    setOpenCategories(prev => ({ ...prev, [catKey]: !prev[catKey] }));
  };

  // Agrupamento de serviços por categoria
  const groupedServices = services.reduce((acc, service) => {
    const cat = service.category?.toLowerCase() || 'outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  const sortedCategories = [
    ...categoryOrder.filter(cat => groupedServices[cat]),
    ...Object.keys(groupedServices).filter(cat => !categoryOrder.includes(cat))
  ];

  // Separação de agendamentos
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const upcomingAppointments = appointments
    .filter((a) => a.status === 'scheduled' && a.date >= todayStr)
    .sort((a, b) => (a.date + a.time_slot).localeCompare(b.date + b.time_slot));
  
  const pastAppointments = appointments
    .filter((a) => a.status !== 'scheduled' || a.date < todayStr)
    .slice(0, 3);

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
      setErrorMessage('Por favor, selecione o serviço, barbeiro, data e horário.');
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
        {/* Banner Feedback Sucesso */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between animate-fade-in shadow-lg">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage('')} className="text-xs text-emerald-400/60 hover:text-emerald-400">✕</button>
          </div>
        )}

        {/* Banner Feedback Erro */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2.5 animate-fade-in">
            <AlertCircle size={18} className="shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {loadingData ? (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-ink-300">
            <Loader2 size={28} className="animate-spin text-gold-400" />
            <span className="text-xs font-medium">Carregando informações...</span>
          </div>
        ) : (
          <>
            {/* 1. AGENDAMENTO ATIVO (Só aparece se houver) */}
            {nextAppointment && (
              <section className="animate-slide-up space-y-3">
                <h3 className="text-xs font-bold text-gold-400 tracking-wider uppercase flex items-center gap-1.5">
                  <CalendarDays size={14} /> Agendamento Ativo
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
              </section>
            )}

            {/* 2. LISTA DE SERVIÇOS EM ACCORDION / CATEGORIAS */}
            <section className="space-y-4">
              <h3 className="text-xs font-bold text-ink-300 tracking-wider uppercase">
                Novo Agendamento
              </h3>

              <form onSubmit={handleCreateAppointment} className="space-y-5">
                {/* Passo 1: Serviços Categorizados */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gold-400">
                    1. Selecione o Serviço
                  </label>
                  
                  <div className="space-y-3">
                    {sortedCategories.map((catKey) => {
                      const isOpen = !!openCategories[catKey];
                      const categoryServices = groupedServices[catKey] || [];

                      return (
                        <div key={catKey} className="card overflow-hidden">
                          <button
                            type="button"
                            onClick={() => toggleCategory(catKey)}
                            className="w-full p-3.5 flex items-center justify-between bg-ink-850 hover:bg-ink-800 transition-colors"
                          >
                            <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">
                              {categoryLabels[catKey] || catKey} ({categoryServices.length})
                            </span>
                            <ChevronDown size={16} className={`text-ink-300 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                          </button>

                          {isOpen && (
                            <div className="p-2 space-y-2 border-t border-white/5">
                              {categoryServices.map((service) => {
                                const isSelected = selectedService === service.id;
                                return (
                                  <div
                                    key={service.id}
                                    onClick={() => setSelectedService(service.id)}
                                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                                      isSelected
                                        ? 'bg-gold-500/10 border-gold-500 text-ink-100 shadow-md'
                                        : 'bg-ink-900/60 border-white/5 hover:border-white/20 text-ink-200'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                        isSelected ? 'gold-gradient text-ink-950' : 'bg-white/5 text-ink-400'
                                      }`}>
                                        <Scissors size={16} />
                                      </div>
                                      <div>
                                        <p className="text-xs font-bold text-ink-100">{service.name}</p>
                                        <p className="text-[10px] text-ink-400">{service.duration} min</p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                      <span className="text-xs font-bold gold-text">R${service.price}</span>
                                      <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                                        isSelected ? 'border-gold-400 bg-gold-400 text-ink-950' : 'border-white/20'
                                      }`}>
                                        {isSelected && <Check size={12} strokeWidth={3} />}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Passo 2: Seleção de Barbeiro */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-gold-400">
                    2. Escolha o Profissional
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {barbers.map((barber) => {
                      const isSelected = selectedBarber === barber.id;
                      return (
                        <button
                          type="button"
                          key={barber.id}
                          onClick={() => setSelectedBarber(barber.id)}
                          className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                            isSelected
                              ? 'bg-gold-500/10 border-gold-500 text-ink-100'
                              : 'bg-ink-900/60 border-white/5 text-ink-300 hover:border-white/20'
                          }`}
                        >
                          <UserCheck size={16} className={isSelected ? 'text-gold-400' : 'text-ink-400'} />
                          <span className="text-xs font-semibold truncate">{barber.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Passo 3: Data e Horário */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gold-400">
                      3. Data
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

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-gold-400">
                      4. Horário
                    </label>
                    <div className="grid grid-cols-5 gap-1.5">
                      {AVAILABLE_TIMES.map((time) => (
                        <button
                          type="button"
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`py-2 rounded-lg text-[11px] font-semibold border transition-all ${
                            selectedTime === time
                              ? 'gold-gradient text-ink-950 border-gold-500'
                              : 'bg-ink-900 border-white/5 text-ink-300 hover:border-gold-500/30'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl gold-gradient text-ink-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
                >
                  {submitting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    'Confirmar Agendamento'
                  )}
                </button>
              </form>
            </section>

            {/* 3. CARD FIXO DE HISTÓRICO (ÚLTIMOS 3 SERVIÇOS) */}
            <section className="pt-2">
              <div className="card p-5 border-white/5 bg-ink-900/40 space-y-3">
                <h4 className="text-xs font-bold text-ink-300 uppercase tracking-wider flex items-center gap-1.5">
                  <History size={14} className="text-gold-400" /> Histórico Recente (Últimos 3)
                </h4>

                {pastAppointments.length > 0 ? (
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
                ) : (
                  <p className="text-xs text-ink-400 text-center py-2">
                    Nenhum serviço anterior encontrado.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}