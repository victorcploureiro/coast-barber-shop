import { useState, useEffect } from 'react';
import { Crown, Check, Sparkles, Zap, ShieldCheck, Loader2 } from 'lucide-react';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';

interface SubscriptionPlan {
  id: string;
  name: string;
  badge?: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

export default function ClubPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .order('price', { ascending: true });

        if (!error && data) {
          setPlans(data);
        }
      } catch (err) {
        console.error('Erro ao buscar planos:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  return (
    <div className="min-h-screen pb-24">
      <Header title="Coast Club" subtitle="Assinaturas e benefícios exclusivos" />

      {/* Hero / Pitch do Clube */}
      <section className="px-5 mt-4">
        <div className="relative rounded-2xl overflow-hidden p-6 bg-gradient-to-br from-ink-800 via-ink-850 to-ink-900 border border-gold-500/30">
          <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-gold-500/10 blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-500/10 border border-gold-500/20 mb-3">
              <Crown size={14} className="text-gold-400" />
              <span className="text-xs font-bold text-gold-400 uppercase tracking-wider">Seja Membro VIP</span>
            </div>
            <h2 className="font-display text-2xl text-ink-100 tracking-wide mb-2">
              SEU ESTILO EM DIA, <br />
              <span className="gold-text">SEM PREOCUPAÇÕES</span>
            </h2>
            <p className="text-xs text-ink-300 leading-relaxed">
              Assine um dos nossos planos mensais e garanta seus cortes e barbas com economia, flexibilidade e prioridade de agendamento.
            </p>
          </div>
        </div>
      </section>

      {/* Destaque de Vantagens */}
      <section className="grid grid-cols-3 gap-2.5 px-5 mt-4">
        {[
          { icon: Zap, title: 'Atendimento', desc: 'Prioritário' },
          { icon: ShieldCheck, title: 'Sem Fidelidade', desc: 'Cancele quando quiser' },
          { icon: Sparkles, title: 'Desconto', desc: 'Em produtos' },
        ].map((item, index) => (
          <div key={index} className="card p-3 text-center">
            <item.icon size={18} className="text-gold-400 mx-auto mb-1" />
            <p className="text-xs font-bold text-ink-100">{item.title}</p>
            <p className="text-[10px] text-ink-300">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Lista Principal de Planos */}
      <section className="px-5 mt-6">
        <h3 className="text-lg font-bold text-ink-100 mb-3">Escolha o seu Plano</h3>
        
        {loading ? (
          <div className="py-12 flex items-center justify-center gap-2 text-ink-300">
            <Loader2 size={20} className="animate-spin text-gold-400" />
            <span className="text-xs">Carregando planos...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`card p-5 relative overflow-hidden transition-all ${
                  plan.popular ? 'border-gold-500/60 ring-1 ring-gold-500/30 bg-gradient-to-b from-ink-850 to-ink-900' : ''
                }`}
              >
                {/* Badge de Selo Exclusivo */}
                {plan.badge && (
                  <div className="flex justify-between items-center mb-2">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      plan.popular
                        ? 'gold-gradient text-ink-950 font-black'
                        : 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                    }`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-base font-bold text-ink-100 pr-2">{plan.name}</h4>
                  <div className="text-right shrink-0">
                    <span className="font-display text-2xl gold-text">R$ {plan.price}</span>
                    <span className="text-[10px] text-ink-300 block">/{plan.period || 'mês'}</span>
                  </div>
                </div>

                {/* Lista de Recursos/Benefícios */}
                <div className="space-y-2 my-4 pt-3 border-t border-white/5">
                  {plan.features?.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <div className="h-4 w-4 rounded-full gold-gradient flex items-center justify-center shrink-0">
                        <Check size={10} className="text-ink-950" strokeWidth={3} />
                      </div>
                      <span className="text-xs text-ink-200">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Ação */}
                <button
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                    plan.popular
                      ? 'gold-gradient text-ink-950 shadow-lg shadow-gold-500/10 active:scale-95'
                      : 'bg-ink-700 hover:bg-ink-600 text-ink-100 active:scale-95'
                  }`}
                >
                  <Crown size={14} /> Assinar {plan.name.split(':')[1] || plan.name}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}