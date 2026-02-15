
import React, { useState } from 'react';
import { UserProfile, Expense, Category, Frequency } from '../types';
import { CATEGORY_COLORS, CATEGORY_LABELS, CURRENCY_SYMBOLS, FREQUENCY_LABELS } from '../constants';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell
} from 'recharts';

interface BudgetDetailsProps {
  profile: UserProfile;
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
  isDarkMode: boolean;
}

const BudgetDetails: React.FC<BudgetDetailsProps> = ({ profile, expenses, onDeleteExpense, isDarkMode }) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'cycle'>('monthly');
  const currencySymbol = CURRENCY_SYMBOLS[profile.currency] || '$';

  // Income logic requested: simple 4x for weekly, 2x for biweekly
  const getMonthlyIncome = () => {
    switch (profile.frequency) {
      case Frequency.WEEKLY: return profile.income * 4;
      case Frequency.BIWEEKLY: return profile.income * 2;
      default: return profile.income;
    }
  };

  const monthlyIncome = getMonthlyIncome();
  const currentIncomeView = viewMode === 'monthly' ? monthlyIncome : profile.income;
  
  const splits = {
    [Category.NEEDS]: currentIncomeView * 0.50,
    [Category.WANTS]: currentIncomeView * 0.30,
    [Category.SAVINGS]: currentIncomeView * 0.20,
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Filter expenses for current month for the "Estado del Mes" section
  const getSpentInMonth = (cat: Category) => 
    expenses.filter(e => {
      const d = new Date(e.date);
      return e.category === cat && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((acc, curr) => acc + curr.amount, 0);

  // Filter expenses for current cycle for the "Ciclo" view comparison if needed
  const cycleStart = profile.lastLoginDate ? new Date(profile.lastLoginDate) : new Date();
  const getSpentInCycle = (cat: Category) =>
    expenses.filter(e => {
      const d = new Date(e.date);
      return e.category === cat && d >= cycleStart;
    }).reduce((acc, curr) => acc + curr.amount, 0);

  const activeSpent = viewMode === 'monthly' ? getSpentInMonth : getSpentInCycle;

  const chartData = [
    { name: 'Necesidades', Presupuesto: splits[Category.NEEDS], Gastado: activeSpent(Category.NEEDS), color: CATEGORY_COLORS.NEEDS },
    { name: 'Deseos', Presupuesto: splits[Category.WANTS], Gastado: activeSpent(Category.WANTS), color: CATEGORY_COLORS.WANTS },
    { name: 'Ahorro', Presupuesto: splits[Category.SAVINGS], Gastado: activeSpent(Category.SAVINGS), color: CATEGORY_COLORS.SAVINGS },
  ];

  const currentMovements = expenses.filter(e => new Date(e.date) >= cycleStart);
  const pastMovements = expenses.filter(e => new Date(e.date) < cycleStart);

  const renderExpenseList = (list: Expense[], title: string) => (
    <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
      <h3 className="text-sm font-black uppercase tracking-widest text-indigo-500 mb-4 flex items-center justify-between">
        {title}
        <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
          {list.length} registros
        </span>
      </h3>
      <div className="space-y-2">
        {list.length === 0 ? (
          <p className="text-xs text-slate-400 italic py-2">Sin registros en esta sección.</p>
        ) : (
          list.slice().reverse().map(exp => (
            <div key={exp.id} className={`flex items-center justify-between p-3 rounded-xl transition-all group ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[exp.category] }} />
                <div>
                  <div className="text-sm font-bold flex items-center gap-2">
                    {exp.description}
                    {exp.isFixed && (
                      <span className="text-[8px] bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-1 rounded uppercase font-black">
                        Fijo {exp.frequency ? `(${FREQUENCY_LABELS[exp.frequency]})` : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{new Date(exp.date).toLocaleDateString()} • {CATEGORY_LABELS[exp.category]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-black">-${exp.amount.toLocaleString()}</span>
                <button onClick={() => onDeleteExpense(exp.id)} className="p-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <h2 className="text-xl font-black italic uppercase tracking-tighter">Plantilla de Distribución</h2>
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
          <button 
            onClick={() => setViewMode('monthly')}
            className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${viewMode === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
          >
            Vista Mensual
          </button>
          <button 
            onClick={() => setViewMode('cycle')}
            className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${viewMode === 'cycle' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
          >
            Vista {FREQUENCY_LABELS[profile.frequency]}
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { cat: Category.NEEDS, label: 'Necesidades', pct: '50%', color: CATEGORY_COLORS.NEEDS },
          { cat: Category.WANTS, label: 'Deseos', pct: '30%', color: CATEGORY_COLORS.WANTS },
          { cat: Category.SAVINGS, label: 'Ahorro', pct: '20%', color: CATEGORY_COLORS.SAVINGS },
        ].map((item) => {
          const total = splits[item.cat];
          const spent = activeSpent(item.cat);
          const remaining = total - spent;

          return (
            <div key={item.cat} className={`p-5 rounded-3xl border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {item.pct} {item.label}
                </span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              </div>
              <p className="text-xl font-black italic">{currencySymbol}{total.toLocaleString()}</p>
              <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-[9px] font-bold text-slate-400 uppercase">
                  Gastado ({viewMode === 'monthly' ? 'Mes' : 'Ciclo'})
                </p>
                <p className={`text-sm font-bold ${remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                  {currencySymbol}{spent.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </section>

      <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h2 className="text-lg font-bold italic uppercase tracking-tight mb-6">
          Comparativa de {viewMode === 'monthly' ? 'Mes' : 'Ciclo'}
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10 }} />
              <Tooltip cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff' }} />
              <Bar name="Presupuesto" dataKey="Presupuesto" fill={isDarkMode ? "#334155" : "#e2e8f0"} radius={[6, 6, 0, 0]} barSize={32} />
              <Bar name="Gastado" dataKey="Gastado" radius={[6, 6, 0, 0]} barSize={32}>
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-black italic uppercase tracking-tighter px-2">Movimientos</h2>
        {renderExpenseList(currentMovements, 'Ciclo Actual')}
        {renderExpenseList(pastMovements, 'Historial Pasado')}
      </div>
    </div>
  );
};

export default BudgetDetails;
