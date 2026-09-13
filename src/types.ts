export type TabKey = 'home' | 'book' | 'club' | 'shop' | 'profile';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  icon: string;
}

export interface Barber {
  id: string;
  name: string;
  role: string;
  rating: number;
  reviews: number;
  image: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

export interface ClubTier {
  name: string;
  points: string;
  color: string;
  perks: string[];
}

export interface Appointment {
  id: string;
  service: string;
  barber: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}
