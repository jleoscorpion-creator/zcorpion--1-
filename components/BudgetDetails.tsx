
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
import { Pencil, Trash2, X, Check, Save } from 'lucide-react';
import { Movement } from '../types';

interface BudgetDetailsProps {
  profile: UserProfile;
  expenses: Expense[];
  onDeleteMovement: (id: string) => void;
  onEditMovement: (id: string, updates: Partial<Movement>) => void;
  isDarkMode: boolean;
}

const BudgetDetails: React.FC<BudgetDetailsProps> = ({ profile, expenses, onDeleteMovement, onEditMovement, isDarkMode }) => {
  const [viewMode, setViewMode] = useState<'monthly' | 'cycle'>('cycle');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ amount: '', note: '', category: '' });
  const currencySymbol = CURRENCY_SYMBOLS[profile.currency] || '$';

  const startEdit = (m: Movement) => {
    setEditingId(m.id);
    setEditForm({ amount: m.amount.toString(), note: m.note || '', category: m.category });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = (id: string) => {
    onEditMovement(id, {
      amount: parseFloat(editForm.amount),
      note: editForm.note,
      category: editForm.category
    });
    setEditingId(null);
  };

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
  
  const budgetSplit = profile.budgetSplit || { needs: 0.50, wants: 0.30, savings: 0.20 };
  const splits = {
    [Category.NEEDS]: currentIncomeView * budgetSplit.needs,
    [Category.WANTS]: currentIncomeView * budgetSplit.wants,
    [Category.SAVINGS]: currentIncomeView * budgetSplit.savings,
  };

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const movements = profile.movements || [];

  // Filter movements for current month for the "Estado del Mes" section
  const getSpentInMonth = (cat: Category) => 
    movements.filter(m => {
      const d = new Date(m.date);
      return m.type === 'expense' && m.category === cat && d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    }).reduce((acc, curr) => acc + curr.amount, 0);

  // Filter movements for current cycle for the "Ciclo" view comparison if needed
  const cycleStart = profile.lastResetDate ? new Date(profile.lastResetDate) : new Date();
  const getSpentInCycle = (cat: Category) =>
    movements.filter(m => {
      const d = new Date(m.date);
      return m.type === 'expense' && m.category === cat && d >= cycleStart;
    }).reduce((acc, curr) => acc + curr.amount, 0);

  const activeSpent = viewMode === 'monthly' ? getSpentInMonth : getSpentInCycle;

  const chartData = [
    { name: 'Necesidades', Presupuesto: splits[Category.NEEDS], Gastado: activeSpent(Category.NEEDS), color: CATEGORY_COLORS.NEEDS },
    { name: 'Deseos', Presupuesto: splits[Category.WANTS], Gastado: activeSpent(Category.WANTS), color: CATEGORY_COLORS.WANTS },
    { name: 'Ahorro', Presupuesto: splits[Category.SAVINGS], Gastado: activeSpent(Category.SAVINGS), color: CATEGORY_COLORS.SAVINGS },
  ];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const currentMovementsActive = movements.filter(m => {
    const d = new Date(m.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const recentMovements = movements.filter(m => {
    const d = new Date(m.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() !== today.getTime();
  }).slice(0, 10);

  const renderMovementList = (list: any[], title: string, subtitle?: string) => (
    <div className={`p-8 rounded-[2.5rem] border transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-black uppercase italic tracking-tighter text-indigo-600 dark:text-indigo-400">
            {title}
          </h3>
          {subtitle && <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-slate-400">
          {list.length} registros
        </span>
      </div>
      <div className="space-y-4">
        {list.length === 0 ? (
          <div className="text-center py-12 opacity-30">
            <div className="text-4xl mb-3">📝</div>
            <p className="text-xs font-black uppercase tracking-widest italic">Sin registros recientes</p>
          </div>
        ) : (
          list.map(m => (
            <div key={m.id} className={`flex flex-col p-5 rounded-[2rem] border transition-all group ${isDarkMode ? 'bg-slate-950 border-white/5 hover:border-indigo-500/30' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:shadow-lg'}`}>
              {editingId === m.id ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      value={editForm.amount} 
                      onChange={e => setEditForm({...editForm, amount: e.target.value})}
                      className={`flex-1 p-2 rounded-xl text-sm font-black border uppercase outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      placeholder="Monto"
                    />
                    <select 
                      value={editForm.category}
                      onChange={e => setEditForm({...editForm, category: e.target.value})}
                      className={`p-2 rounded-xl text-[10px] font-black border uppercase outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    >
                      <option value={Category.NEEDS}>Necesidad</option>
                      <option value={Category.WANTS}>Deseo</option>
                      <option value={Category.SAVINGS}>Ahorro</option>
                      <option value="Ingreso">Ingreso</option>
                    </select>
                  </div>
                  <input 
                    type="text" 
                    value={editForm.note}
                    onChange={e => setEditForm({...editForm, note: e.target.value})}
                    className={`w-full p-2 rounded-xl text-xs font-bold border outline-none ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    placeholder="Nota / Descripción"
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={cancelEdit} className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-rose-500 transition-colors">
                      <X size={16} />
                    </button>
                    <button onClick={() => saveEdit(m.id)} className="p-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all">
                      <Check size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-sm border ${m.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                      {m.type === 'income' ? '💰' : '🛒'}
                    </div>
                    <div>
                      <div className="text-sm font-black uppercase flex items-center gap-2">
                        {m.note || m.category}
                        {m.type === 'income' && <span className="text-[8px] bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full uppercase font-black tracking-tighter">INGRESO</span>}
                      </div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">
                        {new Date(m.date).toLocaleDateString()} • {CATEGORY_LABELS[m.category as Category] || m.category}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-sm font-black italic ${m.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {m.type === 'income' ? '+' : '-'}{currencySymbol}{m.amount.toLocaleString()}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(m)}
                        className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-indigo-500/10 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'}`}
                      >
                         <Pencil size={14} />
                      </button>
                      <button 
                        onClick={() => onDeleteMovement(m.id)}
                        className={`p-2 rounded-xl transition-all ${isDarkMode ? 'hover:bg-rose-500/10 text-rose-400' : 'hover:bg-rose-50 text-rose-600'}`}
                      >
                         <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
            onClick={() => setViewMode('cycle')}
            className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${viewMode === 'cycle' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
          >
            Vista {FREQUENCY_LABELS[profile.frequency]}
          </button>
          {profile.frequency !== Frequency.MONTHLY && (
            <button 
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-1.5 text-[10px] font-black uppercase rounded-lg transition-all ${viewMode === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}
            >
              Vista Mensual
            </button>
          )}
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { cat: Category.NEEDS, label: 'Necesidades', pct: '50%', color: CATEGORY_COLORS.NEEDS, icon: '🍔' },
          { cat: Category.WANTS, label: 'Deseos', pct: '30%', color: CATEGORY_COLORS.WANTS, icon: '🎮' },
          { cat: Category.SAVINGS, label: 'Ahorro', pct: '20%', color: CATEGORY_COLORS.SAVINGS, icon: '💰' },
        ].map((item) => {
          const total = splits[item.cat];
          const spent = activeSpent(item.cat);
          const remaining = total - spent;
          const percentSpent = Math.min((spent / total) * 100, 100);

          return (
            <div key={item.cat} className={`relative p-8 rounded-[2.5rem] border transition-all duration-300 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl select-none">{item.icon}</div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {item.pct} {item.label}
                </span>
                <div className="w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 shadow-sm" style={{ backgroundColor: item.color }} />
              </div>
              <p className="text-3xl font-black italic tracking-tighter text-indigo-600 dark:text-indigo-400">{currencySymbol}{total.toLocaleString()}</p>
              
              <div className="mt-8 space-y-2">
                 <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                    <span>Progreso</span>
                    <span className={remaining < 0 ? 'text-rose-500' : 'text-emerald-500'}>{Math.round((spent/total)*100)}%</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${remaining < 0 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} style={{ width: `${percentSpent}%` }} />
                 </div>
              </div>

              <div className="mt-6 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-end">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gastado</p>
                  <p className={`text-lg font-black italic tracking-tighter ${remaining < 0 ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                    {currencySymbol}{spent.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Resta</p>
                   <p className={`text-sm font-black italic ${remaining < 0 ? 'text-rose-500' : 'text-indigo-500'}`}>
                      {currencySymbol}{remaining.toLocaleString()}
                   </p>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <div className={`p-8 rounded-[2.5rem] border transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-black italic uppercase tracking-tighter">
            Comparativa {viewMode === 'monthly' ? 'Mensual' : 'Ciclo'}
          </h2>
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700" />
                <span className="text-[9px] font-black uppercase text-slate-400">Plan</span>
             </div>
             <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-indigo-500" />
                <span className="text-[9px] font-black uppercase text-slate-400">Gasto</span>
             </div>
          </div>
        </div>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={12}>
              <CartesianGrid strokeDasharray="6 6" vertical={false} stroke={isDarkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.1)"} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDarkMode ? '#64748b' : '#94a3b8', fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: isDarkMode ? '#475569' : '#cbd5e1', fontSize: 10, fontWeight: '700' }} 
              />
              <Tooltip 
                cursor={{ fill: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }} 
                contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: isDarkMode ? '#0f172a' : '#fff', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '16px' }}
                itemStyle={{ textTransform: 'uppercase', fontWeight: '900', fontSize: '11px' }}
              />
              <Bar name="Plan" dataKey="Presupuesto" fill={isDarkMode ? "#1e293b" : "#f1f5f9"} radius={[12, 12, 0, 0]} barSize={40} />
              <Bar name="Gasto" dataKey="Gastado" radius={[12, 12, 0, 0]} barSize={40}>
                {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-black italic uppercase tracking-tighter px-2">Movimientos del Plan</h2>
        {renderMovementList(currentMovementsActive, 'Hoy', 'Registros recientes del día')}
        {renderMovementList(recentMovements, 'Historial Reciente', 'Últimos movimientos procesados')}
      </div>
    </div>
  );
};

export default BudgetDetails;
