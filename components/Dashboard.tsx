
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { UserProfile, Expense, Category, Frequency } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORY_COLORS, CURRENCY_SYMBOLS, FREQUENCY_LABELS } from '../constants';
import FinancialSummary from './FinancialSummary';
import OnboardingGuide from './OnboardingGuide';

interface DashboardProps {
  profile: UserProfile;
  expenses: Expense[];
  onAddExpense: (amount: number, category: Category, description: string, isFixed: boolean, frequency?: Frequency) => void;
  onAddIncome: (amount: number, category: string, description: string) => void;
  onNavigateToTab: (tab: any) => void;
  isDarkMode: boolean;
  canInstall?: boolean;
  onInstall?: () => void;
  onCompleteOnboarding: (key: string) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ profile, expenses, onAddExpense, onAddIncome, onNavigateToTab, isDarkMode, canInstall, onInstall, onCompleteOnboarding, onUpdateProfile }) => {
  const [selectedCat, setSelectedCat] = useState<Category>(Category.NEEDS);
  const [timeRemainingToday, setTimeRemainingToday] = useState<string>('');
  const [dayProgressPercent, setDayProgressPercent] = useState(100);
  const [showSummary, setShowSummary] = useState(false);

  const currencySymbol = CURRENCY_SYMBOLS[profile.currency] || '$';

  // Lógica de ciclo financiero ajustada a frecuencia
  const getCycleStart = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (profile.frequency === Frequency.WEEKLY) {
      const day = d.getDay();
      d.setDate(d.getDate() - day); // Inicio de semana (Domingo)
    } else if (profile.frequency === Frequency.BIWEEKLY) {
      if (d.getDate() > 15) {
        d.setDate(16);
      } else {
        d.setDate(1);
      }
    } else {
      d.setDate(1); // Mes
    }
    return d;
  };

  const cycleStart = profile.lastResetDate ? new Date(profile.lastResetDate) : new Date();
  const cycleMovements = (profile.movements || []).filter(m => new Date(m.date) >= cycleStart);
  
  const getCategoryTotal = (cat: Category) => 
    cycleMovements.filter(m => m.type === 'expense' && m.category === cat).reduce((acc, curr) => acc + curr.amount, 0);

  // Dashboard display: up to 10 most recent movements of the current cycle
  const savingsTarget = (profile.income || 0) * (profile.budgetSplit?.savings || 0.2);
  const currentSavings = getCategoryTotal(Category.SAVINGS);
  const isSavingsTargetMet = currentSavings >= savingsTarget && savingsTarget > 0;
  
  const cycleRewardClaimed = profile.lastCycleRewardId === profile.lastResetDate;
  
  const getCycleRewardAmount = () => {
    if (profile.frequency === Frequency.WEEKLY) return 15;
    if (profile.frequency === Frequency.BIWEEKLY) return 30;
    return 60; // Monthly
  };

  const handleClaimCycleReward = () => {
    if (isSavingsTargetMet && !cycleRewardClaimed) {
      const reward = getCycleRewardAmount();
      onUpdateProfile({
        diamonds: (profile.diamonds || 0) + reward,
        lastCycleRewardId: profile.lastResetDate
      });
    }
  };

  const dashboardMovements = cycleMovements.slice(0, 10);

  const totalCycleExpenses = profile.spent || 0;
  const balance = profile.walletBalance;

  useEffect(() => {
    const updateDailyCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
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

  const chartData = [
    { name: 'Necesidades', value: getCategoryTotal(Category.NEEDS), color: CATEGORY_COLORS.NEEDS },
    { name: 'Deseos', value: getCategoryTotal(Category.WANTS), color: CATEGORY_COLORS.WANTS },
    { name: 'Ahorro', value: getCategoryTotal(Category.SAVINGS), color: CATEGORY_COLORS.SAVINGS },
  ].filter(d => d.value > 0);

  const periodLabel = FREQUENCY_LABELS[profile.frequency];

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  const streakAchievedToday = profile.lastStreakDate && new Date(profile.lastStreakDate).getTime() === todayDate.getTime();

  const dashboardSteps = [
    {
      title: "Tu Cuadro de Mando",
      content: "Aquí verás un resumen rápido de tu salud financiera actual. El balance se ajusta automáticamente a tu ciclo de ingresos."
    },
    {
      title: "Balance y Ciclo",
      content: "El balance muestra cuánto dinero tienes disponible después de tus gastos en este periodo. ¡Mantenlo en positivo!"
    },
    {
      title: "Racha Zcorpion",
      content: "Tu racha aumenta cada día que registras un gasto o completas una lección. ¡No dejes que se apague el fuego!"
    },
    {
      title: "Distribución en Tiempo Real",
      content: "El gráfico circular te muestra en qué categoría estás gastando más según la regla 50/30/20."
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden">
      {profile && !profile.onboardingSeen?.includes('dashboard') && (
        <OnboardingGuide 
          guideKey="dashboard" 
          steps={dashboardSteps} 
          onComplete={onCompleteOnboarding} 
          isDarkMode={isDarkMode} 
        />
      )}
      {!profile.isPremium && (
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-pink-900 p-[1px] rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-slate-950/90 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-[0_0_15px_rgba(79,70,229,0.5)]">🦂</div>
               <div>
                  <h3 className="text-sm font-black text-white italic uppercase tracking-tight">Potencia tus Finanzas con Zcorpion</h3>
                  <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest">IA Avanzada + Academy Pro + Juegos</p>
               </div>
            </div>
            <button 
              onClick={() => onNavigateToTab('profile' as any)} 
              className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-500 transition-all active:scale-95"
            >
              Mejorar Ahora
            </button>
          </div>
        </div>
      )}

      {canInstall && (
        <div className={`p-6 rounded-3xl border-2 border-dashed flex items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-500 ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
              📲
            </div>
            <div>
              <h4 className={`text-sm font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Zcorpion en tu Pantalla</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Instala la app para acceso directo</p>
            </div>
          </div>
          <button 
            onClick={onInstall}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all"
          >
            Instalar App
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex justify-between items-start">
            <span className={`text-xs font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-indigo-500/60'}`}>Billetera (Wallet)</span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            </div>
          </div>
          <div className="flex flex-col gap-1 mt-4">
            <span className={`text-4xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{currencySymbol}{(profile.walletBalance || 0).toLocaleString()}</span>
            <div className="flex items-center gap-2 mt-2">
               <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest ${profile.walletBalance >= 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>{profile.walletBalance >= 0 ? 'EFECTIVO' : 'DEUDA'}</span>
            </div>
          </div>
        </div>

        <div className={`relative p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col justify-between overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
          <div className={`absolute bottom-0 left-0 h-1.5 transition-all duration-1000 ${streakAchievedToday ? 'bg-orange-500' : 'bg-slate-200 dark:bg-slate-800'}`} style={{ width: `${dayProgressPercent}%` }} />
          <div className="flex justify-between items-start">
             <span className={`text-xs font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-indigo-500/60'}`}>Cierre del Día</span>
             <span className={`text-[10px] font-black uppercase ${streakAchievedToday ? 'text-indigo-500' : 'text-orange-500'}`}>{timeRemainingToday}</span>
          </div>
          <div className="flex items-center gap-4 mt-4">
             <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 ${streakAchievedToday ? 'bg-orange-500 text-white shadow-2xl shadow-orange-500/40 animate-pulse' : (isDarkMode ? 'bg-slate-800 text-slate-600 grayscale' : 'bg-slate-100 text-slate-400 grayscale')}`}>
                <span className={`text-3xl ${streakAchievedToday ? 'scale-110' : 'scale-100'}`}>🔥</span>
             </div>
             <div>
                <span className={`text-3xl font-black italic tracking-tighter ${streakAchievedToday ? (isDarkMode ? 'text-white' : 'text-slate-950') : 'text-slate-400'}`}>{profile.streak} Días</span>
                <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${streakAchievedToday ? 'text-emerald-500' : (isDarkMode ? 'text-slate-600' : 'text-slate-400')}`}>{streakAchievedToday ? 'Racha Protegida ✓' : 'Falta estudio hoy'}</p>
             </div>
          </div>
        </div>

        <div className={`p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
           <span className={`text-xs font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-slate-500' : 'text-indigo-500/60'}`}>Gastado {periodLabel}</span>
           <div className="mt-4">
              <span className="text-4xl font-black italic tracking-tighter text-rose-500">{currencySymbol}{(profile.spent || 0).toLocaleString()}</span>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Total en este periodo</p>
           </div>
        </div>
      </div>

      {/* Bonus Diamantes (Premium Only) */}
      {profile.isPremium && (
        <div className={`p-6 rounded-[2rem] border transition-all duration-500 ${isDarkMode ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-cyan-50 border-cyan-200'} flex flex-col md:flex-row items-center justify-between gap-6`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/20 ${isSavingsTargetMet && !cycleRewardClaimed ? 'animate-bounce' : ''}`}>
               💎
            </div>
            <div>
              <h4 className={`text-sm font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Reto de Ahorro {periodLabel}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                {cycleRewardClaimed ? '¡Recompensa cobrada! Vuelve el próximo ciclo.' : 
                 isSavingsTargetMet ? `¡Meta lograda! Cobra tus ${getCycleRewardAmount()} diamantes.` : 
                 `Ahorra ${currencySymbol}${savingsTarget.toLocaleString()} para ganar ${getCycleRewardAmount()} diamantes.`}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 w-full md:w-auto">
            <div className="w-full md:w-48 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-cyan-500 transition-all duration-1000" 
                 style={{ width: `${Math.min(100, (currentSavings / savingsTarget) * 100)}%` }} 
               />
            </div>
            {!cycleRewardClaimed && (
              <button 
                disabled={!isSavingsTargetMet}
                onClick={handleClaimCycleReward}
                className={`w-full md:w-auto px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isSavingsTargetMet ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20 hover:scale-105 active:scale-95' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed opacity-50'}`}
              >
                {isSavingsTargetMet ? 'Reclamar Diamantes' : 'En Progreso'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className={`p-8 rounded-[2.5rem] border transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex justify-between items-center mb-8">
             <h3 className="text-xl font-black italic uppercase tracking-tighter">Agregar Movimiento</h3>
             <div className="w-10 h-10 bg-emerald-600/10 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Plus size={20} />
             </div>
          </div>
          <QuickExpenseForm onSubmit={onAddExpense} onAddIncome={onAddIncome} isDarkMode={isDarkMode} preSelectedCat={selectedCat} onCatChange={setSelectedCat} currencySymbol={currencySymbol} />
        </div>

        <div className={`p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-black italic uppercase tracking-tighter">Distribución</h3>
              <div className="flex items-center gap-1">
                 <div className="w-2 h-2 rounded-full bg-indigo-500" />
                 <span className="text-[9px] font-black uppercase text-slate-400">En tiempo real</span>
              </div>
           </div>
           <div className="h-[220px] w-full flex-1">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={chartData} 
                    innerRadius={70} 
                    outerRadius={95} 
                    paddingAngle={8} 
                    dataKey="value" 
                    stroke="none"
                  >
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '16px' }} 
                    itemStyle={{ fontWeight: '900', fontSize: '12px', textTransform: 'uppercase' }}
                    formatter={(value: number) => `${currencySymbol}${value.toLocaleString()}`} 
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-400">
                 <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-3xl opacity-20">📊</div>
                 <p className="text-xs font-black uppercase tracking-widest italic">Sin datos este periodo</p>
              </div>
            )}
           </div>
        </div>
      </div>

      <div className={`p-8 rounded-[2.5rem] border transition-all duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
         <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black italic uppercase tracking-tighter">Últimos Gastos</h3>
            <button onClick={() => onNavigateToTab('budget')} className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-xl transition-all hover:scale-105 active:scale-95">Historial Completo</button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardMovements.length === 0 ? (
              <div className="col-span-full py-16 text-center opacity-40">
                 <div className="text-4xl mb-4">🛒</div>
                 <p className="text-xs font-black uppercase tracking-widest italic">Sin movimientos recientes</p>
              </div>
            ) : (
              dashboardMovements.map(m => (
                <div key={m.id} className={`flex items-center gap-4 p-5 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-slate-950 border-white/5 hover:border-indigo-500/30' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 hover:shadow-lg'}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border ${m.type === 'income' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                    {m.type === 'income' ? '💰' : 
                     (m.category === 'Alimentación' || m.category === Category.NEEDS ? '🍔' : 
                      m.category === 'Transporte' ? '🚗' : 
                      m.category === Category.WANTS ? '🎮' : '🛒')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black uppercase truncate ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{m.note || m.category}</p>
                    <div className="flex items-center gap-2">
                       <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em]">{m.category}</p>
                       {m.type === 'income' && <span className="text-[7px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded-full uppercase font-black">Ingreso</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-black italic ${m.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {m.type === 'income' ? '+' : '-'}{currencySymbol}{m.amount.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
         </div>
      </div>
      {showSummary && <FinancialSummary profile={profile} expenses={expenses} onClose={() => setShowSummary(false)} onGoToPlan={() => { setShowSummary(false); onNavigateToTab('budget'); }} isDarkMode={isDarkMode} />}
    </div>
  );
};

const QuickExpenseForm: React.FC<{ 
  onSubmit: (a: number, c: Category, d: string, f: boolean, freq?: Frequency) => void, 
  onAddIncome: (a: number, c: string, d: string) => void,
  isDarkMode: boolean, 
  preSelectedCat: Category,
  onCatChange: (c: Category) => void,
  currencySymbol: string
}> = ({ onSubmit, onAddIncome, isDarkMode, preSelectedCat, onCatChange, currencySymbol }) => {
  const [amount, setAmount] = React.useState('');
  const [desc, setDesc] = React.useState('');
  const [isFixed, setIsFixed] = React.useState(false);
  const [frequency, setFrequency] = React.useState<Frequency>(Frequency.MONTHLY);
  const [mode, setMode] = React.useState<'expense' | 'income'>('expense');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc) return;
    const numAmount = parseFloat(amount);
    if (mode === 'expense') {
      onSubmit(numAmount, preSelectedCat, desc, isFixed, isFixed ? frequency : undefined);
    } else {
      onAddIncome(numAmount, 'Ingreso', desc);
    }
    setAmount(''); setDesc(''); setIsFixed(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
        <button type="button" onClick={() => setMode('expense')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${mode === 'expense' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500'}`}>Gasto</button>
        <button type="button" onClick={() => setMode('income')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${mode === 'income' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500'}`}>Ingreso</button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">{currencySymbol}</span>
          <input type="number" placeholder="Monto" required value={amount} onChange={e => setAmount(e.target.value)} className={`w-full border-none rounded-xl p-3 pl-8 outline-none ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50'}`} />
        </div>
        {mode === 'expense' ? (
          <select value={preSelectedCat} onChange={e => onCatChange(e.target.value as Category)} className={`border-none rounded-xl p-3 outline-none ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50'}`}>
            <option value={Category.NEEDS}>Necesidad</option><option value={Category.WANTS}>Deseo</option><option value={Category.SAVINGS}>Ahorro</option>
          </select>
        ) : (
          <div className={`flex items-center justify-center rounded-xl p-3 ${isDarkMode ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'} font-black text-[10px] uppercase tracking-widest`}>💸 Depósito</div>
        )}
      </div>
      <input type="text" placeholder={mode === 'expense' ? "¿En qué gastaste?" : "¿De dónde vino el dinero?"} required value={desc} onChange={e => setDesc(e.target.value)} className={`w-full border-none rounded-xl p-3 outline-none ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50'}`} />
      
      {mode === 'expense' && (
        <div className="flex flex-col gap-3 px-2">
          <div className="flex items-center gap-2"><input type="checkbox" id="isFixed" checked={isFixed} onChange={e => setIsFixed(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" /><label htmlFor="isFixed" className="text-xs font-bold uppercase text-slate-500 cursor-pointer">Gasto Fijo Recurrente</label></div>
          {isFixed && (
            <div className="animate-in slide-in-from-left-2 duration-300">
               <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Frecuencia</label>
               <div className="grid grid-cols-3 gap-2">
                  {Object.entries(FREQUENCY_LABELS).map(([key, label]) => <button key={key} type="button" onClick={() => setFrequency(key as Frequency)} className={`py-2 text-[10px] font-black uppercase rounded-lg border transition-all ${frequency === key ? 'bg-indigo-600 text-white border-indigo-600' : isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-white text-slate-600 border-slate-200'}`}>{label}</button>)}
               </div>
            </div>
          )}
        </div>
      )}
      
      <button type="submit" className={`w-full ${mode === 'expense' ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20'} text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg transition-all active:scale-95`}>
        {mode === 'expense' ? 'Alimentar Racha' : 'Cargar Fondos'}
      </button>
    </form>
  );
};

export default Dashboard;
