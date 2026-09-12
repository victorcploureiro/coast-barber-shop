import { BRAND_CONFIG } from './config/brand';

export const heroImage = "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1000";
export const shopInterior = "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=600";
export const beardGrooming = "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=600";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: 'cabelo' | 'barba' | 'combo' | 'quimica' | 'cuidados';
  icon: string;
}

export const services: Service[] = [
  // CORTE & ESTILO
  {
    id: 'corte-coast',
    name: 'Corte Coast / Fade',
    description: 'Corte sob medida (clássico ou degradê), alinhamento de pezinho e finalização com pomada.',
    price: 50,
    duration: 30,
    category: 'cabelo',
    icon: 'scissors'
  },
  {
    id: 'corte-sobrancelha',
    name: 'Corte + Sobrancelha',
    description: 'Design de corte completo alinhado ao design de sobrancelha na navalha.',
    price: 65,
    duration: 30,
    category: 'cabelo',
    icon: 'sparkles'
  },

  // BARBA & RITUAL
  {
    id: 'barboterapia-coast',
    name: 'Barboterapia Coast',
    description: 'Modelagem com toalha quente, óleos essenciais, esfoliação facial e acabamento na navalha.',
    price: 50,
    duration: 30,
    category: 'barba',
    icon: 'flame'
  },
  {
    id: 'barba-pezinho',
    name: 'Barba + Pezinho',
    description: 'Ritual de barboterapia completo acompanhado da manutenção do contorno/pezinho do cabelo.',
    price: 65,
    duration: 30,
    category: 'barba',
    icon: 'flame'
  },
  {
    id: 'barba-sobrancelha',
    name: 'Barba + Sobrancelha',
    description: 'Modelagem de barba com acabamento na navalha e alinhamento de sobrancelhas.',
    price: 65,
    duration: 30,
    category: 'barba',
    icon: 'flame'
  },
  {
    id: 'pigmentacao-barba',
    name: 'Pigmentação de Barba',
    description: 'Cobertura sutil e uniforme de fios brancos ou falhas para um visual encorpado.',
    price: 50,
    duration: 15,
    category: 'barba',
    icon: 'palette'
  },

  // COMBOS
  {
    id: 'combo-executive',
    name: 'Combo Coast Executive',
    description: 'A experiência completa: Corte de cabelo sob medida acompanhado do ritual tradicional de barba.',
    price: 100,
    duration: 60,
    category: 'combo',
    icon: 'crown'
  },

  // QUÍMICOS
  {
    id: 'luzes-mechas',
    name: 'Luzes & Mechas',
    description: 'Aclaramento técnico de mechas na touca para iluminar o visual com naturalidade.',
    price: 80,
    duration: 30,
    category: 'quimica',
    icon: 'palette'
  },
  {
    id: 'platinado-global',
    name: 'Platinado Global',
    description: 'Descoloração total de alta performance, tonalização precisa e hidratação profunda.',
    price: 200,
    duration: 180,
    category: 'quimica',
    icon: 'sparkles'
  },
  {
    id: 'relaxamento-capilar',
    name: 'Relaxamento & Suavização',
    description: 'Redução de volume e controle de cachos/fios com toque macio e acabamento natural.',
    price: 50,
    duration: 30,
    category: 'quimica',
    icon: 'scissors'
  },
  {
    id: 'selagem-termica',
    name: 'Selagem Térmica',
    description: 'Alinhamento capilar para redução de frizz e disciplina dos fios.',
    price: 80,
    duration: 30,
    category: 'quimica',
    icon: 'scissors'
  },
  {
    id: 'camuflagem-grisalhos',
    name: 'Camuflagem de Grisalhos',
    description: 'Tonalização semipermanente sem amônia para suavizar o grisalho sem marcas.',
    price: 80,
    duration: 30,
    category: 'quimica',
    icon: 'palette'
  },

  // CUIDADOS & WAXING
  {
    id: 'waxing-nariz',
    name: 'Waxing Nariz',
    description: 'Remoção rápida e higiênica de pelos nasais com cera específica.',
    price: 20,
    duration: 10,
    category: 'cuidados',
    icon: 'sparkles'
  },
  {
    id: 'waxing-orelha',
    name: 'Waxing Orelhas',
    description: 'Higienização e remoção de pelos das orelhas para um visual impecável.',
    price: 20,
    duration: 15,
    category: 'cuidados',
    icon: 'sparkles'
  }
];

export interface Barber {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  likes: number;
  image: string;
}

export const barbers: Barber[] = [
  {
    id: 'viny-costa',
    name: 'Viny Costa',
    role: 'Barbeiro / Fundador',
    rating: 5.0,
    reviews: 142,
    likes: 310,
    image: 'https://d39p7gjvbgwtet.cloudfront.net/Pessoas/120x120/p_foto_000727493.jpg?v=20260225160400'
  },
  {
    id: 'nicolas',
    name: 'Nicolas',
    role: 'Barbeiro',
    rating: 4.9,
    reviews: 98,
    likes: 215,
    image: 'https://d39p7gjvbgwtet.cloudfront.net/Pessoas/120x120/p_foto_000492268.jpg?v=20260302091200'
  },
  {
    id: 'kaua',
    name: 'Kauã',
    role: 'Barbeiro',
    rating: 4.9,
    reviews: 76,
    likes: 180,
    image: 'https://d39p7gjvbgwtet.cloudfront.net/Pessoas/120x120/p_foto_000730129.jpg?v=20260528094700'
  },
  {
    id: 'roberto',
    name: 'Roberto',
    role: 'Barbeiro',
    rating: 4.8,
    reviews: 64,
    likes: 145,
    image: 'https://d39p7gjvbgwtet.cloudfront.net/Pessoas/120x120/p_foto_000045328.jpg?v=20260416131500'
  },
  {
    id: 'joao-paulo',
    name: 'João Paulo',
    role: 'Barbeiro',
    rating: 4.9,
    reviews: 82,
    likes: 195,
    image: 'https://d39p7gjvbgwtet.cloudfront.net/Pessoas/120x120/p_foto_000584545.jpg?v=20260213112900'
  }
];

export interface SubscriptionPlan {
  id: string;
  name: string;
  badge?: string;
  price: number;
  period: string;
  features: string[];
  popular?: boolean;
}

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'club-barba-basic',
    name: 'Coast Club: Barba Essential',
    badge: 'Seg a Qua',
    price: 89.9,
    period: 'mês',
    features: [
      '2 Barboterapias completas por mês',
      'Atendimento exclusivo de Terça e Quarta',
      'Uso exclusivo do titular do cadastro'
    ]
  },
  {
    id: 'club-corte-basic',
    name: 'Coast Club: Corte Essential',
    badge: 'Seg a Qua',
    price: 89.9,
    period: 'mês',
    features: [
      '2 Cortes de cabelo por mês',
      'Atendimento exclusivo de Terça e Quarta',
      'Uso exclusivo do titular do cadastro'
    ]
  },
  {
    id: 'club-duo-cabelo-barba',
    name: 'Coast Club: Duo Cabelo & Barba',
    badge: 'Mais Vendido',
    popular: true,
    price: 138.9,
    period: 'mês',
    features: [
      '1 Combo Cabelo + Barba + 1 Corte de Cabelo',
      'Compartilhável com filho no mesmo cadastro',
      'Válido de Terça a Sábado'
    ]
  },
  {
    id: 'club-pai-filho-4',
    name: 'Coast Club: Pai & Filho (4 Cortes)',
    badge: 'Família',
    price: 179.9,
    period: 'mês',
    features: [
      '4 Cortes de cabelo mensais no total',
      'Uso flexível entre Pai e Filho',
      'Válido de Terça a Sábado'
    ]
  },
  {
    id: 'club-flex-3',
    name: 'Coast Club: Freedom (3 Serviços)',
    badge: 'Flexível',
    price: 138.9,
    period: 'mês',
    features: [
      '3 Créditos livres (Corte ou Barba)',
      'Compartilhável no mesmo cadastro',
      'Válido de Terça a Sábado'
    ]
  }
];

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Pomada Matte Modeladora',
    category: 'Cabelo',
    price: 55,
    image: 'https://images.unsplash.com/photo-1608248597260-6578613690d2?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 'prod-2',
    name: 'Óleo Hidratante para Barba',
    category: 'Barba',
    price: 48,
    image: 'https://images.unsplash.com/photo-1626285861696-9f0bf5a49c6d?auto=format&fit=crop&q=80&w=400'
  }
];

export const appointments = [
  {
    id: 'apt-1',
    service: 'Combo Coast Executive',
    barber: 'Viny Costa',
    date: '18 Setembro',
    time: '15:00',
    status: 'upcoming',
    price: 100
  },
  {
    id: 'apt-2',
    service: 'Corte Coast / Fade',
    barber: 'Nicolas',
    date: '28 Agosto',
    time: '10:30',
    status: 'completed',
    price: 50
  }
];