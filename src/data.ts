import type { Service, Barber, Product, ClubTier, Appointment } from './types';

export const services: Service[] = [
  { id: 's1', name: 'Corte Clássico', description: 'Corte masculino com tesoura e máquina, finalização com pomada.', price: 45, duration: 40, icon: 'scissors' },
  { id: 's2', name: 'Corte + Barba', description: 'Corte completo com toalha quente, navalha e hidratação.', price: 65, duration: 60, icon: 'sparkles' },
  { id: 's3', name: 'Barba Premium', description: 'Modelagem de barba com toalha quente, óleo e pós-barba.', price: 35, duration: 30, icon: 'flame' },
  { id: 's4', name: 'Pigmentação', description: 'Pigmentação de barba e cabelo para disfarçar falhas.', price: 55, duration: 45, icon: 'palette' },
  { id: 's5', name: 'Sobrancelha', description: 'Design e alinhamento de sobrancelha na navalha.', price: 20, duration: 15, icon: 'eye' },
  { id: 's6', name: 'Platinum Experience', description: 'Corte + barba + hidratação + lavagem + bebida cortesia.', price: 120, duration: 90, icon: 'crown' },
];

export const barbers: Barber[] = [
  { id: 'b1', name: 'Rafael Costa', role: 'Master Barber', rating: 4.9, reviews: 312, image: 'https://images.pexels.com/photos/4625626/pexels-photo-4625626.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 'b2', name: 'Diego Martins', role: 'Senior Barber', rating: 4.8, reviews: 208, image: 'https://images.pexels.com/photos/897263/pexels-photo-897263.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 'b3', name: 'Lucas Ferreira', role: 'Barber', rating: 4.7, reviews: 156, image: 'https://images.pexels.com/photos/7447151/pexels-photo-7447151.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
  { id: 'b4', name: 'Bruno Almeida', role: 'Especialista em Barba', rating: 5.0, reviews: 189, image: 'https://images.pexels.com/photos/3998424/pexels-photo-3998424.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' },
];

export const products: Product[] = [
  { id: 'p1', name: 'Pomada Matte Strong', brand: 'Coast Premium', price: 38, category: 'Cabelo', image: 'https://images.pexels.com/photos/5970246/pexels-photo-5970246.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', description: 'Fixação extra forte com acabamento fosco natural.' },
  { id: 'p2', name: 'Óleo para Barba', brand: 'Coast Grooming', price: 32, category: 'Barba', image: 'https://images.pexels.com/photos/3998408/pexels-photo-3998408.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', description: 'Hidrata e amacia a barba com fragrância amadeirada.' },
  { id: 'p3', name: 'Shampoo Detox', brand: 'Coast Care', price: 28, category: 'Cuidados', image: 'https://images.pexels.com/photos/4969838/pexels-photo-4969838.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', description: 'Limpeza profunda sem ressecar, revitaliza o couro.' },
  { id: 'p4', name: 'Cera Modeladora', brand: 'Coast Premium', price: 42, category: 'Cabelo', image: 'https://images.pexels.com/photos/4969874/pexels-photo-4969874.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', description: 'Modelagem flexível com brilho sutil e sem flakes.' },
  { id: 'p5', name: 'Balm Pós-Barba', brand: 'Coast Grooming', price: 35, category: 'Cuidados', image: 'https://images.pexels.com/photos/5853395/pexels-photo-5853395.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', description: 'Acalma a pele e previne irritações após o barbear.' },
  { id: 'p6', name: 'Kit Coast Completo', brand: 'Coast Premium', price: 149, category: 'Kits', image: 'https://images.pexels.com/photos/897263/pexels-photo-897263.jpeg?auto=compress&cs=tinysrgb&h=650&w=940', description: 'Pomada + óleo + shampoo + balm em estojo premium.' },
];

export const clubTiers: ClubTier[] = [
  {
    name: 'Bronze',
    points: '0 - 199 pts',
    color: 'from-amber-700 to-amber-900',
    perks: ['10% off em produtos', 'Lembretes de agendamento'],
  },
  {
    name: 'Prata',
    points: '200 - 499 pts',
    color: 'from-slate-400 to-slate-600',
    perks: ['15% off em produtos', 'Prioridade no agendamento', 'Bebida cortesia'],
  },
  {
    name: 'Ouro',
    points: '500 - 999 pts',
    color: 'from-gold-400 to-gold-600',
    perks: ['20% off em produtos', 'Agendamento prioritário', 'Bebida cortesia', 'Brinde mensal'],
  },
  {
    name: 'Platinum',
    points: '1000+ pts',
    color: 'from-cyan-400 to-blue-600',
    perks: ['25% off em produtos', 'Acesso VIP a horários', 'Corte de brinde a cada 5', 'Atendimento dedicado'],
  },
];

export const appointments: Appointment[] = [
  { id: 'a1', service: 'Corte + Barba', barber: 'Rafael Costa', date: '15 Set 2026', time: '14:30', status: 'upcoming' },
  { id: 'a2', service: 'Corte Clássico', barber: 'Diego Martins', date: '02 Set 2026', time: '10:00', status: 'completed' },
  { id: 'a3', service: 'Barba Premium', barber: 'Bruno Almeida', date: '28 Ago 2026', time: '16:00', status: 'completed' },
  { id: 'a4', service: 'Corte + Barba', barber: 'Rafael Costa', date: '20 Ago 2026', time: '15:30', status: 'completed' },
];

export const timeSlots: string[] = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
];

export const heroImage = 'https://images.pexels.com/photos/5970246/pexels-photo-5970246.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
export const shopInterior = 'https://images.pexels.com/photos/4969838/pexels-photo-4969838.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
export const beardGrooming = 'https://images.pexels.com/photos/5853395/pexels-photo-5853395.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';
