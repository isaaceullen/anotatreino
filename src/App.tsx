
import React, { useState, useEffect } from 'react';
import { Home, Dumbbell, Calendar, Settings as SettingsIcon } from 'lucide-react';
import { useWorkoutManager } from './hooks/useWorkoutManager';
import { HomeScreen } from './screens/HomeScreen';
import { ActiveWorkoutScreen } from './screens/ActiveWorkoutScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ConfigScreen } from './screens/ConfigScreen';
import { ExercisesScreen } from './screens/ExercisesScreen';
import { CustomDialog } from './components/CustomDialog';

type Screen = 'home' | 'exercises' | 'history' | 'settings';

const App: React.FC = () => {
  const workoutManager = useWorkoutManager();
  const [activeTab, setActiveTab] = useState<Screen>('home');

  // Implementação de Roteamento via Pathname (/)
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.replace(/^\//, '');
      const screenName = path || 'home';
      const validScreens: Screen[] = ['home', 'exercises', 'history', 'settings'];
      
      if (validScreens.includes(screenName as Screen)) {
        setActiveTab(screenName as Screen);
      } else {
        // Rota padrão
        window.history.replaceState(null, '', '/home');
        setActiveTab('home');
      }
    };

    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('pushstate', handleLocationChange);
    window.addEventListener('replacestate', handleLocationChange);

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('pushstate', handleLocationChange);
      window.removeEventListener('replacestate', handleLocationChange);
    };
  }, []);

  const navigateTo = (screen: Screen) => {
    window.history.pushState(null, '', `/${screen}`);
    window.dispatchEvent(new Event('pushstate'));
  };

  if (workoutManager.activeDraft) {
    return (
      <>
        <ActiveWorkoutScreen manager={workoutManager} />
        <CustomDialog {...workoutManager.dialog} />
      </>
    );
  }

  const renderContent = () => {
    // Renderização Condicional Estrita:
    // O componente ExercisesScreen só é montado se activeTab === 'exercises'.
    // Ao mudar de aba, ele é desmontado, interrompendo o carregamento de GIFs.
    if (activeTab === 'exercises') {
      return (
        <ExercisesScreen manager={workoutManager} />
      );
    }

    switch (activeTab) {
      case 'home': return <HomeScreen manager={workoutManager} />;
      case 'history': return <HistoryScreen manager={workoutManager} />;
      case 'settings': return <ConfigScreen manager={workoutManager} />;
      default: return <HomeScreen manager={workoutManager} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col max-w-lg mx-auto border-x border-zinc-900 shadow-2xl relative safe-area-bottom">
      <main className="flex-1 overflow-y-auto pb-24">
        {renderContent()}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-2xl border-t border-zinc-900 max-w-lg mx-auto z-50 safe-area-bottom">
        <div className="flex justify-around items-center h-20 px-4">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => navigateTo('home')} 
            icon={<Home size={22} />} 
            label="Início" 
          />
          <NavButton 
            active={activeTab === 'exercises'} 
            onClick={() => navigateTo('exercises')} 
            icon={<Dumbbell size={22} />} 
            label="Acervo" 
          />
          <NavButton 
            active={activeTab === 'history'} 
            onClick={() => navigateTo('history')} 
            icon={<Calendar size={22} />} 
            label="Evolução" 
          />
          <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => navigateTo('settings')} 
            icon={<SettingsIcon size={22} />} 
            label="Ajustes" 
          />
        </div>
      </nav>

      <CustomDialog {...workoutManager.dialog} />
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: any; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${active ? 'text-blue-500 scale-110' : 'text-zinc-600'}`}
  >
    {icon}
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;
