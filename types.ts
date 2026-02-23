
export type GroupLetter = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
export const GROUPS: GroupLetter[] = ['A', 'B', 'C', 'D', 'E', 'F'];

export type DayId = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export const DAY_NAMES: Record<number, string> = {
  0: 'Domingo',
  1: 'Segunda-feira',
  2: 'Terça-feira',
  3: 'Quarta-feira',
  4: 'Quinta-feira',
  5: 'Sexta-feira',
  6: 'Sábado'
};

// --- NOVA ARQUITETURA ---

export interface Category {
  id: string;
  name: string;
  groupLetter: GroupLetter;
}

export interface MasterExercise {
  id: string;
  name: string;
  targetMuscles: string[]; // Alterado de targetMuscle (string) para string[]
  gifUrl: string;
}

export type ExerciseType = 'strength' | 'cardio';

export interface Exercise {
  id: string;           // ID único da instância (para logs e tracking)
  masterId: string;     // Referência ao catálogo
  groupId: GroupLetter; // A qual treino pertence
  
  // Legacy / Compatibility fields
  categoryId?: string;
  url?: string;
  weekdays?: DayId[];
  equipment?: string;
  category?: string;
  viewUrl?: string;
  defaultSets?: number;
  defaultReps?: number;

  // Dados Mutáveis do Usuário
  load: number;
  sets: number;
  reps: number;
  restTime: number;
  notes?: string;       // Notas específicas desta instância
  sortOrder: number;
  
  // Campos derivados/cache (para facilitar UI sem joins complexos)
  name: string;         // Cópia do nome do Master
  targetMuscles: string[]; // Cópia dos músculos
  type: ExerciseType;
}

export interface SeriesEntry {
  id: string;
  load: number;
  reps: number;
  completed: boolean;
}

export interface WorkoutDraft {
  startTime: number;
  selectedGroups: GroupLetter[];
  exercises: {
    [exerciseId: string]: SeriesEntry[];
  };
  cardioCompleted?: {
    [exerciseId: string]: boolean;
  };
}

export interface Session {
  id: string;
  date: string;
  startTime: number;
  endTime: number;
  durationMinutes: number;
  volume: number;
  totalSeries: number;
  notes: string;
  groups: GroupLetter[];
  details: {
    exerciseId: string;
    exerciseName: string;
    series: { load: number; reps: number }[];
    type?: ExerciseType;
  }[];
}

export interface WorkoutLog {
  id: string;
  date: string;
  groupLetter: GroupLetter;
  completedExercises: string[];
}

export type Schedule = Record<number, GroupLetter[]>;

export interface WorkoutHistory {
  id: string;
  exerciseId: string;
  exerciseName: string;
  load: number;
  reps: number;
  sets: number;
  date: string;
}

export interface AppSettings {
  autoTimer: boolean;
  restTimeSeconds: number;
}

export interface AppState {
  exercises: Exercise[]; // Lista de exercícios configurados pelo usuário
  sessions: Session[];
  settings: AppSettings;
  schedule: Schedule;
  logs: WorkoutLog[];
  history: WorkoutHistory[];
  categories: Category[];
}
