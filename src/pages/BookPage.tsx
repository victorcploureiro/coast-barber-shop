import { useState, useEffect } from 'react';
import { Calendar, Clock, User, Scissors, CheckCircle, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { TabKey } from '@/types';

const ROLE_BARBER_ID = '9edfdd5a-7095-472b-8498-27952e6750b8';

const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

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
  rating?: number;
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

  // 1. Carregar Serviços e Barbeiros com Fallback duplo
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Serviços
        const { data: servicesData } = await supabase.from('services').select('*');
        if (servicesData) setServices(servicesData);

        // Barbeiros: Tenta via user_roles primeiro
        const { data: userRolesData } = await supabase
          .from('user_roles')
          .select('user_id, profiles!inner(id, name, avatar_url, rating)')
          .eq('role_id', ROLE_BARBER_ID);

        let list: Barber[] = [];

        if (userRolesData && userRolesData.length > 0) {
          list = userRolesData.map((item: any) => item.profiles).filter(Boolean);
        }

        // Fallback: se não trouxer pela user_roles, busca direto por role = 'barbeiro' em profiles
        if (list.length === 0) {
          const { data: profilesBarbers } = await supabase
            .from('profiles')
            .select('id, name, avatar_url, rating')
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

  // 2. Aplicar barbeiro pré-selecionado vindo da Home
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

  // Obter categorias únicas dos serviços
  const categories = ['todos', ...Array.from(new Set(services.map((s) => s.category).filter(Boolean)))];

  const filteredServices = activeCategory === 'todos'
    ? services
    : services.filter((s) => s.category === activeCategory);

  // Verificação de regras de horários (dia atual, horários passados e domingos)
  const isDateSunday = (dateStr: string) => {
    const day = new Date(dateStr + 'T00:00:00').getDay();
    return day === 0; // 0 = Domingo
  };

  const isTimeSlotInPast = (timeSlot: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (selectedDate !== today) return false;

    const [hours, minutes] = timeSlot.split(':').map(Number);
    const now = new Date();
    const slotTime = new Date();
    slotTime.setHours(hours, minutes, 0, 0);

    return now > slotTime;
  };

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

  return (
    <div className="min-h-screen pb-24 animate-fade-in">
      <Header title="Novo Agendamento" />

      <main className="px-5 mt-4 space-y-6">
        {/* SERVIÇOS COM CATEGORIAS */}
        <section>
          <h3 className="text-sm font-bold text-ink-100 mb-3 flex items-center gap-2">
            <Scissors size={16} className="text-gold-400" /> Escolha o Serviço
          </h3>

          {/* Filtros por Categoria */}
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

          {/* Lista de Serviços */}
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
          {isDateSunday(selectedDate) && (
            <p className="text-xs text-red-400 mt-2 font-medium">
              Não funcionamos aos domingos. Selecione outra data.
            </p>
          )}
        </section>

        {/* BARBEIROS */}
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
                    <p className="text-[10px] text-gold-400 font-semibold">
                      ★ {barber.rating || 5.0}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* HORÁRIOS */}
        <section>
          <h3 className="text-sm font-bold text-ink-100 mb-3 flex items-center gap-2">
            <Clock size={16} className="text-gold-400" /> Escolha o Horário
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {TIME_SLOTS.map((slot) => {
              const inPast = isTimeSlotInPast(slot);
              const isOccupied =
                selectedBarber && isSlotBookedForBarber(selectedBarber.id, slot);
              const isSunday = isDateSunday(selectedDate);
              const isDisabled = inPast || !!isOccupied || isSunday;
              const isSelected = selectedTimeSlot === slot;

              return (
                <button
                  key={slot}
                  disabled={isDisabled}
                  onClick={() => setSelectedTimeSlot(isSelected ? null : slot)}
                  className={`py-2.5 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
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

        {/* BOTÃO CONFIRMAR */}
        <div className="pt-4 border-t border-white/10">
          <button
            disabled={
              !selectedService ||
              !selectedBarber ||
              !selectedTimeSlot ||
              isDateSunday(selectedDate) ||
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
