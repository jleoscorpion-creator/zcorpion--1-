
import React, { useState, useEffect } from 'react';
import { UserProfile, Expense, Category, Frequency } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_COLORS, CURRENCY_SYMBOLS, FREQUENCY_LABELS } from '../constants';
import FinancialSummary from './FinancialSummary';

interface DashboardProps {
  profile: UserProfile;
  expenses: Expense[];
  onAddExpense: (amount: number, category: Category, description: string, isFixed: boolean, frequency?: Frequency) => void;
  onNavigateToTab: (tab: 'budget' | 'dashboard' | 'chat' | 'academy' | 'settings') => void;
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, expenses, onAddExpense, onNavigateToTab, isDarkMode }) => {
  const [selectedCat, setSelectedCat] = useState<Category>(Category.NEEDS);
  const [timeRemainingToday, setTimeRemainingToday] = useState<string>('');
  const [dayProgressPercent, setDayProgressPercent] = useState(100);
  const [showSummary, setShowSummary] = useState(false);

  const currencySymbol = CURRENCY_SYMBOLS[profile.currency] || '$';

  // Lógica de ciclo financiero (para el balance)
  const getCycleStart = () => profile.lastLoginDate ? new Date(profile.lastLoginDate) : new Date();
  const currentCycleExpenses = expenses.filter(e => new Date(e.date) >= getCycleStart());
  const totalCycleExpenses = currentCycleExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = profile.income - totalCycleExpenses;

  useEffect(() => {
    const updateDailyCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Siguiente medianoche
      const diffMs = midnight.getTime() - now.getTime();
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemainingToday(`${hours}h ${minutes}m`);
      setDayProgressPercent((diffMs / (24 * 60 * 60 * 1000)) * 100);
    };
    updateDailyCountdown();
    const timer = setInterval(updateDailyCountdown, 30000);
    return () => clearInterval(timer);
  }, []);

  const getCategoryTotal = (cat: Category) => 
    currentCycleExpenses.filter(e => e.category === cat).reduce((acc, curr) => acc + curr.amount, 0);

  const chartData = [
    { name: 'Necesidades', value: getCategoryTotal(Category.NEEDS), color: CATEGORY_COLORS.NEEDS },
    { name: 'Deseos', value: getCategoryTotal(Category.WANTS), color: CATEGORY_COLORS.WANTS },
    { name: 'Ahorro', value: getCategoryTotal(Category.SAVINGS), color: CATEGORY_COLORS.SAVINGS },
  ].filter(d => d.value > 0);

  const periodLabel = profile.frequency === Frequency.WEEKLY ? 'Semanal' : profile.frequency === Frequency.BIWEEKLY ? 'Quincenal' : 'Mensual';

  // Verificar si la racha se cumplió hoy (por gasto o por lección)
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  
  const streakAchievedToday = profile.lastStreakDate && new Date(profile.lastStreakDate).getTime() === todayDate.getTime();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Balance Card */}
        <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Balance {periodLabel}</span>
            <button 
              onClick={() => setShowSummary(true)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-indigo-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
            </button>
          </div>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-3xl font-bold">{currencySymbol}{balance.toLocaleString()}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${balance >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {balance >= 0 ? 'Disponible' : 'Sobrepasado'}
            </span>
          </div>
        </div>

        {/* Daily Streak Card */}
        <div className={`relative p-6 rounded-3xl border shadow-sm flex flex-col justify-between transition-all overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <div 
            className={`absolute bottom-0 left-0 h-1 transition-all duration-1000 ${streakAchievedToday ? 'bg-orange-500' : 'bg-slate-400 opacity-30'}`}
            style={{ width: `${dayProgressPercent}%` }}
          />
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Cierre del Día</span>
            <span className={`text-[10px] font-black uppercase ${streakAchievedToday ? 'text-indigo-500' : 'text-orange-500'}`}>
              {timeRemainingToday} restan
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              streakAchievedToday 
                ? 'bg-orange-500 text-white shadow-[0_0_20px_rgba(249,115,22,0.5)] animate-pulse' 
                : (isDarkMode ? 'bg-slate-800 text-slate-600 grayscale' : 'bg-slate-100 text-slate-400 grayscale')
            }`}>
              <span className={`text-2xl transition-transform ${streakAchievedToday ? 'scale-110' : 'scale-100'}`}>🔥</span>
            </div>
            <div>
              <span className={`text-2xl font-black italic transition-colors ${streakAchievedToday ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-slate-400'}`}>
                {profile.streak} Días
              </span>
              <p className={`text-[9px] font-black uppercase tracking-widest ${streakAchievedToday ? 'text-emerald-500' : 'text-slate-400'}`}>
                {streakAchievedToday ? 'Racha Protegida ✓' : '¡Regístra algo o estudia!'}
              </p>
            </div>
          </div>
        </div>

        {/* Gastos Card */}
        <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Gastos {periodLabel}</span>
          <span className="text-3xl font-bold text-rose-500 mt-2">{currencySymbol}{totalCycleExpenses.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div id="quick-expense-form" className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h3 className="text-lg font-bold mb-4 italic uppercase tracking-tight">Agregar Movimiento</h3>
          <QuickExpenseForm onSubmit={onAddExpense} isDarkMode={isDarkMode} preSelectedCat={selectedCat} onCatChange={setSelectedCat} currencySymbol={currencySymbol} />
        </div>

        <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h3 className="text-lg font-bold mb-4 italic uppercase tracking-tight">Distribución</h3>
          <div className="h-[200px] w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', color: isDarkMode ? '#f1f5f9' : '#0f172a' }}
                    formatter={(value: number) => `${currencySymbol}${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm italic font-medium">
                Sin registros hoy
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-around text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: CATEGORY_COLORS.NEEDS}}/> Necesidad</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: CATEGORY_COLORS.WANTS}}/> Deseo</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: CATEGORY_COLORS.SAVINGS}}/> Ahorro</div>
          </div>
        </div>
      </div>

      {showSummary && (
        <FinancialSummary 
          profile={profile} 
          expenses={expenses} 
          onClose={() => setShowSummary(false)} 
          onGoToPlan={() => {
            setShowSummary(false);
            onNavigateToTab('budget');
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

const QuickExpenseForm: React.FC<{ 
  onSubmit: (a: number, c: Category, d: string, f: boolean, freq?: Frequency) => void, 
  isDarkMode: boolean, 
  preSelectedCat: Category,
  onCatChange: (c: Category) => void,
  currencySymbol: string
}> = ({ onSubmit, isDarkMode, preSelectedCat, onCatChange, currencySymbol }) => {
  const [amount, setAmount] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [isFixed, setIsFixed] = React.useState(false);
  const [frequency, setFrequency] = React.useState<Frequency>(Frequency.MONTHLY);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc) return;
    onSubmit(parseFloat(amount), preSelectedCat, desc, isFixed, isFixed ? frequency : undefined);
    setAmount(''); setDesc(''); setIsFixed(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{currencySymbol}</span>
          <input 
            type="number" placeholder="Monto" required
            value={amount} onChange={e => setAmount(e.target.value)}
            className={`w-full border-none rounded-xl p-3 pl-8 outline-none ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50'}`}
          />
        </div>
        <select 
          value={preSelectedCat} onChange={e => onCatChange(e.target.value as Category)}
          className={`border-none rounded-xl p-3 outline-none ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50'}`}
        >
          <option value={Category.NEEDS}>Necesidad</option>
          <option value={Category.WANTS}>Deseo</option>
          <option value={Category.SAVINGS}>Ahorro</option>
        </select>
      </div>
      <input 
        type="text" placeholder="¿En qué gastaste?" required
        value={desc} onChange={e => setDesc(e.target.value)}
        className={`w-full border-none rounded-xl p-3 outline-none ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50'}`}
      />
      <div className="flex flex-col gap-3 px-2">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" id="isFixed" checked={isFixed}
            onChange={e => setIsFixed(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          <label htmlFor="isFixed" className="text-xs font-bold uppercase text-slate-500 cursor-pointer">Gasto Fijo Recurrente</label>
        </div>
        {isFixed && (
          <div className="animate-in slide-in-from-left-2 duration-300">
             <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Frecuencia</label>
             <div className="grid grid-cols-3 gap-2">
                {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                  <button key={key} type="button" onClick={() => setFrequency(key as Frequency)}
                    className={`py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${frequency === key ? 'bg-indigo-600 text-white border-indigo-600' : isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-600 border-slate-200'}`}
                  >
                    {label}
                  </button>
                ))}
             </div>
          </div>
        )}
      </div>
      <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg active:scale-95 transition-all">
        Alimentar Racha
      </button>
    </form>
  );
};

export default Dashboard;
