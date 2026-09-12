import { Star, Clock, TrendingUp, ChevronRight, Scissors, Sparkles, Flame, Palette, Eye, Crown } from 'lucide-react';
import Header from '@/components/Header';
import { services, barbers, heroImage, shopInterior, beardGrooming } from '@/data';
import { BRAND_CONFIG } from '@/config/brand';
import type { TabKey } from '@/types';

const iconMap: Record<string, typeof Scissors> = {
  scissors: Scissors,
  sparkles: Sparkles,
  flame: Flame,
  palette: Palette,
  eye: Eye,
  crown: Crown,
};

interface HomePageProps {
  onNavigate: (tab: TabKey) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  return (
    <div className="min-h-screen pb-24">
      <Header title="" showLocation />

      {/* Hero */}
      <section className="relative mx-5 mt-2 rounded-2xl overflow-hidden h-56 animate-slide-up">
        <img src={heroImage} alt={BRAND_CONFIG.name} className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-5">
          {/* Tagline vinda do BRAND_CONFIG */}
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

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 px-5 mt-4">
        {[
          { label: 'Anos de história', value: '12+' },
          { label: 'Clientes/mês', value: '800+' },
          { label: 'Avaliação', value: '4.9' },
        ].map((stat) => (
          <div key={stat.label} className="card p-3 text-center">
            <p className="font-display text-2xl gold-text tracking-wide">{stat.value}</p>
            <p className="text-[10px] text-ink-300 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Services */}
      <section className="px-5 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-ink-100">Serviços</h3>
          <button onClick={() => onNavigate('book')} className="text-xs text-gold-400 font-medium flex items-center gap-1">
            Ver todos <ChevronRight size={14} />
          </button>
        </div>
        <div className="space-y-2.5">
          {services.slice(0, 4).map((service) => {
            const Icon = iconMap[service.icon] ?? Scissors;
            return (
              <div key={service.id} className="card card-hover p-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-ink-800 border border-white/5 flex items-center justify-center shrink-0">
                  <Icon size={22} className="text-gold-400" />
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
                <div className="text-right shrink-0">
                  <p className="font-display text-xl gold-text tracking-wide">R${service.price}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Barbers */}
      <section className="mt-6">
        <div className="flex items-center justify-between mb-3 px-5">
          <h3 className="text-lg font-bold text-ink-100">Nossa Equipe</h3>
          <button onClick={() => onNavigate('book')} className="text-xs text-gold-400 font-medium flex items-center gap-1">
            Escolher <ChevronRight size={14} />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar px-5 pb-2">
          {barbers.map((barber) => (
            <div key={barber.id} className="card card-hover shrink-0 w-40 overflow-hidden">
              <div className="h-44 overflow-hidden">
                <img src={barber.image} alt={barber.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3">
                <h4 className="text-sm font-semibold text-ink-100 truncate">{barber.name}</h4>
                <p className="text-[11px] text-gold-400 mb-1">{barber.role}</p>
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-gold-400 fill-gold-400" />
                  <span className="text-[11px] text-ink-200 font-medium">{barber.rating}</span>
                  <span className="text-[11px] text-ink-400">({barber.reviews})</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gallery */}
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

      {/* CTA */}
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