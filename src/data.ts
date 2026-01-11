import { Exercise, MuscleGroup, WorkoutTemplate, WeeklySchedule } from './types';

export const COLORS = {
    BLACK: '#000000',
    GREEN: '#39FF14',
    BLUE: '#00F0FF',
    ORANGE: '#FFAA00',
    WHITE: '#FFFFFF',
    GRAY: '#B0B0B0',
};

// Health Options (used in Onboarding and ProfileEditor)
export const INJURY_OPTIONS = ['ШЕЯ', 'ПЛЕЧИ', 'СПИНА', 'ПОЯСНИЦА', 'КОЛЕНИ', 'ЗАПЯСТЬЯ'];
export const CHRONIC_OPTIONS = ['СЕРДЦЕ/ДАВЛЕНИЕ', 'АСТМА', 'НЕТ ОГРАНИЧЕНИЙ'];

// Database of exercises (Assuming same content as original, keeping it brief for this step, but in reality I will copy the full content.
// Since the user wants "Exact Interface", I MUST copy the full DB.)
export const EXERCISE_DB: Record<MuscleGroup, Exercise[]> = {
    [MuscleGroup.CHEST]: [
        { id: 'ch_1', name: 'Жим штанги лежа', group: MuscleGroup.CHEST, defaultReps: 10, defaultWeight: 60 },
        { id: 'ch_2', name: 'Жим гантелей на наклонной', group: MuscleGroup.CHEST, defaultReps: 10, defaultWeight: 24 },
        { id: 'ch_3', name: 'Разведение гантелей', group: MuscleGroup.CHEST, defaultReps: 12, defaultWeight: 12 },
        { id: 'ch_4', name: 'Отжимания на брусьях', group: MuscleGroup.CHEST, defaultReps: 10, defaultWeight: 0 },
        { id: 'ch_5', name: 'Жим штанги на наклонной (вниз)', group: MuscleGroup.CHEST, defaultReps: 10, defaultWeight: 50 },
        { id: 'ch_6', name: 'Пуловер с гантелью', group: MuscleGroup.CHEST, defaultReps: 12, defaultWeight: 20 },
        { id: 'ch_7', name: 'Отжимания от пола', group: MuscleGroup.CHEST, defaultReps: 15, defaultWeight: 0 },
        { id: 'ch_8', name: 'Жим Свенда', group: MuscleGroup.CHEST, defaultReps: 15, defaultWeight: 10 },
        { id: 'ch_9', name: 'Жим гантелей лежа', group: MuscleGroup.CHEST, defaultReps: 10, defaultWeight: 24 },
        { id: 'ch_10', name: 'Отжимания от платформы', group: MuscleGroup.CHEST, defaultReps: 12, defaultWeight: 0 },
        { id: 'ch_11', name: 'Жим в Смите', group: MuscleGroup.CHEST, defaultReps: 10, defaultWeight: 40 },
        { id: 'ch_12', name: 'Бабочка (Pec Deck)', group: MuscleGroup.CHEST, defaultReps: 12, defaultWeight: 35 },
        { id: 'ch_13', name: 'Жим в Хаммере сидя', group: MuscleGroup.CHEST, defaultReps: 10, defaultWeight: 40 },
        { id: 'ch_14', name: 'Кроссовер (верхние блоки)', group: MuscleGroup.CHEST, defaultReps: 15, defaultWeight: 15 },
        { id: 'ch_15', name: 'Кроссовер (нижние блоки)', group: MuscleGroup.CHEST, defaultReps: 15, defaultWeight: 10 },
        { id: 'ch_16', name: 'Жим в блочном тренажере', group: MuscleGroup.CHEST, defaultReps: 10, defaultWeight: 40 },
        { id: 'ch_17', name: 'Пуловер в тренажере', group: MuscleGroup.CHEST, defaultReps: 12, defaultWeight: 30 },
        { id: 'ch_18', name: 'Отжимания в гравитроне', group: MuscleGroup.CHEST, defaultReps: 10, defaultWeight: 0 },
        { id: 'ch_19', name: 'Жим одной рукой в Хаммере', group: MuscleGroup.CHEST, defaultReps: 10, defaultWeight: 20 },
        { id: 'ch_20', name: 'Кроссовер лежа на скамье', group: MuscleGroup.CHEST, defaultReps: 12, defaultWeight: 10 },
    ],
    [MuscleGroup.BACK]: [
        { id: 'bk_1', name: 'Становая тяга', group: MuscleGroup.BACK, defaultReps: 8, defaultWeight: 80 },
        { id: 'bk_2', name: 'Подтягивания широким', group: MuscleGroup.BACK, defaultReps: 8, defaultWeight: 0 },
        { id: 'bk_3', name: 'Тяга штанги в наклоне', group: MuscleGroup.BACK, defaultReps: 10, defaultWeight: 50 },
        { id: 'bk_4', name: 'Тяга гантели одной рукой', group: MuscleGroup.BACK, defaultReps: 10, defaultWeight: 20 },
        { id: 'bk_5', name: 'Тяга Т-грифа', group: MuscleGroup.BACK, defaultReps: 10, defaultWeight: 45 },
        { id: 'bk_6', name: 'Тяга Пендли', group: MuscleGroup.BACK, defaultReps: 8, defaultWeight: 50 },
        { id: 'bk_7', name: 'Подтягивания обратным', group: MuscleGroup.BACK, defaultReps: 8, defaultWeight: 0 },
        { id: 'bk_8', name: 'Шраги со штангой', group: MuscleGroup.BACK, defaultReps: 15, defaultWeight: 60 },
        { id: 'bk_9', name: 'Тяга гантелей в наклоне', group: MuscleGroup.BACK, defaultReps: 10, defaultWeight: 18 },
        { id: 'bk_10', name: 'Тяга Кинга', group: MuscleGroup.BACK, defaultReps: 12, defaultWeight: 0 },
        { id: 'bk_11', name: 'Тяга верхнего блока', group: MuscleGroup.BACK, defaultReps: 12, defaultWeight: 45 },
        { id: 'bk_12', name: 'Тяга нижнего блока', group: MuscleGroup.BACK, defaultReps: 12, defaultWeight: 45 },
        { id: 'bk_13', name: 'Пуловер на верхнем блоке', group: MuscleGroup.BACK, defaultReps: 15, defaultWeight: 25 },
        { id: 'bk_14', name: 'Гравитрон', group: MuscleGroup.BACK, defaultReps: 10, defaultWeight: 0 },
        { id: 'bk_15', name: 'Рычажная тяга одной рукой', group: MuscleGroup.BACK, defaultReps: 10, defaultWeight: 25 },
        { id: 'bk_16', name: 'Тяга в. блока обратным', group: MuscleGroup.BACK, defaultReps: 12, defaultWeight: 40 },
        { id: 'bk_17', name: 'Тяга в. блока параллельным', group: MuscleGroup.BACK, defaultReps: 12, defaultWeight: 45 },
        { id: 'bk_18', name: 'Гиперэкстензия', group: MuscleGroup.BACK, defaultReps: 15, defaultWeight: 0 },
        { id: 'bk_19', name: 'Тяга Т-грифа в тренажере', group: MuscleGroup.BACK, defaultReps: 10, defaultWeight: 30 },
        { id: 'bk_20', name: 'Шраги в Смите', group: MuscleGroup.BACK, defaultReps: 15, defaultWeight: 60 },
    ],
    [MuscleGroup.LEGS]: [
        { id: 'lg_1', name: 'Приседания со штангой', group: MuscleGroup.LEGS, defaultReps: 8, defaultWeight: 80 },
        { id: 'lg_2', name: 'Румынская тяга', group: MuscleGroup.LEGS, defaultReps: 10, defaultWeight: 60 },
        { id: 'lg_3', name: 'Выпады с гантелями', group: MuscleGroup.LEGS, defaultReps: 12, defaultWeight: 14 },
        { id: 'lg_4', name: 'Болгарские выпады', group: MuscleGroup.LEGS, defaultReps: 10, defaultWeight: 12 },
        { id: 'lg_5', name: 'Фронтальные приседания', group: MuscleGroup.LEGS, defaultReps: 8, defaultWeight: 60 },
        { id: 'lg_6', name: 'Зашагивания на платформу', group: MuscleGroup.LEGS, defaultReps: 12, defaultWeight: 12 },
        { id: 'lg_7', name: 'Ягодичный мостик', group: MuscleGroup.LEGS, defaultReps: 12, defaultWeight: 50 },
        { id: 'lg_8', name: 'Подъем на носки стоя', group: MuscleGroup.LEGS, defaultReps: 20, defaultWeight: 40 },
        { id: 'lg_9', name: 'Гоблет-приседания', group: MuscleGroup.LEGS, defaultReps: 12, defaultWeight: 20 },
        { id: 'lg_10', name: 'Боковые выпады', group: MuscleGroup.LEGS, defaultReps: 12, defaultWeight: 10 },
        { id: 'lg_11', name: 'Жим ногами', group: MuscleGroup.LEGS, defaultReps: 12, defaultWeight: 120 },
        { id: 'lg_12', name: 'Разгибание ног', group: MuscleGroup.LEGS, defaultReps: 15, defaultWeight: 35 },
        { id: 'lg_13', name: 'Сгибание ног лежа', group: MuscleGroup.LEGS, defaultReps: 15, defaultWeight: 30 },
        { id: 'lg_14', name: 'Сгибание ног сидя', group: MuscleGroup.LEGS, defaultReps: 15, defaultWeight: 30 },
        { id: 'lg_15', name: 'Гакк-приседания', group: MuscleGroup.LEGS, defaultReps: 10, defaultWeight: 80 },
        { id: 'lg_16', name: 'Сведение ног', group: MuscleGroup.LEGS, defaultReps: 20, defaultWeight: 35 },
        { id: 'lg_17', name: 'Разведение ног', group: MuscleGroup.LEGS, defaultReps: 20, defaultWeight: 35 },
        { id: 'lg_18', name: 'Подъем на носки сидя', group: MuscleGroup.LEGS, defaultReps: 20, defaultWeight: 40 },
        { id: 'lg_19', name: 'Приседания в Смите', group: MuscleGroup.LEGS, defaultReps: 10, defaultWeight: 60 },
        { id: 'lg_20', name: 'Отведение ноги в кроссовере', group: MuscleGroup.LEGS, defaultReps: 15, defaultWeight: 10 },
    ],
    [MuscleGroup.SHOULDERS]: [
        { id: 'sh_1', name: 'Армейский жим', group: MuscleGroup.SHOULDERS, defaultReps: 10, defaultWeight: 40 },
        { id: 'sh_2', name: 'Жим гантелей сидя', group: MuscleGroup.SHOULDERS, defaultReps: 10, defaultWeight: 18 },
        { id: 'sh_3', name: 'Махи в стороны', group: MuscleGroup.SHOULDERS, defaultReps: 15, defaultWeight: 8 },
        { id: 'sh_4', name: 'Махи в наклоне', group: MuscleGroup.SHOULDERS, defaultReps: 15, defaultWeight: 8 },
        { id: 'sh_5', name: 'Жим Арнольда', group: MuscleGroup.SHOULDERS, defaultReps: 10, defaultWeight: 14 },
        { id: 'sh_6', name: 'Подъем гантелей перед собой', group: MuscleGroup.SHOULDERS, defaultReps: 12, defaultWeight: 10 },
        { id: 'sh_7', name: 'Тяга штанги к подбородку', group: MuscleGroup.SHOULDERS, defaultReps: 12, defaultWeight: 30 },
        { id: 'sh_8', name: 'Жим штанги из-за головы', group: MuscleGroup.SHOULDERS, defaultReps: 10, defaultWeight: 35 },
        { id: 'sh_9', name: 'Махи лежа на наклонной', group: MuscleGroup.SHOULDERS, defaultReps: 15, defaultWeight: 6 },
        { id: 'sh_10', name: 'Подъем блина перед собой', group: MuscleGroup.SHOULDERS, defaultReps: 15, defaultWeight: 10 },
        { id: 'sh_11', name: 'Жим сидя в тренажере', group: MuscleGroup.SHOULDERS, defaultReps: 10, defaultWeight: 30 },
        { id: 'sh_12', name: 'Махи в кроссовере', group: MuscleGroup.SHOULDERS, defaultReps: 15, defaultWeight: 5 },
        { id: 'sh_13', name: 'Лицевая тяга (Face Pulls)', group: MuscleGroup.SHOULDERS, defaultReps: 15, defaultWeight: 20 },
        { id: 'sh_14', name: 'Обратная разводка', group: MuscleGroup.SHOULDERS, defaultReps: 15, defaultWeight: 25 },
        { id: 'sh_15', name: 'Жим в Смите сидя', group: MuscleGroup.SHOULDERS, defaultReps: 10, defaultWeight: 30 },
        { id: 'sh_16', name: 'Подъем рук на н. блоке', group: MuscleGroup.SHOULDERS, defaultReps: 12, defaultWeight: 10 },
        { id: 'sh_17', name: 'Махи в тренажере', group: MuscleGroup.SHOULDERS, defaultReps: 15, defaultWeight: 20 },
        { id: 'sh_18', name: 'Тяга н. блока к подбородку', group: MuscleGroup.SHOULDERS, defaultReps: 12, defaultWeight: 25 },
        { id: 'sh_19', name: 'Отведение руки на блоке', group: MuscleGroup.SHOULDERS, defaultReps: 15, defaultWeight: 5 },
        { id: 'sh_20', name: 'Перекрестные махи', group: MuscleGroup.SHOULDERS, defaultReps: 15, defaultWeight: 5 },
    ],
    [MuscleGroup.BICEPS]: [
        { id: 'bi_1', name: 'Подъем штанги на бицепс', group: MuscleGroup.BICEPS, defaultReps: 10, defaultWeight: 30 },
        { id: 'bi_2', name: 'Подъем гантелей (супинация)', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 12 },
        { id: 'bi_3', name: 'Молотки', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 14 },
        { id: 'bi_4', name: 'Концентрированный подъем', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 10 },
        { id: 'bi_5', name: 'Скамья Скотта (штанга)', group: MuscleGroup.BICEPS, defaultReps: 10, defaultWeight: 25 },
        { id: 'bi_6', name: 'Подъем сидя на наклонной', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 10 },
        { id: 'bi_7', name: 'Подъем EZ-штанги', group: MuscleGroup.BICEPS, defaultReps: 10, defaultWeight: 25 },
        { id: 'bi_8', name: 'Подъем обратным хватом', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 20 },
        { id: 'bi_9', name: 'Сгибания Зоттмана', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 10 },
        { id: 'bi_10', name: 'Паучьи сгибания', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 20 },
        { id: 'bi_11', name: 'Сгибание на н. блоке', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 25 },
        { id: 'bi_12', name: 'Молотки на блоке', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 25 },
        { id: 'bi_13', name: 'Бицепс-машина', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 30 },
        { id: 'bi_14', name: 'Сгибание в кроссовере', group: MuscleGroup.BICEPS, defaultReps: 15, defaultWeight: 15 },
        { id: 'bi_15', name: 'Сгибание одной рукой (блок)', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 10 },
        { id: 'bi_16', name: 'Скамья Скотта (блок)', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 20 },
        { id: 'bi_17', name: 'Подтягивания в гравитроне', group: MuscleGroup.BICEPS, defaultReps: 8, defaultWeight: 0 },
        { id: 'bi_18', name: 'Сгибание лежа на полу', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 20 },
        { id: 'bi_19', name: 'Сгибание в Смите', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 20 },
        { id: 'bi_20', name: 'Тяга к подбородку узко', group: MuscleGroup.BICEPS, defaultReps: 12, defaultWeight: 25 },
    ],
    [MuscleGroup.TRICEPS]: [
        { id: 'tri_1', name: 'Жим узким хватом', group: MuscleGroup.TRICEPS, defaultReps: 10, defaultWeight: 50 },
        { id: 'tri_2', name: 'Французский жим', group: MuscleGroup.TRICEPS, defaultReps: 10, defaultWeight: 30 },
        { id: 'tri_3', name: 'Разгибание из-за головы', group: MuscleGroup.TRICEPS, defaultReps: 12, defaultWeight: 18 },
        { id: 'tri_4', name: 'Кик-бэк', group: MuscleGroup.TRICEPS, defaultReps: 15, defaultWeight: 8 },
        { id: 'tri_5', name: 'Отжимания на брусьях', group: MuscleGroup.TRICEPS, defaultReps: 10, defaultWeight: 0 },
        { id: 'tri_6', name: 'Французский жим гантелями', group: MuscleGroup.TRICEPS, defaultReps: 12, defaultWeight: 12 },
        { id: 'tri_7', name: 'Отжимания от скамьи', group: MuscleGroup.TRICEPS, defaultReps: 15, defaultWeight: 0 },
        { id: 'tri_8', name: 'Жим Тейта', group: MuscleGroup.TRICEPS, defaultReps: 12, defaultWeight: 12 },
        { id: 'tri_9', name: 'Калифорнийский жим', group: MuscleGroup.TRICEPS, defaultReps: 10, defaultWeight: 30 },
        { id: 'tri_10', name: 'Алмазные отжимания', group: MuscleGroup.TRICEPS, defaultReps: 12, defaultWeight: 0 },
        { id: 'tri_11', name: 'Разгибание на блоке (канат)', group: MuscleGroup.TRICEPS, defaultReps: 15, defaultWeight: 25 },
        { id: 'tri_12', name: 'Разгибание (прямая рукоять)', group: MuscleGroup.TRICEPS, defaultReps: 15, defaultWeight: 30 },
        { id: 'tri_13', name: 'Разгибание обратным хватом', group: MuscleGroup.TRICEPS, defaultReps: 15, defaultWeight: 20 },
        { id: 'tri_14', name: 'Фр. жим на нижнем блоке', group: MuscleGroup.TRICEPS, defaultReps: 12, defaultWeight: 25 },
        { id: 'tri_15', name: 'Разгибание одной рукой', group: MuscleGroup.TRICEPS, defaultReps: 15, defaultWeight: 10 },
        { id: 'tri_16', name: 'Отжимания в тренажере', group: MuscleGroup.TRICEPS, defaultReps: 12, defaultWeight: 40 },
        { id: 'tri_17', name: 'Разгибание из-за головы (блок)', group: MuscleGroup.TRICEPS, defaultReps: 12, defaultWeight: 20 },
        { id: 'tri_18', name: 'Жим узким в Смите', group: MuscleGroup.TRICEPS, defaultReps: 10, defaultWeight: 40 },
        { id: 'tri_19', name: 'Разгибание вперед (блок)', group: MuscleGroup.TRICEPS, defaultReps: 15, defaultWeight: 20 },
        { id: 'tri_20', name: 'Разгибание в гравитроне', group: MuscleGroup.TRICEPS, defaultReps: 12, defaultWeight: 30 },
    ],
    [MuscleGroup.ABS]: [
        { id: 'abs_1', name: 'Скручивания на полу', group: MuscleGroup.ABS, defaultReps: 20, defaultWeight: 0 },
        { id: 'abs_2', name: 'Подъем ног в висе', group: MuscleGroup.ABS, defaultReps: 15, defaultWeight: 0 },
        { id: 'abs_3', name: 'Русский твист', group: MuscleGroup.ABS, defaultReps: 20, defaultWeight: 5 },
        { id: 'abs_4', name: 'Планка', group: MuscleGroup.ABS, defaultReps: 60, defaultWeight: 0 },
        { id: 'abs_5', name: 'V-скручивания', group: MuscleGroup.ABS, defaultReps: 15, defaultWeight: 0 },
        { id: 'abs_6', name: 'Боковые наклоны', group: MuscleGroup.ABS, defaultReps: 15, defaultWeight: 16 },
        { id: 'abs_7', name: 'Велосипед', group: MuscleGroup.ABS, defaultReps: 30, defaultWeight: 0 },
        { id: 'abs_8', name: 'Ролик для пресса', group: MuscleGroup.ABS, defaultReps: 12, defaultWeight: 0 },
        { id: 'abs_9', name: 'Подъем ног на скамье', group: MuscleGroup.ABS, defaultReps: 15, defaultWeight: 0 },
        { id: 'abs_10', name: 'Скручивания на наклонной', group: MuscleGroup.ABS, defaultReps: 15, defaultWeight: 0 },
        { id: 'abs_11', name: 'Молитва (блок)', group: MuscleGroup.ABS, defaultReps: 15, defaultWeight: 30 },
        { id: 'abs_12', name: 'Подъем ног в упоре', group: MuscleGroup.ABS, defaultReps: 15, defaultWeight: 0 },
        { id: 'abs_13', name: 'Пресс-машина', group: MuscleGroup.ABS, defaultReps: 15, defaultWeight: 30 },
        { id: 'abs_14', name: 'Дровосек (верхний блок)', group: MuscleGroup.ABS, defaultReps: 15, defaultWeight: 20 },
        { id: 'abs_15', name: 'Дровосек (нижний блок)', group: MuscleGroup.ABS, defaultReps: 15, defaultWeight: 20 },
        { id: 'abs_16', name: 'Боковые в гиперэкстензии', group: MuscleGroup.ABS, defaultReps: 15, defaultWeight: 0 },
        { id: 'abs_17', name: 'Подтягивание коленей', group: MuscleGroup.ABS, defaultReps: 15, defaultWeight: 0 },
        { id: 'abs_18', name: 'Повороты корпуса', group: MuscleGroup.ABS, defaultReps: 20, defaultWeight: 30 },
        { id: 'abs_19', name: 'Кранчи на блоке', group: MuscleGroup.ABS, defaultReps: 15, defaultWeight: 25 },
        { id: 'abs_20', name: 'Вакуум', group: MuscleGroup.ABS, defaultReps: 30, defaultWeight: 0 },
    ],
    [MuscleGroup.NONE]: []
};

// Initial Mock State
export const INITIAL_TEMPLATES: WorkoutTemplate[] = [
    {
        id: 'tpl_a',
        name: 'ГРУДЬ + ПРЕСС',
        primaryGroup: MuscleGroup.CHEST,
        secondaryGroup: MuscleGroup.ABS,
        type: 'PROGRESSIVE',
        exercises: [
            EXERCISE_DB[MuscleGroup.CHEST].find(e => e.id === 'ch_1')!,  // Жим штанги лежа
            EXERCISE_DB[MuscleGroup.CHEST].find(e => e.id === 'ch_2')!,  // Жим гантелей на наклонной
            EXERCISE_DB[MuscleGroup.CHEST].find(e => e.id === 'ch_12')!, // Бабочка
            EXERCISE_DB[MuscleGroup.CHEST].find(e => e.id === 'ch_4')!,  // Отжимания на брусьях
            EXERCISE_DB[MuscleGroup.ABS].find(e => e.id === 'abs_6')!,    // Боковые наклоны
            EXERCISE_DB[MuscleGroup.ABS].find(e => e.id === 'abs_9')!,    // Подъем ног на скамье
            EXERCISE_DB[MuscleGroup.ABS].find(e => e.id === 'abs_10')!,   // Скручивания на наклонной
            EXERCISE_DB[MuscleGroup.ABS].find(e => e.id === 'abs_12')!,   // Подъем ног в упоре
        ]
    },
    {
        id: 'tpl_b',
        name: 'СПИНА + БИЦЕПС',
        primaryGroup: MuscleGroup.BACK,
        secondaryGroup: MuscleGroup.BICEPS,
        type: 'PROGRESSIVE',
        exercises: [
            EXERCISE_DB[MuscleGroup.BACK].find(e => e.id === 'bk_2')!,   // Подтягивания широким
            EXERCISE_DB[MuscleGroup.BACK].find(e => e.id === 'bk_3')!,   // Тяга штанги в наклоне
            EXERCISE_DB[MuscleGroup.BACK].find(e => e.id === 'bk_12')!,  // Тяга нижнего блока
            EXERCISE_DB[MuscleGroup.BACK].find(e => e.id === 'bk_16')!,  // Тяга в. блока обратным
            EXERCISE_DB[MuscleGroup.BACK].find(e => e.id === 'bk_18')!,  // Гиперэкстензия
            EXERCISE_DB[MuscleGroup.BICEPS].find(e => e.id === 'bi_1')!, // Подъем штанги на бицепс
            EXERCISE_DB[MuscleGroup.BICEPS].find(e => e.id === 'bi_3')!, // Молотки
            EXERCISE_DB[MuscleGroup.ABS].find(e => e.id === 'abs_2')!,   // Подъем ног в висе
        ]
    },
    {
        id: 'tpl_c',
        name: 'НОГИ + ПЛЕЧИ',
        primaryGroup: MuscleGroup.LEGS,
        secondaryGroup: MuscleGroup.SHOULDERS,
        type: 'PROGRESSIVE',
        exercises: [
            EXERCISE_DB[MuscleGroup.LEGS].find(e => e.id === 'lg_1')!,   // Приседания со штангой
            EXERCISE_DB[MuscleGroup.LEGS].find(e => e.id === 'lg_11')!,  // Жим ногами
            EXERCISE_DB[MuscleGroup.LEGS].find(e => e.id === 'lg_2')!,   // Румынская тяга
            EXERCISE_DB[MuscleGroup.LEGS].find(e => e.id === 'lg_12')!,  // Разгибание ног
            EXERCISE_DB[MuscleGroup.SHOULDERS].find(e => e.id === 'sh_2')!, // Жим гантелей сидя
            EXERCISE_DB[MuscleGroup.SHOULDERS].find(e => e.id === 'sh_3')!, // Махи в стороны
            EXERCISE_DB[MuscleGroup.SHOULDERS].find(e => e.id === 'sh_13')!, // Лицевая тяга
            EXERCISE_DB[MuscleGroup.ABS].find(e => e.id === 'abs_4')!,    // Планка
        ]
    }
];

export const INITIAL_SCHEDULE: WeeklySchedule = {
    1: 'tpl_a', // Monday
    3: 'tpl_b', // Wednesday
    5: 'tpl_c', // Friday
    0: null, 2: null, 4: null, 6: null
};

export const DAYS_OF_WEEK = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];
