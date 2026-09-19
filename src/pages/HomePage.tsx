import { useState, useEffect } from 'react';
import { 
  Heart, Clock, TrendingUp, ChevronRight, ChevronDown, Scissors, Sparkles, 
  Flame, Palette, Eye, Crown, Calendar, Star
} from 'lucide-react';
import Header from '@/components/Header';
import { heroImage, shopInterior, beardGrooming } from '@/data';
import { BRAND_CONFIG } from '@/config/brand';
import type { TabKey, Barber } from '@/types';
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

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration?: number;
  icon?: string;
  category?: string;
}

interface HomePageProps {
  onNavigate: (tab: TabKey, serviceId?: string) => void;
}

function capitalizeCategory(category: string): string {
  if (!category) return 'Outros Serviços';
  return category
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const { user } = useAuth();
  const [nextAppointment, setNextAppointment] = useState<any>(null);
  const [dbBarbers, setDbBarbers] = useState<Barber[]>([]);
  const [dbServices, setDbServices] = useState<Service[]>([]);
  const [userName, setUserName] = useState<string>('');

  // Cálculo dinâmico dos anos de história baseado no BRAND_CONFIG
  const currentYear = new Date().getFullYear();
  const yearsOfHistory = Math.max(1, currentYear - BRAND_CONFIG.foundedYear);

  // Estado para armazenar os dados vindos da Edge Function do Google Places
  const [googleData, setGoogleData] = useState<{ rating: number; user_ratings_total: number; url?: string } | null>(null);

  // Accordions iniciam fechados
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  // Curtidas persistidas via tabela barber_reviews
  const [likes, setLikes] = useState<Record<string, { count: number; liked: boolean }>>({});

  // 1. Chamar Edge Function do Supabase (Google Places)
  useEffect(() => {
    async function fetchGooglePlacesData() {
      try {
        const { data, error } = await supabase.functions.invoke('google-rating');
        if (!error && data) {
          setGoogleData({
            rating: data.rating || 4.9,
            user_ratings_total: data.user_ratings_total || data.reviews_count || 0,
            url: data.url || 'https://www.google.com/maps/place/Coast+Barber+Shop+%7C+Barbearia+em+SP/@-23.6332722,-46.6410901,17z/data=!3m2!4b1!5s0x94ce5afb08a7ead1:0x71d4a5bdc25112e2!4m6!3m5!1s0x94ce5b6dc91d67a5:0x65f01e136b070fc3!8m2!3d-23.6332771!4d-46.6385152!16s%2Fg%2F11fpbj0gn7?entry=ttu&g_ep=EgoyMDI2MDkxNi4wIKXMDSoASAFQAw%3D%3D'
          });
        }
      } catch (err) {
        console.error('Erro ao chamar Edge Function google-rating:', err);
      }
    }

    fetchGooglePlacesData();
  }, []);

  // 2. Buscar Barbeiros e carregar contagem e status de curtidas da tabela `barber_reviews`
  useEffect(() => {
    async function fetchBarbersAndLikes() {
      try {
        const { data: barbersData, error: barbersError } = await supabase
          .from('profiles')
          .select('*')
          .ilike('role', 'barbeiro')
          .order('name');

        if (barbersError || !barbersData) return;

        const mapped: Barber[] = barbersData.map((b) => ({
          id: b.id,
          name: b.name || 'Barbeiro',
          role: 'Barbeiro',
          image: b.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
          rating: b.rating || 5.0,
          reviews: b.reviews || 0,
          bio: '',
          specialties: []
        }));
        setDbBarbers(mapped);

        // Buscar todas as curtidas registradas na tabela `barber_reviews`
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('barber_reviews')
          .select('barber_id, client_id, liked');

        const likesState: Record<string, { count: number; liked: boolean }> = {};

        mapped.forEach((barber) => {
          // Filtrar todas as curtidas ativas para este barbeiro
          const barberLikes = (reviewsData || []).filter(
            (r) => r.barber_id === barber.id && r.liked === true
          );

          // Verificar se o usuário logado atualmente já curtiu
          const isUserLiked = user
            ? (reviewsData || []).some(
                (r) => r.barber_id === barber.id && r.client_id === user.id && r.liked === true
              )
            : false;

          likesState[barber.id] = {
            count: barberLikes.length,
            liked: isUserLiked,
          };
        });

        setLikes(likesState);
      } catch (err) {
        console.error('Erro ao buscar barbeiros e curtidas:', err);
      }
    }

    fetchBarbersAndLikes();
  }, [user]);

  // 3. Buscar Serviços
  useEffect(() => {
    async function fetchServices() {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .order('name');

        if (!error && data) {
          setDbServices(data);
        }
      } catch (err) {
        console.error('Erro ao buscar serviços:', err);
      }
    }

    fetchServices();
  }, []);

  // 4. Buscar Usuário e Agendamentos
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

        if (profile?.name) {
          setUserName(profile.name.split(' ')[0]);
        } else {
          setUserName(user.email?.split('@')[0] || '');
        }

        const todayStr = new Date().toISOString().split('T')[0];
        const { data: apts, error } = await supabase
          .from('appointments')
          .select('*, service:services(name), barber:profiles!appointments_barber_id_fkey(name)')
          .eq('client_id', user.id)
          .eq('status', 'scheduled')
          .gte('date', todayStr)
          .order('date', { ascending: true })
          .order('time_slot', { ascending: true })
          .limit(1);

        if (!error && apts && apts.length > 0) {
          setNextAppointment(apts[0]);
        } else {
          setNextAppointment(null);
        }
      } catch (err) {
        console.error('Erro ao buscar dados na Home:', err);
      }
    }

    fetchUserDataAndAppointment();
  }, [user]);

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryName]: !prev[categoryName],
    }));
  };

  // Alternar e Salvar no Supabase (Tabela barber_reviews)
  const toggleLike = async (barberId: string) => {
    if (!user) {
      alert('Faça login para curtir um barbeiro!');
      return;
    }

    const current = likes[barberId] || { count: 0, liked: false };
    const newLikedState = !current.liked;
    const newCount = newLikedState ? current.count + 1 : Math.max(0, current.count - 1);

    // Atualização otimista do estado na UI
    setLikes((prev) => ({
      ...prev,
      [barberId]: {
        count: newCount,
        liked: newLikedState,
      },
    }));

    try {
      // Verificar se o registro já existe para este cliente e barbeiro
      const { data: existingReview } = await supabase
        .from('barber_reviews')
        .select('id')
        .eq('client_id', user.id)
        .eq('barber_id', barberId)
        .maybeSingle();

      if (existingReview) {
        // Atualizar linha existente
        await supabase
          .from('barber_reviews')
          .update({ liked: newLikedState })
          .eq('id', existingReview.id);
      } else {
        // Inserir nova linha
        await supabase
          .from('barber_reviews')
          .insert({
            client_id: user.id,
            barber_id: barberId,
            liked: newLikedState,
          });
      }
    } catch (err) {
      console.error('Erro ao salvar curtida no Supabase:', err);
      // Reverter alteração otimista se der erro no servidor
      setLikes((prev) => ({
        ...prev,
        [barberId]: current,
      }));
    }
  };

  const groupedServices = dbServices.reduce<Record<string, Service[]>>((acc, service) => {
    const rawCategory = service.category || 'outros serviços';
    const category = capitalizeCategory(rawCategory);
    if (!acc[category]) acc[category] = [];
    acc[category].push(service);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pb-24">
      <Header title={userName ? `Olá, ${userName}` : ""} showLocation />

      {/* Próximo agendamento ou Hero Banner */}
      {nextAppointment ? (
        <section className="mx-5 mt-2 animate-slide-up">
          <div className="rounded-2xl p-5 bg-gradient-to-br from-gold-500/15 via-ink-900 to-ink-950 border border-gold-500/30 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full gold-gradient text-ink-950">
                Próximo Agendamento
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
              onClick={() => onNavigate('profile')}
              className="mt-3 w-full py-2.5 rounded-xl bg-ink-800/80 border border-white/10 text-xs font-semibold text-ink-200 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              Ver detalhes no perfil <ChevronRight size={14} />
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
              Agendar agora
              <ChevronRight size={16} />
            </button>
          </div>
        </section>
      )}

      {/* Cards de Métricas */}
      <section className="grid grid-cols-2 gap-3 px-5 mt-4">
        <div className="card p-3 text-center flex flex-col justify-center items-center">
          <p className="font-display text-2xl gold-text tracking-wide">{yearsOfHistory}+</p>
          <p className="text-[10px] text-ink-300 mt-0.5">Anos de história</p>
        </div>

        <a 
          href={googleData?.url || "https://www.google.com/maps/place/Coast+Barber+Shop+%7C+Barbearia+em+SP/@-23.6332722,-46.6410901,17z/data=!3m2!4b1!5s0x94ce5afb08a7ead1:0x71d4a5bdc25112e2!4m6!3m5!1s0x94ce5b6dc91d67a5:0x65f01e136b070fc3!8m2!3d-23.6332771!4d-46.6385152!16s%2Fg%2F11fpbj0gn7?entry=ttu&g_ep=EgoyMDI2MDkxNi4wIKXMDSoASAFQAw%3D%3D"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="card p-3 flex flex-col justify-center items-center text-center hover:border-gold-500/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1">
            <Star size={16} className="text-gold-400 fill-gold-400" />
            <span className="font-display text-2xl gold-text tracking-wide">
              {googleData ? googleData.rating : '4.9'}
            </span>
          </div>
          <p className="text-[10px] text-ink-300 mt-0.5">
            Google {googleData ? `(${googleData.user_ratings_total} avaliações)` : 'Avaliação'}
          </p>
        </a>
      </section>

      {/* Accordion de Serviços */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-ink-100">Serviços</h3>
          <button onClick={() => onNavigate('book')} className="text-xs text-gold-400 font-medium flex items-center gap-1">
            Agendar <ChevronRight size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {Object.entries(groupedServices).map(([category, items]) => {
            const isOpen = !!openCategories[category];
            return (
              <div key={category} className="card overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-ink-800/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-100">{category}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-ink-800 text-gold-400 border border-gold-500/20 font-medium">
                      {items.length} {items.length === 1 ? 'opção' : 'opções'}
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`text-gold-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 space-y-2.5 border-t border-white/5 pt-3">
                    {items.map((service) => {
                      const Icon = iconMap[service.icon || 'scissors'] ?? Scissors;
                      return (
                        <div
                          key={service.id}
                          onClick={() => onNavigate('book', service.id)}
                          className="p-3 rounded-xl bg-ink-800/40 border border-white/5 flex items-center gap-3 cursor-pointer hover:border-gold-500/30 transition-colors"
                        >
                          <div className="h-10 w-10 rounded-lg bg-ink-800 border border-white/5 flex items-center justify-center shrink-0">
                            <Icon size={18} className="text-gold-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold text-ink-100 truncate">{service.name}</h4>
                            <p className="text-[11px] text-ink-300 mt-0.5 line-clamp-1">{service.description || ''}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-ink-300 flex items-center gap-1">
                                <Clock size={10} /> {service.duration || 30} min
                              </span>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-display text-base gold-text tracking-wide">R${service.price}</p>
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
      </section>

      {/* Nossa Equipe com curtidas conectadas ao Supabase */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3 px-5">
          <h3 className="text-lg font-bold text-ink-100">Nossa Equipe</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2">
          {dbBarbers.map((barber) => {
            const barberLike = likes[barber.id] || { count: 0, liked: false };
            return (
              <div 
                key={barber.id} 
                className="card shrink-0 w-40 overflow-hidden"
              >
                <div className="h-44 overflow-hidden relative">
                  <img src={barber.image} alt={barber.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-semibold text-ink-100 truncate">{barber.name}</h4>
                  <p className="text-[11px] text-gold-400 mb-2">{barber.role}</p>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <button
                      onClick={() => toggleLike(barber.id)}
                      className="flex items-center gap-1.5 text-xs text-ink-300 hover:text-gold-400 transition-colors"
                    >
                      <Heart
                        size={15}
                        className={barberLike.liked ? 'text-red-500 fill-red-500' : 'text-ink-400'}
                      />
                      <span className="text-[11px] font-medium text-ink-200">
                        {barberLike.count}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Galeria */}
      <section className="px-5 mt-6">
        <h3 className="text-lg font-bold text-ink-100 mb-3">Galeria</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl overflow-hidden h-32">
            <img src={shopInterior} alt="Interior da Coast Barber Shop" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          <div className="rounded-xl overflow-hidden h-32">
            <img src={beardGrooming} alt="Cuidados com a Barba" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        </div>
      </section>

      {/* Clube */}
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