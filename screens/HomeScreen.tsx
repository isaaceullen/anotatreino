
import React, { useState, useEffect } from 'react';
import { GROUPS, GroupLetter, DAY_NAMES } from '../types';
import { Play, Dumbbell, CalendarDays } from 'lucide-react';

export const HomeScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { state, startWorkout, getGroupTags } = manager;
  const [selected, setSelected] = useState<GroupLetter[]>([]);

  useEffect(() => {
    const todayIndex = new Date().getDay();
    const scheduledGroups: GroupLetter[] = state.schedule[todayIndex] || [];
    if (scheduledGroups.length > 0) {
      setSelected(scheduledGroups);
    }
  }, [state.schedule]);

  const toggleGroup = (g: GroupLetter) => {
    setSelected(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const getExerciseCountForGroup = (g: GroupLetter) => {
    return state.exercises.filter((e: any) => e.groupId === g).length;
  };

  const getScheduledDays = (g: GroupLetter) => {
    const days: string[] = [];
    Object.entries(state.schedule).forEach(([dayIdx, groups]) => {
      if ((groups as GroupLetter[]).includes(g)) {
        days.push(DAY_NAMES[Number(dayIdx)].substring(0, 3));
      }
    });
    return days.length > 0 ? days.join(', ') : null;
  };

  // Grupos que têm exercícios cadastrados
  const activeGroups = GROUPS.filter(g => getExerciseCountForGroup(g) > 0);

  return (
    <div className="p-6 space-y-8 animate-in fade-in duration-500">
      <header className="pt-4 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none">
            Anota <br/><span className="text-blue-500">Treino</span>
          </h1>
        </div>
        <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center text-blue-500 shadow-xl shadow-blue-900/10">
          <Dumbbell size={24} />
        </div>
      </header>

      <section className="space-y-4">
        <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Seus Treinos</h2>
        
        {activeGroups.length === 0 ? (
           <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-[2.5rem] p-8 text-center">
              <p className="text-zinc-600 font-bold text-sm mb-4">Você ainda não montou nenhum treino.</p>
              <p className="text-zinc-700 text-xs">Vá até o menu "Acervo" (ícone Halter) para começar a adicionar exercícios aos grupos.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {activeGroups.map(g => {
              const count = getExerciseCountForGroup(g);
              const isSelected = selected.includes(g);
              const scheduledDays = getScheduledDays(g);
              const muscleTags = getGroupTags(g);

              return (
                <button
                  key={g}
                  onClick={() => toggleGroup(g)}
                  className={`relative flex flex-col items-start p-6 rounded-[2.5rem] border transition-all duration-300 text-left group overflow-hidden ${
                    isSelected 
                    ? 'bg-blue-600 border-blue-500 text-white shadow-xl shadow-blue-600/30' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex w-full justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black italic uppercase ${isSelected ? 'bg-white text-blue-600' : 'bg-black/40 text-zinc-300'}`}>
                          {g}
                       </div>
                       <div>
                          <span className={`block text-[10px] font-black uppercase tracking-widest ${isSelected ? 'text-blue-200' : 'text-zinc-600'}`}>{count} Exercícios</span>
                          {scheduledDays && (
                             <div className={`flex items-center gap-1 mt-0.5 text-xs font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>
                                <CalendarDays size={12} /> {scheduledDays}
                             </div>
                          )}
                       </div>
                    </div>
                    {isSelected && <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-lg" />}
                  </div>

                  <div className="flex flex-wrap gap-1 relative z-10">
                     {muscleTags.map((tag: string) => (
                        <span key={tag} className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${isSelected ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                           {tag}
                        </span>
                     ))}
                  </div>

                  {/* Decorative Background */}
                  <div className={`absolute -right-4 -bottom-4 w-32 h-32 rounded-full blur-3xl transition-all ${isSelected ? 'bg-white/20' : 'bg-blue-900/10 group-hover:bg-blue-900/20'}`} />
                </button>
              );
            })}
          </div>
        )}
      </section>

      <div className="fixed bottom-28 left-4 right-4 max-w-md mx-auto z-40">
        <button
          disabled={selected.length === 0}
          onClick={() => startWorkout(selected)}
          className={`w-full py-5 rounded-3xl font-black uppercase text-lg italic tracking-widest flex items-center justify-center gap-3 transition-all ${
            selected.length > 0 
            ? 'bg-white text-black shadow-2xl active:scale-95' 
            : 'bg-zinc-900 text-zinc-700 opacity-50 cursor-not-allowed'
          }`}
        >
          <Play fill="currentColor" size={24} />
          {selected.length > 0 ? `Iniciar Treino (${selected.join('+')})` : 'Selecione um Treino'}
        </button>
      </div>
    </div>
  );
};
