import React, { useState, useEffect, useRef } from 'react';
import { Timer as TimerIcon, Save, XCircle, ChevronRight, Check, ArrowUp, ArrowDown, Activity, ListOrdered, Minus, Plus, MoreVertical, Trash2, Settings, AlertTriangle } from 'lucide-react';
import { RestTimerOverlay } from '../components/RestTimerOverlay';
import { ExercisesScreen } from './ExercisesScreen';
import { CARDIO_MASTER_ID } from '../constants';

// Componente de Input Inteligente com Steppers (+/-)
const SmartStepper = ({ value, onChange, step, suffix, textColor = 'text-white', className = '' }: { value: number, onChange: (v: number) => void, step: number, suffix?: string, textColor?: string, className?: string }) => {
  const [localValue, setLocalValue] = useState<string | number>(value === 0 ? '' : value);

  useEffect(() => {
    if (Number(localValue) !== value) {
      setLocalValue(value === 0 ? '' : value);
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
    if (val === '') {
       onChange(0);
    } else {
       onChange(Number(val));
    }
  };

  const handleBlur = () => {
    if (localValue === '' || localValue === '0') {
      setLocalValue(''); 
    }
  };

  const increment = () => {
     const newVal = Number(localValue || 0) + step;
     setLocalValue(newVal);
     onChange(newVal);
  };

  const decrement = () => {
     const newVal = Math.max(0, Number(localValue || 0) - step);
     setLocalValue(newVal === 0 ? '' : newVal);
     onChange(newVal);
  };

  return (
    <div className={`flex items-center bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden h-12 ${className}`}>
        <button 
          onClick={decrement} 
          className="w-10 h-full flex items-center justify-center bg-zinc-900/50 hover:bg-zinc-800 text-zinc-500 active:text-white transition-colors border-r border-zinc-800/50 flex-none"
        >
            <Minus size={16} strokeWidth={3} />
        </button>
        
        <div className="flex-1 flex items-center justify-center relative px-1 bg-black/20 h-full min-w-0">
            <input 
                type="number"
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0"
                className={`w-full h-full bg-transparent text-center font-black text-lg outline-none no-spinner ${textColor} placeholder-zinc-700`}
            />
            {suffix && <span className="text-[8px] font-black text-zinc-600 absolute right-1 bottom-1 pointer-events-none">{suffix}</span>}
        </div>
        
        <button 
          onClick={increment} 
          className="w-10 h-full flex items-center justify-center bg-zinc-900/50 hover:bg-zinc-800 text-zinc-500 active:text-white transition-colors border-l border-zinc-800/50 flex-none"
        >
            <Plus size={16} strokeWidth={3} />
        </button>
    </div>
  );
};

export const ActiveWorkoutScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { activeDraft, updateSeries, updateAllSeries, addSeriesToDraft, removeSeriesFromDraft, markCardioComplete, finishWorkout, cancelWorkout, reorderExercises, state, showDialog, getLastSessionData, getMaster } = manager;
  const [showSummary, setShowSummary] = useState(false);
  const [notes, setNotes] = useState('');
  const [timerVisible, setTimerVisible] = useState(false);
  const [expandedGif, setExpandedGif] = useState<string | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [showExercisesModal, setShowExercisesModal] = useState(false);
  
  // Reordering State
  const [isReordering, setIsReordering] = useState(false);
  const [localSortOrder, setLocalSortOrder] = useState<string[]>([]);

  // Timeout Logic
  const [showTimeoutModal, setShowTimeoutModal] = useState(false);
  const [timeoutSeconds, setTimeoutSeconds] = useState(300); 
  const inactivityCheckRef = useRef<any>(null);

  const handleDeleteExercise = (exId: string) => {
    showDialog(
      'confirm',
      'Excluir Exercício',
      'Excluir permanentemente este exercício deste grupo?',
      () => {
        manager.removeExercise(exId);
      }
    );
  };

  useEffect(() => {
    inactivityCheckRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - activeDraft.startTime;
      if (elapsed > 5400000 && !showTimeoutModal) setShowTimeoutModal(true);
    }, 60000);
    return () => clearInterval(inactivityCheckRef.current);
  }, [activeDraft.startTime, showTimeoutModal]);

  useEffect(() => {
    let interval: any;
    if (showTimeoutModal && timeoutSeconds > 0) {
      interval = setInterval(() => setTimeoutSeconds(s => s - 1), 1000);
    } else if (showTimeoutModal && timeoutSeconds === 0) {
      finishWorkout("Finalizado automaticamente por inatividade.");
    }
    return () => clearInterval(inactivityCheckRef.current);
  }, [showTimeoutModal, timeoutSeconds]);

  const handleContinue = () => {
    setShowTimeoutModal(false);
    setTimeoutSeconds(300);
  };

  const getExercise = (id: string) => state.exercises.find((e: any) => e.id === id);

  // Sorting
  const toggleReorderMode = () => {
    if (!isReordering) {
      const currentIds = Object.keys(activeDraft.exercises).sort((a, b) => {
        const exA = getExercise(a);
        const exB = getExercise(b);
        return (exA?.sortOrder || 0) - (exB?.sortOrder || 0);
      });
      setLocalSortOrder(currentIds);
    }
    setIsReordering(!isReordering);
  };

  const saveReorder = () => {
    reorderExercises(localSortOrder);
    setIsReordering(false);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newList = [...localSortOrder];
    [newList[index - 1], newList[index]] = [newList[index], newList[index - 1]];
    setLocalSortOrder(newList);
  };

  const handleMoveDown = (index: number) => {
    if (index === localSortOrder.length - 1) return;
    const newList = [...localSortOrder];
    [newList[index + 1], newList[index]] = [newList[index], newList[index + 1]];
    setLocalSortOrder(newList);
  };

  const sortedExerciseIds = Object.keys(activeDraft.exercises).sort((a, b) => {
    const exA = getExercise(a);
    const exB = getExercise(b);
    return (exA?.sortOrder || 0) - (exB?.sortOrder || 0);
  });

  const handleSeriesCheck = (exId: string, seriesId: string, currentStatus: boolean) => {
    updateSeries(exId, seriesId, { completed: !currentStatus });
    if (!currentStatus && state.settings.autoTimer) {
      setTimerVisible(true);
    }
  };

  const handleBulkCheck = (exId: string, alreadyCompleted: boolean) => {
    updateAllSeries(exId, { completed: !alreadyCompleted });
  };

  const calculateVolume = () => {
    let vol = 0;
    Object.values(activeDraft.exercises).forEach((series: any) => {
      (series as any[]).forEach((s: any) => { if (s.completed) vol += (s.load * s.reps); });
    });
    return vol;
  };

  const handleCancel = async () => {
    const confirm = await showDialog('confirm', 'Sair do Treino?', 'Todo o progresso desta sessão não salva será perdido.');
    if (confirm) cancelWorkout();
  };

  const getIncompleteExercisesCount = () => {
    if (!activeDraft) return 0;
    let count = 0;
    Object.entries(activeDraft.exercises).forEach(([exId, series]) => {
      const ex = state.exercises.find((e: any) => e.id === exId);
      if (ex && ex.type === 'strength') {
        const hasCompletedSeries = (series as any[]).some(s => s.completed);
        if (!hasCompletedSeries) count++;
      }
    });
    return count;
  };

  const incompleteCount = getIncompleteExercisesCount();

  if (showSummary) {
    return (
      <div className="min-h-screen bg-black p-6 flex flex-col animate-in slide-in-from-right duration-300 pt-[max(env(safe-area-inset-top),3rem)]">
        <header className="mb-10 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl mx-auto flex items-center justify-center mb-6 shadow-2xl shadow-blue-600/30">
            <Save size={40} />
          </div>
          <h2 className="text-3xl font-black italic uppercase">Resumo da Missão</h2>
        </header>

        {incompleteCount > 0 && (
          <div className="bg-orange-900/30 border border-orange-500/50 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-orange-500 font-black uppercase text-xs tracking-widest mb-1">Atenção</h4>
              <p className="text-orange-200/80 text-sm font-medium">
                Você deixou <span className="font-black text-orange-400">{incompleteCount}</span> {incompleteCount === 1 ? 'exercício incompleto' : 'exercícios incompletos'} (nenhuma série marcada).
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] text-center">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Volume Total</p>
            <p className="text-2xl font-black italic text-white">{calculateVolume()} kg</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem] text-center">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Duração</p>
            <p className="text-2xl font-black italic text-white">{Math.floor((Date.now() - activeDraft.startTime) / 60000)} min</p>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-2">Diário de Treino</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] p-6 text-white min-h-[150px] outline-none focus:ring-2 ring-blue-500 transition-all text-sm"
            placeholder="Como você se sentiu hoje? Evoluiu a carga?"
          />
        </div>

        <div className="space-y-3 mt-8 pb-10">
          <button onClick={() => finishWorkout(notes)} className="w-full bg-blue-600 py-6 rounded-[2rem] font-black italic uppercase text-lg shadow-2xl">Confirmar e Registrar</button>
          <button onClick={() => setShowSummary(false)} className="w-full py-4 text-zinc-500 font-bold uppercase text-xs">Ajustar Treino</button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* 1. CABEÇALHO FIXO DO APP */}
      <header className="flex-none bg-black/80 backdrop-blur-xl z-50 px-6 pb-4 pt-[max(env(safe-area-inset-top),1.5rem)] border-b border-zinc-900 flex justify-between items-center transition-all">
        {isReordering ? (
          <>
            <button onClick={toggleReorderMode} className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">Cancelar</button>
            <h2 className="text-sm font-black italic uppercase text-white animate-pulse">Organizando...</h2>
            <button onClick={saveReorder} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-600/20">Salvar</button>
          </>
        ) : (
          <>
            <button onClick={handleCancel} className="text-zinc-600 p-2"><XCircle size={24} /></button>
            <div className="text-center">
              <h2 className="text-sm font-black italic uppercase text-blue-500 leading-none">Treino {activeDraft.selectedGroups.join(' + ')}</h2>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Sessão Ativa</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setIsBottomSheetOpen(true)} className="w-10 h-10 bg-zinc-900 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white transition-colors"><MoreVertical size={20} /></button>
            </div>
          </>
        )}
      </header>

      {/* Bottom Sheet de Opções */}
      {isBottomSheetOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsBottomSheetOpen(false)} />
          <div className="relative bg-zinc-900 rounded-t-[2rem] p-6 pb-10 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto mb-6" />
            
            <div className="space-y-2">
              <button 
                onClick={() => { setIsBottomSheetOpen(false); toggleReorderMode(); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-800 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <ListOrdered size={20} />
                </div>
                <div>
                  <h3 className="font-black uppercase italic text-sm text-white">Reordenar Lista</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Mude a ordem dos exercícios</p>
                </div>
              </button>

              <button 
                onClick={() => { setIsBottomSheetOpen(false); setTimerVisible(true); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-800 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-blue-500">
                  <TimerIcon size={20} />
                </div>
                <div>
                  <h3 className="font-black uppercase italic text-sm text-white">Timer de Descanso</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Controle suas pausas</p>
                </div>
              </button>

              <button 
                onClick={() => { setIsBottomSheetOpen(false); setShowExercisesModal(true); }}
                className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-zinc-800 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-green-500">
                  <Plus size={20} />
                </div>
                <div>
                  <h3 className="font-black uppercase italic text-sm text-white">Adicionar Exercícios</h3>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Busque no acervo</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exercícios */}
      {showExercisesModal && (
        <div className="fixed inset-0 z-[70] bg-black overflow-y-auto">
          <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl px-4 py-4 border-b border-zinc-900 flex items-center">
            <button onClick={() => setShowExercisesModal(false)} className="p-2 text-zinc-400 hover:text-white mr-2">
              <XCircle size={24} />
            </button>
            <h2 className="text-lg font-black italic uppercase">Adicionar ao Treino</h2>
          </div>
          <ExercisesScreen manager={manager} isModal={true} modalTargetGroup={activeDraft.selectedGroups[0]} onCloseModal={() => setShowExercisesModal(false)} />
        </div>
      )}

      {/* 2. CORPO SCROLLÁVEL */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-6 pb-40">
        {isReordering ? (
          <div className="space-y-3 animate-in fade-in duration-300">
             <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-4 mb-6 text-center">
               <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Use as setas para ordenar</p>
             </div>
             {localSortOrder.map((exId, index) => {
               const ex = getExercise(exId);
               if (!ex) return null;
               const master = getMaster(ex.masterId);
               
               return (
                 <div key={exId} className="bg-zinc-800/80 border border-blue-500/30 rounded-[2rem] p-4 flex items-center gap-4 transition-all">
                    <div className="flex-1 min-w-0">
                       <h4 className="text-base font-black italic uppercase text-white whitespace-normal leading-tight">{master?.name || ex.name}</h4>
                       {master?.targetMuscles && (
                         <span className="text-[9px] font-bold text-zinc-500 uppercase">{master.targetMuscles.join(' + ')}</span>
                       )}
                    </div>
                    <div className="flex items-center gap-2">
                       <button onClick={() => handleMoveUp(index)} className={`p-4 rounded-xl transition-colors ${index === 0 ? 'text-zinc-700' : 'bg-zinc-900 text-white hover:bg-blue-600'}`} disabled={index === 0}><ArrowUp size={24} /></button>
                       <button onClick={() => handleMoveDown(index)} className={`p-4 rounded-xl transition-colors ${index === localSortOrder.length - 1 ? 'text-zinc-700' : 'bg-zinc-900 text-white hover:bg-blue-600'}`} disabled={index === localSortOrder.length - 1}><ArrowDown size={24} /></button>
                    </div>
                 </div>
               );
             })}
          </div>
        ) : (
          sortedExerciseIds.map((exId) => {
            const ex = getExercise(exId);
            if (!ex) return null;
            const master = getMaster(ex.masterId);
            const displayUrl = master?.gifUrl || ex.viewUrl;
            const displayName = master?.name || ex.name;

            // CARDIO CARD
            if (ex.type === 'cardio' || ex.masterId === CARDIO_MASTER_ID) {
              const isCompleted = activeDraft.cardioCompleted?.[exId] || false;
              return (
                <div key={exId} className="bg-zinc-900/30 border border-zinc-800 rounded-[2.5rem] p-6 space-y-4 relative overflow-hidden">
                  {isCompleted && <div className="absolute inset-0 bg-green-900/10 pointer-events-none" />}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[8px] bg-pink-500/20 text-pink-500 font-black px-1.5 py-0.5 rounded uppercase">Cardio</span>
                      </div>
                      <h4 className="text-base font-black italic uppercase text-white whitespace-normal leading-tight">{displayName}</h4>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleDeleteExercise(exId)} className="p-2 bg-zinc-800 rounded-xl text-zinc-400 hover:text-red-500 transition-colors">
                        <Trash2 size={16} />
                      </button>
                      <div className="p-2 bg-zinc-800 rounded-xl text-zinc-400">
                        <Activity size={16} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <button onClick={() => markCardioComplete(exId, !isCompleted)} className={`flex-1 py-4 rounded-2xl flex items-center justify-center gap-2 transition-all font-black uppercase text-xs tracking-widest ${isCompleted ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
                      {isCompleted ? <><Check size={16}/> Concluído</> : 'Marcar Feito'}
                    </button>
                  </div>
                </div>
              );
            }

            // STRENGTH CARD
            const series = activeDraft.exercises[exId] || [];
            const lastData = getLastSessionData(exId);
            
            // Valores atuais para exibição (usando a primeira série como referência para o input global)
            const currentLoad = series[0]?.load || 0;
            const currentReps = series[0]?.reps || 0;

            const delta = currentLoad - lastData.load;
            const allCompleted = series.every((s: any) => s.completed);

            return (
              <div key={exId} className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden group relative flex flex-col">
                
                {/* 2.1 CABEÇALHO DO CARD (GIF + INFO) */}
                <div className="p-4 flex gap-4 border-b border-zinc-800/50 relative">
                   <button 
                     onClick={() => handleDeleteExercise(exId)} 
                     className="absolute top-4 right-4 p-2 bg-zinc-800 rounded-xl text-zinc-400 hover:text-red-500 transition-colors z-10"
                   >
                     <Trash2 size={16} />
                   </button>
                   <div 
                     className="w-28 h-28 flex-none bg-black rounded-2xl overflow-hidden relative cursor-pointer border border-zinc-800"
                     onClick={() => displayUrl && setExpandedGif(displayUrl)}
                   >
                     {displayUrl ? (
                        <img src={displayUrl} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" alt={displayName} />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                           <Activity size={32} className="text-zinc-600" />
                        </div>
                     )}
                   </div>
                   <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-lg font-black italic uppercase text-white leading-tight whitespace-normal">{displayName}</h4>
                      {master?.targetMuscles && (
                        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1 block">
                          {master.targetMuscles.join(' + ')}
                        </span>
                      )}
                      {ex.notes && (
                         <p className="text-[10px] text-zinc-500 font-medium mt-1 leading-tight">
                           {ex.notes}
                         </p>
                      )}
                      
                      {/* Badge de Carga */}
                      <div className="mt-2 flex">
                          <span className={`text-[9px] font-black uppercase bg-black/50 backdrop-blur px-2 py-1 rounded border border-zinc-800 ${delta > 0 ? 'text-green-500' : delta < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                             {delta > 0 ? `▲ +${delta}kg Progressão` : delta < 0 ? `▼ ${delta}kg` : 'Carga Mantida'}
                          </span>
                      </div>
                   </div>
                </div>

                {/* 2.2 CORPO DO CARD (CONTROLES GLOBAIS + SÉRIES) */}
                <div className="p-4">
                  {state.settings.autoTimer ? (
                    // MODO DETALHADO (TIMER LIGADO)
                    // Layout: Inputs em cima, Bolinhas em baixo
                    <div className="space-y-4">
                      {/* Inputs Globais */}
                      <div className="grid grid-cols-2 gap-3">
                          <SmartStepper 
                            value={currentLoad} 
                            step={5} 
                            suffix="KG"
                            className="w-full"
                            onChange={(val) => updateAllSeries(exId, { load: val })} 
                          />
                          <SmartStepper 
                            value={currentReps} 
                            step={1} 
                            suffix="REPS" 
                            textColor="text-blue-500"
                            className="w-full"
                            onChange={(val) => updateAllSeries(exId, { reps: val })} 
                          />
                      </div>
                      
                      {/* Lista de Checkboxes Individuais (Bolinhas) */}
                      <div className="bg-zinc-950/50 rounded-2xl p-4 border border-zinc-800/50">
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Séries ({series.length})</span>
                           {!state.settings.lockSets && (
                             <div className="flex items-center gap-1">
                                <button onClick={() => removeSeriesFromDraft(exId)} className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                                   <Minus size={14} strokeWidth={3} />
                                </button>
                                <button onClick={() => addSeriesToDraft(exId)} className="w-6 h-6 rounded-md bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                                   <Plus size={14} strokeWidth={3} />
                                </button>
                             </div>
                           )}
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                           {series.map((s: any, idx: number) => (
                             <button
                               key={s.id}
                               onClick={() => handleSeriesCheck(exId, s.id, s.completed)}
                               className={`w-10 h-10 flex-none rounded-xl flex items-center justify-center font-black transition-all ${
                                 s.completed 
                                   ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                                   : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                               }`}
                             >
                               {s.completed ? <Check size={16} strokeWidth={4}/> : (idx + 1)}
                             </button>
                           ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // MODO SIMPLIFICADO (TIMER DESLIGADO)
                    // Layout: Inputs à esquerda, Checkbox grande à direita
                    <div className="flex gap-3">
                      <div className="flex flex-col gap-2 flex-1">
                          <SmartStepper 
                            value={currentLoad} 
                            step={5} 
                            suffix="KG"
                            className="w-full"
                            onChange={(val) => updateAllSeries(exId, { load: val })} 
                          />
                          <SmartStepper 
                            value={currentReps} 
                            step={1} 
                            suffix="REPS" 
                            textColor="text-blue-500"
                            className="w-full"
                            onChange={(val) => updateAllSeries(exId, { reps: val })} 
                          />
                      </div>
                      
                      <div className="flex flex-col items-center justify-center gap-2">
                        {!state.settings.lockSets && (
                          <div className="flex items-center gap-1">
                             <button onClick={() => removeSeriesFromDraft(exId)} className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                                <Minus size={16} strokeWidth={3} />
                             </button>
                             <button onClick={() => addSeriesToDraft(exId)} className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors">
                                <Plus size={16} strokeWidth={3} />
                             </button>
                          </div>
                        )}
                        <button 
                          onClick={() => handleBulkCheck(exId, allCompleted)} 
                          className={`w-20 flex-1 min-h-[60px] rounded-2xl flex items-center justify-center transition-all border-2 relative overflow-hidden active:scale-95 ${allCompleted ? 'bg-blue-600 border-blue-400 text-white shadow-xl' : 'bg-zinc-900 border-zinc-800 text-zinc-700'}`}
                        >
                          {allCompleted ? (
                             <>
                               <span className="absolute inset-0 flex items-center justify-center text-4xl font-black text-white/20 select-none pb-1">{series.length}</span>
                               <Check size={32} strokeWidth={4} className="relative z-10" />
                             </>
                          ) : (
                             <div className="flex flex-col items-center">
                               <span className="text-2xl font-black leading-none">{series.length}</span>
                               <span className="text-[9px] font-black uppercase tracking-widest">Séries</span>
                             </div>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {!isReordering && (
        <div className="fixed bottom-10 left-4 right-4 max-w-md mx-auto z-40">
          <button onClick={() => setShowSummary(true)} className="w-full bg-white text-black py-6 rounded-3xl font-black italic uppercase text-lg shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 border-2 border-white/50">
            Finalizar Sessão <ChevronRight size={20} />
          </button>
        </div>
      )}

      {timerVisible && <RestTimerOverlay initialSeconds={state.settings.restTimeSeconds} onClose={() => setTimerVisible(false)} />}
      
      {showTimeoutModal && (
        <div className="fixed inset-0 bg-black/95 z-[200] flex items-center justify-center p-6">
           <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 text-center w-full max-w-sm">
              <Activity size={48} className="text-blue-500 mx-auto mb-4" />
              <h3 className="text-2xl font-black italic uppercase text-white mb-2">Ainda aí?</h3>
              <p className="text-zinc-400 text-sm mb-6">Sua sessão está ativa há 90 minutos.</p>
              <div className="text-4xl font-mono font-black text-white mb-8">{Math.floor(timeoutSeconds / 60)}:{(timeoutSeconds % 60).toString().padStart(2, '0')}</div>
              <div className="flex gap-3">
                 <button onClick={() => finishWorkout("Timeout Automático")} className="flex-1 py-4 rounded-2xl bg-zinc-800 text-white font-black uppercase text-xs tracking-widest">Finalizar</button>
                 <button onClick={handleContinue} className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase text-xs tracking-widest">Continuar</button>
              </div>
           </div>
        </div>
      )}

      {expandedGif && (
        <div 
          className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setExpandedGif(null)}
        >
          <div className="relative max-w-lg w-full bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setExpandedGif(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-black/80 transition-colors z-10"
            >
              <XCircle size={24} />
            </button>
            <img src={expandedGif} className="w-full h-auto object-contain" alt="Exercício" />
          </div>
        </div>
      )}
    </div>
  );
};