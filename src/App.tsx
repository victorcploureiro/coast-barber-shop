import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import HomePage from '@/pages/HomePage';
import BookPage from '@/pages/BookPage';
import ClubPage from '@/pages/ClubPage';
import ShopPage from '@/pages/ShopPage';
import ProfilePage from '@/pages/ProfilePage';
import type { TabKey } from '@/types';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage onNavigate={setActiveTab} />;
      case 'book':
        return <BookPage />;
      case 'club':
        return <ClubPage />;
      case 'shop':
        return <ShopPage />;
      case 'profile':
        return <ProfilePage onNavigate={setActiveTab} />;
      default:
        return <HomePage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 max-w-md mx-auto relative">
      {renderPage()}
      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}
