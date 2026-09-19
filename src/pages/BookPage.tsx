import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, CheckCircle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { TabKey } from '@/types';

const ROLE_BARBER_ID = '9edfdd5a-7095-472b-8498-27952e6750b8';

// Função ajustada para incluir o horário limite exatamente (ex: 19:00 e 18:30)
const generateTimeSlots = (startHour: number, startMinute: number, endHour: number, endMinute: number) => {
  const slots: string[] = [];
  let current = new Date();
  current.setHours(startHour, startMinute, 0, 0);

  const end = new Date();
  end.setHours(endHour, endMinute, 0, 0);

  while (current <= end) {
    const hours = String(current.getHours()).padStart(2, '0');
    const minutes = String(current.getMinutes()).padStart(2, '0');
    slots.push(`${hours}:${minutes}`);
    current.setMinutes(current.getMinutes() + 30);
  }

  return slots;
};

// Terça a Sexta: 09:00 até 19:00
const WEEKDAY_SLOTS = generateTimeSlots(9, 0, 19, 0);

// Sábado: 09:00 até 18:30
const SATURDAY_SLOTS = generateTimeSlots(9, 0, 18, 30);

interface Service {
  id: string;
  name: string;
  price: number;
  category?: string;
  duration?: number;
}

interface Barber {
  id: string;
  name: string;
  avatar_url?: string;
}

interface Appointment {
  barber_id: string;
  time_slot: string;
  date: string;
  status: string;
}

interface BookPageProps {
  onNavigate?: (tab: TabKey, barberId?: string) => void;
  initialBarberId?: string | null;
  onClearInitialBarber?: () => void;
}

export default function BookPage({
  onNavigate,
  initialBarberId,
  onClearInitialBarber,
}: BookPageProps) {
  const { user } = useAuth();

  const [services, setServices] = useState<Service[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [existingAppointments, setExistingAppointments] = useState<Appointment[]>([]);

  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // 1. Carregar Serviços e Barbeiros
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: servicesData } = await supabase.from('services').select('*');
        if (servicesData) setServices(servicesData);

        const { data: userRolesData } = await supabase
          .from('user_roles')
          .select('user_id, profiles!inner(id, name, avatar_url)')
          .eq('role_id', ROLE_BARBER_ID);

        let list: Barber[] = [];

        if (userRolesData && userRolesData.length > 0) {
          list = userRolesData.map((item: any) => item.profiles).filter(Boolean);
        }

        if (list.length === 0) {
          const { data: profilesBarbers } = await supabase
            .from('profiles')
            .select('id, name, avatar_url')
            .eq('role', 'barbeiro');
          if (profilesBarbers) list = profilesBarbers;
        }

        setBarbers(list);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Aplicar barbeiro vindo da Home
  useEffect(() => {
    if (initialBarberId && barbers.length > 0) {
      const barber = barbers.find((b) => b.id === initialBarberId);
      if (barber) setSelectedBarber(barber);
      if (onClearInitialBarber) onClearInitialBarber();
    }
  }, [initialBarberId, barbers, onClearInitialBarber]);

  // 3. Buscar agendamentos existentes da data
  useEffect(() => {
    const fetchAppointments = async () => {
      if (!selectedDate) return;
      const { data } = await supabase
        .from('appointments')
        .select('barber_id, time_slot, status, date')
        .eq('date', selectedDate)
        .neq('status', 'cancelled');

      if (data) setExistingAppointments(data);
    };

    fetchAppointments();
  }, [selectedDate]);

  // Categorias únicas
  const categories = ['todos', ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))];

  const filteredServices = activeCategory === 'todos'
    ? services
    : services.filter((s) => s.category === activeCategory);

  // Verificação de dias sem funcionamento (Domingo = 0, Segunda = 1)
  const getDayOfWeek = (dateStr: string) => {
    return new Date(dateStr + 'T00:00:00').getDay();
  };

  const isClosedDay = (dateStr: string) => {
    const day = getDayOfWeek(dateStr);
    return day === 0 || day === 1;
  };

  // Retorna a grade de horários
  const getTimeSlotsForDate = (dateStr: string) => {
    const day = getDayOfWeek(dateStr);
    if (day === 6) return SATURDAY_SLOTS; // Sábado
    return WEEKDAY_SLOTS; // Terça a Sexta
  };

  // Verifica se o horário já passou na data de hoje
  const isTimeSlotInPast = (timeSlot: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate !== today) return false;

    const [hours, minutes] = timeSlot.split(':').map(Number);
    const now = new Date();
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    return now > slotTime;
  };

  // Verifica se o barbeiro já está ocupado no horário
  const isSlotBookedForBarber = (barberId: string, timeSlot: string) => {
    return existingAppointments.some(
      (a) => a.barber_id === barberId && a.time_slot === timeSlot
    );
  };

  const handleCreateAppointment = async () => {
    if (!user) {
      if (onNavigate) onNavigate('profile');
      return;
    }
    if (!selectedService || !selectedBarber || !selectedTimeSlot || !selectedDate) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from('appointments').insert({
        client_id: user.id,
        barber_id: selectedBarber.id,
        service_id: selectedService.id,
        date: selectedDate,
        time_slot: selectedTimeSlot,
        price: selectedService.price,
        status: 'scheduled',
      });

      if (!error) {
        setSuccess(true);
      } else {
        alert('Erro ao realizar agendamento. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
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

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-5 text-center">
        <CheckCircle className="w-16 h-16 text-green-400 mb-4 animate-bounce" />
        <h2 className="text-xl font-bold text-ink-100 mb-2">Agendamento Confirmado!</h2>
        <p className="text-sm text-ink-400 mb-6">Seu horário foi reservado com sucesso.</p>
        <button
          onClick={() => onNavigate && onNavigate('appointments')}
          className="w-full py-3.5 rounded-xl gold-gradient text-ink-950 font-bold text-sm"
        >
          Ver Meus Agendamentos
        </button>
      </div>
    );
  }

  const currentSlots = getTimeSlotsForDate(selectedDate);
  const closed = isClosedDay(selectedDate);

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      <Header title="Novo Agendamento" />

      <main className="px-5 mt-4 space-y-6">
        {/* SERVIÇOS AGRUPADOS POR CATEGORIA */}
        <section>
          <h3 className="text-sm font-bold text-ink-100 mb-3 flex items-center gap-2">
            <Scissors size={16} className="text-gold-400" /> Escolha o Serviço
          </h3>

          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none mb-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat!)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-gold-500 text-ink-950 font-bold'
                    : 'bg-ink-850 text-ink-300 border border-white/5 hover:border-white/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-2.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
            {filteredServices.map((srv) => (
              <div
                key={srv.id}
                onClick={() => setSelectedService(srv)}
                className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  selectedService?.id === srv.id
                    ? 'border-gold-400 bg-gold-500/10'
                    : 'border-white/5 bg-ink-850 hover:border-white/20'
                }`}
              >
                <div>
                  <p className="text-sm font-semibold text-ink-100">{srv.name}</p>
                  <p className="text-xs text-gold-400 font-bold mt-0.5">R$ {srv.price}</p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    selectedService?.id === srv.id ? 'border-gold-400 bg-gold-400' : 'border-ink-500'
                  }`}
                >
                  {selectedService?.id === srv.id && <div className="w-2 h-2 rounded-full bg-ink-950" />}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* DATA */}
        <section>
          <h3 className="text-sm font-bold text-ink-100 mb-3 flex items-center gap-2">
            <Calendar size={16} className="text-gold-400" /> Escolha a Data
          </h3>
          <input
            type="date"
            min={new Date().toISOString().split('T')[0]}
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTimeSlot(null);
            }}
            className="w-full bg-ink-850 border border-white/10 rounded-xl p-3 text-sm text-ink-100 focus:outline-none focus:border-gold-400"
          />
          {closed && (
            <p className="text-xs text-red-400 mt-2 font-medium">
              Não funcionamos aos domingos e segundas-feiras. Selecione outra data.
            </p>
          )}
        </section>

        {/* BARBEIROS (SEM ESTRELAS / RATING) */}
        <section>
          <h3 className="text-sm font-bold text-ink-100 mb-3 flex items-center gap-2">
            <User size={16} className="text-gold-400" /> Escolha o Barbeiro
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {barbers.map((barber) => {
              const isSelected = selectedBarber?.id === barber.id;
              return (
                <div
                  key={barber.id}
                  onClick={() => setSelectedBarber(isSelected ? null : barber)}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'border-gold-400 bg-gold-500/10'
                      : 'border-white/5 bg-ink-850 hover:border-white/20'
                  }`}
                >
                  {barber.avatar_url ? (
                    <img
                      src={barber.avatar_url}
                      alt={barber.name}
                      className="w-9 h-9 rounded-full object-cover border border-gold-400/30"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-ink-700 flex items-center justify-center text-xs font-bold text-gold-400">
                      {barber.name.charAt(0)}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-ink-100 truncate">{barber.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* HORÁRIOS DE 30 EM 30 MINUTOS */}
        <section>
          <h3 className="text-sm font-bold text-ink-100 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-gold-400" /> Escolha o Horário
          </h3>
          <div className="grid grid-cols-4 gap-2">
            {currentSlots.map((slot) => {
              const inPast = isTimeSlotInPast(slot);
              const isOccupied =
                selectedBarber && isSlotBookedForBarber(selectedBarber.id, slot);
              const isDisabled = inPast || !!isOccupied || closed;
              const isSelected = selectedTimeSlot === slot;

              return (
                <button
                  key={slot}
                  disabled={isDisabled}
                  onClick={() => setSelectedTimeSlot(isSelected ? null : slot)}
                  className={`py-2 px-1 rounded-xl border text-xs font-semibold text-center transition-all ${
                    isDisabled
                      ? 'opacity-30 line-through border-ink-800 bg-ink-900 text-ink-600 cursor-not-allowed'
                      : isSelected
                      ? 'border-gold-400 bg-gold-500 text-ink-950 font-bold'
                      : 'border-white/5 bg-ink-850 text-ink-200 hover:border-white/20'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        </section>

        {/* CONFIRMAÇÃO */}
        <div className="pt-4 border-t border-white/10">
          <button
            disabled={
              !selectedService ||
              !selectedBarber ||
              !selectedTimeSlot ||
              closed ||
              submitting
            }
            onClick={handleCreateAppointment}
            className="w-full py-3.5 rounded-xl gold-gradient text-ink-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-gold-500/20 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar Agendamento'}
          </button>
        </div>
      </main>
    </div>
  );
}
