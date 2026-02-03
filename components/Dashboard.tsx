
import React, { useState, useEffect } from 'react';
import { UserProfile, Expense, Category, Frequency } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_COLORS, CURRENCY_SYMBOLS, FREQUENCY_LABELS } from '../constants';

interface DashboardProps {
  profile: UserProfile;
  expenses: Expense[];
  onAddExpense: (amount: number, category: Category, description: string, isFixed: boolean, frequency?: Frequency) => void;
  isDarkMode: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, expenses, onAddExpense, isDarkMode }) => {
  const [selectedCat, setSelectedCat] = useState<Category>(Category.NEEDS);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState(100);

  const getPeriodFilter = (dateStr: string, freq: Frequency) => {
    const d = new Date(dateStr);
    const now = new Date();
    
    if (freq === Frequency.MONTHLY) {
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }
    
    const diffMs = now.getTime() - d.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
    if (freq === Frequency.WEEKLY) return diffDays <= 7;
    if (freq === Frequency.BIWEEKLY) return diffDays <= 14;
    return false;
  };

  const currentPeriodExpenses = expenses.filter(e => getPeriodFilter(e.date, profile.frequency));
  
  // Adjusted logic: If a fixed expense is registered in the current period, it's counted normally.
  // The user asked for it to "affect balance based on time". 
  // We'll calculate the period balance based on transactions that happened in this cycle.
  const totalPeriodExpenses = currentPeriodExpenses.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = profile.income - totalPeriodExpenses;
  const currencySymbol = CURRENCY_SYMBOLS[profile.currency] || '$';

  const getPeriodDays = (freq: Frequency) => {
    if (freq === Frequency.WEEKLY) return 7;
    if (freq === Frequency.BIWEEKLY) return 14;
    return 30;
  };

  useEffect(() => {
    const updateCountdown = () => {
      if (!profile.lastLoginDate) return;
      
      const lastDate = new Date(profile.lastLoginDate);
      const today = new Date();
      const limitDays = getPeriodDays(profile.frequency);
      const limitMs = limitDays * 24 * 60 * 60 * 1000;
      
      const expiryTime = lastDate.getTime() + limitMs;
      const diffMs = expiryTime - today.getTime();
      
      if (diffMs <= 0) {
        setTimeRemaining('Ciclo Completado');
        setProgressPercent(0);
      } else {
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeRemaining(`${days}d ${hours}h`);
        setProgressPercent((diffMs / limitMs) * 100);
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 60000);
    return () => clearInterval(timer);
  }, [profile.lastLoginDate, profile.frequency]);

  const getCategoryTotal = (cat: Category) => 
    currentPeriodExpenses.filter(e => e.category === cat).reduce((acc, curr) => acc + curr.amount, 0);

  const chartData = [
    { name: 'Necesidades', value: getCategoryTotal(Category.NEEDS), color: CATEGORY_COLORS.NEEDS },
    { name: 'Deseos', value: getCategoryTotal(Category.WANTS), color: CATEGORY_COLORS.WANTS },
    { name: 'Ahorro', value: getCategoryTotal(Category.SAVINGS), color: CATEGORY_COLORS.SAVINGS },
  ].filter(d => d.value > 0);

  const periodLabel = profile.frequency === Frequency.WEEKLY ? 'Semanal' : profile.frequency === Frequency.BIWEEKLY ? 'Quincenal' : 'Mensual';

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Balance {periodLabel}</span>
          <div className="flex items-end gap-2 mt-2">
            <span className="text-3xl font-bold">{currencySymbol}{balance.toLocaleString()}</span>
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${balance >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
              {balance >= 0 ? 'Libre' : 'Excedido'}
            </span>
          </div>
        </div>

        <button 
          onClick={() => document.getElementById('quick-expense-form')?.scrollIntoView({ behavior: 'smooth' })}
          className={`relative p-6 rounded-3xl border shadow-sm flex flex-col justify-between transition-all group hover:scale-[1.02] text-left active:scale-95 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
        >
          <div 
            className="absolute bottom-0 left-0 h-1 bg-orange-500/30 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
          <div className="flex justify-between items-start">
            <span className="text-slate-500 text-sm font-medium uppercase tracking-wider group-hover:text-indigo-500 transition-colors">Ciclo</span>
            <span className="text-[10px] font-black text-orange-500 uppercase">{timeRemaining}</span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isDarkMode ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-500'} group-hover:bg-orange-500 group-hover:text-white`}>
              <span className="text-xl animate-pulse">🔥</span>
            </div>
            <div>
              <span className="text-2xl font-bold">{profile.streak} Racha</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Meta: Ahorrar en cada ciclo</p>
            </div>
          </div>
        </button>

        <div className={`p-6 rounded-3xl border shadow-sm flex flex-col justify-between transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <span className="text-slate-500 text-sm font-medium uppercase tracking-wider">Gastos {periodLabel}</span>
          <span className="text-3xl font-bold text-rose-500 mt-2">{currencySymbol}{totalPeriodExpenses.toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div id="quick-expense-form" className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h3 className="text-lg font-bold mb-4 italic uppercase tracking-tight">Nuevo Movimiento</h3>
          <QuickExpenseForm onSubmit={onAddExpense} isDarkMode={isDarkMode} preSelectedCat={selectedCat} onCatChange={setSelectedCat} currencySymbol={currencySymbol} />
        </div>

        <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h3 className="text-lg font-bold mb-4 italic uppercase tracking-tight">Distribución Actual</h3>
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
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', backgroundColor: isDarkMode ? '#1e293b' : '#ffffff', color: isDarkMode ? '#f1f5f9' : '#0f172a' }}
                    formatter={(value: number) => `${currencySymbol}${value.toLocaleString()}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm italic font-medium">
                Sin movimientos en este {periodLabel.toLowerCase()}
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-around text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: CATEGORY_COLORS.NEEDS}}/> Necesidades</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: CATEGORY_COLORS.WANTS}}/> Deseos</div>
            <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{backgroundColor: CATEGORY_COLORS.SAVINGS}}/> Ahorro</div>
          </div>
        </div>
      </div>
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
    setAmount('');
    setDesc('');
    setIsFixed(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{currencySymbol}</span>
          <input 
            type="number" 
            placeholder="Monto" 
            required
            value={amount} 
            onChange={e => setAmount(e.target.value)}
            className={`w-full border-none rounded-xl p-3 pl-8 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${isDarkMode ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 placeholder-slate-400'}`}
          />
        </div>
        <select 
          value={preSelectedCat} 
          onChange={e => onCatChange(e.target.value as Category)}
          className={`border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50'}`}
        >
          <option value={Category.NEEDS}>Necesidad</option>
          <option value={Category.WANTS}>Deseo</option>
          <option value={Category.SAVINGS}>Ahorro</option>
        </select>
      </div>
      <input 
        type="text" 
        placeholder="Descripción (ej. Netflix, Renta...)" 
        required
        value={desc} 
        onChange={e => setDesc(e.target.value)}
        className={`w-full border-none rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none transition-colors ${isDarkMode ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 placeholder-slate-400'}`}
      />
      
      <div className="flex flex-col gap-3 px-2">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            id="isFixed" 
            checked={isFixed}
            onChange={e => setIsFixed(e.target.checked)}
            className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
          />
          <label htmlFor="isFixed" className="text-xs font-bold uppercase text-slate-500 tracking-tight cursor-pointer">
            ¿Es un {preSelectedCat === Category.WANTS ? 'deseo' : 'gasto'} fijo?
          </label>
        </div>

        {isFixed && (
          <div className="animate-in slide-in-from-left-2 duration-300">
             <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Frecuencia del Gasto Fijo</label>
             <div className="grid grid-cols-3 gap-2">
                {Object.entries(FREQUENCY_LABELS).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setFrequency(key as Frequency)}
                    className={`py-2 text-[10px] font-black uppercase tracking-tighter rounded-lg border transition-all ${
                      frequency === key
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
             </div>
          </div>
        )}
      </div>

      <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95">
        Guardar Transacción
      </button>
    </form>
  );
};

export default Dashboard;
