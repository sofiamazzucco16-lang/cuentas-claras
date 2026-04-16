const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY as string | undefined;
const OPENROUTER_MODEL = 'google/gemini-2.0-flash-exp:free';

export const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            const base64 = result.split(',')[1];
            resolve({ base64, mimeType: file.type });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

export const analyzeFilesWithAI = async (files: File[], prompt: string): Promise<string> => {
    if (!OPENROUTER_API_KEY) {
        throw new Error('No se encontró la clave de API. Verificá la configuración de la app.');
    }

    const fileParts = await Promise.all(files.map(fileToBase64));

    const contentParts: Array<{ type: string; text?: string; image_url?: { url: string } }> = [
        { type: 'text', text: prompt },
        ...fileParts.map(({ base64, mimeType }) => ({
            type: 'image_url',
            image_url: {
                url: `data:${mimeType};base64,${base64}`,
            },
        })),
    ];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://cuentas-claras.app',
            'X-Title': 'Cuentas Claras',
        },
        body: JSON.stringify({
            model: OPENROUTER_MODEL,
            messages: [{ role: 'user', content: contentParts }],
            response_format: { type: 'json_object' },
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { error?: { message?: string } };
        const msg = errorData?.error?.message || response.statusText;
        throw new Error(`Error al contactar la IA (${response.status}): ${msg}`);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const text = data.choices?.[0]?.message?.content;

    if (!text) {
        throw new Error('La IA devolvió una respuesta vacía. Intentá con una imagen más clara.');
    }

    return text;
};
