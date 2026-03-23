
import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Trophy, Activity, Target, TrendingUp, TrendingDown } from 'lucide-react';
import { Session, WorkoutHistory, Exercise } from '../types';

export const ProgressScreen: React.FC<{ app: any }> = ({ app }) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const loggedDays = useMemo(() => {
    return app.state.sessions.map((s: Session) => s.date);
  }, [app.state.sessions]);

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
      const historyDate = new Date(h.date).getTime();
      const adjustedHistoryDate = historyDate + new Date(historyDate).getTimezoneOffset() * 60000;
      
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
