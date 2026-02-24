
import { AppState, MasterExercise } from './types';

export const CARDIO_MASTER_ID = 'cardio_generic_v1';

export const MASTER_EXERCISES: MasterExercise[] =
[
  {
    "id": "custom_ex_42",
    "name": "Remada baixa Supinada",
    "targetMuscles": ["Costas"],
    "gifUrl": "https://static.wixstatic.com/media/2edbed_d022143e985c4f02854c12257d16ce91~mv2.gif"
  },
  {
    "id": "custom_ex_86",
    "name": "Puxada Frente máquina supinada",
    "targetMuscles": ["Costas"],
    "gifUrl": "https://musclemagfitness.com/wp-content/uploads/reverse-grip-lat-pulldown-exercise.gif"
  }
];


export const INITIAL_DATA: AppState = {
  sessions: [],
  settings: {
    autoTimer: true,
    restTimeSeconds: 60
  },
  schedule: { 0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
  logs: [],
  exercises: [],
  history: [],
  categories: []
};
