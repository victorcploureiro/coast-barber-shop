export const BRAND_CONFIG = {
  name: 'Coast Barber Shop',
  tagline: 'O Clássico Nunca Morre',
  founder: 'Viny Costa',
  foundedYear: 2019,
  address: 'Av. do Café, 485 - Vila Guarani, São Paulo - SP',
  bio: 'Idealizada em 2019 por Viny Costa (atuante na região desde 2006). Especialistas em cortes sociais clássicos, degradês e técnicas de tesoura para todos os tipos de cabelo, do oriental ao afro.',
  
  // Contato e Atendimento
  phone: '(11) 99664-5875',
  whatsappUrl: 'https://wa.me/5511996645875',
  instagramUrl: 'https://www.instagram.com/coastbarbershop',
  
  // Horários de Funcionamento
  businessHours: [
    { days: 'Terça a Sexta', hours: '09:00 às 19:30' },
    { days: 'Sábado', hours: '09:00 às 19:00' },
    { days: 'Domingo e Segunda', hours: 'Fechado' }
  ],

  amenities: [
    'Wi-Fi Grátis',
    'Estacionamento Gratuito',
    'Atendimento Adulto & Infantil',
    'Ambiente Climatizado'
  ],
  paymentMethods: ['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Dinheiro'],
  languages: ['Português'],
  assets: {
    iconUrl: 'https://yklvdivaomflpkpmjmul.supabase.co/storage/v1/object/public/assets/coast_icon.png',
    logoUrl: 'https://yklvdivaomflpkpmjmul.supabase.co/storage/v1/object/public/assets/coast_logo.png',
  }
};