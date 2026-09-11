import { useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Clock, Star, Scissors, Sparkles, Flame, Palette, Eye, Crown, Calendar } from 'lucide-react';
import Header from '@/components/Header';
import { services, barbers, timeSlots } from '@/data';
import type { Service, Barber } from '@/types';

const iconMap: Record<string, typeof Scissors> = {
  scissors: Scissors,
  sparkles: Sparkles,
  flame: Flame,
  palette: Palette,
  eye: Eye,
  crown: Crown,
};

type Step = 'service' | 'barber' | 'datetime' | 'confirm';

export default function BookPage() {
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

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

  const handleNext = () => {
    if (step === 'service' && selectedService) setStep('barber');
    else if (step === 'barber' && selectedBarber) setStep('datetime');
    else if (step === 'datetime' && selectedTime) setStep('confirm');
  };

  const handleBack = () => {
    if (step === 'barber') setStep('service');
    else if (step === 'datetime') setStep('barber');
    else if (step === 'confirm') setStep('datetime');
  };

  const handleConfirm = () => {
    setConfirmed(true);
  };

  const reset = () => {
    setConfirmed(false);
    setStep('service');
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedTime(null);
    setSelectedDate(0);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen pb-24">
        <Header title="Agendamento" />
        <div className="flex flex-col items-center justify-center px-5 mt-16 animate-scale-in">
          <div className="h-20 w-20 rounded-full gold-gradient flex items-center justify-center mb-5 shadow-lg shadow-gold-500/30">
            <Check size={40} className="text-ink-950" strokeWidth={3} />
          </div>
          <h2 className="text-xl font-bold text-ink-100 mb-2">Agendamento confirmado!</h2>
          <p className="text-sm text-ink-300 text-center max-w-xs mb-6">
            {selectedService?.name} com {selectedBarber?.name} em {weekdays[dates[selectedDate].getDay()]}, {dates[selectedDate].getDate()} de {months[dates[selectedDate].getMonth()]} às {selectedTime}
          </p>
          <div className="card p-4 w-full max-w-xs mb-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-ink-300">Serviço</span>
              <span className="text-ink-100 font-medium">{selectedService?.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-ink-300">Barbeiro</span>
              <span className="text-ink-100 font-medium">{selectedBarber?.name}</span>
            </div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-ink-300">Horário</span>
              <span className="text-ink-100 font-medium">{selectedTime}</span>
            </div>
            <div className="border-t border-white/5 pt-2 mt-2 flex items-center justify-between">
              <span className="text-ink-300 text-sm">Total</span>
              <span className="font-display text-xl gold-text">R${selectedService?.price}</span>
            </div>
          </div>
          <button
            onClick={reset}
            className="px-6 py-3 rounded-xl gold-gradient text-ink-950 text-sm font-semibold active:scale-95 transition-transform"
          >
            Novo agendamento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <Header title="Agendar Horário" subtitle="Escolha o serviço, barbeiro e horário" />

      {/* Progress */}
      <div className="px-5 mt-4">
        <div className="flex items-center gap-2">
          {stepOrder.map((s, i) => (
            <div key={s} className="flex-1">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i <= currentStepIndex ? 'gold-gradient' : 'bg-ink-700'
                }`}
              />
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          {stepOrder.map((s, i) => (
            <span key={s} className={`text-[10px] font-medium ${i <= currentStepIndex ? 'text-gold-400' : 'text-ink-400'}`}>
              {i + 1}. {s === 'service' ? 'Serviço' : s === 'barber' ? 'Barbeiro' : s === 'datetime' ? 'Horário' : 'Confirmação'}
            </span>
          ))}
        </div>
      </div>

      {/* Step: Service */}
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
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'gold-gradient' : 'bg-ink-800 border border-white/5'
                  }`}>
                    <Icon size={22} className={isSelected ? 'text-ink-950' : 'text-gold-400'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-ink-100">{service.name}</h4>
                    <p className="text-xs text-ink-300 mt-0.5 line-clamp-1">{service.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-ink-200 flex items-center gap-1">
                        <Clock size={11} /> {service.duration} min
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 flex items-center gap-2">
                    <span className="font-display text-xl gold-text">R${service.price}</span>
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full gold-gradient flex items-center justify-center">
                        <Check size={12} className="text-ink-950" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Step: Barber */}
      {step === 'barber' && (
        <section className="px-5 mt-5 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            {barbers.map((barber) => {
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
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-6 w-6 rounded-full gold-gradient flex items-center justify-center">
                        <Check size={14} className="text-ink-950" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-ink-100">{barber.name}</h4>
                    <p className="text-[11px] text-gold-400 mb-1">{barber.role}</p>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-gold-400 fill-gold-400" />
                      <span className="text-[11px] text-ink-200 font-medium">{barber.rating}</span>
                      <span className="text-[11px] text-ink-400">({barber.reviews})</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Step: DateTime */}
      {step === 'datetime' && (
        <section className="px-5 mt-5 animate-fade-in">
          {/* Date selector */}
          <h3 className="text-sm font-semibold text-ink-100 mb-3">Escolha a data</h3>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {dates.map((date, i) => {
              const isSelected = selectedDate === i;
              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(i)}
                  className={`shrink-0 w-16 py-3 rounded-xl text-center transition-all ${
                    isSelected ? 'gold-gradient text-ink-950' : 'card text-ink-200 card-hover'
                  }`}
                >
                  <p className={`text-[10px] font-medium ${isSelected ? 'text-ink-950/70' : 'text-ink-400'}`}>
                    {weekdays[date.getDay()]}
                  </p>
                  <p className="text-xl font-bold mt-0.5">{date.getDate()}</p>
                  <p className={`text-[10px] ${isSelected ? 'text-ink-950/70' : 'text-ink-400'}`}>
                    {months[date.getMonth()]}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Time slots */}
          <h3 className="text-sm font-semibold text-ink-100 mt-5 mb-3">Horários disponíveis</h3>
          <div className="grid grid-cols-4 gap-2">
            {timeSlots.map((time, i) => {
              const isAvailable = i % 5 !== 0;
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  disabled={!isAvailable}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isSelected
                      ? 'gold-gradient text-ink-950'
                      : isAvailable
                        ? 'card text-ink-200 card-hover'
                        : 'bg-ink-850 text-ink-500 line-through cursor-not-allowed'
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Step: Confirm */}
      {step === 'confirm' && selectedService && selectedBarber && (
        <section className="px-5 mt-5 animate-fade-in">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-ink-100 mb-4">Confirme seu agendamento</h3>
            <div className="flex items-center gap-3 pb-4 border-b border-white/5">
              <img src={selectedBarber.image} alt={selectedBarber.name} className="h-14 w-14 rounded-xl object-cover" />
              <div>
                <p className="text-sm font-semibold text-ink-100">{selectedBarber.name}</p>
                <p className="text-xs text-gold-400">{selectedBarber.role}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={11} className="text-gold-400 fill-gold-400" />
                  <span className="text-[11px] text-ink-200">{selectedBarber.rating}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-300">Serviço</span>
                <span className="text-sm text-ink-100 font-medium">{selectedService.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-300">Data</span>
                <span className="text-sm text-ink-100 font-medium flex items-center gap-1">
                  <Calendar size={13} className="text-gold-400" />
                  {weekdays[dates[selectedDate].getDay()]}, {dates[selectedDate].getDate()} {months[dates[selectedDate].getMonth()]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-300">Horário</span>
                <span className="text-sm text-ink-100 font-medium flex items-center gap-1">
                  <Clock size={13} className="text-gold-400" />
                  {selectedTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-300">Duração</span>
                <span className="text-sm text-ink-100 font-medium">{selectedService.duration} min</span>
              </div>
              <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                <span className="text-sm text-ink-300">Total</span>
                <span className="font-display text-2xl gold-text">R${selectedService.price}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Navigation buttons */}
      <div className="fixed bottom-[72px] left-0 right-0 z-20 px-5 pt-3 pb-3 glass-strong border-t border-white/5">
        <div className="flex items-center gap-3">
          {step !== 'service' && (
            <button
              onClick={handleBack}
              className="h-12 w-12 rounded-xl bg-ink-800 border border-white/5 flex items-center justify-center shrink-0 active:scale-95 transition-transform"
            >
              <ChevronLeft size={20} className="text-ink-200" />
            </button>
          )}
          {step === 'confirm' ? (
            <button
              onClick={handleConfirm}
              className="flex-1 h-12 rounded-xl gold-gradient text-ink-950 text-sm font-bold active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              <Check size={18} strokeWidth={3} /> Confirmar agendamento
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
