import React, { useState } from 'react';
import { Timer, Database, Download, Upload, ShieldAlert, Trash2, Edit, ChevronLeft, Minus, Plus, Activity } from 'lucide-react';
import { GROUPS, GroupLetter, DAY_NAMES, Exercise } from '../types';
import { CARDIO_MASTER_ID } from '../constants';



export const ConfigScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { state, setState, exportData, importData, showDialog, updateExercise, removeExercise, addExerciseToGroup } = manager;
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  // View: Main Config
  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      <div className="p-6 pt-[max(env(safe-area-inset-top),2.5rem)] space-y-10 animate-in fade-in duration-500 pb-32">
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
                      <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => {
                          window.history.pushState(null, '', `/exercises?group=${g}`);
                          window.dispatchEvent(new Event('pushstate'));
                      }}>
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center font-black text-white">{g}</div>
                            <div>
                               <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{count} Exercícios</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                           {isActive && (
                             <button 
                               onClick={async (e) => {
                                 e.stopPropagation();
                                 if (await showDialog('confirm', 'Apagar Tudo?', `Deseja apagar todos os exercícios do Grupo ${g}?`)) {
                                    const exercisesToRemove = state.exercises.filter((ex: any) => ex.groupId === g);
                                    exercisesToRemove.forEach((ex: any) => removeExercise(ex.id));
                                 }
                               }}
                               className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                               title="Apagar todos os exercícios"
                             >
                               <Trash2 size={16} />
                             </button>
                           )}
                           <div className="text-xs font-bold text-blue-500 uppercase tracking-widest flex items-center gap-1">
                             Editar <Edit size={12} />
                           </div>
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

          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold text-sm italic uppercase">Trancar Séries</p>
              <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">Ocultar botões de adicionar/remover séries</p>
            </div>
            <button 
              onClick={() => setState((prev: any) => ({ ...prev, settings: { ...prev.settings, lockSets: !prev.settings.lockSets }}))}
              className={`w-14 h-8 rounded-full transition-all relative ${state.settings.lockSets ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-zinc-800'}`}
            >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${state.settings.lockSets ? 'left-7' : 'left-1'}`} />
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