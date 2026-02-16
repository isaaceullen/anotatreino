import React, { useState } from 'react';
import { Timer, Database, Download, Upload, ShieldAlert, Trash2, Edit, ChevronLeft, Minus, Plus, Activity } from 'lucide-react';
import { GROUPS, GroupLetter, DAY_NAMES, Exercise } from '../types';
import { CARDIO_MASTER_ID } from '../constants';

// Componente Stepper interno para o Modal
const Stepper = ({ value, onChange, step, label }: { value: number, onChange: (v: number) => void, step: number, label: string }) => (
   <div className="space-y-1">
      <label className="text-[9px] font-black text-zinc-500 uppercase text-center block">{label}</label>
      <div className="flex items-center bg-black border border-zinc-800 rounded-xl overflow-hidden h-10">
         <button onClick={() => onChange(Math.max(0, value - step))} className="p-2 h-full hover:bg-zinc-800 text-zinc-400 active:text-white transition-colors">
            <Minus size={12} strokeWidth={3} />
         </button>
         <input type="number" value={value} onChange={e => onChange(Number(e.target.value))} className="w-full bg-transparent text-center text-white font-black text-xs outline-none no-spinner" />
         <button onClick={() => onChange(value + step)} className="p-2 h-full hover:bg-zinc-800 text-zinc-400 active:text-white transition-colors">
            <Plus size={12} strokeWidth={3} />
         </button>
      </div>
   </div>
);

export const ConfigScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { state, setState, exportData, importData, showDialog, updateExercise, removeExercise, addExerciseToGroup } = manager;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  // Estado para Modal de Edição de Grupo
  const [editingGroup, setEditingGroup] = useState<GroupLetter | null>(null);

  // Toggle Dias
  const toggleSchedule = (dayIdx: number, group: GroupLetter) => {
    const currentSchedule = state.schedule[dayIdx] || [];
    let newDaySchedule;
    if (currentSchedule.includes(group)) {
      newDaySchedule = currentSchedule.filter((g: string) => g !== group);
    } else {
      newDaySchedule = [...currentSchedule, group].sort();
    }
    setState((prev: any) => ({ ...prev, schedule: { ...prev.schedule, [dayIdx]: newDaySchedule } }));
  };

  const handleImportClick = () => fileInputRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const jsonStr = event.target?.result as string;
      if (importData(jsonStr)) showDialog('alert', 'Sucesso', 'Dados restaurados.');
      else showDialog('alert', 'Erro', 'Arquivo inválido.');
    };
    reader.readAsText(file);
  };

  const handleAddCardio = () => {
     if (!editingGroup) return;
     
     // Verifica se já existe cardio
     const hasCardio = state.exercises.some((e: any) => e.groupId === editingGroup && e.type === 'cardio');
     
     if (hasCardio) {
        showDialog('alert', 'Aviso', 'Este grupo já possui uma sessão de cardio.');
        return;
     }

     const newItem: Partial<Exercise> = {
        masterId: CARDIO_MASTER_ID,
        name: 'Cardio Livre',
        targetMuscles: ['Cardio'],
        type: 'cardio',
        load: 0,
        sets: 0,
        reps: 0,
        restTime: 0,
        notes: '',
        groupId: editingGroup
      };
      
      addExerciseToGroup(newItem);
      showDialog('alert', 'Sucesso', 'Sessão de Cardio adicionada ao grupo!');
  };

  // View: Edição Detalhada do Grupo
  if (editingGroup) {
     const exercises = state.exercises.filter((e: any) => e.groupId === editingGroup).sort((a: any, b: any) => a.sortOrder - b.sortOrder);
     const hasCardio = exercises.some((e: any) => e.type === 'cardio');
     
     return (
        <div className="p-6 pb-32 animate-in slide-in-from-right duration-300 h-full overflow-y-auto">
           <header className="flex items-center gap-4 mb-8">
              <button onClick={() => setEditingGroup(null)} className="p-2 bg-zinc-900 rounded-xl text-zinc-400"><ChevronLeft size={20}/></button>
              <div>
                 <h2 className="text-2xl font-black italic uppercase tracking-tighter leading-none">Grupo {editingGroup}</h2>
                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Editando {exercises.length} Exercícios</p>
              </div>
           </header>
           
           <div className="space-y-4">
              {exercises.map((ex: Exercise) => (
                 <div key={ex.id} className="bg-zinc-900 border border-zinc-800 rounded-[2rem] p-5 relative">
                    <button 
                       onClick={async () => {
                          if (await showDialog('confirm', 'Remover Exercício?', 'Isso apagará este item do treino.')) {
                             removeExercise(ex.id);
                          }
                       }}
                       className="absolute top-4 right-4 text-zinc-600 hover:text-red-500"
                    >
                       <Trash2 size={18} />
                    </button>

                    <div className="mb-4 pr-8">
                       <h4 className="font-black italic uppercase text-white">{ex.name}</h4>
                       <span className="text-[9px] font-bold text-zinc-500 uppercase bg-zinc-800 px-2 py-0.5 rounded">{ex.targetMuscles?.join(' + ') || (ex as any).targetMuscle}</span>
                    </div>

                    {ex.type === 'strength' ? (
                       <div className="grid grid-cols-3 gap-3 mb-4">
                          <Stepper label="Carga" value={ex.load} step={5} onChange={(v) => updateExercise(ex.id, { load: v })} />
                          <Stepper label="Séries" value={ex.sets} step={1} onChange={(v) => updateExercise(ex.id, { sets: v })} />
                          <Stepper label="Reps" value={ex.reps} step={1} onChange={(v) => updateExercise(ex.id, { reps: v })} />
                       </div>
                    ) : (
                       <div className="bg-zinc-800/50 p-3 rounded-xl mb-4 text-center">
                          <p className="text-[10px] text-zinc-500 italic">Cardio</p>
                       </div>
                    )}

                    <div className="space-y-1">
                       <label className="text-[9px] font-black text-zinc-500 uppercase">Anotações Fixas</label>
                       <input 
                          value={ex.notes || ''}
                          onChange={(e) => updateExercise(ex.id, { notes: e.target.value })}
                          className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-blue-500"
                          placeholder="Sem notas..."
                       />
                    </div>
                 </div>
              ))}
              {exercises.length === 0 && (
                 <p className="text-center text-zinc-500 text-xs italic py-10">Grupo vazio. Adicione exercícios pelo menu Acervo.</p>
              )}
           </div>

           <div className="pt-4 mt-4 border-t border-dashed border-zinc-800">
             <button 
               onClick={handleAddCardio}
               disabled={hasCardio}
               className={`w-full py-4 rounded-2xl border border-zinc-800 font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${hasCardio ? 'bg-zinc-900 text-zinc-600 opacity-50 cursor-not-allowed' : 'bg-zinc-900 text-pink-500 hover:bg-zinc-800'}`}
             >
                <Activity size={16} /> {hasCardio ? 'Cardio Já Adicionado' : 'Adicionar Sessão de Cardio'}
             </button>
           </div>
        </div>
     );
  }

  // View: Main Config
  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      <div className="p-6 space-y-10 animate-in fade-in duration-500 pb-32">
        <header className="pt-4">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none">Ajustes</h2>
        </header>

        {/* Gerenciar Treinos */}
        <section className="bg-[#121214] border border-zinc-800 rounded-[2.5rem] p-6 space-y-6 shadow-2xl">
          <div className="flex items-center gap-3">
             <Edit size={20} className="text-white" />
             <h3 className="text-lg font-black text-white italic uppercase tracking-tight">Gerenciar Treinos</h3>
          </div>

          <div className="space-y-4">
             {GROUPS.map(g => {
                const count = state.exercises.filter((e: any) => e.groupId === g).length;
                const isActive = count > 0;
                
                return (
                   <div key={g} className={`border border-zinc-800 rounded-3xl p-4 transition-all ${isActive ? 'bg-zinc-900' : 'bg-transparent opacity-50'}`}>
                      <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setEditingGroup(g)}>
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-black text-white">{g}</div>
                            <div>
                               <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{count} Exercícios</p>
                            </div>
                         </div>
                         <div className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1">
                           Editar <Edit size={12} />
                         </div>
                      </div>
                      
                      {/* Mini Agendamento Inline */}
                      <div className="flex gap-1 justify-between bg-black/40 p-2 rounded-xl">
                         {Object.entries(DAY_NAMES).map(([idxStr, name]) => {
                            const idx = parseInt(idxStr);
                            const isScheduled = state.schedule[idx]?.includes(g);
                            return (
                               <button 
                                  key={idx}
                                  onClick={() => toggleSchedule(idx, g)}
                                  className={`w-6 h-8 rounded-lg text-[8px] font-black uppercase transition-all flex flex-col items-center justify-center ${isScheduled ? 'bg-blue-600 text-white' : 'text-zinc-600 hover:bg-zinc-800'}`}
                               >
                                  {name.substring(0, 1)}
                               </button>
                            );
                         })}
                      </div>
                   </div>
                );
             })}
          </div>
        </section>

        {/* Preferências */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-3">
             <Timer size={20} className="text-blue-500" />
             <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Preferências</h3>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-sm italic uppercase">Timer Automático</p>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Abrir timer ao marcar série</p>
            </div>
            <button 
              onClick={() => setState((prev: any) => ({ ...prev, settings: { ...prev.settings, autoTimer: !prev.settings.autoTimer }}))}
              className={`w-14 h-8 rounded-full transition-all relative ${state.settings.autoTimer ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-zinc-800'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${state.settings.autoTimer ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </section>

        {/* Dados */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 space-y-6">
          <div className="flex items-center gap-3">
             <Database size={20} className="text-blue-500" />
             <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Dados</h3>
          </div>
          <div className="space-y-3">
            <button onClick={exportData} className="w-full flex items-center justify-between p-5 bg-zinc-800/50 rounded-2xl hover:bg-zinc-800 transition-all border border-zinc-800 group">
              <div className="flex items-center gap-4">
                <Download size={20} className="text-zinc-400 group-hover:text-blue-500 transition-colors" />
                <div className="text-left">
                  <p className="font-bold text-sm italic uppercase text-white">Exportar</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Baixar JSON</p>
                </div>
              </div>
            </button>
            <button onClick={handleImportClick} className="w-full flex items-center justify-between p-5 bg-zinc-800/50 rounded-2xl hover:bg-zinc-800 transition-all border border-zinc-800 group">
              <div className="flex items-center gap-4">
                <Upload size={20} className="text-zinc-400 group-hover:text-blue-500 transition-colors" />
                <div className="text-left">
                  <p className="font-bold text-sm italic uppercase text-white">Importar</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Restaurar JSON</p>
                </div>
              </div>
            </button>
            <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".json" />
          </div>
        </section>

        <section className="bg-red-500/5 border border-red-500/20 rounded-[2.5rem] p-8 space-y-5">
          <div className="flex items-center gap-3 text-red-500">
             <ShieldAlert size={20} />
             <h3 className="text-xs font-black uppercase tracking-widest">Zona Crítica</h3>
          </div>
          <button 
            onClick={async () => {
               if (await showDialog('confirm', 'Resetar Fábrica?', 'Tudo será apagado.')) {
                  setState({ exercises: [], sessions: [], settings: { autoTimer: true, restTimeSeconds: 60 }, schedule: {}, logs: [], history: [] });
               }
            }}
            className="w-full py-5 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95"
          >
            Limpar Base de Dados
          </button>
        </section>
      </div>
    </div>
  );
};