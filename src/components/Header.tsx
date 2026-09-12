import { MapPin } from 'lucide-react';
import { BRAND_CONFIG } from '../config/brand';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showLocation?: boolean;
}

export default function Header({ title, subtitle, showLocation }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 glass-strong border-b border-white/5">
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl overflow-hidden border border-white/10 shadow-lg shadow-gold-500/10 flex items-center justify-center bg-ink-900">
            <img 
              src={BRAND_CONFIG.assets.iconUrl} 
              alt={BRAND_CONFIG.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-display text-lg tracking-wide text-ink-100 leading-none">
              COAST <span className="gold-text">BARBER SHOP</span>
            </h1>
            <p className="text-[10px] text-gold-400 font-semibold uppercase tracking-wider mt-0.5">
              {BRAND_CONFIG.tagline}
            </p>
            {showLocation && (
              <p className="text-[11px] text-ink-300 flex items-center gap-1 mt-0.5">
                <MapPin size={10} className="text-gold-400" />
                {BRAND_CONFIG.address}
              </p>
            )}
          </div>
        </div>
      </div>
      {title && (
        <div className="px-5 pb-4">
          <h2 className="text-2xl font-bold text-ink-100 leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-ink-300 mt-1">{subtitle}</p>}
        </div>
      )}
    </header>
  );
}