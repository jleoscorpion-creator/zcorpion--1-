
import React from 'react';
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
  const currencySymbol = CURRENCY_SYMBOLS[profile.currency] || '$';

  const getMonthlyIncome = () => {
    switch (profile.frequency) {
      case Frequency.WEEKLY: return profile.income * 4;
      case Frequency.BIWEEKLY: return profile.income * 2;
      default: return profile.income;
    }
  };

  const monthlyIncome = getMonthlyIncome();
  const splits = {
    [Category.NEEDS]: monthlyIncome * 0.50,
    [Category.WANTS]: monthlyIncome * 0.30,
    [Category.SAVINGS]: monthlyIncome * 0.20,
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const getSpentThisMonth = (cat: Category) => 
    expenses.filter(e => {
      const d = new Date(e.date);
      return e.category === cat && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((acc, curr) => acc + curr.amount, 0);

  const chartData = [
    { name: 'Necesidades', Presupuesto: splits[Category.NEEDS], Gastado: getSpentThisMonth(Category.NEEDS), color: CATEGORY_COLORS.NEEDS },
    { name: 'Deseos', Presupuesto: splits[Category.WANTS], Gastado: getSpentThisMonth(Category.WANTS), color: CATEGORY_COLORS.WANTS },
    { name: 'Ahorro', Presupuesto: splits[Category.SAVINGS], Gastado: getSpentThisMonth(Category.SAVINGS), color: CATEGORY_COLORS.SAVINGS },
  ];

  const fixedExpenses = expenses.filter(e => e.isFixed);
  const varNeeds = expenses.filter(e => !e.isFixed && e.category === Category.NEEDS);
  const varWants = expenses.filter(e => !e.isFixed && e.category === Category.WANTS);
  const savings = expenses.filter(e => e.category === Category.SAVINGS);

  const sections = [
    { title: 'Gastos Fijos', data: fixedExpenses, color: '#64748b' },
    { title: 'Necesidades (Variables)', data: varNeeds, color: CATEGORY_COLORS.NEEDS },
    { title: 'Deseos (Variables)', data: varWants, color: CATEGORY_COLORS.WANTS },
    { title: 'Ahorro e Inversión', data: savings, color: CATEGORY_COLORS.SAVINGS },
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { cat: Category.NEEDS, label: 'Necesidades', pct: '50%', color: CATEGORY_COLORS.NEEDS },
          { cat: Category.WANTS, label: 'Deseos', pct: '30%', color: CATEGORY_COLORS.WANTS },
          { cat: Category.SAVINGS, label: 'Ahorro', pct: '20%', color: CATEGORY_COLORS.SAVINGS },
        ].map((item) => {
          const spent = getSpentThisMonth(item.cat);
          const total = splits[item.cat];
          const remaining = total - spent;
          const isOver = remaining < 0;

          return (
            <div key={item.cat} className={`p-5 rounded-3xl border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {item.pct} {item.label}
                </span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Plantilla Mensual</p>
                <p className="text-xl font-black italic">{currencySymbol}{total.toLocaleString()}</p>
              </div>
              <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Mes Queda</p>
                  <p className={`text-sm font-bold ${isOver ? 'text-rose-500' : 'text-emerald-500'}`}>
                    {currencySymbol}{remaining.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-slate-400 uppercase">Uso</p>
                  <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    {total > 0 ? ((spent / total) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h2 className="text-xl font-bold italic uppercase tracking-tight flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"/>
          Análisis Mensual (Proyectado)
        </h2>
        <div className="h-[300px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDarkMode ? "#1e293b" : "#f1f5f9"} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 700 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 10 }} />
              <Tooltip cursor={{ fill: isDarkMode ? '#1e293b' : '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#fff' }} />
              <Bar name="Presupuesto Mensual" dataKey="Presupuesto" fill={isDarkMode ? "#334155" : "#e2e8f0"} radius={[6, 6, 0, 0]} barSize={32} />
              <Bar name="Gastado Mes" dataKey="Gastado" radius={[6, 6, 0, 0]} barSize={32}>
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold italic uppercase tracking-tight px-2 flex items-center gap-2">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Historial por Categorías
        </h2>
        {sections.map(section => (
          <div key={section.title} className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-500 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: section.color}}/>
              {section.title}
              <span className="ml-auto text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {section.data.length} registros
              </span>
            </h3>
            <div className="space-y-2">
              {section.data.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">Sin registros en esta categoría.</p>
              ) : (
                section.data.slice().reverse().map(exp => (
                  <div key={exp.id} className={`flex items-center justify-between p-3 rounded-xl transition-all group ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: CATEGORY_COLORS[exp.category] }} />
                      <div>
                        <div className="text-sm font-bold flex items-center gap-2 flex-wrap">
                          {exp.description}
                          {exp.isFixed && (
                            <div className="flex items-center gap-1">
                              <span className="text-[8px] bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 px-1 rounded uppercase font-black">Fijo</span>
                              {exp.frequency && (
                                <span className="text-[8px] text-slate-400 font-bold uppercase italic">
                                  ({FREQUENCY_LABELS[exp.frequency]})
                                </span>
                              )}
                            </div>
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
        ))}
      </div>
    </div>
  );
};

export default BudgetDetails;
