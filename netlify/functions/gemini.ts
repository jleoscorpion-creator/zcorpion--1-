import { Handler } from "@netlify/functions";
import { GoogleGenAI } from "@google/genai";

const handler: Handler = async (event, context) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Método no permitido" }) };
  }

  try {
    const body = JSON.parse(event.body || "{}") as any;

    // Obtener la API key de las variables de entorno (oculta en Netlify)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "API key no configurada" }) };
    }

    const ai = new GoogleGenAI({ apiKey });

    // Modo chat: interactuar con un mensaje del usuario
    if (body.mode === "chat") {
      const { message, profile, expenses, goals } = body;

      const contextInfo = `Usuario: ingreso ${profile?.income || 'N/A'} ${profile?.currency || ''}. Gastos recientes: ${JSON.stringify(
        (expenses || []).slice(-10)
      )}. Metas: ${JSON.stringify(goals || [])}.`;

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `Eres Zcorpion, un asistente financiero experto. Responde breve y claramente. Contexto: ${contextInfo}`,
        },
      });

      const response = await chat.sendMessage({ message });
      const text = response?.text || "";

      return { statusCode: 200, body: JSON.stringify({ text }) };
    }

    // Por defecto: generar consejos (advice)
    const { profile, expenses, goals } = body;
    const totalExpenses = (expenses || []).reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
    const goalsInfo = (goals || []).map((g: any) => `${g.name}: ${g.currentAmount}/${g.targetAmount}`).join(", ");

    const prompt = `
    Actúa como un asesor financiero experto. El usuario tiene un ingreso ${profile?.frequency?.toLowerCase() || 'mensual'} de ${profile?.income || 0} ${profile?.currency || ''}.
    Sigue el método 50/30/20.
    Gastos totales registrados: ${totalExpenses}.
    Metas de ahorro actuales: ${goalsInfo || "Ninguna definida aún"}.
    Gastos detallados recientes: ${JSON.stringify((expenses || []).slice(-5))}.
    
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
      config: { responseMimeType: "application/json" },
    });

    const data = JSON.parse(response.text || '{"tips": []}');

    return { statusCode: 200, body: JSON.stringify({ tips: data.tips }) };
  } catch (error) {
    console.error("Error en Gemini:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error procesando la solicitud", details: error instanceof Error ? error.message : "" }),
    };
  }
};

export { handler };
