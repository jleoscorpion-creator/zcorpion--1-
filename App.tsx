
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { UserProfile, Expense, Frequency, Category, SavingsGoal } from './types';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import BudgetDetails from './components/BudgetDetails';
import AIChat from './components/AIChat';
import Academy from './components/Academy';
import Settings from './components/Settings';
import Social from './components/Social';
import ProfilePage from './components/ProfilePage';
import Tutorial from './components/Tutorial';
import PremiumUnlock from './components/PremiumUnlock';
import { motion } from 'motion/react';
import { FREQUENCY_LABELS, CURRENCY_SYMBOLS } from './constants';

const TICKER_TEXT = [
  "DOMINA TUS FINANZAS CON ZCORPION",
  "NUEVO: MUNDO CRYPTO DESBLOQUEADO en la ACADEMY",
  "AHORRA EL 20% DE TU INGRESO MENSUAL",
  "EL INTERÉS COMPUESTO ES TU MEJOR AMIGO",
  "SÉ UN ZCORPION: INTELIGENCIA Y DISCIPLINA",
  "Z-PRO: ANÁLISIS DE ACCIONES AHORA DISPONIBLE"
];

const App: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budget' | 'chat' | 'academy' | 'social' | 'profile' | 'settings'>('dashboard');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [lastChatActivity, setLastChatActivity] = useState<number>(Date.now());
  const [isChatting, setIsChatting] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('finanza_dark_mode') === 'true';
  });

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  useEffect(() => {
    const savedProfile = localStorage.getItem('finanza_profile');
    const savedExpenses = localStorage.getItem('finanza_expenses');
    const savedGoals = localStorage.getItem('finanza_goals');
    const hasSeenTutorial = localStorage.getItem('finanza_tutorial_seen');
    
    let currentProfile: UserProfile | null = savedProfile ? JSON.parse(savedProfile) : null;
    const currentExpenses: Expense[] = savedExpenses ? JSON.parse(savedExpenses) : [];

    if (currentProfile) {
      if (!hasSeenTutorial) setShowTutorial(true);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (currentProfile.lastStreakDate) {
        const lastStreak = new Date(currentProfile.lastStreakDate);
        lastStreak.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today.getTime() - lastStreak.getTime()) / (1000 * 3600 * 24));
        if (diffDays > 1) currentProfile.streak = 0;
      }

      if (currentProfile.xp === undefined) currentProfile.xp = 0;
      if (currentProfile.lives === undefined) currentProfile.lives = 5;
      if (currentProfile.level === undefined) currentProfile.level = 1;
      if (currentProfile.isPremium === undefined) currentProfile.isPremium = false;
      if (currentProfile.completedLessons === undefined) currentProfile.completedLessons = [];
      if (currentProfile.friends === undefined) currentProfile.friends = [];
      if (currentProfile.friendRequests === undefined) currentProfile.friendRequests = ['User_01', 'SmartSaver_99'];
      if (currentProfile.onboardingSeen === undefined) currentProfile.onboardingSeen = [];
      if (currentProfile.portfolio === undefined) currentProfile.portfolio = [];

      if (currentProfile.lives < 5) {
        const lastRegen = currentProfile.lastLifeRegenTime ? new Date(currentProfile.lastLifeRegenTime) : new Date();
        const now = new Date();
        const diffMinutes = Math.floor((now.getTime() - lastRegen.getTime()) / (1000 * 60));
        const livesToAdd = Math.floor(diffMinutes / 30);
        
        if (livesToAdd > 0) {
          currentProfile.lives = Math.min(5, currentProfile.lives + livesToAdd);
          // Set to the exact timestamp of the last life added to avoid losing partial progress
          currentProfile.lastLifeRegenTime = new Date(lastRegen.getTime() + livesToAdd * 30 * 60 * 1000).toISOString();
        }
      } else {
        currentProfile.lastLifeRegenTime = new Date().toISOString();
      }

      currentProfile.lastLoginDate = new Date().toISOString();
      setProfile(currentProfile);
    }
    
    if (savedExpenses) setExpenses(currentExpenses);
    if (savedGoals) setGoals(JSON.parse(savedGoals));

    const savedChat = localStorage.getItem('finanza_chat_messages');
    const savedChatTime = localStorage.getItem('finanza_chat_time');
    if (savedChat && savedChatTime) {
      // Remove the 30-minute expiration as requested ("keep information same even if refreshed")
      setChatMessages(JSON.parse(savedChat));
      setLastChatActivity(parseInt(savedChatTime));
    }
  }, []);

  useEffect(() => {
    if (profile && !profile.isPremium && profile.lives < 5) {
      const timer = setInterval(() => {
        const lastRegen = profile.lastLifeRegenTime ? new Date(profile.lastLifeRegenTime) : new Date();
        const now = new Date();
        const diffMs = now.getTime() - lastRegen.getTime();
        const thirtyMinsInMs = 30 * 60 * 1000;

        if (diffMs >= thirtyMinsInMs) {
          const livesToAdd = Math.floor(diffMs / thirtyMinsInMs);
          const newLives = Math.min(5, profile.lives + livesToAdd);
          handleUpdateProfile({ 
            lives: newLives, 
            lastLifeRegenTime: new Date(lastRegen.getTime() + livesToAdd * thirtyMinsInMs).toISOString() 
          });
        }
      }, 30000); // Check every 30s
      return () => clearInterval(timer);
    }
  }, [profile]);

  useEffect(() => {
    if (profile) localStorage.setItem('finanza_profile', JSON.stringify(profile));
    if (expenses.length >= 0) localStorage.setItem('finanza_expenses', JSON.stringify(expenses));
    if (goals.length >= 0) localStorage.setItem('finanza_goals', JSON.stringify(goals));
    localStorage.setItem('finanza_dark_mode', isDarkMode.toString());
    
    if (chatMessages.length > 0) {
      localStorage.setItem('finanza_chat_messages', JSON.stringify(chatMessages));
      localStorage.setItem('finanza_chat_time', lastChatActivity.toString());
    }
  }, [profile, expenses, goals, isDarkMode, chatMessages, lastChatActivity]);

  // Added: Logic for life regeneration countdown
  const [regenCountdown, setRegenCountdown] = useState<string>("");

  useEffect(() => {
    if (profile && !profile.isPremium && profile.lives < 5) {
      const updateCountdown = () => {
        const lastRegen = profile.lastLifeRegenTime ? new Date(profile.lastLifeRegenTime) : new Date();
        const now = new Date();
        const diffMs = now.getTime() - lastRegen.getTime();
        const thirtyMinsInMs = 30 * 60 * 1000;
        
        // Time until NEXT life
        const remainingMs = thirtyMinsInMs - (diffMs % thirtyMinsInMs);
        const mins = Math.floor(remainingMs / 60000);
        const secs = Math.floor((remainingMs % 60000) / 1000);
        setRegenCountdown(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      };

      updateCountdown();
      const timer = setInterval(updateCountdown, 1000);
      return () => clearInterval(timer);
    } else {
      setRegenCountdown("");
    }
  }, [profile]);

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
    const newXP = profile.xp + xpGained;
    const newLevel = Math.floor(newXP / 1000) + 1; // 1000 XP per level
    
    setProfile({ 
      ...profile, 
      ...streakUpdate, 
      xp: newXP, 
      level: newLevel,
      completedLessons: newCompleted 
    });
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => { 
    if (profile) {
      const newProfile = { ...profile, ...updates };
      
      // Handle premium unlimited lives
      if (newProfile.isPremium) {
        newProfile.lives = 99; // Represent unlimited
      } else if (newProfile.lives > 5) {
        newProfile.lives = 5;
      }

      if (!newProfile.isPremium && newProfile.lives < 5 && (profile.lives >= 5 || !profile.lastLifeRegenTime)) {
        newProfile.lastLifeRegenTime = new Date().toISOString();
      }
      setProfile(newProfile);
    }
  };

  const handleOnboardingComplete = (key: string) => {
    if (!profile) return;
    const seen = profile.onboardingSeen || [];
    if (!seen.includes(key)) {
      handleUpdateProfile({
        onboardingSeen: [...seen, key]
      });
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isChatting || !profile) return;

    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    let currentChatCount = profile.chatCount || 0;
    let lastReset = profile.lastChatReset || now;

    // Reset if 24 hours passed
    if (now - lastReset > dayInMs) {
      currentChatCount = 0;
      lastReset = now;
    }

    // Check limit for non-premium
    if (!profile.isPremium && currentChatCount >= 7) {
      setChatMessages(prev => [...prev, 
        { role: 'user', text }, 
        { role: 'model', text: "Has alcanzado el límite de 7 consultas diarias. Desbloquea PREMIUM para acceso ilimitado y consejos financieros avanzados." }
      ]);
      return;
    }
    
    const newMsgs: {role: 'user' | 'model', text: string}[] = [...chatMessages, { role: 'user', text }];
    setChatMessages(newMsgs);
    setLastChatActivity(Date.now());
    setIsChatting(true);

    // Update profile chat count
    handleUpdateProfile({ 
      chatCount: currentChatCount + 1,
      lastChatReset: lastReset
    });

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const contextSummary = `Income: ${profile.income} ${profile.currency} (${profile.frequency}). Expenses: ${JSON.stringify(expenses.slice(-20))}. Goals: ${JSON.stringify(goals)}.`;
      
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: `Eres Zcorpion, un mentor financiero de élite. Tu estilo es minimalista, quirúrgico, pero profundamente MOTIVADOR y ASPIRACIONAL.
TU MISIÓN: Ayudar al usuario a alcanzar la libertad financiera. Tus respuestas deben ser chispas de inspiración y estrategia.
MOTIVACIÓN: Usa un tono que empodere al usuario. Felicítalo por sus metas y anímalo a ahorrar y DIVERSIFICAR (menciona inversiones, fondos o activos si es pertinente).
REGLAS DE FORMATO:
- Responde en máximo 3-4 oraciones impactantes.
- Estructura: Un insight potente y máximo 2 puntos de acción (usa 🔥 o 💎).
- No uses saludos ni despedidas genéricas.
- Usa MAYÚSCULAS para enfatizar conceptos de riqueza y disciplina.
CONTEXTO ACTUAL: ${contextSummary}.
Responde en español de forma ultra-concisa pero vibrante.`
        }
      });

      const response = await chat.sendMessage({ message: text });
      const botText = response.text || "Lo siento, tuve un problema analizando eso.";
      setChatMessages([...newMsgs, { role: 'model', text: botText }]);
    } catch (err) {
      console.error(err);
      setChatMessages([...newMsgs, { role: 'model', text: "Ocurrió un error con la conexión a la IA." }]);
    } finally {
      setIsChatting(false);
    }
  };

  const resetChat = () => {
    if (window.confirm('¿Quieres reiniciar la conversación? Esto borrará el historial actual.')) {
      setChatMessages([]);
      localStorage.removeItem('finanza_chat_messages');
      localStorage.removeItem('finanza_chat_time');
    }
  };

  const unlockPremium = () => {
    handleUpdateProfile({ isPremium: true });
    setShowUnlockModal(false);
  };

  const deleteExpense = (id: string) => setExpenses(expenses.filter(e => e.id !== id));
  const updateGoals = (newGoals: SavingsGoal[]) => setGoals(newGoals);
  const logout = () => { localStorage.clear(); setProfile(null); setExpenses([]); setGoals([]); setActiveTab('dashboard'); };

  if (!profile) return <Onboarding onComplete={(u, i, f, c) => {
    const p: UserProfile = { 
      username: u, income: i, frequency: f, currency: c, streak: 0, xp: 0, lives: 5, completedLessons: [],
      level: 1, isPremium: false,
      lastLoginDate: new Date().toISOString(), lastStreakDate: undefined,
      lastLifeRegenTime: new Date().toISOString(), friends: [], friendRequests: [],
      onboardingSeen: []
    };
    setProfile(p);
    setShowTutorial(true);
  }} />;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900 font-sans'}`}>
      {showTutorial && <Tutorial onComplete={() => { setShowTutorial(false); localStorage.setItem('finanza_tutorial_seen', 'true'); }} isDarkMode={isDarkMode} />}
      {showUnlockModal && <PremiumUnlock onUnlock={unlockPremium} onClose={() => setShowUnlockModal(false)} isDarkMode={isDarkMode} />}
      
      <header className={`border-b sticky top-0 z-30 flex flex-col transition-colors ${isDarkMode ? 'bg-slate-900/80 border-slate-800 shadow-xl backdrop-blur-md' : 'bg-white/95 border-slate-200 shadow-md backdrop-blur-md'}`}>
        {/* Ticker Bar */}
        <div className={`overflow-hidden py-1 border-b ${isDarkMode ? 'bg-indigo-950/30 border-white/5' : 'bg-indigo-50 border-indigo-100'}`}>
          <motion.div 
            animate={{ x: ["100%", "-100%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex whitespace-nowrap gap-12"
          >
            {[...TICKER_TEXT, ...TICKER_TEXT].map((text, i) => (
              <span key={i} className="text-[10px] font-black italic uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                <span className="w-1 h-1 bg-indigo-500 rounded-full" />
                {text}
              </span>
            ))}
          </motion.div>
        </div>

        <div className="px-6 py-4 flex items-center justify-between w-full overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex items-center gap-3 shrink-0 mr-4">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-xl shadow-indigo-600/30 rotate-3 shrink-0">ZC</div>
            <h1 className="text-2xl font-black tracking-tighter italic uppercase text-indigo-600 dark:text-indigo-400 shrink-0">ZCORPION</h1>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
            {!profile.isPremium && (
              <button 
                onClick={() => setShowUnlockModal(true)}
                className="group flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 p-[2px] rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
              >
                <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} px-4 py-2 rounded-[14px] flex items-center gap-2`}>
                  <span className={`text-[11px] font-black tracking-widest uppercase ${isDarkMode ? 'text-white' : 'text-slate-900 font-bold'}`}>Desbloquear PRO</span>
                  <span className="text-sm">👑</span>
                </div>
              </button>
            )}

            <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border shadow-sm shrink-0 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
               <div className="flex items-center gap-1.5">
                 <span className="text-sm text-rose-500 drop-shadow-sm">❤️</span>
                 <div className="flex flex-col">
                   <span className="text-sm font-black italic leading-none">{profile.isPremium ? '∞' : profile.lives}</span>
                   {regenCountdown && (
                     <span className="text-[7px] font-black opacity-40 uppercase tracking-tighter leading-none mt-0.5">{regenCountdown}</span>
                   )}
                 </div>
               </div>
               <div className={`w-px h-4 mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
               <div className="flex items-center gap-1.5">
                 <span className="text-sm text-amber-500 drop-shadow-sm">⭐</span>
                 <span className="text-sm font-black italic">{profile.xp}</span>
               </div>
            </div>

            <button onClick={() => setActiveTab('profile')} className={`p-1.5 rounded-2xl border-2 transition-all shrink-0 ${isDarkMode ? 'bg-slate-800 border-indigo-900 shadow-indigo-900/20' : 'bg-white border-indigo-50 shadow-indigo-600/10 shadow-xl'}`}>
               <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden flex items-center justify-center text-sm text-white font-black uppercase">
                 {profile.username[0]}
               </div>
            </button>
          </div>
        </div>
    </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-8 mb-24 overflow-x-hidden">
        {activeTab === 'dashboard' && (
          <Dashboard 
            profile={profile} 
            expenses={expenses} 
            onAddExpense={addExpense} 
            onNavigateToTab={(tab) => setActiveTab(tab)} 
            isDarkMode={isDarkMode}
            canInstall={!!deferredPrompt}
            onInstall={handleInstallClick}
            onCompleteOnboarding={handleOnboardingComplete}
          />
        )}
        {activeTab === 'budget' && <BudgetDetails profile={profile} expenses={expenses} onDeleteExpense={deleteExpense} isDarkMode={isDarkMode} />}
        {activeTab === 'chat' && (
          <AIChat 
            profile={profile} 
            expenses={expenses} 
            goals={goals} 
            onUpdateGoals={updateGoals} 
            isDarkMode={isDarkMode} 
            messages={chatMessages}
            isChatting={isChatting}
            onSendMessage={handleSendMessage}
            onResetChat={resetChat}
          />
        )}
        {activeTab === 'academy' && <Academy profile={profile} onUpdateProfile={handleUpdateProfile} onCompleteLesson={completeLesson} isDarkMode={isDarkMode} onCompleteOnboarding={handleOnboardingComplete} />}
        {activeTab === 'social' && <Social profile={profile} onUpdateProfile={handleUpdateProfile} isDarkMode={isDarkMode} />}
        {activeTab === 'profile' && (
          <ProfilePage 
            profile={profile} 
            expenses={expenses} 
            onUpdateProfile={handleUpdateProfile} 
            isDarkMode={isDarkMode} 
            onLogout={logout} 
            onNavigateToTab={(t) => setActiveTab(t as any)} 
            canInstall={!!deferredPrompt}
            onInstall={handleInstallClick}
          />
        )}
        {activeTab === 'settings' && <Settings profile={profile} onUpdateProfile={handleUpdateProfile} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} onLogout={logout} />}
      </main>

      <nav className={`fixed bottom-8 left-6 right-6 max-w-4xl mx-auto rounded-[3rem] border p-2 z-50 transition-all duration-500 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] backdrop-blur-3xl ${isDarkMode ? 'bg-slate-950/80 border-white/10' : 'bg-white/95 border-slate-200'}`}>
        <div className="flex justify-start md:justify-around items-center px-4 overflow-x-auto no-scrollbar gap-2">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => setActiveTab('dashboard')} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} 
            label="Inicio" 
          />
          <NavButton 
            active={activeTab === 'budget'} 
            onClick={() => setActiveTab('budget')} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>} 
            label="Plan" 
          />
          <NavButton 
            active={activeTab === 'chat'} 
            onClick={() => {
              if (activeTab === 'chat' && chatMessages.length > 0) {
                resetChat();
              } else {
                setActiveTab('chat');
              }
            }} 
            icon={<div className="relative"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>{!profile.isPremium && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />}</div>} 
            label="Zcorp IA" 
          />
          <NavButton 
            active={activeTab === 'academy'} 
            onClick={() => setActiveTab('academy')} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} 
            label="Z-Academy" 
          />
          <NavButton 
            active={activeTab === 'profile' || activeTab === 'settings'} 
            onClick={() => setActiveTab('profile')} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM4.5 18a8.5 8.5 0 0115 0" /></svg>} 
            label="Mi Perfil" 
          />
        </div>
      </nav>
    </div>
  );
};

const PremiumLockedView: React.FC<{ onUnlock: () => void; isDarkMode: boolean; feature: string }> = ({ onUnlock, isDarkMode, feature }) => (
  <div className="flex flex-col items-center justify-center py-20 animate-in zoom-in duration-500">
    <div className="w-24 h-24 bg-gradient-to-tr from-amber-400 to-rose-500 rounded-[2.5rem] flex items-center justify-center mb-8 shadow-2xl shadow-orange-500/20 rotate-3">
       <div className="bg-slate-950 p-4 rounded-3xl">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
       </div>
    </div>
    <h3 className={`text-4xl font-black italic uppercase tracking-tighter mb-2 text-center ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{feature}</h3>
    <p className="text-slate-500 font-medium mb-10 text-center max-w-sm px-6">Esta función requiere una suscripción Zcorp Premium activa. Obtén acceso completo y personalizado.</p>
    <button 
      onClick={onUnlock}
      className="bg-indigo-600 text-white px-10 py-5 rounded-[2rem] font-black uppercase italic tracking-widest shadow-xl shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all"
    >
      Desbloquear Ahora
    </button>
  </div>
);

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-2 transition-all px-6 py-3.5 rounded-[2rem] min-w-[100px] flex-shrink-0 ${active ? 'text-indigo-600 bg-indigo-50/80 dark:bg-indigo-900/40 shadow-inner' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-white/5'}`}>
    <div className={`transition-transform duration-300 ${active ? 'scale-125' : 'scale-100'}`}>{icon}</div>
    <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
  </button>
);

export default App;

