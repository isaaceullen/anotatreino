
import React, { useState, useMemo } from 'react';
import { Search, Plus, Trash2, Save, Minus, Activity, Dumbbell, Check, ChevronRight, ArrowLeft, Lock } from 'lucide-react';
import { Exercise, MasterExercise, GROUPS, GroupLetter } from '../types';
import { MASTER_EXERCISES, CARDIO_MASTER_ID } from '../constants';

// Componente Stepper Otimizado para Mobile UX
const Stepper = ({ value, onChange, step, label }: { value: number | string, onChange: (v: number | string) => void, step: number, label: string }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val === '' ? '' : Number(val));
  };

  const handleBlur = () => {
    if (value === '' || value === undefined) onChange(0);
  };

  const increment = () => onChange(Number(value || 0) + step);
  const decrement = () => onChange(Math.max(0, Number(value || 0) - step));

  return (
    <div className="space-y-1">
       <label className="text-[9px] font-black text-zinc-500 uppercase text-center block">{label}</label>
       <div className="flex items-center bg-black border border-zinc-800 rounded-xl overflow-hidden">
          <button 
             onClick={decrement}
             className="p-3 hover:bg-zinc-800 text-zinc-400 active:text-white transition-colors"
          >
             <Minus size={14} strokeWidth={3} />
          </button>
          <input 
             type="number" 
             value={value} 
             onChange={handleInputChange}
             onBlur={handleBlur}
             className="w-full bg-transparent text-center text-white font-black text-sm outline-none no-spinner"
          />
          <button 
             onClick={increment}
             className="p-3 hover:bg-zinc-800 text-zinc-400 active:text-white transition-colors"
          >
             <Plus size={14} strokeWidth={3} />
          </button>
       </div>
    </div>
  );
};

export const ExercisesScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { addExerciseToGroup, showDialog, state } = manager;
  
  const [activeStep, setActiveStep] = useState<'catalog' | 'config'>('catalog');
  const [search, setSearch] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  
  // Lista de exercícios selecionados para o lote
  const [selection, setSelection] = useState<any[]>([]);
  const [targetGroup, setTargetGroup] = useState<GroupLetter>('A');

  // Músculos únicos (agregado de arrays)
  const muscles = useMemo(() => {
    const allMuscles = MASTER_EXERCISES.flatMap(e => e.targetMuscles || []);
    return Array.from(new Set(allMuscles)).sort();
  }, []);
  
  // Filtro atualizado para arrays
  const filteredCatalog = useMemo(() => {
    return MASTER_EXERCISES.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) &&
      (!selectedMuscle || m.targetMuscles.includes(selectedMuscle))
    );
  }, [search, selectedMuscle]);

  // Lógica de Toggle (Batch Selection)
  const toggleSelection = (master: MasterExercise) => {
    const isSelected = selection.some(item => item.masterId === master.id);
    
    // Verificar se já existe no grupo alvo
    const isAlreadyInGroup = state.exercises.some((e: any) => e.groupId === targetGroup && e.masterId === master.id);
    if (isAlreadyInGroup) {
      showDialog('alert', 'Já Adicionado', `Este exercício já existe no Grupo ${targetGroup}.`);
      return;
    }

    if (isSelected) {
      setSelection(prev => prev.filter(item => item.masterId !== master.id));
    } else {
      const newItem: Partial<Exercise> = {
        masterId: master.id,
        name: master.name,
        targetMuscles: master.targetMuscles,
        type: 'strength',
        load: 10,
        sets: 3,
        reps: 10,
        restTime: 60,
        notes: ''
      };
      setSelection(prev => [...prev, newItem]);
    }
  };

  const addCardioToSelection = () => {
    const newItem: Partial<Exercise> = {
      masterId: CARDIO_MASTER_ID,
      name: 'Cardio Livre',
      targetMuscles: ['Cardio'],
      type: 'cardio',
      load: 0,
      sets: 0,
      reps: 0,
      restTime: 0,
      notes: ''
    };
    setSelection(prev => [...prev, newItem]);
    showDialog('alert', 'Cardio Adicionado', 'Item de cardio incluído na lista.');
  };

  const removeFromSelection = (index: number) => {
    setSelection(prev => prev.filter((_, i) => i !== index));
    if (selection.length === 1) setActiveStep('catalog'); 
  };

  const updateSelectionItem = (index: number, updates: Record<string, any>) => {
    setSelection(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item));
  };

  const handleSaveWorkout = async () => {
    if (selection.length === 0) return;
    
    const sanitizedSelection = selection.map(item => ({
       ...item,
       load: Number(item.load) || 0,
       sets: Number(item.sets) || 0,
       reps: Number(item.reps) || 0
    }));
    
    const confirm = await showDialog('confirm', 'Salvar Treino?', `Adicionar ${selection.length} exercícios ao Grupo ${targetGroup}?`);
    if (confirm) {
      sanitizedSelection.forEach(item => {
        addExerciseToGroup({ ...item, groupId: targetGroup } as Omit<Exercise, 'id'>);
      });
      setSelection([]);
      setActiveStep('catalog');
      showDialog('alert', 'Sucesso', 'Exercícios salvos no seu treino!');
    }
  };

  // --- RENDER: CONFIGURAÇÃO (LOTE) ---
  if (activeStep === 'config') {
    return (
      <div className="p-6 pb-40 animate-in slide-in-from-right duration-300">
        <header className="flex justify-between items-center mb-6 sticky top-0 bg-black z-20 py-4 -mx-6 px-6 border-b border-zinc-900">
          <button onClick={() => setActiveStep('catalog')} className="text-zinc-500 font-bold text-xs uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
             <ArrowLeft size={16}/> Voltar
          </button>
          <div className="flex items-center gap-2">
             <span className="text-xs font-black text-zinc-600 uppercase">Salvar em:</span>
             <span className="bg-zinc-900 border border-zinc-800 text-blue-500 font-black rounded-lg py-1 px-3">
                Grupo {targetGroup}
             </span>
          </div>
        </header>

        <h2 className="text-2xl font-black italic uppercase mb-2">Configurar Lote</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase mb-8">{selection.length} Exercícios selecionados</p>

        <div className="space-y-8">
          {selection.map((item, idx) => (
            <div key={idx} className="bg-zinc-900/50 border border-zinc-800 rounded-[2rem] p-5 relative group transition-all hover:border-zinc-700">
               <div className="flex items-center justify-between mb-6 pb-4 border-b border-zinc-800/50">
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <span className="text-xs font-black">{idx + 1}</span>
                     </div>
                     <div>
                       <h3 className="font-black italic uppercase text-white leading-tight">{item.name}</h3>
                       <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{item.targetMuscles?.join(' + ')}</span>
                     </div>
                  </div>
                  <button onClick={() => removeFromSelection(idx)} className="text-zinc-600 hover:text-red-500 transition-colors p-2">
                    <Trash2 size={18} />
                  </button>
               </div>

               {item.type === 'strength' ? (
                 <div className="grid grid-cols-3 gap-3 mb-4">
                    <Stepper label="Carga (kg)" value={item.load} step={5} onChange={(v) => updateSelectionItem(idx, { load: v })} />
                    <Stepper label="Séries" value={item.sets} step={1} onChange={(v) => updateSelectionItem(idx, { sets: v })} />
                    <Stepper label="Reps" value={item.reps} step={1} onChange={(v) => updateSelectionItem(idx, { reps: v })} />
                 </div>
               ) : (
                 <div className="bg-zinc-800/50 p-4 rounded-xl text-center mb-4">
                    <p className="text-xs text-zinc-400 italic">Cardio: Registre tempo/distância durante o treino.</p>
                 </div>
               )}

               <div className="space-y-1">
                  <input 
                    value={item.notes} 
                    onChange={e => updateSelectionItem(idx, { notes: e.target.value })}
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 outline-none focus:border-blue-500 transition-colors"
                    placeholder="Notas opcionais (ex: Drop-set)..."
                  />
               </div>
            </div>
          ))}

          <div className="pt-4 border-t border-dashed border-zinc-800">
            <button onClick={addCardioToSelection} className="w-full py-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-pink-500 font-black uppercase text-xs tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">
               <Activity size={16} /> Adicionar Sessão de Cardio
            </button>
          </div>
        </div>

        <div className="fixed bottom-24 left-4 right-4 z-40">
           <button 
             onClick={handleSaveWorkout}
             className="w-full bg-blue-600 text-white font-black italic uppercase py-5 rounded-3xl shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
           >
             <Save size={20} /> Salvar Tudo no Grupo {targetGroup}
           </button>
        </div>
      </div>
    );
  }

  // --- RENDER: CATÁLOGO (SELEÇÃO) ---
  return (
    <div className="p-6 space-y-6 animate-in fade-in duration-500 pb-40">
      <header className="flex justify-between items-center pt-2">
        <div>
           <h2 className="text-3xl font-black italic uppercase tracking-tighter">Catálogo</h2>
           <div className="flex items-center gap-2 mt-1">
             <span className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Adicionando ao:</span>
             <select 
                value={targetGroup} 
                onChange={e => { setTargetGroup(e.target.value as GroupLetter); setSelection([]); }}
                className="bg-zinc-900 border border-zinc-800 text-blue-500 font-black rounded-lg py-1 px-3 outline-none text-xs uppercase"
             >
                {GROUPS.map(g => <option key={g} value={g}>Grupo {g}</option>)}
             </select>
           </div>
        </div>
        {selection.length > 0 && (
           <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
              {selection.length} Selecionados
           </div>
        )}
      </header>

      {/* Busca e Filtros */}
      <div className="space-y-4 sticky top-0 bg-black/95 backdrop-blur-xl z-20 py-2 -mx-2 px-2 border-b border-zinc-900/50">
         <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar exercício..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white outline-none focus:ring-2 ring-blue-500 transition-all"
            />
         </div>
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button 
               onClick={() => setSelectedMuscle(null)}
               className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all border ${!selectedMuscle ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
            >
              Todos
            </button>
            {muscles.map(m => (
              <button 
                 key={m}
                 onClick={() => setSelectedMuscle(m === selectedMuscle ? null : m)}
                 className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase transition-all border ${selectedMuscle === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-zinc-900 text-zinc-500 border-zinc-800'}`}
              >
                {m}
              </button>
            ))}
         </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid grid-cols-2 gap-3">
         {filteredCatalog.map(master => {
            const isSelected = selection.some(s => s.masterId === master.id);
            // Verificar uso
            const isAlreadyInTargetGroup = state.exercises.some((e: any) => e.groupId === targetGroup && e.masterId === master.id);
            const usedInGroups = state.exercises
               .filter((e: any) => e.masterId === master.id)
               .map((e: any) => e.groupId);
            const uniqueUsedGroups = Array.from(new Set(usedInGroups));
            
            return (
              <div 
                 key={master.id} 
                 onClick={() => !isAlreadyInTargetGroup && toggleSelection(master)}
                 className={`relative rounded-[2rem] overflow-hidden group cursor-pointer active:scale-95 transition-all duration-300 border-2 ${
                    isAlreadyInTargetGroup ? 'border-zinc-800 opacity-50 grayscale' :
                    isSelected 
                      ? 'border-blue-600 bg-zinc-900 shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                      : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600'
                 }`}
              >
                 <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                    <img 
                      src={master.gifUrl} 
                      alt={master.name} 
                      className={`w-full h-full object-cover transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-90'}`} 
                      loading="lazy" 
                      decoding="async" 
                    />
                    
                    {/* Overlay de Seleção */}
                    <div className={`absolute inset-0 bg-blue-600/20 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0'}`} />

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 transition-all duration-300">
                       {isAlreadyInTargetGroup ? (
                         <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500">
                           <Lock size={16} />
                         </div>
                       ) : (
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
                            isSelected 
                              ? 'bg-blue-600 border-blue-500 text-white scale-110 shadow-lg' 
                              : 'bg-black/40 border-white/20 text-white/50'
                         }`}>
                            {isSelected ? <Check size={18} strokeWidth={3} /> : <Plus size={18} />}
                         </div>
                       )}
                    </div>

                    {/* Badge de Uso em Outros Grupos */}
                    {uniqueUsedGroups.length > 0 && !isAlreadyInTargetGroup && (
                       <div className="absolute top-3 left-3">
                          <span className="bg-black/60 backdrop-blur px-2 py-1 rounded-lg text-[9px] font-black text-white uppercase border border-white/10">
                             Em uso: {uniqueUsedGroups.join(', ')}
                          </span>
                       </div>
                    )}
                 </div>
                 
                 <div className="p-4">
                    <h4 className={`font-black italic uppercase leading-tight mb-1 text-sm transition-colors ${isSelected ? 'text-blue-400' : 'text-white'}`}>{master.name}</h4>
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950 px-2 py-1 rounded inline-block">{master.targetMuscles?.join(' + ')}</span>
                 </div>
              </div>
            );
         })}
      </div>
      
      {filteredCatalog.length === 0 && (
         <div className="text-center py-20 opacity-50">
            <Dumbbell className="mx-auto mb-2" size={32} />
            <p className="text-xs font-bold uppercase">Nenhum exercício encontrado</p>
         </div>
      )}

      {/* FAB (Floating Action Button) para Avançar */}
      <div className={`fixed bottom-24 left-4 right-4 z-40 transition-all duration-500 transform ${selection.length > 0 ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <button 
           onClick={() => setActiveStep('config')}
           className="w-full bg-blue-600 text-white py-5 rounded-3xl shadow-2xl shadow-blue-600/40 flex items-center justify-between px-8 group active:scale-95 transition-all"
        >
           <div className="flex items-center gap-3">
              <span className="bg-white text-blue-600 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm">{selection.length}</span>
              <div className="text-left">
                 <p className="font-black italic uppercase text-sm leading-none">Configurar</p>
                 <p className="text-[10px] font-bold uppercase text-blue-200 tracking-widest">Itens selecionados</p>
              </div>
           </div>
           <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
