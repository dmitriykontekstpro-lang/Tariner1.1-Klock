const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export interface FoodAnalysisResult {
    isFood: boolean; // NEW: true if food detected
    foodName: string;
    calories: number;
    protein: number;
    fats: number;
    carbs: number;
    portion: string;
    weight: number;
    foodType: string;
}

interface UserHints {
    foodName?: string;
    weight?: string;
    portionSize?: 'S' | 'M' | 'L';
}

/**
 * Build prompt for GPT-4 Vision with structured hints
 */
const buildPrompt = (hints: UserHints): string => {
    const hintsParts = [];
    if (hints.foodName) hintsParts.push(`Название от пользователя: "${hints.foodName}"`);
    if (hints.weight) hintsParts.push(`Вес от пользователя: ${hints.weight}г`);
    if (hints.portionSize) {
        const sizeDesc = hints.portionSize === 'S' ? 'Маленькая' : hints.portionSize === 'M' ? 'Средняя' : 'Большая';
        hintsParts.push(`Размер порции: ${sizeDesc} (${hints.portionSize})`);
    }

    const hintsText = hintsParts.length > 0
        ? `ПОДСКАЗКИ ПОЛЬЗОВАТЕЛЯ (учитывай их приоритетно):\n${hintsParts.join('\n')}`
        : 'ПОДСКАЗОК НЕТ, определи сам.';

    return `
Ты эксперт по питанию. Твоя задача как можно точнее определить количество калорий, белков, жиров, углеводов для более точного анализа питания качества еды твоего клиента. Проанализируй фото.

ЗАДАЧА №1: ПРОВЕРКА
Есть ли на фото еда или напиток? 
Если НЕТ - верни JSON: { "isFood": false } и больше ничего.

ЗАДАЧА №2: АНАЛИЗ (Если еда есть)
${hintsText}

1. Определи название блюда (если пользователь не указал).
2. Оцени вес (если пользователь не указал).
3. Рассчитай КБЖУ.

ФОРМАТ JSON для еды (строго):
{
   "isFood": true,
   "foodName": "Название",
   "portion": "описание (напр. 1 тарелка)",
   "weight": 250, (число в граммах)
   "foodType": "Категория",
   "calories": 450,
   "protein": 35,
   "fats": 12,
   "carbs": 50
}
`.trim();
};

export const analyzeFoodPhoto = async (
    photoBase64: string,
    hints: UserHints = {}
): Promise<FoodAnalysisResult> => {
    if (!OPENAI_API_KEY) {
        console.error('API Key missing. Checked EXPO_PUBLIC_OPENAI_API_KEY');
        throw new Error('OpenAI API Key not configured');
    }

    const prompt = buildPrompt(hints);

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${photoBase64}`,
                                    detail: 'low'
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 500,
                temperature: 0.3
            })
        });

        const data = await response.json();

        if (!data.choices?.[0]?.message?.content) {
            console.error('OpenAI Raw Response:', JSON.stringify(data));
            throw new Error('Invalid response from AI');
        }

        let content = data.choices[0].message.content;
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();

        const result: FoodAnalysisResult = JSON.parse(content);

        // Check isFood flag
        if (result.isFood === false) {
            return {
                isFood: false, foodName: '', calories: 0, protein: 0, fats: 0, carbs: 0, portion: '', weight: 0, foodType: ''
            };
        }

        return result;

    } catch (error) {
        console.error('AI Analysis failed:', error);
        throw error;
    }
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const analyzeFoodPhotoWithRetry = async (
    photoBase64: string,
    hints: UserHints = {},
    retries = 3
): Promise<FoodAnalysisResult> => {
    try {
        return await analyzeFoodPhoto(photoBase64, hints);
    } catch (error) {
        if (retries > 0) {
            console.log(`Retrying analysis... (${retries} left)`);
            await sleep(1000 * (4 - retries));
            return analyzeFoodPhotoWithRetry(photoBase64, hints, retries - 1);
        }
        throw error;
    }
};
