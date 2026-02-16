
import { useState, useEffect } from 'react';
import { AppState, WorkoutDraft, GroupLetter, Session, SeriesEntry, Exercise, Schedule, MasterExercise } from '../types';
import { MASTER_EXERCISES, INITIAL_DATA, CARDIO_MASTER_ID } from '../constants';

const STORAGE_KEY = 'meutreino_v5_state'; 
const DRAFT_KEY = 'meutreino_v5_draft';

// Função para buscar dados do catálogo
const getMaster = (masterId: string): MasterExercise | undefined => {
  return MASTER_EXERCISES.find(m => m.id === masterId);
};

export const useWorkoutManager = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [activeDraft, setActiveDraft] = useState<WorkoutDraft | null>(() => {
    const saved = localStorage.getItem(DRAFT_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    type: 'alert' | 'confirm';
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }>({
    isOpen: false,
    type: 'alert',
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    if (activeDraft) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(activeDraft));
    } else {
      localStorage.removeItem(DRAFT_KEY);
    }
  }, [activeDraft]);

  const showDialog = (type: 'alert' | 'confirm', title: string, message: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialog({
        isOpen: true,
        type,
        title,
        message,
        onConfirm: () => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(true);
        },
        onCancel: () => {
          setDialog(prev => ({ ...prev, isOpen: false }));
          resolve(false);
        }
      });
    });
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `anota-treino-backup-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (jsonStr: string) => {
    try {
      const importedState = JSON.parse(jsonStr);
      if (importedState.exercises) {
        setState(importedState);
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const getLastSessionData = (exerciseId: string) => {
    const lastSession = [...state.sessions]
      .reverse()
      .find(s => s.details.some(d => d.exerciseId === exerciseId));
    
    if (lastSession) {
      const detail = lastSession.details.find(d => d.exerciseId === exerciseId);
      return {
        load: detail?.series[0]?.load || 0,
        reps: detail?.series[0]?.reps || 0
      };
    }
    
    // Procura na configuração inicial do exercício
    const ex = state.exercises.find(e => e.id === exerciseId);
    return {
      load: ex?.load || 0,
      reps: ex?.reps || 0
    };
  };

  const startWorkout = (groups: GroupLetter[]) => {
    const exercisesInGroups = state.exercises.filter(e => groups.includes(e.groupId));

    const draftExercises: WorkoutDraft['exercises'] = {};
    const cardioCompleted: WorkoutDraft['cardioCompleted'] = {};

    exercisesInGroups.forEach(ex => {
      if (ex.type === 'strength') {
        const last = getLastSessionData(ex.id);
        draftExercises[ex.id] = Array.from({ length: ex.sets }).map(() => ({
          id: crypto.randomUUID(),
          load: last.load,
          reps: last.reps,
          completed: false
        }));
      } else {
        draftExercises[ex.id] = [];
        cardioCompleted[ex.id] = false;
      }
    });

    setActiveDraft({
      startTime: Date.now(),
      selectedGroups: groups,
      exercises: draftExercises,
      cardioCompleted
    });
  };

  const updateSeries = (exerciseId: string, seriesId: string, updates: Partial<SeriesEntry>) => {
    setActiveDraft(prev => {
      if (!prev) return null;
      const exSeries = prev.exercises[exerciseId] || [];
      return {
        ...prev,
        exercises: {
          ...prev.exercises,
          [exerciseId]: exSeries.map(s => s.id === seriesId ? { ...s, ...updates } : s)
        }
      };
    });
  };

  const updateAllSeries = (exerciseId: string, updates: Partial<SeriesEntry>) => {
    setActiveDraft(prev => {
      if (!prev) return null;
      const exSeries = prev.exercises[exerciseId] || [];
      return {
        ...prev,
        exercises: {
          ...prev.exercises,
          [exerciseId]: exSeries.map(s => ({ ...s, ...updates }))
        }
      };
    });
  };

  const markCardioComplete = (exerciseId: string, completed: boolean) => {
    setActiveDraft(prev => {
      if (!prev) return null;
      return {
        ...prev,
        cardioCompleted: {
          ...prev.cardioCompleted,
          [exerciseId]: completed
        }
      };
    });
  };

  const finishWorkout = (notes: string) => {
    if (!activeDraft) return;

    const endTime = Date.now();
    const durationMinutes = Math.floor((endTime - activeDraft.startTime) / 60000);
    
    let totalVolume = 0;
    let totalSeriesCount = 0;
    const details: Session['details'] = [];

    Object.entries(activeDraft.exercises).forEach(([exId, series]) => {
      const ex = state.exercises.find(e => e.id === exId);
      if (!ex) return;

      if (ex.type === 'strength') {
        const completedSeries = (series as SeriesEntry[]).filter(s => s.completed);
        if (completedSeries.length > 0) {
          totalSeriesCount += completedSeries.length;
          completedSeries.forEach(s => totalVolume += (s.load * s.reps));
          
          details.push({
            exerciseId: exId,
            exerciseName: ex.name,
            type: 'strength',
            series: completedSeries.map(s => ({ load: s.load, reps: s.reps }))
          });
        }
      } 
    });

    if (activeDraft.cardioCompleted) {
      Object.entries(activeDraft.cardioCompleted).forEach(([exId, completed]) => {
         if (completed) {
           const ex = state.exercises.find(e => e.id === exId);
           if (ex) {
             details.push({
               exerciseId: exId,
               exerciseName: ex.name,
               type: 'cardio',
               series: []
             });
           }
         }
      });
    }

    const newSession: Session = {
      id: crypto.randomUUID(),
      date: new Date().toISOString().split('T')[0],
      startTime: activeDraft.startTime,
      endTime,
      durationMinutes,
      volume: totalVolume,
      totalSeries: totalSeriesCount,
      notes,
      groups: activeDraft.selectedGroups,
      details
    };

    setState(prev => ({ ...prev, sessions: [...prev.sessions, newSession] }));
    setActiveDraft(null);
  };

  const removeSession = (id: string) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== id)
    }));
  };

  // --- ACTIONS ---

  const addExerciseToGroup = (exercise: Omit<Exercise, 'id'>) => {
    const maxSort = Math.max(0, ...state.exercises.map(e => e.sortOrder));
    setState(prev => ({ 
      ...prev, 
      exercises: [...prev.exercises, { ...exercise, id: crypto.randomUUID(), sortOrder: maxSort + 1 }] 
    }));
  };

  // Nova função segura para atualizar exercícios com verificação de histórico
  const updateExerciseWithHistoryCheck = async (id: string, updates: Partial<Exercise>) => {
    const currentEx = state.exercises.find(e => e.id === id);
    if (!currentEx) return;

    // Detectar mudanças críticas
    const isCriticalChange = (
      (updates.load !== undefined && updates.load !== currentEx.load) ||
      (updates.sets !== undefined && updates.sets !== currentEx.sets) ||
      (updates.reps !== undefined && updates.reps !== currentEx.reps)
    );

    if (isCriticalChange) {
      const confirm = await showDialog(
        'confirm', 
        'Alteração Crítica', 
        'Alterar estes valores base pode apagar seu histórico de progressão para este exercício. Deseja continuar?'
      );

      if (!confirm) return;

      // Se confirmado, atualiza e limpa histórico deste exercício nas sessões passadas
      // (Remove os detalhes deste exercício das sessões anteriores para "resetar" a noção de progressão)
      setState(prev => {
        const cleanSessions = prev.sessions.map(session => ({
          ...session,
          details: session.details.filter(d => d.exerciseId !== id)
        })).filter(s => s.details.length > 0 || s.notes); // Mantém sessão se tiver outros detalhes ou notas

        const updatedExercises = prev.exercises.map(e => e.id === id ? { ...e, ...updates } : e);

        return {
          ...prev,
          exercises: updatedExercises,
          sessions: cleanSessions
        };
      });
      return;
    }

    // Atualização normal (notas, ordem, etc)
    setState(prev => ({
      ...prev,
      exercises: prev.exercises.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  };

  const reorderExercises = (orderedIds: string[]) => {
    setState(prev => {
      const newExercises = prev.exercises.map(ex => {
        const newIndex = orderedIds.indexOf(ex.id);
        if (newIndex !== -1) return { ...ex, sortOrder: newIndex };
        return ex;
      });
      return { ...prev, exercises: newExercises };
    });
  };

  const removeExercise = (id: string) => {
    setState(prev => ({ ...prev, exercises: prev.exercises.filter(e => e.id !== id) }));
  };

  const getGroupTags = (group: GroupLetter) => {
    const exercisesInGroup = state.exercises.filter(e => e.groupId === group);
    // Flatten array of arrays and remove duplicates
    const allMuscles = exercisesInGroup.flatMap(e => e.targetMuscles || []);
    return Array.from(new Set(allMuscles));
  };

  return {
    state,
    setState,
    activeDraft,
    startWorkout,
    updateSeries,
    updateAllSeries,
    markCardioComplete,
    finishWorkout,
    removeSession,
    cancelWorkout: () => setActiveDraft(null),
    addExerciseToGroup,
    updateExercise: updateExerciseWithHistoryCheck, // Usar a versão segura
    reorderExercises,
    removeExercise,
    exportData,
    importData,
    showDialog,
    dialog,
    getLastSessionData,
    getGroupTags,
    getMaster
  };
};
