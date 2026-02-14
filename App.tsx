
import React, { useState, useEffect } from 'react';
import { UserProfile, Expense, Frequency, Category, SavingsGoal } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import BudgetDetails from './components/BudgetDetails';
import AIChat from './components/AIChat';
import Academy from './components/Academy';
import Settings from './components/Settings';
import Tutorial from './components/Tutorial';
import { FREQUENCY_LABELS, CURRENCY_SYMBOLS } from './constants';

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budget' | 'chat' | 'academy' | 'settings'>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('finanza_dark_mode') === 'true';
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem('finanza_profile');
    const savedExpenses = localStorage.getItem('finanza_expenses');
    const savedGoals = localStorage.getItem('finanza_goals');
    const hasSeenTutorial = localStorage.getItem('finanza_tutorial_seen');
    
    let currentProfile: UserProfile | null = savedProfile ? JSON.parse(savedProfile) : null;
    const currentExpenses: Expense[] = savedExpenses ? JSON.parse(savedExpenses) : [];

    if (currentProfile) {
      if (!hasSeenTutorial) setShowTutorial(true);

      // Lógica de Racha Diaria al Cargar
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (currentProfile.lastStreakDate) {
        const lastStreak = new Date(currentProfile.lastStreakDate);
        lastStreak.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastStreak.getTime()) / (1000 * 3600 * 24));
        if (diffDays > 1) currentProfile.streak = 0;
      } else if (currentProfile.streak > 0) {
        currentProfile.streak = 0;
      }

      // Inicializar gamificación si no existe
      if (currentProfile.xp === undefined) currentProfile.xp = 0;
      if (currentProfile.lives === undefined) currentProfile.lives = 5;
      if (currentProfile.completedLessons === undefined) currentProfile.completedLessons = [];

      currentProfile.lastLoginDate = new Date().toISOString();
      setProfile(currentProfile);
    }
    
    if (savedExpenses) setExpenses(currentExpenses);
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, []);

  useEffect(() => {
    if (profile) localStorage.setItem('finanza_profile', JSON.stringify(profile));
    if (expenses.length >= 0) localStorage.setItem('finanza_expenses', JSON.stringify(expenses));
    if (goals.length >= 0) localStorage.setItem('finanza_goals', JSON.stringify(goals));
    localStorage.setItem('finanza_dark_mode', isDarkMode.toString());
  }, [profile, expenses, goals, isDarkMode]);

  const updateStreak = (currentProfile: UserProfile) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let newStreak = currentProfile.streak;
    let newLastStreakDate = currentProfile.lastStreakDate;

    if (!currentProfile.lastStreakDate) {
      newStreak = 1;
      newLastStreakDate = today.toISOString();
    } else {
      const lastStreak = new Date(currentProfile.lastStreakDate);
      lastStreak.setHours(0, 0, 0, 0);
      const diffDays = Math.floor((today.getTime() - lastStreak.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 1) {
        newStreak += 1;
        newLastStreakDate = today.toISOString();
      } else if (diffDays > 1) {
        newStreak = 1;
        newLastStreakDate = today.toISOString();
      }
    }
    return { streak: newStreak, lastStreakDate: newLastStreakDate };
  };

  const addExpense = (amount: number, category: Category, description: string, isFixed: boolean, frequency?: Frequency) => {
    if (!profile) return;
    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      amount, category, description, isFixed,
      frequency: isFixed ? (frequency || profile.frequency) : undefined,
      date: new Date().toISOString()
    };
    setExpenses([...expenses, newExpense]);
    const streakUpdate = updateStreak(profile);
    setProfile({ ...profile, ...streakUpdate });
  };

  const completeLesson = (lessonId: string, xpGained: number) => {
    if (!profile) return;
    const streakUpdate = updateStreak(profile);
    const newCompleted = [...new Set([...profile.completedLessons, lessonId])];
    setProfile({ 
      ...profile, 
      ...streakUpdate, 
      xp: profile.xp + xpGained, 
      completedLessons: newCompleted 
    });
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => { if (profile) setProfile({ ...profile, ...updates }); };
  const deleteExpense = (id: string) => setExpenses(expenses.filter(e => e.id !== id));
  const updateGoals = (newGoals: SavingsGoal[]) => setGoals(newGoals);
  const logout = () => { localStorage.clear(); setProfile(null); setExpenses([]); setGoals([]); setActiveTab('dashboard'); };

  if (!profile) return <Onboarding onComplete={(u, i, f, c) => {
    const p: UserProfile = { 
      username: u, 
      income: i, 
      frequency: f, 
      currency: c, 
      streak: 0, 
      xp: 0, 
      lives: 5, 
      completedLessons: [],
      lastLoginDate: new Date().toISOString(), 
      lastStreakDate: undefined
    };
    setProfile(p);
    setShowTutorial(true);
  }} />;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {showTutorial && <Tutorial onComplete={() => { setShowTutorial(false); localStorage.setItem('finanza_tutorial_seen', 'true'); }} isDarkMode={isDarkMode} />}
      
      <header className={`border-b sticky top-0 z-30 px-6 py-4 flex items-center justify-between transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-slate-100 shadow-sm'}`}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-xs">ZC</div>
          <h1 className="text-xl font-black tracking-tight italic uppercase">ZCORPION</h1>
        </div>
        <div className="flex items-center gap-3">
           <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
              <span className="text-xs">⭐</span>
              <span className="text-xs font-black">{profile.xp}</span>
           </div>
           <button onClick={() => setActiveTab('settings')} className={`p-2 rounded-xl border-2 transition-all ${isDarkMode ? 'bg-slate-800 border-indigo-900' : 'bg-slate-50 border-indigo-50'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
           </button>
        </div>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 mb-24">
        {activeTab === 'dashboard' && <Dashboard profile={profile} expenses={expenses} onAddExpense={addExpense} onNavigateToTab={(tab) => setActiveTab(tab)} isDarkMode={isDarkMode} />}
        {activeTab === 'budget' && <BudgetDetails profile={profile} expenses={expenses} onDeleteExpense={deleteExpense} isDarkMode={isDarkMode} />}
        {activeTab === 'chat' && <AIChat profile={profile} expenses={expenses} goals={goals} onUpdateGoals={updateGoals} isDarkMode={isDarkMode} />}
        {activeTab === 'academy' && <Academy profile={profile} onUpdateProfile={handleUpdateProfile} onCompleteLesson={completeLesson} isDarkMode={isDarkMode} />}
        {activeTab === 'settings' && <Settings isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} onLogout={logout} profile={profile} onUpdateProfile={handleUpdateProfile} />}
      </main>

      <nav className={`fixed bottom-0 left-0 right-0 border-t p-2 md:p-4 z-40 transition-colors backdrop-blur-md ${isDarkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'}`}>
        <div className="max-w-xl mx-auto flex justify-around">
          <NavButton active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} label="Inicio" />
          <NavButton active={activeTab === 'budget'} onClick={() => setActiveTab('budget')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>} label="Plan" />
          <NavButton active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>} label="Chat AI" />
          <NavButton active={activeTab === 'academy'} onClick={() => setActiveTab('academy')} icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} label="Aprender" />
        </div>
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all px-4 py-2 rounded-2xl ${active ? 'text-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/30' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>
    {icon}
    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
  </button>
);

export default App;
