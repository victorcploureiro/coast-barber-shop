import { Home, CalendarDays, Clock, Crown, User } from 'lucide-react';
import type { TabKey } from '@/types';

interface BottomNavProps {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}

const tabs: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: 'home', label: 'Início', icon: Home },
  { key: 'book', label: 'Agendamentos', icon: CalendarDays },
  { key: 'appointments', label: 'Agenda', icon: Clock },
  { key: 'club', label: 'Clube', icon: Crown },
  { key: 'profile', label: 'Perfil', icon: User },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/5">
      <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className="relative flex flex-col items-center gap-1 px-3 py-1.5 no-select"
            >
              <div
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  isActive ? 'scale-110' : 'scale-100'
                }`}
              >
                <Icon
                  size={22}
                  className={`transition-colors duration-300 ${
                    isActive ? 'text-gold-400' : 'text-ink-400'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {isActive && (
                  <span className="absolute -inset-2 rounded-full bg-gold-400/10 blur-md" />
                )}
              </div>
              <span
                className={`text-[10px] font-medium tracking-wide transition-colors duration-300 ${
                  isActive ? 'text-gold-400' : 'text-ink-400'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute -top-px h-0.5 w-6 rounded-full gold-gradient" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}