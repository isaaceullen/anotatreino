
import React, { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, CartesianGrid } from 'recharts';
import { Trophy, Activity, Target, TrendingUp, TrendingDown, Dumbbell, ChevronDown, Search, X } from 'lucide-react';
import { Session, WorkoutHistory, Exercise } from '../types';

export const ProgressScreen: React.FC<{ app: any }> = ({ app }) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const loggedDays = useMemo(() => {
    return app.state.sessions.map((s: Session) => {
      return format(new Date(s.date + 'T00:00:00'), 'yyyy-MM-dd');
    });
  }, [app.state.sessions]);

  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const allExercises = useMemo(() => {
    const counts: Record<string, number> = {};
    (app.state.history || []).forEach((h: WorkoutHistory) => {
      counts[h.exerciseName] = (counts[h.exerciseName] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);
  }, [app.state.history]);

  const filteredExercises = useMemo(() => {
    if (!searchQuery) return allExercises;
    return allExercises.filter(ex => ex.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allExercises, searchQuery]);

  const exerciseStats = useMemo(() => {
    if (!selectedExercise) return null;

    const history: { date: string; maxLoad: number; sessionDate: Date }[] = [];
    const sortedHistory = [...(app.state.history || [])]
      .filter((h: WorkoutHistory) => h.exerciseName === selectedExercise)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sortedHistory.forEach((h: WorkoutHistory) => {
      history.push({
        date: format(new Date(h.date + 'T00:00:00'), 'dd/MM'),
        sessionDate: new Date(h.date + 'T00:00:00'),
        maxLoad: h.load
      });
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
  }, [selectedExercise, app.state.history]);

  // 1. CARDS DE RECORDES PESSOAIS (PRs)
  const personalRecords = useMemo(() => {
    const prs: Record<string, number> = {};
    
    app.state.history.forEach((h: WorkoutHistory) => {
      if (!prs[h.exerciseName] || h.load > prs[h.exerciseName]) {
        prs[h.exerciseName] = h.load;
      }
    });
    
    const targetExercises = ["Supino", "Agachamento", "Levantamento Terra", "Deadlift", "Squat", "Bench Press"];
    
    // Ordena pelo maior peso e pega os 3 primeiros, priorizando os targetExercises
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
  }, [app.state.history]);

  // 2. GRÁFICO DE RADAR (EQUILÍBRIO MUSCULAR)
  const muscleBalance = useMemo(() => {
    const counts: Record<string, number> = {};
    
    app.state.history.forEach((h: WorkoutHistory) => {
      const exercise = app.state.exercises.find((e: Exercise) => e.id === h.exerciseId);
      if (exercise && exercise.targetMuscles) {
        exercise.targetMuscles.forEach(muscle => {
          counts[muscle] = (counts[muscle] || 0) + 1;
        });
      }
    });
    
    return Object.entries(counts).map(([muscle, count]) => ({
      subject: muscle,
      A: count,
      fullMark: Math.max(...Object.values(counts), 10)
    }));
  }, [app.state.history, app.state.exercises]);

  // 3. COMPARATIVO DE VOLUME SEMANAL
  const weeklyComparison = useMemo(() => {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = today - 7 * 24 * 60 * 60 * 1000;
    const fourteenDaysAgo = today - 14 * 24 * 60 * 60 * 1000;

    let currentWeekVolume = 0;
    let previousWeekVolume = 0;

    app.state.history.forEach((h: WorkoutHistory) => {
      const adjustedHistoryDate = new Date(h.date + 'T00:00:00').getTime();
      
      const volume = h.load * h.reps * h.sets;

      if (adjustedHistoryDate >= sevenDaysAgo && adjustedHistoryDate <= today) {
        currentWeekVolume += volume;
      } else if (adjustedHistoryDate >= fourteenDaysAgo && adjustedHistoryDate < sevenDaysAgo) {
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
  }, [app.state.history]);

  // Volume Data for Chart
  const volumeData = useMemo(() => {
    return app.state.sessions.slice(-10).map((s: Session) => {
      return { date: s.date.split('-').slice(1).join('/'), volume: s.volume };
    });
  }, [app.state.sessions]);

  // Category Distribution for Pie Chart
  const splitData = useMemo(() => {
    const counts: any = {};
    app.state.sessions.forEach((s: Session) => {
      s.groups.forEach(g => {
        counts[g] = (counts[g] || 0) + 1;
      });
    });
    return Object.keys(counts).map(key => ({ name: `Treino ${key}`, value: counts[key] }));
  }, [app.state.sessions]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="p-4 pt-10 pb-32 space-y-8 animate-in fade-in duration-500">
      <header className="px-2">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Evolução</h2>
        <p className="text-zinc-400 text-sm font-medium mt-1">Sua central de alta performance</p>
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

      {/* 4. CALENDÁRIO DE CONSISTÊNCIA */}
      <section className="px-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] mb-6 text-center">Calendário de Consistência</h3>
          <div className="grid grid-cols-7 gap-y-4 text-center">
            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
              <span key={`${d}-${i}`} className="text-[10px] font-black text-zinc-600">{d}</span>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${(month+1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
              const isLogged = loggedDays.includes(dateStr);
              return (
                <div key={i} className="flex items-center justify-center relative py-1">
                  <span className={`text-sm font-black italic ${isLogged ? 'text-white' : 'text-zinc-700'}`}>{dayNum}</span>
                  {isLogged && <div className="absolute inset-0 bg-blue-500/20 rounded-full border border-blue-500/50 scale-125 z-[-1]" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* GRÁFICO DE VOLUME */}
      <section className="px-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl h-80 flex flex-col">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Volume de Treino (kg)</h3>
          <div className="flex-1">
            {volumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={volumeData}>
                  <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <XAxis dataKey="date" stroke="#3f3f46" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                    cursor={{ fill: '#27272a', opacity: 0.4 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-700 italic text-sm">Dados insuficientes para gerar gráficos.</div>
            )}
          </div>
        </div>
      </section>

      {/* DISTRIBUIÇÃO POR GRUPO */}
      <section className="px-2">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl h-80 flex flex-col">
          <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-6">Distribuição por Grupo</h3>
          <div className="flex-1">
            {splitData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={splitData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
                    {splitData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                    itemStyle={{ fontWeight: 'bold' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-zinc-700 italic text-sm">Finalize seu primeiro treino!</div>
            )}
          </div>
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
    </div>
  );
};
