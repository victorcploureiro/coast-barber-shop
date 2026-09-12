import { useState, useEffect } from 'react';
import { 
  Check, ChevronLeft, ChevronRight, Clock, Star, Scissors, Sparkles, 
  Flame, Palette, Eye, Crown, Calendar, Loader2, Plus, XCircle, AlertCircle 
} from 'lucide-react';
import Header from '@/components/Header';
import { services, barbers as defaultBarbers, timeSlots } from '@/data';
import type { Service, Barber } from '@/types';
import { supabase } from '../lib/supabase';
import { useAuth } from '@/hooks/useAuth';

const iconMap: Record<string, typeof Scissors> = {
  scissors: Scissors,
  sparkles: Sparkles,
  flame: Flame,
  palette: Palette,
  eye: Eye,
  crown: Crown,
};

type Step = 'list' | 'service' | 'barber' | 'datetime' | 'confirm';

export default function BookPage() {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('list');
  const [userAppointments, setUserAppointments] = useState<any[]>([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDateIndex, setSelectedDateIndex] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  const [dbBarbers, setDbBarbers] = useState<Barber[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const today = new Date();
  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

  const stepOrder: Step[] = ['service', 'barber', 'datetime', 'confirm'];
  const currentStepIndex = stepOrder.indexOf(step);

  // 1. Carregar agendamentos do usuário
  const fetchUserAppointments = async () => {
    if (!user) {
      setLoadingAppts(false);
      return;
    }
    try {
      const { data } = await supabase
        .from('appointments')
        .select('*, service:services(name), barber:profiles!appointments_barber_id_fkey(name)')
        .eq('client_id', user.id)
        .order('date', { ascending: false })
        .order('time_slot', { ascending: false });

      if (data) setUserAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAppts(false);
    }
  };

  useEffect(() => {
    fetchUserAppointments();
  }, [user]);

  const handleCancel = async (id: string) => {
    if (!confirm('Deseja cancelar este agendamento?')) return;
    setCancellingId(id);
    try {
      await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', id);
      await fetchUserAppointments();
    } finally {
      setCancellingId(null);
    }
  };

  // 2. Trava de Horários Passados e Dias Fechados
  const isClosedDay = (dateObj: Date) => {
    const day = dateObj.getDay();
    return day === 0 || day === 1;
  };

  const getAvailableSlots = (dateObj: Date, allSlots: string[]) => {
    const day = dateObj.getDay();
    if (isClosedDay(dateObj)) return [];

    const now = new Date();
    const isToday = 
      dateObj.getDate() === now.getDate() &&
      dateObj.getMonth() === now.getMonth() &&
      dateObj.getFullYear() === now.getFullYear();

    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    return allSlots.filter((slot) => {
      const [hours, minutes] = slot.split(':').map(Number);
      const slotTotalMinutes = hours * 60 + minutes;

      if (isToday && slotTotalMinutes <= currentMinutes) return false;
      if (day === 6) return slotTotalMinutes <= 1110; // Sábado até 18:30
      return slotTotalMinutes <= 1140; // Terça a Sexta até 19:00
    });
  };

  const getSelectedDateString = (index: number) => {
    const dateObj = dates[index];
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Carregar barbeiros
  useEffect(() => {
    async function fetchBarbers() {
      try {
        const { data, error } = await supabase.from('profiles').select('*').order('name');
        if (!error && data && data.length > 0) {
          setDbBarbers(data.map((b) => ({
            id: b.id,
            name: b.name || 'Barbeiro',
            role: 'Barbeiro',
            image: b.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
            rating: 5.0,
            reviews: 12,
            bio: '',
            specialties: []
          })));
        } else setDbBarbers(defaultBarbers);
      } catch { setDbBarbers(defaultBarbers); }
    }
    fetchBarbers();
  }, []);

  // Buscar slots ocupados no Supabase
  useEffect(() => {
    async function fetchBookedSlots() {
      if (!selectedBarber) return;
      setLoadingSlots(true);
      const formattedDate = getSelectedDateString(selectedDateIndex);
      try {
        const { data } = await supabase
          .from('appointments')
          .select('time_slot')
          .eq('barber_id', selectedBarber.id)
          .eq('date', formattedDate)
          .neq('status', 'cancelled');
        if (data) setBookedSlots(data.map((item) => item.time_slot));
      } finally { setLoadingSlots(false); }
    }
    if (step === 'datetime') fetchBookedSlots();
  }, [selectedBarber, selectedDateIndex, step]);

  const handleNext = () => {
    if (step === 'service' && selectedService) setStep('barber');
    else if (step === 'barber' && selectedBarber) setStep('datetime');
    else if (step === 'datetime' && selectedTime) { setBookingError(null); setStep('confirm'); }
  };

  const handleBack = () => {
    setBookingError(null);
    if (step === 'service') setStep('list');
    else if (step === 'barber') setStep('service');
    else if (step === 'datetime') setStep('barber');
    else if (step === 'confirm') setStep('datetime');
  };

  // Confirmar com Trava Antiduplicação (Overbooking)
  const handleConfirm = async () => {
    if (!selectedService || !selectedBarber || !selectedTime) return;
    setIsSubmitting(true);
    setBookingError(null);
    const formattedDate = getSelectedDateString(selectedDateIndex);

    try {
      // Checagem de disponibilidade em tempo real no banco
      const { data: existingApt } = await supabase
        .from('appointments')
        .select('id')
        .eq('barber_id', selectedBarber.id)
        .eq('date', formattedDate)
        .eq('time_slot', selectedTime)
        .neq('status', 'cancelled')
        .maybeSingle();

      if (existingApt) {
        setBookingError('Este horário acabou de ser reservado. Escolha outro horário.');
        setStep('datetime');
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from('appointments').insert({
        client_id: user?.id || null,
        barber_id: selectedBarber.id,
        service_id: selectedService.id,
        date: formattedDate,
        time_slot: selectedTime,
        price: selectedService.price,
        status: 'scheduled',
      });

      if (error) throw new Error(error.message);

      setConfirmed(true);
      await fetchUserAppointments();
    } catch (err: any) {
      setBookingError(err.message || 'Erro ao realizar agendamento.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setConfirmed(false);
    setBookingError(null);
    setStep('list');
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedTime(null);
    setSelectedDateIndex(0);
  };

  const activeBarbersList = dbBarbers.length > 0 ? dbBarbers : defaultBarbers;

  if (confirmed) {
    return (
      <div className="min-h-screen pb-44">
        <Header title="Agendamento" />
        <div className="flex flex-col items-center justify-center px-5 mt-16 animate-scale-in">
          <div className="h-20 w-20 rounded-full gold-gradient flex items-center justify-center mb-5 shadow-lg shadow-gold-500/30">
            <Check size={40} className="text-ink-950" strokeWidth={3} />
          </div>
          <h2 className="text-xl font-bold text-ink-100 mb-2">Agendamento confirmado!</h2>
          <p className="text-sm text-ink-300 text-center max-w-xs mb-6">
            {selectedService?.name} com {selectedBarber?.name} em {weekdays[dates[selectedDateIndex].getDay()]}, {dates[selectedDateIndex].getDate()} de {months[dates[selectedDateIndex].getMonth()]} às {selectedTime}
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl gold-gradient text-ink-950 text-sm font-semibold active:scale-95 transition-transform"
          >
            Ver Meus Agendamentos
          </button>
        </div>
      </div>
    );
  }

  // --- TELA INICIAL DA ABA: LISTA DE MEUS AGENDAMENTOS ---
  if (step === 'list') {
    const upcoming = userAppointments.filter(a => a.status === 'scheduled');
    const past = userAppointments.filter(a => a.status !== 'scheduled');

    return (
      <div className="min-h-screen pb-24 animate-fade-in">
        <Header title="Agendamentos" />
        <div className="px-5 mt-4 space-y-6">
          <button
            onClick={() => setStep('service')}
            className="w-full py-3.5 rounded-xl gold-gradient text-ink-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 active:scale-95 transition-transform"
          >
            <Plus size={18} strokeWidth={2.5} /> Novo Agendamento
          </button>

          <section>
            <h3 className="text-sm font-bold text-ink-100 mb-3">Próximos Agendamentos</h3>
            {loadingAppts ? (
              <div className="py-8 text-center text-ink-300 flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin text-gold-400" /> Carregando...
              </div>
            ) : upcoming.length === 0 ? (
              <div className="card p-6 text-center text-ink-400">
                <p className="text-sm font-medium">Você não possui agendamentos ativos.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((apt) => (
                  <div key={apt.id} className="card p-4 border border-gold-500/20">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full gold-gradient text-ink-950">
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
                        {cancellingId === apt.id ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                        Cancelar Agendamento
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

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
        </div>
      </div>
    );
  }

  // --- PASSO A PASSO DE NOVO AGENDAMENTO ---
  return (
    <div className="min-h-screen pb-44">
      <Header title="Novo Agendamento" subtitle="Escolha o serviço, barbeiro e horário" />

      {/* Barra de Progresso */}
      <div className="px-5 mt-4">
        <div className="flex items-center gap-2">
          {stepOrder.map((s, i) => (
            <div key={s} className="flex-1">
              <div className={`h-1.5 rounded-full transition-all duration-300 ${
                i <= currentStepIndex ? 'gold-gradient' : 'bg-ink-700'
              }`} />
            </div>
          ))}
        </div>
      </div>

      {bookingError && (
        <div className="mx-5 mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400 flex items-center gap-2.5">
          <AlertCircle size={16} className="shrink-0 text-red-400" />
          <span>{bookingError}</span>
        </div>
      )}

      {/* Passo 1: Serviços */}
      {step === 'service' && (
        <section className="px-5 mt-5 animate-fade-in">
          <div className="space-y-2.5">
            {services.map((service) => {
              const Icon = iconMap[service.icon] ?? Scissors;
              const isSelected = selectedService?.id === service.id;
              return (
                <button
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`card w-full p-4 flex items-center gap-4 text-left transition-all ${
                    isSelected ? 'border-gold-500/50 ring-1 ring-gold-500/30' : 'card-hover'
                  }`}
                >
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? 'gold-gradient' : 'bg-ink-800 border border-white/5'
                  }`}>
                    <Icon size={22} className={isSelected ? 'text-ink-950' : 'text-gold-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-ink-100">{service.name}</h4>
                    <p className="text-xs text-ink-300 mt-0.5 line-clamp-1">{service.description}</p>
                  </div>
                  <span className="font-display text-xl gold-text">R${service.price}</span>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Passo 2: Barbeiros */}
      {step === 'barber' && (
        <section className="px-5 mt-5 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            {activeBarbersList.map((barber) => {
              const isSelected = selectedBarber?.id === barber.id;
              return (
                <button
                  key={barber.id}
                  onClick={() => setSelectedBarber(barber)}
                  className={`card overflow-hidden text-left transition-all ${
                    isSelected ? 'border-gold-500/50 ring-1 ring-gold-500/30' : 'card-hover'
                  }`}
                >
                  <div className="h-36 overflow-hidden relative">
                    <img src={barber.image} alt={barber.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-ink-100">{barber.name}</h4>
                    <p className="text-[11px] text-gold-400 mb-1">{barber.role}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Passo 3: Data e Horário */}
      {step === 'datetime' && (
        <section className="px-5 mt-5 animate-fade-in">
          <h3 className="text-sm font-semibold text-ink-100 mb-3">Escolha a data</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {dates.map((date, i) => {
              const isSelected = selectedDateIndex === i;
              const isClosed = isClosedDay(date);

              return (
                <button
                  key={i}
                  disabled={isClosed}
                  onClick={() => { setSelectedDateIndex(i); setSelectedTime(null); }}
                  className={`shrink-0 w-16 py-3 rounded-xl text-center transition-all ${
                    isClosed
                      ? 'bg-ink-900/40 text-ink-600 opacity-40 cursor-not-allowed border border-white/5'
                      : isSelected
                      ? 'gold-gradient text-ink-950 font-bold shadow-md shadow-gold-500/10'
                      : 'card text-ink-200 card-hover'
                  }`}
                >
                  <p className="text-[10px]">{weekdays[date.getDay()]}</p>
                  <p className="text-xl font-bold mt-0.5">{date.getDate()}</p>
                  <p className="text-[10px]">{isClosed ? 'Fechado' : months[date.getMonth()]}</p>
                </button>
              );
            })}
          </div>

          <h3 className="text-sm font-semibold text-ink-100 mt-5 mb-3">Horários disponíveis</h3>
          {loadingSlots ? (
            <div className="py-8 text-center text-ink-300 flex items-center justify-center gap-2">
              <Loader2 size={18} className="animate-spin text-gold-400" />
              <span className="text-xs">Verificando agenda...</span>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {getAvailableSlots(dates[selectedDateIndex], timeSlots).map((time) => {
                const isBooked = bookedSlots.includes(time);
                const isSelected = selectedTime === time;

                return (
                  <button
                    key={time}
                    disabled={isBooked}
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isSelected
                        ? 'gold-gradient text-ink-950 font-bold'
                        : isBooked
                        ? 'bg-ink-850 text-ink-500 line-through cursor-not-allowed border border-transparent opacity-50'
                        : 'card text-ink-200 card-hover'
                    }`}
                  >
                    {time}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Passo 4: Confirmação */}
      {step === 'confirm' && selectedService && selectedBarber && (
        <section className="px-5 mt-5 animate-fade-in">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-100 mb-4">Confirme seu agendamento</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-ink-300">Serviço</span><span className="text-ink-100 font-medium">{selectedService.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-ink-300">Barbeiro</span><span className="text-ink-100 font-medium">{selectedBarber.name}</span></div>
              <div className="flex justify-between text-sm"><span className="text-ink-300">Data e Horário</span><span className="text-ink-100 font-medium">{dates[selectedDateIndex].getDate()}/{dates[selectedDateIndex].getMonth()+1} às {selectedTime}</span></div>
              <div className="border-t border-white/5 pt-3 flex justify-between"><span className="text-ink-300 text-sm">Total</span><span className="font-display text-2xl gold-text">R${selectedService.price}</span></div>
            </div>
          </div>
        </section>
      )}

      {/* Botões Fixos de Navegação */}
      <div className="fixed bottom-16 left-0 right-0 z-30 px-5 pt-3 pb-3 glass-strong border-t border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="h-12 w-12 rounded-xl bg-ink-800 border border-white/5 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
          >
            <ChevronLeft size={20} className="text-ink-200" />
          </button>
          {step === 'confirm' ? (
            <button
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="flex-1 h-12 rounded-xl gold-gradient text-ink-950 text-sm font-bold active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} strokeWidth={3} />} Confirmar agendamento
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={
                (step === 'service' && !selectedService) ||
                (step === 'barber' && !selectedBarber) ||
                (step === 'datetime' && !selectedTime)
              }
              className="flex-1 h-12 rounded-xl gold-gradient text-ink-950 text-sm font-bold active:scale-95 transition-transform disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-2"
            >
              Continuar <ChevronRight size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}