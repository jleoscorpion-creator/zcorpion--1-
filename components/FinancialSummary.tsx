
import React from 'react';
import { UserProfile, Expense, Category, Frequency } from '../types';
import { CATEGORY_COLORS, CURRENCY_SYMBOLS, CATEGORY_LABELS } from '../constants';

interface FinancialSummaryProps {
  profile: UserProfile;
  expenses: Expense[];
  onClose: () => void;
  onGoToPlan: () => void;
  isDarkMode: boolean;
}

const FinancialSummary: React.FC<FinancialSummaryProps> = ({ profile, expenses, onClose, onGoToPlan, isDarkMode }) => {
  const currencySymbol = CURRENCY_SYMBOLS[profile.currency] || '$';

  const now = new Date();
  const cycleMovements = profile.movements || [];
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const monthExpenses = cycleMovements.filter(m => m.type === 'expense' && new Date(m.date) >= startOfMonth);
  const weekExpenses = cycleMovements.filter(m => m.type === 'expense' && new Date(m.date) >= startOfWeek);

  const totalMonth = monthExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalWeek = weekExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Normalize income to monthly and weekly for comparison
  const getIncomeByPeriod = () => {
    let monthly = profile.income;
    if (profile.frequency === Frequency.WEEKLY) monthly = profile.income * 4;
    if (profile.frequency === Frequency.BIWEEKLY) monthly = profile.income * 2;
    return { monthly, weekly: monthly / 4 };
  };

  const income = getIncomeByPeriod();

  const getCatTotal = (movements: Movement[], cat: Category) => 
    movements.filter(m => m.type === 'expense' && m.category === cat).reduce((acc, curr) => acc + curr.amount, 0);

  const budgetSplit = profile.budgetSplit || { needs: 0.5, wants: 0.3, savings: 0.2 };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className={`w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl transition-colors overflow-y-auto max-h-[90vh] ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black italic uppercase tracking-tighter">Resumen Financiero</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Card: Monthly Performance */}
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Rendimiento Mensual</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-black">{currencySymbol}{totalMonth.toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-bold uppercase">Gastado de {currencySymbol}{(income.monthly * (budgetSplit.needs + budgetSplit.wants)).toLocaleString()} (Gasto)</p>
              </div>
              <div className={`text-xs font-black px-3 py-1 rounded-full ${totalMonth > income.monthly ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                {((totalMonth / income.monthly) * 100).toFixed(0)}%
              </div>
            </div>
            <div className="mt-4 h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${totalMonth > income.monthly ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                style={{ width: `${Math.min((totalMonth / income.monthly) * 100, 100)}%` }} 
              />
            </div>
          </div>

          {/* Card: Weekly Performance */}
          <div className={`p-6 rounded-3xl border ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Rendimiento Semanal</p>
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-black">{currencySymbol}{totalWeek.toLocaleString()}</p>
                <p className="text-xs text-slate-500 font-bold uppercase">Semana vs Presupuesto {currencySymbol}{income.weekly.toLocaleString()}</p>
              </div>
              <div className={`text-xs font-black px-3 py-1 rounded-full ${totalWeek > income.weekly ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                {((totalWeek / income.weekly) * 100).toFixed(0)}%
              </div>
            </div>
          </div>

          {/* Category Breakdown List */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-2">Desglose por Categoría (Mes)</p>
            {[Category.NEEDS, Category.WANTS, Category.SAVINGS].map(cat => (
              <div key={cat} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                  <span className="text-sm font-bold uppercase italic">{CATEGORY_LABELS[cat].split(' ')[0]}</span>
                </div>
                <span className="font-black">{currencySymbol}{getCatTotal(monthExpenses, cat).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={onGoToPlan}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 transition-all active:scale-95 mt-4"
          >
            Ver Detalles en Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default FinancialSummary;
