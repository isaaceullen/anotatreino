
import React, { Suspense } from 'react';
import { HashRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { Home, Dumbbell, Calendar, Settings as SettingsIcon, Activity } from 'lucide-react';
import { useWorkoutManager } from './hooks/useWorkoutManager';
import { HomeScreen } from './screens/HomeScreen';
import { ActiveWorkoutScreen } from './screens/ActiveWorkoutScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ProgressScreen } from './screens/ProgressScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { CustomDialog } from './components/CustomDialog';
import { LoadingSpinner } from './components/LoadingSpinner';

// Lazy Load da tela pesada (Acervo/Exercícios)
// O .then manipula o módulo pois ExercisesScreen usa exportação nomeada (named export), não default.
const ExercisesScreen = React.lazy(() => 
  import('./screens/ExercisesScreen').then(module => ({ default: module.ExercisesScreen }))
);

type Screen = 'home' | 'exercises' | 'history' | 'settings';

const App: React.FC = () => {
  const workoutManager = useWorkoutManager();

  if (workoutManager.activeDraft) {
    return (
      <>
        <ActiveWorkoutScreen manager={workoutManager} />
        <CustomDialog {...workoutManager.dialog} />
      </>
    );
  }

  return (
    <HashRouter>
      <div className="min-h-screen bg-black text-white font-sans flex flex-col max-w-lg mx-auto border-x border-zinc-900 shadow-2xl relative safe-area-bottom">
        <main className="flex-1 overflow-y-auto pb-24">
          <Routes>
            <Route path="/" element={<Navigate to="/inicio" replace />} />
            <Route path="/inicio" element={<HomeScreen manager={workoutManager} />} />
            <Route path="/exercicios" element={
              <Suspense fallback={<LoadingSpinner />}>
                <ExercisesScreen manager={workoutManager} />
              </Suspense>
            } />
            <Route path="/historico" element={<HistoryScreen manager={workoutManager} />} />
            <Route path="/progresso" element={<ProgressScreen app={workoutManager} />} />
            <Route path="/configuracoes" element={<SettingsScreen manager={workoutManager} />} />
          </Routes>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/90 backdrop-blur-2xl border-t border-zinc-900 max-w-lg mx-auto z-50 safe-area-bottom">
          <div className="flex justify-around items-center h-20 px-4">
            <NavButton 
              to="/inicio" 
              icon={<Home size={22} />} 
              label="Início" 
            />
            <NavButton 
              to="/exercicios" 
              icon={<Dumbbell size={22} />} 
              label="Acervo" 
            />
            <NavButton 
              to="/historico" 
              icon={<Calendar size={22} />} 
              label="Histórico" 
            />
            <NavButton 
              to="/progresso" 
              icon={<Activity size={22} />} 
              label="Evolução" 
            />
            <NavButton 
              to="/configuracoes" 
              icon={<SettingsIcon size={22} />} 
              label="Ajustes" 
            />
          </div>
        </nav>

        <CustomDialog {...workoutManager.dialog} />
      </div>
    </HashRouter>
  );
};

const NavButton: React.FC<{ to: string; icon: any; label: string }> = ({ to, icon, label }) => (
  <NavLink 
    to={to}
    className={({ isActive }) => `flex flex-col items-center gap-1.5 transition-all duration-300 ${isActive ? 'text-blue-500 scale-110' : 'text-zinc-600'}`}
  >
    {icon}
    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
  </NavLink>
);

export default App;
