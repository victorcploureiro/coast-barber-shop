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

  // 1. Carregar Serviços e Apenas Barbeiros via user_roles
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: servicesData } = await supabase.from('services').select('*');
        if (servicesData) setServices(servicesData);

        // Busca pela tabela user_roles e traz o perfil relacionado
        const { data: barbersData, error: barberError } = await supabase
          .from('user_roles')
          .select('user_id, profiles!inner(id, name, avatar_url, rating)')
          .eq('role_id', ROLE_BARBER_ID);

        if (!barberError && barbersData) {
          const list = barbersData
            .map((item: any) => item.profiles)
            .filter(Boolean);
          setBarbers(list);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do agendamento:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Aplicar Barbeiro Inicial enviado via navegação
  useEffect(() => {
    if (initialBarberId && barbers.length > 0) {
      const barber = barbers.find((b) => b.id === initialBarberId);
      if (barber) {
        setSelectedBarber(barber);
      }
      if (onClearInitialBarber) onClearInitialBarber();
    }
  }, [initialBarberId, barbers, onClearInitialBarber]);

  // 3. Buscar agendamentos existentes da data para calcular ocupação
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

  const isSlotBookedForBarber = (barberId: string, timeSlot: string) => {
    return existingAppointments.some(
      (a) => a.barber_id === barberId && a.time_slot === timeSlot
    );
  };

  const isBarberAvailableAtSlot = (barberId: string, timeSlot: string) => {
    return !isSlotBookedForBarber(barberId, timeSlot);
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
        {/* SERVIÇO */}
        <section>
          <h3 className="text-sm font-bold text-ink-100 mb-3 flex items-center gap-2">
            <Scissors size={16} className="text-gold-400" /> Escolha o Serviço
          </h3>
          <div className="grid grid-cols-1 gap-2.5">
            {services.map((srv) => (
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
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedTimeSlot(null);
            }}
            className="w-full bg-ink-800 border border-white/10 rounded-xl p-3 text-sm text-ink-100 focus:outline-none focus:border-gold-400"
          />
        </section>

        {/* BARBEIRO x HORÁRIO */}
        <div className="grid grid-cols-1 gap-6">
          {/* BARBEIROS */}
          <section>
            <h3 className="text-sm font-bold text-ink-100 mb-3 flex items-center gap-2">
              <User size={16} className="text-gold-400" /> Escolha o Barbeiro
            </h3>
            <div className="space-y-2">
              {barbers.map((barber) => {
                const isOccupied =
                  selectedTimeSlot && !isBarberAvailableAtSlot(barber.id, selectedTimeSlot);
                const isSelected = selectedBarber?.id === barber.id;

                return (
                  <button
                    key={barber.id}
                    disabled={!!isOccupied}
                    onClick={() => setSelectedBarber(isSelected ? null : barber)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                      isOccupied
                        ? 'opacity-40 bg-ink-900 border-dashed border-ink-700 cursor-not-allowed'
                        : isSelected
                        ? 'border-gold-400 bg-gold-500/10'
                        : 'border-white/5 bg-ink-850 hover:border-white/20'
                    }`}
                  >
                    <span className={`text-sm font-medium ${isOccupied ? 'text-ink-500 line-through' : 'text-ink-100'}`}>
                      {barber.name}
                    </span>
                    {isOccupied && <span className="text-[10px] text-red-400 font-bold uppercase">Ocupado</span>}
                  </button>
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
                const isOccupied =
                  selectedBarber && isSlotBookedForBarber(selectedBarber.id, slot);
                const isSelected = selectedTimeSlot === slot;

                return (
                  <button
                    key={slot}
                    disabled={!!isOccupied}
                    onClick={() => setSelectedTimeSlot(isSelected ? null : slot)}
                    className={`py-2.5 px-2 rounded-xl border text-xs font-semibold text-center transition-all ${
                      isOccupied
                        ? 'opacity-40 line-through border-red-500/20 bg-red-500/5 text-red-400 cursor-not-allowed'
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
        </div>

        {/* BOTAO CONFIRMAR */}
        <div className="pt-4 border-t border-white/10">
          <button
            disabled={!selectedService || !selectedBarber || !selectedTimeSlot || submitting}
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