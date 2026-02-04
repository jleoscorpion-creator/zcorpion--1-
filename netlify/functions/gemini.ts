import { Handler } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

interface GeminiRequest {
  profile: { frequency: string; income: number; currency: string };
  expenses: Array<{ amount: number }>;
  goals: Array<{ name: string; currentAmount: number; targetAmount: number }>;
}

const handler: Handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Método no permitido" }),
    };
  }

  try {
    const { profile, expenses, goals } = JSON.parse(
      event.body || "{}"
    ) as GeminiRequest;

    // Obtener la API key de las variables de entorno (oculta en Netlify)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "API key no configurada" }),
      };
    }

    const ai = new GoogleGenAI({ apiKey });

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const goalsInfo = goals
      .map((g) => `${g.name}: ${g.currentAmount}/${g.targetAmount}`)
      .join(", ");

    const prompt = `
    Actúa como un asesor financiero experto. El usuario tiene un ingreso ${profile.frequency.toLowerCase()} de ${profile.income} ${profile.currency}.
    Sigue el método 50/30/20.
    Gastos totales registrados: ${totalExpenses}.
    Metas de ahorro actuales: ${goalsInfo || "Ninguna definida aún"}.
    Gastos detallados recientes: ${JSON.stringify(expenses.slice(-5))}.
    
    Genera 3 consejos prácticos, cortos y motivadores en español. 
    Prioriza consejos que ayuden a alcanzar sus metas específicas si las tiene.
    Devuelve la respuesta en formato JSON con la siguiente estructura:
    {
      "tips": [
        {"title": "string", "content": "string", "category": "ahorro" | "inversion" | "gasto"}
      ]
    }
  `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const data = JSON.parse(response.text || '{"tips": []}');

    return {
      statusCode: 200,
      body: JSON.stringify({ tips: data.tips }),
    };
  } catch (error) {
    console.error("Error en Gemini:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Error procesando la solicitud",
        details: error instanceof Error ? error.message : "",
      }),
    };
  }
};

export { handler };
