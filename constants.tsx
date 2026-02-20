
import { AppState, MasterExercise } from './types';

export const CARDIO_MASTER_ID = 'cardio_generic_v1';

export const MASTER_EXERCISES: MasterExercise[] = [
  { "id": "custom_ex_01", "name": "Supino reto na máquina", "targetMuscles": ["Peito", "Ombro", "Tríceps"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2024/04/lever-chest-press-.gif" },
  { "id": "custom_ex_02", "name": "Supino reto com Barra", "targetMuscles": ["Peito", "Ombro", "Tríceps"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2017/09/barbell-bench-press.gif" },
  { "id": "custom_ex_03", "name": "Supino inclinado com halteres", "targetMuscles": ["Peito", "Ombro"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/supino-inclinado-com-halteres.gif" },
  { "id": "custom_ex_04", "name": "Pec Deck (Voador aberto)", "targetMuscles": ["Peito"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/voador-no-aparelho.gif" },
  { "id": "custom_ex_05", "name": "Crucifixo reto", "targetMuscles": ["Peito"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2019/11/03081301-crucifixo-com-halteres.gif" },
  { "id": "custom_ex_06", "name": "Desenvolvimento na máquina", "targetMuscles": ["Ombro"], "gifUrl": "https://media.tenor.com/drQHW1DWPo0AAAAM/desenvolvimento-maquina.gif" },
  { "id": "custom_ex_07", "name": "Desenvolvimento com halteres Sentado", "targetMuscles": ["Ombro"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/desenvolvimento-para-ombros-com-halteres.gif" },
  { "id": "custom_ex_08", "name": "Elevação lateral em Pé", "targetMuscles": ["Ombro"], "gifUrl": "https://treinoemalta.com.br/wp-content/uploads/2023/07/Elevacao-Lateral-com-Halteres.gif" },
  { "id": "custom_ex_09", "name": "Elevação frontal com anilha", "targetMuscles": ["Ombro"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2018/09/elevacao-frontal-com-anilha-v2.gif" },
  { "id": "custom_ex_11", "name": "Tríceps francês unilateral c/ halteres", "targetMuscles": ["Tríceps"], "gifUrl": "https://i0.wp.com/omelhortreino.com.br/wp-content/uploads/2025/06/triceps-frances-com-halteres-unilateral-1.gif?resize=550%2C550&ssl=1" },
  { "id": "custom_ex_12", "name": "Tríceps pulley", "targetMuscles": ["Tríceps"], "gifUrl": "https://treinoemalta.com.br/wp-content/uploads/2023/07/Triceps-Pulley-Barra.gif" },
  { "id": "custom_ex_13", "name": "Tríceps testa Barra W Inclinado", "targetMuscles": ["Tríceps"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/07/triceps-testa-no-banco-inclinado.gif" },
  { "id": "custom_ex_14", "name": "Puxador frente aberto", "targetMuscles": ["Costas", "Bíceps"], "gifUrl": "https://image.tuasaude.com/media/article/uh/yp/puxada-frontal_75625.gif?width=686&height=487" },
  { "id": "custom_ex_16", "name": "Puxador frente com triângulo", "targetMuscles": ["Costas"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/costas-puxada-para-frente-no-pulley-com-triangulo.gif" },
  { "id": "custom_ex_17", "name": "Remada polia baixa (Triângulo)", "targetMuscles": ["Costas", "Bíceps"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/09/remada-sentado-com-cabos-e-triangulo-para-costas.gif" },
  { "id": "custom_ex_18", "name": "Remada Cavalinho", "targetMuscles": ["Costas", "Bíceps"], "gifUrl": "https://treinototal.com.br/wp-content/uploads/2025/06/remada-cavalinho.gif" },
  { "id": "custom_ex_19", "name": "Encolhimento com halteres", "targetMuscles": ["Trapézio", "Ombro"], "gifUrl": "https://treinomestre.com.br/wp-content/uploads/2016/01/encolhimento-de-ombros-com-halter.gif" },
  { "id": "custom_ex_21", "name": "Rosca direta Barra W", "targetMuscles": ["Bíceps"], "gifUrl": "https://i0.wp.com/omelhortreino.com.br/wp-content/uploads/2025/08/Rosca-direta-com-barra-w.gif?resize=550%2C550&ssl=1" },
  { "id": "custom_ex_22", "name": "Rosca direta Barra reta", "targetMuscles": ["Bíceps"], "gifUrl": "https://i0.wp.com/omelhortreino.com.br/wp-content/uploads/2025/07/Rosca-Direta-com-Barra.gif?resize=550%2C550&ssl=1" },
  { "id": "custom_ex_23", "name": "Rosca alternada em pé", "targetMuscles": ["Bíceps", "Antebraço"], "gifUrl": "https://treinoemalta.com.br/wp-content/uploads/2023/07/Rosca-Alternada-com-Halteres.gif" },
  { "id": "custom_ex_24", "name": "Rosca martelo alternado em pé", "targetMuscles": ["Bíceps", "Antebraço"], "gifUrl": "https://image.tuasaude.com/media/article/kr/cn/rosca-martelo_75628.gif?width=686&height=487" },
  { "id": "custom_ex_25", "name": "Rosca concentrada", "targetMuscles": ["Bíceps"], "gifUrl": "https://static.wixstatic.com/media/2edbed_796d605902f5410db0fc7a4263db4098~mv2.gif" },
  { "id": "custom_ex_26", "name": "Cadeira Extensora", "targetMuscles": ["Perna", "Quadríceps"], "gifUrl": "https://image.tuasaude.com/media/article/ov/fb/cadeira-extensora_75064.gif?width=686&height=487" },
  { "id": "custom_ex_27", "name": "Cadeira Flexora", "targetMuscles": ["Perna", "Posterior"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2024/12/cadeira-flexora.gif" },
  { "id": "custom_ex_28", "name": "Cadeira Abdutora", "targetMuscles": ["Perna", "Glúteo"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/04/pernas-abducao-de-pernas-na-maquina.gif" },
  { "id": "custom_ex_29", "name": "Cadeira Adutora", "targetMuscles": ["Perna"], "gifUrl": "https://i.pinimg.com/originals/4e/17/b8/4e17b88b6b11c54155939c0a5b3c3381.gif" },
  { "id": "custom_ex_31", "name": "Leg press 45", "targetMuscles": ["Perna", "Quadríceps", "Glúteo"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/pernas-leg-press-45-com-joelhos-no-peito.gif" },
  { "id": "custom_ex_32", "name": "Agachamento (Peso Corporal)", "targetMuscles": ["Perna", "Quadríceps", "Glúteo"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2023/07/bodyweight-squat.gif" },
  { "id": "custom_ex_33", "name": "Agachamento Livre com Barra", "targetMuscles": ["Perna", "Quadríceps", "Glúteo"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/11/agachamento-com-barra.gif" },
  { "id": "custom_ex_34", "name": "Levantamento Terra Sumô", "targetMuscles": ["Perna", "Costas", "Glúteo"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2023/03/barbell-sumo-deadlift.gif" },
  { "id": "custom_ex_35", "name": "Panturrilha na máquina em pé", "targetMuscles": ["Perna", "Panturrilha"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/03/Panturrilha-em-pe-no-aparelho.gif" },
  { "id": "custom_ex_36", "name": "Abdominal máquina", "targetMuscles": ["Abdominal"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/04/abdominal-em-V-na-maquina.gif" },
  { "id": "custom_ex_37", "name": "Abdominal supra solo", "targetMuscles": ["Abdominal"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2017/09/abdominal-reto.gif" },
  { "id": "custom_ex_38", "name": "Abdominal infra paralela", "targetMuscles": ["Abdominal"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2017/09/Abdominal-infra-nas-paralelas.gif" },
  { "id": "custom_ex_39", "name": "Abdominal elevação de tronco", "targetMuscles": ["Abdominal"], "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2017/09/Abdominal-declinado.gif" },
  { "id": "custom_ex_40", "name": "Abdominal oblíquo calcanhar", "targetMuscles": ["Abdominal"], "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/09/alongamento-inclinacao-da-pelvis.gif" },
  {
    "id": "custom_ex_41",
    "name": "Prancha",
    "targetMuscles": ["Abdominal"],
    "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/prancha-com-elevacao-das-pernas-prancha-aranha.gif"
  },
  {
    "id": "custom_ex_42",
    "name": "Remada baixa Supinada",
    "targetMuscles": ["Costas"],
    "gifUrl": "https://static.wixstatic.com/media/2edbed_d022143e985c4f02854c12257d16ce91~mv2.gif"
  },
  {
    "id": "custom_ex_43",
    "name": "Crucifixo Máquina",
    "targetMuscles": ["Peito"],
    "gifUrl": "https://newlife.com.cy/wp-content/uploads/2019/11/22551301-Lever-Seated-Fly-female_Chest_360.gif"
  },
  {
    "id": "custom_ex_44",
    "name": "Rosca Scott máquina",
    "targetMuscles": ["Bíceps"],
    "gifUrl": "https://fitnessprogramer.com/wp-content/uploads/2021/04/Lever-Preacher-Curl.gif"
  },
  {
    "id": "custom_ex_45",
    "name": "Tríceps na polia com corda",
    "targetMuscles": ["Tríceps"],
    "gifUrl": "https://i0.wp.com/omelhortreino.com.br/wp-content/uploads/2025/04/Triceps-na-polia-com-corda.gif"
  },
  {
    "id": "custom_ex_46",
    "name": "Agachamento no smith",
    "targetMuscles": ["Perna", "Quadríceps", "Glúteo"],
    "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/agachamento-smith-machine-com-foco-nos-gluteos-e-posteriores-da-coxa.gif"
  },
  {
    "id": "custom_ex_47",
    "name": "Afundo no smith",
    "targetMuscles": ["Perna"],
    "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/agachamento-afundo-no-smith-machine.gif"
  },
  {
    "id": "custom_ex_48",
    "name": "Stiff",
    "targetMuscles": ["Perna", "Posterior"],
    "gifUrl": "https://static.wixstatic.com/media/2edbed_5cd71a451e8f4210b1c1538ea54c03b6~mv2.gif"
  },
  {
    "id": "custom_ex_49",
    "name": "Panturrilha Sentado",
    "targetMuscles": ["Perna", "Panturrilha"],
    "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2018/10/lever-seated-calf-raise-.gif"
  },
  {
    "id": "custom_ex_51",
    "name": "Elevação unilateral",
    "targetMuscles": ["Ombro"],
    "gifUrl": "https://treinoemalta.com.br/wp-content/uploads/2023/07/Elevacao-Unilateral-na-Polia.gif"
  },
  {
    "id": "custom_ex_52",
    "name": "Triceps Testa Deitado",
    "targetMuscles": ["Tríceps"],
    "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2025/01/rosca-testa-com-barra2.gif"
  },
  {
    "id": "custom_ex_53",
    "name": "Rosca direto polia barra",
    "targetMuscles": ["Bíceps"],
    "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2024/12/rosca-direta-na-polia-com-corda.gif"
  },
  {
    "id": "custom_ex_54",
    "name": "Elevação pélvica",
    "targetMuscles": ["Glúteo", "Perna"],
    "gifUrl": "https://i0.wp.com/meutreinador.com/wp-content/uploads/2024/04/elevacao-pelvica-no-banco.gif"
  },
  {
    "id": "custom_ex_55",
    "name": "Abdominal banco",
    "targetMuscles": ["Abdominal"],
    "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/04/abdominal-elevacao-de-pernas-no-banco.gif"
  },
  {
    "id": "custom_ex_56",
    "name": "Supino inclinado smith",
    "targetMuscles": ["Peito"],
    "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2023/09/smith-incline-bench-press.gif"
  },
  {
    "id": "custom_ex_57",
    "name": "Elevação frontal corda",
    "targetMuscles": ["Ombro"],
    "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2018/09/elevacao-frontal-no-cabo.gif"
  },
  {
    "id": "custom_ex_58",
    "name": "Rosca martelo simultâneo em pé",
    "targetMuscles": ["Bíceps", "Antebraço"],
    "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2023/04/dumbbell-hammer-curl-v-2.gif"
  },
  {
    "id": "custom_ex_59",
    "name": "Tríceps coice unilateral",
    "targetMuscles": ["Tríceps"],
    "gifUrl": "https://static.wixstatic.com/media/2edbed_5b4cb9c68de74c0a8955200eec97e059~mv2.gif"
  },
  {
    "id": "custom_ex_60",
    "name": "Glúteo na Polia",
    "targetMuscles": ["Glúteo"],
    "gifUrl": "https://i0.wp.com/meutreinador.com/wp-content/uploads/2023/12/60_Gluteos-no-Cabo-Posicao-Curvada.gif"
  },
  {
    "id": "custom_ex_61",
    "name": "Mesa Flexora",
    "targetMuscles": ["Perna", "Posterior"],
    "gifUrl": "https://image.tuasaude.com/media/article/hz/mb/mesa-flexora_75623.gif"
  },
   {
    "id": "custom_ex_62",
    "name": "Flexão de braço (Push-up)",
    "targetMuscles": ["Peito", "Ombro", "Tríceps"],
    "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/04/flexao-de-bracos.gif"
  },
  {
    "id": "custom_ex_63",
    "name": "Crossover polia alta",
    "targetMuscles": ["Peito"],
    "gifUrl": "https://meutreinador.com/wp-content/uploads/2024/04/Crossover-polia-alta.gif"
  },
  {
    "id": "custom_ex_64",
    "name": "Remada curvada com barra",
    "targetMuscles": ["Costas", "Bíceps"],
    "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/costas-remada-curvada-com-pegada-invertida.gif"
  },
  {
    "id": "custom_ex_65",
    "name": "Pulldown na polia alta (Braço estendido)",
    "targetMuscles": ["Costas"],
    "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2024/09/pulldown-corda.gif"
  },
  {
    "id": "custom_ex_66",
    "name": "Barra Fixa (Pull-up)",
    "targetMuscles": ["Costas", "Bíceps"],
    "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/costas-barra-fixa-pegada-aberta-palma-para-frente-chinup.gif"
  },
  {
    "id": "custom_ex_67",
    "name": "Arnold Press",
    "targetMuscles": ["Ombro", "Tríceps"],
    "gifUrl": "https://fitnessprogramer.com/wp-content/uploads/2021/02/Arnold-Press.gif"
  },
  {
    "id": "custom_ex_68",
    "name": "Face Pull",
    "targetMuscles": ["Ombro", "Trapézio"],
    "gifUrl": "https://pelank.com/wp-content/uploads/2025/01/Face-Pull.gif"
  },
  {
    "id": "custom_ex_69",
    "name": "Hack Squat",
    "targetMuscles": ["Perna", "Quadríceps"],
    "gifUrl": "https://image.tuasaude.com/media/article/cu/uv/agachamento-hack_75592.gif"
  },
  {
    "id": "custom_ex_70",
    "name": "Passada / Avanço (Walking Lunges)",
    "targetMuscles": ["Perna", "Quadríceps", "Glúteo"],
    "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2023/07/walking-lunge.gif"
  },
  {
    "id": "custom_ex_71",
    "name": "Panturrilha no Leg Press",
    "targetMuscles": ["Perna", "Panturrilha"],
    "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2023/03/leg-press-calf-raise.gif"
  },
  {
    "id": "custom_ex_72",
    "name": "Rosca Inversa com Barra",
    "targetMuscles": ["Bíceps", "Antebraço"],
    "gifUrl": "https://i0.wp.com/omelhortreino.com.br/wp-content/uploads/2025/04/Rosca-Inversa.gif"
  },
  {
    "id": "custom_ex_73",
    "name": "Tríceps Mergulho (Dips)",
    "targetMuscles": ["Tríceps", "Peito", "Ombro"],
    "gifUrl": "https://fitcron.com/wp-content/uploads/2021/03/02511301-Chest-Dip_Chest_720.gif"
  },
  {
    "id": "custom_ex_74",
    "name": "Roda Abdominal",
    "targetMuscles": ["Abdominal"],
    "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2021/03/abdominal-com-rolo-no-chao.gif"
  },
  {
    "id": "custom_ex_75",
    "name": "Levantamento Terra (Convencional)",
    "targetMuscles": ["Perna", "Costas", "Glúteo"],
    "gifUrl": "https://image.tuasaude.com/media/article/zi/bj/levantamento-terra_75590.gif"
  },
   {
    "id": "custom_ex_76",
    "name": "Tríceps Polia barra V",
    "targetMuscles": ["Tríceps"],
    "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2025/01/triceps-na-polia-com-barra-reta.gif"
  },
  {
    "id": "custom_ex_77",
    "name": "Abdominal Bike",
    "targetMuscles": ["Abdominal", "Quadríceps"],
    "gifUrl": "https://meutreinador.com/wp-content/uploads/2024/04/abdominal-bicicleta.gif"
  },
  {
    "id": "custom_ex_78",
    "name": "Supino Reto com Halteres",
    "targetMuscles": ["Peito", "Ombro", "Tríceps"],
    "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/supino-reto-com-halteres.gif"
  },
  {
    "id": "custom_ex_79",
    "name": "Rosca alternada sentado",
    "targetMuscles": ["Bíceps", "Antebraço"],
    "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2024/08/dumbbell-alternate-seated-hammer-curl.gif"
  },
  {
    "id": "custom_ex_80",
    "name": "Elevação Pélvica com Barra",
    "targetMuscles": ["Glúteo", "Posterior", "Quadríceps"],
    "gifUrl": "https://treinoemalta.com.br/wp-content/uploads/2023/07/Elevacao-Pelvica.gif"
  },
  {
    "id": "custom_ex_81",
    "name": "Rosca inclinada",
    "targetMuscles": ["Bíceps"],
    "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/rosca-biceps-com-halteres-no-banco-inclinado.gif"
  },
  {
    "id": "custom_ex_82",
    "name": "Remada Maquina Neutra",
    "targetMuscles": ["Costas"],
    "gifUrl": "https://image.tuasaude.com/media/article/dm/wv/remada_75622.gif"
  },
  {
    "id": "custom_ex_83",
    "name": "Remada em pé Polia Baixa",
    "targetMuscles": ["Ombro", "Trapézio"],
    "gifUrl": "https://www.mundoboaforma.com.br/wp-content/uploads/2020/12/ombros-remada-alta-no-cabo.gif"
  },
  {
    "id": "custom_ex_84",
    "name": "Elevação Frontal",
    "targetMuscles": ["Ombro"],
    "gifUrl": "https://image.tuasaude.com/media/article/sz/nf/elevacao-frontal_75624.gif"
  },
  {
    "id": "custom_ex_85",
    "name": "Supino Inclinado Máquina",
    "targetMuscles": ["Peito", "Ombro"],
    "gifUrl": "https://www.hipertrofia.org/blog/wp-content/uploads/2024/07/lever-incline-chest-press.gif"
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
