import { useState, useEffect } from 'react';
import { 
  Star, Clock, TrendingUp, ChevronRight, ChevronDown, Scissors, Sparkles, 
  Flame, Palette, Eye, Crown, Calendar, Loader2, Bell
} from 'lucide-react';
import Header from '@/components/Header';
import { heroImage, shopInterior, beardGrooming } from '@/data';
import { BRAND_CONFIG } from '@/config/brand';
import type { TabKey, Barber, Service } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

const iconMap: Record<string, typeof Scissors> = {
  scissors: Scissors,
  sparkles: Sparkles,
  flame: Flame,
  palette: Palette,
  eye: Eye,
  crown: Crown,
};

const categoryLabels: Record<string, string> = {
  cabelo: 'Cabelo & Estilo',
  barba: 'Barba & Ritual',
  combo: 'Combos Exclusivos',
  quimica: 'Tratamentos Químicos',
  cuidados: 'Cuidados & Waxing',
};

interface HomePageProps {
  onNavigate: (tab: TabKey) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [dbBarbers, setDbBarbers] = useState<Barber[]>([]);
  const [dbServices, setDbServices] = useState<Service[]>([]);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({ cabelo: true, barba: true });
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Toggle dropdown de categorias de serviços
  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  useEffect(() => {
    async function fetchHomeData() {
      try {
        // 1. Filtrar estritamente apenas os perfis com role 'barbeiro'
        const { data: barbersData } = await supabase
          .from('profiles')
          .select('*')
          .ilike('role', 'barbeiro')
          .order('name');

        if (barbersData && barbersData.length > 0) {
          const mappedBarbers: Barber[] = barbersData.map((b) => ({
            id: b.id,
            name: b.name || 'Barbeiro',
            role: 'Barbeiro',
            image: b.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
            rating: b.rating || 5.0,
            reviews: b.reviews || 12,
            bio: '',
            specialties: []
          }));
          setDbBarbers(mappedBarbers);
        }

        // 2. Buscar todos os serviços da tabela
        const { data: servicesData } = await supabase
          .from('services')
          .select('*')
          .order('price', { ascending: true });

        if (servicesData) setDbServices(servicesData);
      } catch (err) {
        console.error('Erro ao buscar dados na Home:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHomeData();
  }, []);

  useEffect(() => {
    if (!user) {
      setNextAppointment(null);
      setUserName('');
      return;
    }

    async function fetchUserDataAndAppointment() {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', user.id)
          .single();

        const rawName = profile?.name || user.user_metadata?.full_name || user.email?.split('@')[0] || '';
        const firstName = rawName.trim().split(' ')[0];
        if (firstName) {
          setUserName(firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase());
        }

        const now = new Date();
        const localTodayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        const { data: apts, error } = await supabase
          .from('appointments')
          .select('*, service:services(name), barber:profiles!appointments_barber_id_fkey(name)')
          .eq('client_id', user.id)
          .eq('status', 'scheduled')
          .gte('date', localTodayStr)
          .order('date', { ascending: true })
          .order('time_slot', { ascending: true })
          .limit(1);

        if (!error && apts && apts.length > 0) {
          setNextAppointment(apts[0]);
        } else {
          setNextAppointment(null);
        }
      } catch (err) {
        console.error('Erro ao buscar agendamento:', err);
      }
    }

    fetchUserDataAndAppointment();
  }, [user]);

  // Agrupar serviços por categoria
  const groupedServices = dbServices.reduce((acc, service) => {
    const cat = service.category || 'outros';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(service);
    return acc;
  }, {} as Record<string, Service[]>);

  return (
    <div className="min-h-screen pb-24">
      <Header 
        title={userName ? `Olá, ${userName}` : "Bem-vindo"} 
        showLocation 
        actionIcon={Bell}
        onActionClick={() => onNavigate('book')}
      />

      {/* Alternância: Se houver agendamento mostra o Card do Agendamento, senão o Banner Inicial */}
      {nextAppointment ? (
        <section className="mx-5 mt-2 animate-slide-up">
          <div className="rounded-2xl p-5 bg-gradient-to-br from-gold-500/15 via-ink-900 to-ink-950 border border-gold-500/30 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full gold-gradient text-ink-950">
                Seu Agendamento
              </span>
              <span className="text-xs text-ink-300 flex items-center gap-1">
                <Calendar size={13} className="text-gold-400" />
                {nextAppointment.date}
              </span>
            </div>

            <div className="flex items-center gap-4 my-2">
              <div className="h-12 w-12 rounded-xl gold-gradient flex items-center justify-center text-ink-950 shrink-0">
                <Scissors size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-ink-100 truncate">
                  {nextAppointment.service?.name || 'Serviço Agendado'}
                </h3>
                <p className="text-xs text-ink-300">
                  com <span className="text-gold-400 font-medium">{nextAppointment.barber?.name || 'Barbeiro'}</span> às <span className="text-ink-100 font-semibold">{nextAppointment.time_slot}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => onNavigate('book')}
              className="mt-3 w-full py-2.5 rounded-xl bg-ink-800/80 border border-white/10 text-xs font-semibold text-ink-200 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              Ver meus agendamentos <ChevronRight size={14} />
            </button>
          </div>
        </section>
      ) : (
        <section className="relative mx-5 mt-2 rounded-2xl overflow-hidden h-56 animate-slide-up">
          <img src={heroImage} alt={BRAND_CONFIG.name} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 to-transparent" />
          <div className="absolute bottom-0 left-0 p-5">
            <p className="text-gold-400 text-xs font-semibold tracking-widest uppercase mb-1">
              {BRAND_CONFIG.tagline}
            </p>
            <h2 className="font-display text-3xl tracking-wide text-white leading-none uppercase">
              A NAVALHA QUE<br />DEFINE SEU ESTILO
            </h2>
            <button
              onClick={() => onNavigate('book')}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient text-ink-950 text-sm font-semibold active:scale-95 transition-transform"
            >
              Agendar agora <ChevronRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* Métricas e Avaliação do Google */}
      <section className="grid grid-cols-3 gap-3 px-5 mt-4">
        {[
          { label: 'Anos de história', value: '12+' },
          { label: 'Clientes/mês', value: '800+' },
          { label: 'Google Rating', value: '4.9 ★' },
        ].map((stat) => (
          <div key={stat.label} className="card p-3 text-center">
            <p className="font-display text-2xl gold-text tracking-wide">{stat.value}</p>
            <p className="text-[10px] text-ink-300 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Serviços Categorizados com Dropdown Accordion */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-ink-100">Serviços</h3>
          <button onClick={() => onNavigate('book')} className="text-xs text-gold-400 font-medium flex items-center gap-1">
            Agendar <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-ink-300">
            <Loader2 size={18} className="animate-spin text-gold-400" />
            <span className="text-xs">Carregando serviços...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.keys(groupedServices).map((catKey) => {
              const isOpen = !!openCategories[catKey];
              const categoryServices = groupedServices[catKey];

              return (
                <div key={catKey} className="card overflow-hidden">
                  <button
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
                        const Icon = iconMap[service.icon] ?? Scissors;
                        return (
                          <div 
                            key={service.id} 
                            onClick={() => onNavigate('book')}
                            className="p-3 rounded-xl bg-ink-900/60 hover:bg-ink-800/80 flex items-center gap-3.5 cursor-pointer transition-colors"
                          >
                            <div className="h-10 w-10 rounded-lg bg-ink-800 border border-white/5 flex items-center justify-center shrink-0">
                              <Icon size={18} className="text-gold-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-xs font-semibold text-ink-100">{service.name}</h4>
                              <p className="text-[11px] text-ink-300 line-clamp-1">{service.description}</p>
                              <span className="text-[10px] text-ink-400 flex items-center gap-1 mt-0.5">
                                <Clock size={10} /> {service.duration} min
                              </span>
                            </div>
                            <span className="font-display text-base gold-text shrink-0">R${service.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Nossa Equipe (Exclusivamente Barbeiros Reais) */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3 px-5">
          <h3 className="text-lg font-bold text-ink-100">Nossa Equipe</h3>
          <button onClick={() => onNavigate('book')} className="text-xs text-gold-400 font-medium flex items-center gap-1">
            Escolher <ChevronRight size={14} />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2">
          {dbBarbers.map((barber) => (
            <div 
              key={barber.id} 
              onClick={() => onNavigate('book')}
              className="card card-hover shrink-0 w-36 overflow-hidden cursor-pointer"
            >
              <div className="h-40 overflow-hidden">
                <img src={barber.image} alt={barber.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-2.5">
                <h4 className="text-xs font-bold text-ink-100 truncate">{barber.name}</h4>
                <p className="text-[10px] text-gold-400 mb-1">{barber.role}</p>
                <div className="flex items-center gap-1">
                  <Star size={11} className="text-gold-400 fill-gold-400" />
                  <span className="text-[10px] text-ink-200 font-semibold">{barber.rating}</span>
                  <span className="text-[10px] text-ink-400">({barber.reviews})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Galeria */}
      <section className="px-5 mt-6">
        <h3 className="text-lg font-bold text-ink-100 mb-3">Galeria</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl overflow-hidden h-32">
            <img src={shopInterior} alt="Interior" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="rounded-xl overflow-hidden h-32">
            <img src={beardGrooming} alt="Barba" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </section>

      {/* CTA Clube Coast */}
      <section className="px-5 mt-6">
        <div className="relative rounded-2xl overflow-hidden p-5 bg-gradient-to-br from-ink-800 to-ink-850 border border-gold-500/20">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp size={20} className="text-gold-400" />
            <h3 className="text-base font-bold text-ink-100">Faça parte do Clube Coast</h3>
          </div>
          <p className="text-xs text-ink-300 mb-3">Acumule pontos a cada corte e troque por produtos, cortes grátis e benefícios VIP.</p>
          <button
            onClick={() => onNavigate('club')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-ink-700 border border-gold-500/30 text-gold-400 text-sm font-semibold active:scale-95 transition-transform"
          >
            Conhecer o clube <ChevronRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
}