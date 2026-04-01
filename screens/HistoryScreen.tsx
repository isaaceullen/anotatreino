
import React, { useState, useMemo } from 'react';
import { 
  format, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  endOfWeek, 
  startOfMonth, 
  parseISO, 
  startOfWeek 
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { ChevronLeft, ChevronRight, X, Clock, Dumbbell, Activity, TrendingUp, TrendingDown, Trash2, ChevronDown, ChevronUp, Trophy, Target, Search } from 'lucide-react';
import { WorkoutHistory } from '../types';

const SessionAccordion: React.FC<{ session: any; index: number; onDelete: (id: string) => void }> = ({ session, index, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-[2rem] overflow-hidden transition-all">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-6 flex justify-between items-center cursor-pointer active:bg-zinc-800"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 font-black italic">
            {index + 1}
          </div>
          <div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{format(new Date(session.date + 'T00:00:00'), 'dd/MM/yyyy')} • {session.durationMinutes}min</p>
            <h4 className="text-lg font-black italic uppercase text-white leading-none">Split {session.groups.join(' + ')}</h4>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(session.id); }}
            className="p-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
          >
            <Trash2 size={18} />
          </button>
          <div className="text-zinc-600">
            {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
              <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Início</p>
              <p className="font-black italic text-sm text-white">{format(new Date(session.startTime), 'HH:mm')}</p>
            </div>
            <div className="bg-black/40 p-4 rounded-2xl border border-zinc-800/50">
              <p className="text-[9px] font-black text-zinc-600 uppercase mb-1">Volume</p>
              <p className="font-black italic text-sm text-white">{session.volume} kg</p>
            </div>
          </div>

          <div className="space-y-6">
            {session.details.map((d: any, i: number) => (
              <div key={i} className="space-y-2">
                <p className="font-black text-xs text-blue-500 italic uppercase tracking-tight">{d.exerciseName}</p>
                <div className="grid grid-cols-1 gap-1.5">
                  {d.series.map((s: any, sIdx: number) => (
                    <div key={sIdx} className="bg-zinc-800/30 p-2.5 rounded-xl flex justify-between items-center text-[11px] font-black italic">
                      <span className="text-zinc-600">S{sIdx + 1}</span>
                      <div className="flex gap-3">
                        <span className="text-white">{s.load}kg</span>
                        <span className="text-blue-500">{s.reps} reps</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {session.notes && (
            <div className="mt-6 bg-blue-600/5 border border-blue-600/10 p-4 rounded-2xl">
              <p className="text-xs italic text-zinc-400">"{session.notes}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const HistoryScreen: React.FC<{ manager: any }> = ({ manager }) => {
  const { state, removeSession, showDialog } = manager;
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const allExercises = useMemo(() => {
    const counts: Record<string, number> = {};
    (state.sessions || []).forEach((session: any) => {
      (session.details || []).forEach((detail: any) => {
        if (detail.type === 'strength') {
          counts[detail.exerciseName] = (counts[detail.exerciseName] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [state.sessions]);

  const filteredExercises = useMemo(() => {
    if (!searchQuery) return allExercises;
    return allExercises.filter(ex => ex.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allExercises, searchQuery]);

  const exerciseStats = useMemo(() => {
    if (!selectedExercise) return null;

    const history: { date: string; maxLoad: number; sessionDate: Date }[] = [];
    const sortedSessions = [...(state.sessions || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedSessions.forEach((session: any) => {
      const detail = (session.details || []).find((d: any) => d.exerciseName === selectedExercise);
      if (detail && detail.type === 'strength' && detail.series && detail.series.length > 0) {
        const maxLoad = Math.max(...detail.series.map((s: any) => s.load));
        history.push({
          date: format(new Date(session.date + 'T00:00:00'), 'dd/MM'),
          sessionDate: new Date(session.date + 'T00:00:00'),
          maxLoad
        });
      }
    });

    if (history.length === 0) return null;

    let progressionKPI = { diff: 0, percentage: 0, isPositive: true };
    if (history.length >= 2) {
      const last = history[history.length - 1].maxLoad;
      const prev = history[history.length - 2].maxLoad;
      const diff = last - prev;
      progressionKPI = {
        diff,
        percentage: prev > 0 ? (diff / prev) * 100 : 0,
        isPositive: diff >= 0
      };
    }

    let plateauCount = 0;
    if (history.length > 0) {
      const lastLoad = history[history.length - 1].maxLoad;
      for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].maxLoad === lastLoad) {
          plateauCount++;
        } else {
          break;
        }
      }
    }

    let maxJump = { diff: 0, date: '' };
    for (let i = 1; i < history.length; i++) {
      const diff = history[i].maxLoad - history[i - 1].maxLoad;
      if (diff > maxJump.diff) {
        maxJump = { diff, date: history[i].date };
      }
    }

    return {
      history,
      progressionKPI,
      plateauCount,
      maxJump
    };
  }, [selectedExercise, state.sessions]);

  const monthDays = useMemo(() => {
    return eachDayOfInterval({
      start: startOfWeek(startOfMonth(currentMonth)),
      end: endOfWeek(endOfMonth(currentMonth))
    });
  }, [currentMonth]);

  const getSessionsForDay = (date: Date) => {
    return (state.sessions || []).filter((s: any) => {
      const sessionDate = new Date(s.date + 'T00:00:00');
      return isSameDay(sessionDate, date);
    });
  };

  const selectedDaySessions = useMemo(() => {
    if (!selectedDay) return [];
    return getSessionsForDay(selectedDay);
  }, [selectedDay, state.sessions]);

  // 1. CARDS DE RECORDES PESSOAIS (PRs)
  const personalRecords = useMemo(() => {
    const prs: Record<string, number> = {};
    
    (state.sessions || []).forEach((session: any) => {
      (session.details || []).forEach((detail: any) => {
        (detail.series || []).forEach((series: any) => {
          if (!prs[detail.exerciseName] || series.load > prs[detail.exerciseName]) {
            prs[detail.exerciseName] = series.load;
          }
        });
      });
    });
    
    const targetExercises = ["Supino", "Agachamento", "Leg Press", "Puxador", "Levantamento Terra", "Deadlift", "Squat", "Bench Press"];
    
    return Object.entries(prs)
      .map(([name, load]) => ({ name, load }))
      .sort((a, b) => {
        const aIsTarget = targetExercises.some(t => a.name.toLowerCase().includes(t.toLowerCase()));
        const bIsTarget = targetExercises.some(t => b.name.toLowerCase().includes(t.toLowerCase()));
        if (aIsTarget && !bIsTarget) return -1;
        if (!aIsTarget && bIsTarget) return 1;
        return b.load - a.load;
      })
      .slice(0, 3);
  }, [state.sessions]);

  // 2. GRÁFICO DE RADAR (EQUILÍBRIO MUSCULAR)
  const muscleBalance = useMemo(() => {
    const counts: Record<string, number> = {};
    
    (state.sessions || []).forEach((session: any) => {
      (session.details || []).forEach((detail: any) => {
        const exercise = (state.exercises || []).find((e: any) => e.id === detail.exerciseId);
        if (exercise && exercise.targetMuscles) {
          exercise.targetMuscles.forEach((muscle: string) => {
            counts[muscle] = (counts[muscle] || 0) + 1;
          });
        }
      });
    });
    
    return Object.entries(counts).map(([muscle, count]) => ({
      subject: muscle,
      A: count,
      fullMark: Math.max(...Object.values(counts), 10)
    }));
  }, [state.sessions, state.exercises]);

  // 3. COMPARATIVO DE VOLUME SEMANAL
  const weeklyComparison = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = today - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = today - 14 * 24 * 60 * 60 * 1000;

    let currentWeekVolume = 0;
    let previousWeekVolume = 0;

    (state.sessions || []).forEach((session: any) => {
      const adjustedSessionDate = new Date(session.date + 'T00:00:00').getTime();
      
      const volume = session.volume || 0;

      if (adjustedSessionDate >= sevenDaysAgo && adjustedSessionDate <= today) {
        currentWeekVolume += volume;
      } else if (adjustedSessionDate >= fourteenDaysAgo && adjustedSessionDate < sevenDaysAgo) {
        previousWeekVolume += volume;
      }
    });

    let percentageChange = 0;
    if (previousWeekVolume > 0) {
      percentageChange = ((currentWeekVolume - previousWeekVolume) / previousWeekVolume) * 100;
    } else if (currentWeekVolume > 0) {
      percentageChange = 100;
    }

    return {
      currentWeekVolume,
      previousWeekVolume,
      percentageChange: Math.round(percentageChange)
    };
  }, [state.sessions]);

  const handleDeleteSession = async (sessionId: string) => {
    const confirm = await showDialog('confirm', 'Excluir Treino?', 'Este registro será removido permanentemente.');
    if (confirm) {
      removeSession(sessionId);
    }
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide">
      <div className="p-4 pt-10 pb-32 space-y-8 animate-in fade-in duration-500">
        <header className="px-2">
          <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Evolução</h2>
          <p className="text-zinc-400 text-sm font-medium mt-1">Seu histórico de alta performance</p>
        </header>

        {/* DETALHAMENTO POR EXERCÍCIO */}
        <section className="px-2">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="text-blue-500" size={20} />
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Evolução por Exercício</h3>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            {/* Seletor */}
            <div className="mb-6 relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input 
                  type="text"
                  className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-2xl pl-12 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold italic placeholder:text-zinc-500"
                  placeholder="Buscar exercício..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (e.target.value === '') setSelectedExercise('');
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
                {searchQuery && (
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedExercise('');
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {isSearchFocused && filteredExercises.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-800 border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                  {filteredExercises.map(ex => (
                    <button
                      key={ex}
                      className="w-full text-left px-4 py-3 hover:bg-zinc-700 text-sm font-bold italic text-white border-b border-zinc-700/50 last:border-0 transition-colors"
                      onClick={() => {
                        setSelectedExercise(ex);
                        setSearchQuery(ex);
                        setIsSearchFocused(false);
                      }}
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dashboard */}
            {selectedExercise && exerciseStats && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* KPIs */}
                <div className="grid grid-cols-2 gap-3">
                  {/* KPI Progressão */}
                  <div className="bg-black/40 border border-zinc-800/50 rounded-2xl p-4 flex flex-col justify-between">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Último Treino</p>
                    {exerciseStats.history.length >= 2 ? (
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-black italic text-white">{exerciseStats.history[exerciseStats.history.length - 1].maxLoad}kg</span>
                        <div className={`flex items-center text-xs font-bold mb-1 ${exerciseStats.progressionKPI.diff > 0 ? 'text-green-500' : exerciseStats.progressionKPI.diff < 0 ? 'text-red-500' : 'text-zinc-500'}`}>
                          {exerciseStats.progressionKPI.diff > 0 ? <TrendingUp size={14} className="mr-0.5" /> : exerciseStats.progressionKPI.diff < 0 ? <TrendingDown size={14} className="mr-0.5" /> : null}
                          {exerciseStats.progressionKPI.diff > 0 ? '+' : ''}{exerciseStats.progressionKPI.diff}kg
                        </div>
                      </div>
                    ) : (
                      <span className="text-2xl font-black italic text-white">{exerciseStats.history[0]?.maxLoad}kg</span>
                    )}
                  </div>

                  {/* Platô */}
                  <div className="bg-black/40 border border-zinc-800/50 rounded-2xl p-4 flex flex-col justify-between">
                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Análise de Platô</p>
                    <p className="text-sm font-bold text-zinc-300">
                      Carga estável por <span className="text-blue-500 font-black">{exerciseStats.plateauCount}</span> {exerciseStats.plateauCount === 1 ? 'treino' : 'treinos'}
                    </p>
                  </div>
                </div>

                {/* Maior Evolução */}
                {exerciseStats.maxJump.diff > 0 && (
                  <div className="bg-blue-900/20 border border-blue-500/20 rounded-2xl p-4 flex items-center gap-3">
                    <div className="bg-blue-500/20 p-2 rounded-xl text-blue-400 shrink-0">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-blue-400/80 uppercase tracking-widest mb-0.5">Maior Salto de Carga</p>
                      <p className="text-sm font-bold text-blue-100">
                        <span className="text-blue-400 font-black">+{exerciseStats.maxJump.diff}kg</span> em {exerciseStats.maxJump.date}
                      </p>
                    </div>
                  </div>
                )}

                {/* Gráfico */}
                <div className="h-48 mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={exerciseStats.history}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        stroke="#52525b" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        dy={10}
                      />
                      <YAxis 
                        stroke="#52525b" 
                        fontSize={10} 
                        tickLine={false} 
                        axisLine={false} 
                        dx={-10}
                        domain={['dataMin - 5', 'dataMax + 5']}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                        itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                        labelStyle={{ color: '#a1a1aa', marginBottom: '4px', fontSize: '12px' }}
                        formatter={(value: number) => [`${value} kg`, 'Carga Máx']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="maxLoad" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#18181b', stroke: '#3b82f6', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

              </div>
            )}
            
            {!selectedExercise && (
              <div className="text-center py-8 text-zinc-600 italic text-sm">
                Selecione um exercício acima para ver seu detalhamento.
              </div>
            )}
          </div>
        </section>

        {/* 1. CARDS DE RECORDES PESSOAIS (PRs) */}
        <section>
          <div className="flex items-center gap-2 mb-4 px-2">
            <Trophy className="text-yellow-500" size={20} />
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Recordes Pessoais</h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-2">
            {personalRecords.length > 0 ? (
              personalRecords.map((pr, idx) => (
                <div key={idx} className="snap-center shrink-0 w-48 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Trophy size={80} />
                  </div>
                  <h4 className="text-sm font-bold text-zinc-400 uppercase line-clamp-2 mb-4">{pr.name}</h4>
                  <div className="flex items-end gap-1">
                    <span className="text-3xl font-black italic text-white">{pr.load}</span>
                    <span className="text-xs font-bold text-zinc-500 mb-1">kg</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center text-zinc-500 italic text-sm">
                Nenhum recorde registrado ainda.
              </div>
            )}
          </div>
        </section>

        {/* 2. GRÁFICO DE RADAR (EQUILÍBRIO MUSCULAR) */}
        <section className="px-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl h-80 flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-emerald-500" size={20} />
              <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Equilíbrio Muscular</h3>
            </div>
            <div className="flex-1 -mx-6">
              {muscleBalance.length > 2 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={muscleBalance}>
                    <PolarGrid stroke="#27272a" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                    <Radar name="Frequência" dataKey="A" stroke="#3b82f6" fill="transparent" strokeWidth={2} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                      itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-zinc-700 italic text-sm text-center px-4">
                  Treine mais grupos musculares para gerar o radar de equilíbrio.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. COMPARATIVO DE VOLUME SEMANAL */}
        <section className="px-2">
          <div className="bg-gradient-to-br from-blue-900/40 to-zinc-900 border border-blue-500/20 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-20">
              <Activity size={64} className="text-blue-500" />
            </div>
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Volume Semanal</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-4xl font-black italic text-white">{weeklyComparison.currentWeekVolume}</span>
              <span className="text-sm font-bold text-zinc-400 mb-1">kg</span>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-black ${weeklyComparison.percentageChange >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {weeklyComparison.percentageChange >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                {weeklyComparison.percentageChange >= 0 ? '+' : ''}{weeklyComparison.percentageChange}% Volume
              </div>
              <span className="text-xs text-zinc-500 font-medium">vs. semana anterior</span>
            </div>
          </div>
        </section>

        {/* CALENDÁRIO DE CONSISTÊNCIA */}
        <section className="px-2">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] text-center w-full">Calendário de Consistência</h3>
            </div>
            <div className="flex justify-between items-center mb-4">
              <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))} className="p-2 text-zinc-500 hover:text-white transition-colors"><ChevronLeft size={16}/></button>
              <span className="text-xs font-black uppercase italic text-blue-500 tracking-widest">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </span>
              <button onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))} className="p-2 text-zinc-500 hover:text-white transition-colors"><ChevronRight size={16}/></button>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                <div key={`${d}-${i}`} className="text-center text-[10px] font-black text-zinc-600 pb-2">{d}</div>
              ))}
              {monthDays.map((day, i) => {
                const daySessions = getSessionsForDay(day);
                const hasWorkout = daySessions.length > 0;
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                
                return (
                  <button
                    key={i}
                    disabled={!hasWorkout && isCurrentMonth}
                    onClick={() => hasWorkout && setSelectedDay(day)}
                    className={`aspect-square rounded-full flex items-center justify-center text-xs font-black transition-all relative
                      ${!isCurrentMonth ? 'opacity-20' : 'opacity-100'}
                      ${hasWorkout ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-zinc-500 hover:bg-zinc-800'}
                    `}
                  >
                    {format(day, 'd')}
                    {daySessions.length > 1 && (
                      <div className="absolute top-0 right-0 w-2 h-2 bg-white rounded-full border border-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* MODAL DE SESSÕES DO DIA */}
        {selectedDay && (
          <div className="fixed inset-0 bg-black/95 z-[100] p-6 overflow-y-auto animate-in fade-in slide-in-from-bottom duration-300">
            <div className="max-w-md mx-auto py-10 pb-32">
              <header className="flex justify-between items-center mb-8">
                <div>
                  <span className="text-blue-500 font-black uppercase text-[10px] tracking-[0.4em] mb-1 block">Atividade Diária</span>
                  <h3 className="text-3xl font-black italic uppercase text-white">
                    {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
                  </h3>
                </div>
                <button onClick={() => setSelectedDay(null)} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-zinc-500"><X size={24}/></button>
              </header>

              <div className="space-y-4">
                {selectedDaySessions.length > 0 ? (
                  selectedDaySessions.map((session: any, idx: number) => (
                    <SessionAccordion 
                      key={session.id} 
                      session={session} 
                      index={idx} 
                      onDelete={handleDeleteSession} 
                    />
                  ))
                ) : (
                  <p className="text-center py-20 text-zinc-600 italic">Nenhum treino para este dia.</p>
                )}
              </div>
              
              <button 
                onClick={() => setSelectedDay(null)}
                className="w-full mt-10 bg-white text-black py-5 rounded-[2rem] font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

