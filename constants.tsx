
import { AppState, MasterExercise } from './types';

export const CARDIO_MASTER_ID = 'cardio_generic_v1';

export const MASTER_EXERCISES: MasterExercise[] = [
  { "id": "custom_ex_01", "name": "Supino na máquina", "targetMuscles": ["Peito", "Ombro"], "gifUrl": "https://image.tuasaude.com/media/article/zl/lm/treino-de-superiores_74239.gif?width=242&height=161" },
  { "id": "custom_ex_02", "name": "Supino reto com Barra", "targetMuscles": ["Peito", "Tríceps"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2017/09/barbell-bench-press.gif" },
  { "id": "custom_ex_03", "name": "Supino inclinado com halteres", "targetMuscles": ["Peito", "Ombro"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/supino-inclinado-com-halteres.gif" },
  { "id": "custom_ex_04", "name": "Pec Deck (Voador aberto)", "targetMuscles": ["Peito"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/voador-no-aparelho.gif" },
  { "id": "custom_ex_05", "name": "Crucifixo reto", "targetMuscles": ["Peito"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2019/11/03081301-crucifixo-com-halteres.gif" },
  { "id": "custom_ex_06", "name": "Desenvolvimento na máquina", "targetMuscles": ["Ombro"], "gifUrl": "https://media.tenor.com/drQHW1DWPo0AAAAM/desenvolvimento-maquina.gif" },
  { "id": "custom_ex_07", "name": "Desenvolvimento com halteres Sentado", "targetMuscles": ["Ombro"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/desenvolvimento-para-ombros-com-halteres.gif" },
  { "id": "custom_ex_08", "name": "Elevação lateral", "targetMuscles": ["Ombro"], "gifUrl": "https://treinoemalta.com.br/wp-content/uploads/2023/07/Elevacao-Lateral-com-Halteres.gif" },
  { "id": "custom_ex_09", "name": "Elevação frontal com anilha", "targetMuscles": ["Ombro"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2018/09/elevacao-frontal-com-anilha-v2.gif" },
  { "id": "custom_ex_10", "name": "Elevação lateral conjugado com frontal", "targetMuscles": ["Ombro"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2023/11/dumbbell-lateral-raise.gif" },
  { "id": "custom_ex_11", "name": "Tríceps francês unilateral c/ halteres", "targetMuscles": ["Tríceps"], "gifUrl": "https://i0.wp.com/omelhortreino.com.br/wp-content/uploads/2025/06/triceps-frances-com-halteres-unilateral-1.gif?resize=550%2C550&ssl=1" },
  { "id": "custom_ex_12", "name": "Tríceps pulley", "targetMuscles": ["Tríceps"], "gifUrl": "https://treinoemalta.com.br/wp-content/uploads/2023/07/Triceps-Pulley-Barra.gif" },
  { "id": "custom_ex_13", "name": "Tríceps testa Barra W", "targetMuscles": ["Tríceps"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/07/triceps-testa-no-banco-inclinado.gif" },
  { "id": "custom_ex_14", "name": "Puxador frente aberto", "targetMuscles": ["Costas"], "gifUrl": "https://image.tuasaude.com/media/article/uh/yp/puxada-frontal_75625.gif?width=686&height=487" },
  { "id": "custom_ex_15", "name": "Puxador frente Articulado", "targetMuscles": ["Costas"], "gifUrl": "https://image.tuasaude.com/media/article/uh/yp/puxada-frontal_75625.gif?width=686&height=487" },
  { "id": "custom_ex_16", "name": "Puxador frente com triângulo", "targetMuscles": ["Costas"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/costas-puxada-para-frente-no-pulley-com-triangulo.gif" },
  { "id": "custom_ex_17", "name": "Remada polia baixa (Triângulo)", "targetMuscles": ["Costas"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/09/remada-sentado-com-cabos-e-triangulo-para-costas.gif" },
  { "id": "custom_ex_18", "name": "Remada Cavalinho", "targetMuscles": ["Costas"], "gifUrl": "https://treinototal.com.br/wp-content/uploads/2025/06/remada-cavalinho.gif" },
  { "id": "custom_ex_19", "name": "Encolhimento de ombros", "targetMuscles": ["Trapézio", "Ombro"], "gifUrl": "https://treinomestre.com.br/wp-content/uploads/2016/01/encolhimento-de-ombros-com-halter.gif" },
  { "id": "custom_ex_20", "name": "Encolhimento com halteres", "targetMuscles": ["Trapézio"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2024/01/dumbbell-shrug.gif" },
  { "id": "custom_ex_21", "name": "Rosca direta Barra W", "targetMuscles": ["Bíceps"], "gifUrl": "https://i0.wp.com/omelhortreino.com.br/wp-content/uploads/2025/08/Rosca-direta-com-barra-w.gif?resize=550%2C550&ssl=1" },
  { "id": "custom_ex_22", "name": "Rosca direta Barra reta", "targetMuscles": ["Bíceps"], "gifUrl": "https://i0.wp.com/omelhortreino.com.br/wp-content/uploads/2025/07/Rosca-Direta-com-Barra.gif?resize=550%2C550&ssl=1" },
  { "id": "custom_ex_23", "name": "Rosca alternada em pé", "targetMuscles": ["Bíceps"], "gifUrl": "https://treinoemalta.com.br/wp-content/uploads/2023/07/Rosca-Alternada-com-Halteres.gif" },
  { "id": "custom_ex_24", "name": "Rosca martelo simultâneo", "targetMuscles": ["Bíceps", "Antebraço"], "gifUrl": "https://image.tuasaude.com/media/article/kr/cn/rosca-martelo_75628.gif?width=686&height=487" },
  { "id": "custom_ex_25", "name": "Rosca concentrada", "targetMuscles": ["Bíceps"], "gifUrl": "https://static.wixstatic.com/media/2edbed_796d605902f5410db0fc7a4263db4098~mv2.gif" },
  { "id": "custom_ex_26", "name": "Cadeira Extensora", "targetMuscles": ["Perna", "Quadríceps"], "gifUrl": "https://image.tuasaude.com/media/article/ov/fb/cadeira-extensora_75064.gif?width=686&height=487" },
  { "id": "custom_ex_27", "name": "Mesa Flexora Sentado", "targetMuscles": ["Perna", "Posterior"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2024/12/cadeira-flexora.gif" },
  { "id": "custom_ex_28", "name": "Cadeira Abdutora", "targetMuscles": ["Perna", "Glúteo"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/04/pernas-abducao-de-pernas-na-maquina.gif" },
  { "id": "custom_ex_29", "name": "Cadeira Adutora", "targetMuscles": ["Perna"], "gifUrl": "https://i.pinimg.com/originals/4e/17/b8/4e17b88b6b11c54155939c0a5b3c3381.gif" },
  { "id": "custom_ex_30", "name": "Leg Press Horizontal", "targetMuscles": ["Perna"], "gifUrl": "https://image.tuasaude.com/media/article/nb/le/leg-press_75589.gif?width=686&height=487" },
  { "id": "custom_ex_31", "name": "Leg press 45", "targetMuscles": ["Perna"], "gifUrl": "https://image.tuasaude.com/media/article/nb/le/leg-press_75589.gif?width=686&height=487" },
  { "id": "custom_ex_32", "name": "Agachamento (Peso Corporal)", "targetMuscles": ["Perna", "Glúteo"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2023/07/bodyweight-squat.gif" },
  { "id": "custom_ex_33", "name": "Agachamento Livre com Barra", "targetMuscles": ["Perna", "Glúteo"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/11/agachamento-com-barra.gif" },
  { "id": "custom_ex_34", "name": "Levantamento Terra Sumô", "targetMuscles": ["Perna", "Costas", "Glúteo"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2023/03/barbell-sumo-deadlift.gif" },
  { "id": "custom_ex_35", "name": "Panturrilha na máquina em pé", "targetMuscles": ["Perna", "Panturrilha"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/03/Panturrilha-em-pe-no-aparelho.gif" },
  { "id": "custom_ex_36", "name": "Abdominal máquina", "targetMuscles": ["Abdominal"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/04/abdominal-em-V-na-maquina.gif" },
  { "id": "custom_ex_37", "name": "Abdominal supra solo", "targetMuscles": ["Abdominal"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2017/09/abdominal-reto.gif" },
  { "id": "custom_ex_38", "name": "Abdominal infra paralela", "targetMuscles": ["Abdominal"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2017/09/Abdominal-infra-nas-paralelas.gif" },
  { "id": "custom_ex_39", "name": "Abdominal elevação de tronco", "targetMuscles": ["Abdominal"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2017/09/Abdominal-declinado.gif" },
  { "id": "custom_ex_40", "name": "Abdominal oblíquo calcanhar", "targetMuscles": ["Abdominal"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/09/alongamento-inclinacao-da-pelvis.gif" }
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
