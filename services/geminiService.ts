
import { GoogleGenAI } from "@google/genai";
import { UserProfile, Expense, SavingsGoal } from "../types";

export const getFinancialAdvice = async (profile: UserProfile, expenses: Expense[], goals: SavingsGoal[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const goalsInfo = goals.map(g => `${g.name}: ${g.currentAmount}/${g.targetAmount}`).join(", ");
  
  const prompt = `
    Actúa como un asesor financiero experto. El usuario tiene un ingreso ${profile.frequency.toLowerCase()} de ${profile.income} ${profile.currency}.
    Sigue el método 50/30/20.
    Gastos totales registrados: ${totalExpenses}.
    Metas de ahorro actuales: ${goalsInfo || 'Ninguna definida aún'}.
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

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text || '{"tips": []}');
    return data.tips;
  } catch (error) {
    console.error("Error fetching tips:", error);
    return [];
  }
};
