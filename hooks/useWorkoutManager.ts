
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
    // Como finishWorkout agora atualiza state.exercises com os valores da última sessão,
    // a configuração inicial do exercício (state.exercises) sempre terá os valores mais recentes.
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

  const addSeriesToDraft = (exerciseId: string) => {
    setActiveDraft(prev => {
      if (!prev) return null;
      const exSeries = prev.exercises[exerciseId] || [];
      const lastSeries = exSeries[exSeries.length - 1];
      const newSeries: SeriesEntry = {
        id: crypto.randomUUID(),
        load: lastSeries ? lastSeries.load : 0,
        reps: lastSeries ? lastSeries.reps : 0,
        completed: false
      };
      return {
        ...prev,
        exercises: {
          ...prev.exercises,
          [exerciseId]: [...exSeries, newSeries]
        }
      };
    });
  };

  const removeSeriesFromDraft = (exerciseId: string) => {
    setActiveDraft(prev => {
      if (!prev) return null;
      const exSeries = prev.exercises[exerciseId] || [];
      if (exSeries.length <= 1) return prev; // Mantém pelo menos 1 série
      return {
        ...prev,
        exercises: {
          ...prev.exercises,
          [exerciseId]: exSeries.slice(0, -1)
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

    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, -1);
    const correctDateString = localISOTime.split('T')[0];

    const newSession: Session = {
      id: crypto.randomUUID(),
      date: correctDateString,
      startTime: activeDraft.startTime,
      endTime,
      durationMinutes,
      volume: totalVolume,
      totalSeries: totalSeriesCount,
      notes,
      groups: activeDraft.selectedGroups,
      details
    };

    setState(prev => {
      // Atualizar load e reps base de cada exercício com os valores da última série completada
      const updatedExercises = prev.exercises.map(ex => {
        const sessionDetail = details.find(d => d.exerciseId === ex.id);
        if (sessionDetail && sessionDetail.type === 'strength' && sessionDetail.series.length > 0) {
          const lastSeries = sessionDetail.series[sessionDetail.series.length - 1];
          return {
            ...ex,
            load: lastSeries.load,
            reps: lastSeries.reps
          };
        }
        return ex;
      });

      return {
        ...prev,
        exercises: updatedExercises,
        sessions: [...prev.sessions, newSession]
      };
    });
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

  const addExerciseToActiveWorkout = (exercise: Omit<Exercise, 'id'>) => {
    if (!activeDraft) return;

    const newId = crypto.randomUUID();
    const maxSort = Math.max(0, ...state.exercises.map(e => e.sortOrder));
    const newExercise = { ...exercise, id: newId, sortOrder: maxSort + 1 };

    // 1. Add to global state
    setState(prev => ({
      ...prev,
      exercises: [...prev.exercises, newExercise]
    }));

    // 2. Add to active draft
    setActiveDraft(prev => {
      if (!prev) return null;

      const draftExercises = { ...prev.exercises };
      const cardioCompleted = { ...prev.cardioCompleted };

      if (newExercise.type === 'strength') {
        // Find history for this masterId to pre-fill if possible
        const historySession = [...state.sessions].reverse().find(s => s.details.some(d => d.exerciseName === newExercise.name));
        const historyDetail = historySession?.details.find(d => d.exerciseName === newExercise.name);
        
        const load = historyDetail && historyDetail.series.length > 0 ? historyDetail.series[historyDetail.series.length - 1].load : (newExercise.load || 10);
        const reps = historyDetail && historyDetail.series.length > 0 ? historyDetail.series[historyDetail.series.length - 1].reps : (newExercise.reps || 10);

        draftExercises[newId] = Array.from({ length: newExercise.sets || 3 }).map(() => ({
          id: crypto.randomUUID(),
          load,
          reps,
          completed: false
        }));
      } else {
        draftExercises[newId] = [];
        cardioCompleted[newId] = false;
      }

      return {
        ...prev,
        exercises: draftExercises,
        cardioCompleted
      };
    });
  };

  const updateExercise = (id: string, updates: Partial<Exercise>) => {
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
    setActiveDraft(prev => {
      if (!prev) return null;
      const newExercises = { ...prev.exercises };
      delete newExercises[id];
      const newCardioCompleted = { ...prev.cardioCompleted };
      if (newCardioCompleted) delete newCardioCompleted[id];
      return { ...prev, exercises: newExercises, cardioCompleted: newCardioCompleted };
    });
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
    addSeriesToDraft,
    removeSeriesFromDraft,
    markCardioComplete,
    finishWorkout,
    removeSession,
    cancelWorkout: () => setActiveDraft(null),
    addExerciseToGroup,
    addExerciseToActiveWorkout,
    updateExercise,
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
