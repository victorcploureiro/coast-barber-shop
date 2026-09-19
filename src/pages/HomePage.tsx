import { useState, useEffect } from 'react';
import { Scissors, Calendar, ArrowRight, Clock, MapPin, Phone } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import type { Service, TabKey } from '@/types';

interface HomePageProps {
  onNavigate: (tab: TabKey, serviceId?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeaturedServices() {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .limit(4);

        if (!error && data) {
          setFeaturedServices(data);
        }
      } catch (err) {
        console.error('Erro ao carregar serviços em destaque:', err);
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedServices();
  }, []);

  return (
    <div className="min-h-screen pb-28">
      <Header title="Barbearia" />

      <main className="px-5 mt-4 space-y-6">
        {/* Hero / Banner Principal */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold-500/20 via-ink-900 to-ink-950 p-6 border border-gold-500/30 shadow-xl">
          <div className="relative z-10 space-y-3">
            <span className="text-[10px] font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-full gold-gradient text-ink-950 inline-block">
              Estilo & Tradição
            </span>
            <h2 className="text-xl font-bold text-ink-100 leading-tight">
              Seu visual em boas mãos
            </h2>
            <p className="text-xs text-ink-300 leading-relaxed">
              Agende seu horário com nossos profissionais e garanta o melhor atendimento.
            </p>
            <button
              onClick={() => onNavigate('book')}
              className="mt-2 py-3 px-5 rounded-xl gold-gradient text-ink-950 font-bold text-xs flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
            >
              <Calendar size={16} />
              Agendar Horário
            </button>
          </div>
        </section>

        {/* Serviços em Destaque */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gold-400 tracking-wider uppercase flex items-center gap-1.5">
              <Scissors size={14} /> Serviços Populares
            </h3>
            <button
              onClick={() => onNavigate('book')}
              className="text-xs font-semibold text-ink-300 hover:text-gold-400 flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <div className="text-center py-6 text-xs text-ink-400">
              Carregando serviços...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {featuredServices.map((service) => (
                <div
                  key={service.id}
                  className="card p-4 flex items-center justify-between border-white/5 hover:border-gold-500/30 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="h-10 w-10 rounded-xl gold-gradient flex items-center justify-center text-ink-950 shrink-0 shadow-md">
                      <Scissors size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-ink-100">{service.name}</h4>
                      <p className="text-[10px] text-ink-400 flex items-center gap-1 mt-0.5">
                        <Clock size={11} /> {service.duration} min
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold gold-text">
                      R${service.price}
                    </span>
                    <button
                      onClick={() => onNavigate('book', service.id)}
                      className="py-1.5 px-3 rounded-lg gold-gradient text-ink-950 text-[11px] font-bold active:scale-95 transition-transform"
                    >
                      Agendar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Informações da Barbearia */}
        <section className="card p-4 space-y-3 border-white/5 bg-ink-900/40">
          <h4 className="text-xs font-bold text-ink-200 uppercase tracking-wider">
            Informações
          </h4>
          <div className="space-y-2 text-xs text-ink-300">
            <div className="flex items-center gap-2.5">
              <MapPin size={14} className="text-gold-400 shrink-0" />
              <span>Rua Principal, 123 - Centro</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock size={14} className="text-gold-400 shrink-0" />
              <span>Terça a Sábado: 09:00 às 19:00</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={14} className="text-gold-400 shrink-0" />
              <span>(11) 99999-8888</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}