
import { UserProfile, Expense, SavingsGoal } from "../types";

export const getFinancialAdvice = async (profile: UserProfile, expenses: Expense[], goals: SavingsGoal[]) => {
  try {
    // Llamar a la Netlify Function en lugar de usar la API key directamente
    const response = await fetch("/.netlify/functions/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        profile,
        expenses,
        goals,
      }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.tips || [];
  } catch (error) {
    console.error("Error fetching tips:", error);
    return [];
  }
};
