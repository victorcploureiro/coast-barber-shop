import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import HomePage from '@/pages/HomePage';
import BookPage from '@/pages/BookPage';
import AppointmentsPage from '@/pages/AppointmentsPage';
import ClubPage from '@/pages/ClubPage';
import ShopPage from '@/pages/ShopPage';
import ProfilePage from '@/pages/ProfilePage';
import type { TabKey } from '@/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const handleNavigate = (tab: TabKey, serviceId?: string) => {
    if (serviceId) {
      setSelectedServiceId(serviceId);
    }
    setActiveTab(tab);
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'book':
        return (
          <BookPage
            onNavigate={handleNavigate}
            initialServiceId={selectedServiceId}
            onClearInitialService={() => setSelectedServiceId(null)}
          />
        );
      case 'appointments':
        return <AppointmentsPage onNavigate={handleNavigate} />;
      case 'club':
        return <ClubPage />;
      case 'shop':
        return <ShopPage />;
      case 'profile':
        return <ProfilePage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 max-w-md mx-auto relative">
      {renderPage()}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
