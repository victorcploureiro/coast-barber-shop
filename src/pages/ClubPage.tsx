import { Crown, Star, Gift, TrendingUp, Check, ChevronRight } from 'lucide-react';
import Header from '@/components/Header';
import { clubTiers } from '@/data';

export default function ClubPage() {
  const currentPoints = 347;
  const currentTier = clubTiers[1]; // Prata
  const nextTier = clubTiers[2]; // Ouro
  const progress = ((currentPoints - 200) / (500 - 200)) * 100;

  return (
    <div className="min-h-screen pb-24">
      <Header title="Clube Coast" subtitle="Acumule pontos e desbloqueie benefícios" />

      {/* Points card */}
      <section className="px-5 mt-4">
        <div className="relative rounded-2xl overflow-hidden p-5 bg-gradient-to-br from-ink-800 via-ink-850 to-ink-900 border border-gold-500/20">
          <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-gold-500/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-ink-300">Seus pontos</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink-700/80 border border-white/5">
                <Crown size={12} className="text-gold-400" />
                <span className="text-[11px] font-semibold text-gold-400">{currentTier.name}</span>
              </div>
            </div>
            <p className="font-display text-5xl gold-text tracking-wide">{currentPoints} <span className="text-lg text-ink-300 font-body font-normal">pts</span></p>
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-ink-300">Faltam {nextTier ? 500 - currentPoints : 0} pts para {nextTier?.name}</span>
                <span className="text-[11px] text-ink-200 font-medium">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 rounded-full bg-ink-700 overflow-hidden">
                <div className="h-full gold-gradient rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick stats */}
      <section className="grid grid-cols-3 gap-3 px-5 mt-4">
        {[
          { icon: Star, label: 'Visitas', value: '14' },
          { icon: Gift, label: 'Resgates', value: '3' },
          { icon: TrendingUp, label: 'Este mês', value: '+45' },
        ].map((stat) => (
          <div key={stat.label} className="card p-3 text-center">
            <stat.icon size={18} className="text-gold-400 mx-auto mb-1" />
            <p className="font-display text-xl text-ink-100 tracking-wide">{stat.value}</p>
            <p className="text-[10px] text-ink-300">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Tiers */}
      <section className="px-5 mt-6">
        <h3 className="text-lg font-bold text-ink-100 mb-3">Níveis do Clube</h3>
        <div className="space-y-3">
          {clubTiers.map((tier, i) => {
            const isCurrent = tier.name === currentTier.name;
            const isUnlocked = i <= 1;
            return (
              <div
                key={tier.name}
                className={`card p-4 transition-all ${
                  isCurrent ? 'border-gold-500/40 ring-1 ring-gold-500/20' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${tier.color} flex items-center justify-center shrink-0`}>
                      <Crown size={22} className="text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ink-100">{tier.name}</h4>
                      <p className="text-[11px] text-ink-300">{tier.points}</p>
                    </div>
                  </div>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded-full border border-gold-500/20">
                      ATUAL
                    </span>
                  )}
                  {!isUnlocked && (
                    <span className="text-[10px] text-ink-400">Bloqueado</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {tier.perks.map((perk) => (
                    <div key={perk} className="flex items-center gap-2">
                      <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 ${
                        isUnlocked ? 'gold-gradient' : 'bg-ink-700'
                      }`}>
                        <Check size={10} className={isUnlocked ? 'text-ink-950' : 'text-ink-500'} strokeWidth={3} />
                      </div>
                      <span className={`text-xs ${isUnlocked ? 'text-ink-200' : 'text-ink-400'}`}>{perk}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Rewards */}
      <section className="px-5 mt-6">
        <h3 className="text-lg font-bold text-ink-100 mb-3">Resgatar Prêmios</h3>
        <div className="space-y-2.5">
          {[
            { name: 'Corte Clássico Grátis', points: 200, icon: 'scissors' },
            { name: 'Pomada Matte Strong', points: 150, icon: 'gift' },
            { name: 'Corte + Barba Grátis', points: 300, icon: 'sparkles' },
            { name: 'Bebida Premium', points: 50, icon: 'gift' },
          ].map((reward) => {
            const canRedeem = currentPoints >= reward.points;
            return (
              <div key={reward.name} className="card card-hover p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-ink-800 border border-white/5 flex items-center justify-center">
                    <Gift size={18} className="text-gold-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-ink-100">{reward.name}</h4>
                    <p className={`text-xs ${canRedeem ? 'text-gold-400' : 'text-ink-400'}`}>{reward.points} pts</p>
                  </div>
                </div>
                <button
                  disabled={!canRedeem}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    canRedeem
                      ? 'gold-gradient text-ink-950 active:scale-95'
                      : 'bg-ink-700 text-ink-400 cursor-not-allowed'
                  }`}
                >
                  {canRedeem ? 'Resgatar' : 'Indisponível'}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section className="px-5 mt-6">
        <div className="card p-5">
          <h3 className="text-sm font-bold text-ink-100 mb-3">Como funciona</h3>
          <div className="space-y-3">
            {[
              { num: '1', text: 'A cada R$1 gasto, você ganha 1 ponto.' },
              { num: '2', text: 'Acumule pontos para subir de nível.' },
              { num: '3', text: 'Troque pontos por produtos e cortes grátis.' },
            ].map((item) => (
              <div key={item.num} className="flex items-start gap-3">
                <div className="h-7 w-7 rounded-full gold-gradient flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-ink-950">{item.num}</span>
                </div>
                <p className="text-sm text-ink-200 pt-0.5">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
