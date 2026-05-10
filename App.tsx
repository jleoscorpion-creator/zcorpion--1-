
import React, { useState, useEffect } from 'react';
import { UserProfile, Expense, Frequency, Category, SavingsGoal, Movement } from './types';
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
import LivesPurchaseModal from './components/LivesPurchaseModal';
import { motion, AnimatePresence } from 'motion/react';
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
  const [isLoading, setIsLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showLivesModal, setShowLivesModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'budget' | 'chat' | 'academy' | 'social' | 'profile' | 'settings'>('dashboard');
  const [notification, setNotification] = useState<{title: string, message: string, type: 'success' | 'warning' | 'info'} | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [savedChats, setSavedChats] = useState<SavedChat[]>(() => {
    const saved = localStorage.getItem('finanza_saved_chats');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastChatActivity, setLastChatActivity] = useState<number>(Date.now());
  const [isChatting, setIsChatting] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('finanza_dark_mode');
    return saved === null ? true : saved === 'true';
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
      if (currentProfile.watchlist === undefined) currentProfile.watchlist = [];
      if (currentProfile.walletBalance === undefined) currentProfile.walletBalance = currentProfile.income;
      if (currentProfile.movements === undefined) currentProfile.movements = [];
      if (currentProfile.spent === undefined) currentProfile.spent = 0;
      if (currentProfile.lastResetDate === undefined) currentProfile.lastResetDate = new Date().toISOString();
      if (currentProfile.budgetSplit === undefined) {
        currentProfile.budgetSplit = { needs: 0.5, wants: 0.3, savings: 0.2 };
      }
      
      if (currentProfile.diamonds === undefined) currentProfile.diamonds = 0;
      if (currentProfile.claimedLessonTier1 === undefined) currentProfile.claimedLessonTier1 = false;
      if (currentProfile.claimedLessonTier2 === undefined) currentProfile.claimedLessonTier2 = false;
      if (currentProfile.lastCycleRewardId === undefined) currentProfile.lastCycleRewardId = "";
      
      // Consolidate goals into profile
      if (currentProfile.savingsGoals === undefined || currentProfile.savingsGoals.length === 0) {
        currentProfile.savingsGoals = savedGoals ? JSON.parse(savedGoals) : [];
      }
      setGoals(currentProfile.savingsGoals);

      // Logic to check if we should reset based on frequency
      const lastReset = currentProfile.lastResetDate ? new Date(currentProfile.lastResetDate) : new Date();
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));
      
      let shouldReset = false;
      if (currentProfile.frequency === Frequency.WEEKLY && diffDays >= 7) shouldReset = true;
      if (currentProfile.frequency === Frequency.BIWEEKLY && diffDays >= 14) shouldReset = true;
      if (currentProfile.frequency === Frequency.MONTHLY && diffDays >= 30) shouldReset = true;

      if (shouldReset) {
        // Achievement check before reset
        if (currentProfile.spent <= currentProfile.income) {
          setNotification({
            title: "¡CICLO PERFECTO! 🦂",
            message: "Has completado tu ciclo sin exceder tu presupuesto. ¡Bien hecho, sigue así!",
            type: 'success'
          });
        }

        currentProfile.spent = 0;
        currentProfile.movements = []; 
        currentProfile.lastResetDate = now.toISOString();
        // Optionally update wallet balance with new income for new period
        currentProfile.walletBalance += currentProfile.income;
      }

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

    const savedChat = localStorage.getItem('finanza_chat_messages');
    const savedChatTime = localStorage.getItem('finanza_chat_time');
    if (savedChat && savedChatTime) {
      setChatMessages(JSON.parse(savedChat));
      setLastChatActivity(parseInt(savedChatTime));
    }

    // Simulate initial loading for logo animation
    setTimeout(() => {
      setIsLoading(false);
    }, 2500);
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
    
    localStorage.setItem('finanza_chat_messages', JSON.stringify(chatMessages));
    localStorage.setItem('finanza_chat_time', lastChatActivity.toString());
    localStorage.setItem('finanza_saved_chats', JSON.stringify(savedChats));
  }, [profile, expenses, goals, isDarkMode, chatMessages, lastChatActivity, savedChats]);

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

    // Check budget limit for this specific category
    const categoryBudget = profile.income * (profile.budgetSplit ? (profile.budgetSplit[category.toLowerCase() as keyof typeof profile.budgetSplit] || 0) : 0);
    const categorySpent = (profile.movements || [])
      .filter(m => m.type === 'expense' && m.category === category && new Date(m.date) >= new Date(profile.lastResetDate))
      .reduce((acc, curr) => acc + curr.amount, 0);

    const willExceed = (categorySpent + amount) > categoryBudget;
    
    if (willExceed) {
      setNotification({
        title: "⚠️ ALERTA DE PRESUPUESTO",
        message: `Este gasto te hará exceder tu presupuesto de ${category.toLowerCase()}. Ten cuidado.`,
        type: 'warning'
      });
    }

    const newMovementId = Math.random().toString(36).substr(2, 9);
    const newExpense: Expense = {
      id: newMovementId,
      amount, category, description, isFixed,
      frequency: isFixed ? (frequency || profile.frequency) : undefined,
      date: new Date().toISOString()
    };
    
    setExpenses(prev => [...prev, newExpense]);
    
    const streakUpdate = updateStreak(profile);
    const newMovement: Movement = {
      id: newMovementId,
      type: 'expense',
      amount,
      category,
      date: new Date().toISOString(),
      note: description
    };

    const xpGained = willExceed ? 0 : 1;

    if (xpGained > 0) {
      setNotification({
        title: "+1 XP GANADO ⭐",
        message: "¡Buen trabajo manteniendo tu presupuesto! Has ganado 1 XP por tu disciplina.",
        type: 'success'
      });
    }

    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ...streakUpdate,
        xp: prev.xp + xpGained,
        spent: prev.spent + amount,
        walletBalance: prev.walletBalance - amount,
        movements: [newMovement, ...(prev.movements || [])]
      };
    });
  };

  const addIncome = (amount: number, category: string, description: string) => {
    if (!profile) return;
    const newMovement: Movement = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'income',
      amount,
      category,
      date: new Date().toISOString(),
      note: description
    };

    setProfile(prev => {
      if (!prev) return null;
      return {
        ...prev,
        walletBalance: prev.walletBalance + amount,
        movements: [newMovement, ...(prev.movements || [])]
      };
    });
  };

  const completeLesson = (lessonId: string, xpGained: number) => {
    if (!profile) return;
    const streakUpdate = updateStreak(profile);
    const newCompleted = [...new Set([...profile.completedLessons, lessonId])];
    const newXP = profile.xp + xpGained;
    const newLevel = Math.floor(newXP / 1000) + 1; // 1000 XP per level
    
    let bonusDiamonds = 0;
    let updateTier1 = profile.claimedLessonTier1;
    let updateTier2 = profile.claimedLessonTier2;

    if (profile.isPremium) {
      if (newCompleted.length >= 4 && !updateTier1) {
        bonusDiamonds += 5;
        updateTier1 = true;
      }
      if (newCompleted.length >= 8 && !updateTier2) {
        bonusDiamonds += 10;
        updateTier2 = true;
      }
    }

    setProfile({ 
      ...profile, 
      ...streakUpdate, 
      xp: newXP, 
      level: newLevel,
      diamonds: profile.diamonds + bonusDiamonds,
      claimedLessonTier1: updateTier1,
      claimedLessonTier2: updateTier2,
      completedLessons: newCompleted 
    });
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => { 
    setProfile(prev => {
      if (!prev) return null;
      const newProfile = { ...prev, ...updates };
      
      // Sync wallet balance if income or variable status changes
      if (updates.isVariableIncome !== undefined) {
        if (updates.isVariableIncome) {
          newProfile.walletBalance = 0;
        } else {
          newProfile.walletBalance = updates.income !== undefined ? updates.income : prev.income;
        }
      } else if (updates.income !== undefined && !newProfile.isVariableIncome) {
        newProfile.walletBalance = updates.income;
      }
      
      // Handle premium unlimited lives
      if (newProfile.isPremium) {
        newProfile.lives = 99; // Represent unlimited
      } else if (newProfile.lives > 5) {
        newProfile.lives = 5;
      }

      if (!newProfile.isPremium && newProfile.lives < 5 && (prev.lives >= 5 || !prev.lastLifeRegenTime)) {
        newProfile.lastLifeRegenTime = new Date().toISOString();
      }
      return newProfile;
    });
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

  const handleSendMessage = async (text: string, payWithXP: boolean = false) => {
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
    if (!profile.isPremium && currentChatCount >= 7 && !payWithXP) {
      setChatMessages(prev => [...prev, 
        { role: 'user', text }, 
        { role: 'model', text: "Has alcanzado el límite de 7 consultas diarias gratis. Puedes pagar 25 XP para realizar esta consulta o esperar a mañana." }
      ]);
      return;
    }
    
    // Deduct XP if paying
    if (!profile.isPremium && currentChatCount >= 7 && payWithXP) {
      if (profile.xp < 25) {
        setChatMessages(prev => [...prev, 
          { role: 'user', text }, 
          { role: 'model', text: "No tienes suficiente XP (25 ⭐ requeridos) para realizar esta consulta extra." }
        ]);
        return;
      }
      handleUpdateProfile({
        xp: profile.xp - 25
      });
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
    if (profile?.isPremium && chatMessages.length > 0) {
      if (window.confirm('¿Quieres guardar esta conversación antes de borrarla?')) {
        const firstUserMsg = chatMessages.find(m => m.role === 'user')?.text || 'Conversación';
        const title = firstUserMsg.length > 30 ? firstUserMsg.substring(0, 27) + '...' : firstUserMsg;
        const newSavedChat: SavedChat = {
          id: Math.random().toString(36).substring(2, 9),
          title: title,
          messages: [...chatMessages],
          timestamp: new Date().toISOString()
        };
        setSavedChats(prev => [newSavedChat, ...prev]);
      }
    }
    
    setChatMessages([]);
    localStorage.removeItem('finanza_chat_messages');
    localStorage.removeItem('finanza_chat_time');
  };

  const deleteSavedChat = (id: string) => {
    setSavedChats(prev => prev.filter(c => c.id !== id));
  };

  const unlockPremium = () => {
    handleUpdateProfile({ isPremium: true });
    setShowUnlockModal(false);
  };

  const deleteMovement = (id: string) => {
    if (!profile) return;
    const movement = profile.movements.find(m => m.id === id);
    if (!movement) return;

    setProfile(prev => {
      if (!prev) return null;
      const isIncome = movement.type === 'income';
      const xpDeduction = movement.type === 'expense' ? 1 : 0;
      return {
        ...prev,
        xp: Math.max(0, prev.xp - xpDeduction),
        walletBalance: isIncome ? prev.walletBalance - movement.amount : prev.walletBalance + movement.amount,
        spent: isIncome ? prev.spent : prev.spent - movement.amount,
        movements: prev.movements.filter(m => m.id !== id)
      };
    });

    if (movement.type === 'expense') {
      setExpenses(prev => prev.filter(e => e.id !== id));
    }
  };

  const editMovement = (id: string, updates: Partial<Movement>) => {
    if (!profile) return;
    const movement = profile.movements.find(m => m.id === id);
    if (!movement) return;

    setProfile(prev => {
      if (!prev) return null;
      const newMovements = prev.movements.map(m => {
        if (m.id === id) {
          const updated = { ...m, ...updates };
          return updated;
        }
        return m;
      });

      // Recalculate balance and spent
      // (This is a simplified approach, usually we track the diff)
      const oldAmount = movement.amount;
      const newAmount = updates.amount !== undefined ? updates.amount : oldAmount;
      const diff = newAmount - oldAmount;

      let newBalance = prev.walletBalance;
      let newSpent = prev.spent;

      if (movement.type === 'income') {
        newBalance += diff;
      } else {
        newBalance -= diff;
        newSpent += diff;
      }

      return {
        ...prev,
        walletBalance: newBalance,
        spent: newSpent,
        movements: newMovements
      };
    });

    if (movement.type === 'expense' && (updates.amount !== undefined || updates.category !== undefined || updates.note !== undefined)) {
      setExpenses(prev => prev.map(e => {
        if (e.id === id) {
          return { 
            ...e, 
            amount: updates.amount !== undefined ? updates.amount : e.amount,
            category: (updates.category as any) || e.category,
            description: updates.note !== undefined ? updates.note : e.description
          };
        }
        return e;
      }));
    }
  };

  const deleteExpense = (id: string) => {
    deleteMovement(id);
  };
  const updateGoals = (newGoals: SavingsGoal[]) => {
    // Check if any goal was completed
    if (profile) {
      newGoals.forEach(newGoal => {
        const oldGoal = profile.savingsGoals?.find(g => g.id === newGoal.id);
        if (newGoal.currentAmount >= newGoal.targetAmount && (!oldGoal || oldGoal.currentAmount < oldGoal.targetAmount)) {
          setNotification({
            title: "🎯 META ALCANZADA",
            message: "¡Felicidades! Has completado tu meta de ahorro. Tu disciplina está rindiendo frutos.",
            type: 'success'
          });
        }
      });
    }
    
    setGoals(newGoals);
    if (profile) {
      setProfile({ ...profile, savingsGoals: newGoals });
    }
  };
  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const logout = () => { localStorage.clear(); setProfile(null); setExpenses([]); setGoals([]); setActiveTab('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); setIsLoading(true); setTimeout(() => setIsLoading(false), 2000); };

  const handleBuyLives = (livesToAdd: number, cost: number) => {
    if (!profile) return;
    if (profile.xp < cost) return;
    
    // Check if we can add any lives without exceeding 5
    if (profile.isPremium || profile.lives >= 5) return;

    const newLives = Math.min(5, profile.lives + livesToAdd);
    
    handleUpdateProfile({
      xp: profile.xp - cost,
      lives: newLives
    });
    
    // Close modal if full or if they want to exit
    if (newLives >= 5) setShowLivesModal(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ 
            scale: [0.5, 1.2, 1],
            opacity: 1,
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
          className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-5xl shadow-[0_0_50px_rgba(79,70,229,0.5)] mb-8"
        >
          🦂
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-2xl font-black italic uppercase tracking-tighter text-white"
        >
          ZCORPION
        </motion.h2>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: 200 }}
          transition={{ duration: 2, ease: "easeInOut" }}
          className="h-1 bg-indigo-600 mt-6 rounded-full overflow-hidden"
        >
          <motion.div 
            animate={{ x: [-200, 200] }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-1/2 h-full bg-white/50"
          />
        </motion.div>
      </div>
    );
  }

  if (!profile) return <Onboarding onComplete={(u, i, f, c, v) => {
    const p: UserProfile = { 
      username: u, income: i, frequency: f, currency: c, streak: 0, xp: 0, lives: 5, completedLessons: [],
      level: 1, isPremium: false,
      lastLoginDate: new Date().toISOString(), lastStreakDate: undefined,
      lastLifeRegenTime: new Date().toISOString(), friends: [], friendRequests: [],
      onboardingSeen: [],
      isVariableIncome: v,
      walletBalance: i,
      movements: [],
      spent: 0,
      diamonds: 0,
      lastResetDate: new Date().toISOString(),
      budgetSplit: { needs: 0.5, wants: 0.3, savings: 0.2 },
      savingsGoals: []
    };
    setProfile(p);
    setShowTutorial(true);
  }} />;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900 font-sans'}`}>
      {showTutorial && <Tutorial onComplete={() => { setShowTutorial(false); localStorage.setItem('finanza_tutorial_seen', 'true'); }} isDarkMode={isDarkMode} />}
      {showUnlockModal && <PremiumUnlock onUnlock={unlockPremium} onClose={() => setShowUnlockModal(false)} isDarkMode={isDarkMode} />}
      
      {/* Notifications Overlay */}
      <AnimatePresence>
        {notification && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              className="relative w-full max-w-sm pointer-events-auto shadow-2xl"
            >
              <div className={`p-8 rounded-[3rem] border-2 flex flex-col items-center text-center gap-5 ${
                notification.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' : 
                notification.type === 'warning' ? 'bg-rose-600 border-rose-400 text-white' : 
                'bg-indigo-600 border-indigo-400 text-white'
              }`}>
                <motion.div 
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center text-4xl shadow-inner"
                >
                  {notification.type === 'success' ? '🏆' : notification.type === 'warning' ? '⚠️' : 'ℹ️'}
                </motion.div>
                <div>
                  <h4 className="font-black italic uppercase tracking-tighter text-2xl leading-none">{notification.title}</h4>
                  <p className="text-sm font-bold opacity-90 mt-3 leading-relaxed">{notification.message}</p>
                </div>
                <button 
                  onClick={() => setNotification(null)}
                  className="mt-2 w-full bg-white text-slate-900 hover:bg-slate-100 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95"
                >
                  ¡Genial, gracias!
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {profile && (
        <LivesPurchaseModal 
          isOpen={showLivesModal}
          onClose={() => setShowLivesModal(false)}
          onBuy={handleBuyLives}
          currentXP={profile.xp}
          currentLives={profile.lives}
          isDarkMode={isDarkMode}
        />
      )}
      
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
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-xl shadow-indigo-600/30 rotate-3 shrink-0">🦂</div>
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
               <button 
                 onClick={() => !profile.isPremium && profile.lives < 5 && setShowLivesModal(true)}
                 className={`flex items-center gap-1.5 transition-all ${(!profile.isPremium && profile.lives < 5) ? 'hover:scale-110 active:scale-95 cursor-pointer' : 'cursor-default'}`}
               >
                 <span className={`text-sm text-rose-500 drop-shadow-sm ${profile.lives < 2 && !profile.isPremium ? 'animate-pulse' : ''}`}>❤️</span>
                 <div className="flex flex-col items-start translate-y-[-1px]">
                   <div className="flex items-center gap-1">
                     <span className="text-sm font-black italic leading-none">{profile.isPremium ? '∞' : profile.lives}</span>
                     {!profile.isPremium && profile.lives < 5 && (
                       <span className="text-[8px] bg-rose-500 text-white rounded-full w-3 h-3 flex items-center justify-center font-black">+</span>
                     )}
                   </div>
                   {regenCountdown && (
                     <span className="text-[7px] font-black opacity-40 uppercase tracking-tighter leading-none mt-0.5">{regenCountdown}</span>
                   )}
                 </div>
               </button>
               <div className={`w-px h-4 mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
               <div className="flex items-center gap-1.5">
                 <span className="text-sm text-amber-500 drop-shadow-sm">⭐</span>
                 <span className="text-sm font-black italic">{profile.xp}</span>
               </div>
               {profile.isPremium && (
                 <>
                   <div className={`w-px h-4 mx-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
                   <div className="flex items-center gap-1.5">
                     <span className="text-sm text-cyan-400 drop-shadow-sm">💎</span>
                     <span className="text-sm font-black italic">{profile.diamonds}</span>
                   </div>
                 </>
               )}
            </div>

            <button onClick={() => handleTabChange('profile')} className={`p-1.5 rounded-2xl border-2 transition-all shrink-0 ${isDarkMode ? 'bg-slate-800 border-indigo-900 shadow-indigo-900/20' : 'bg-white border-indigo-50 shadow-indigo-600/10 shadow-xl'}`}>
               <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden flex items-center justify-center text-sm text-white font-black uppercase">
                 {profile.username ? profile.username[0] : '?'}
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
            onAddIncome={addIncome}
            onNavigateToTab={(tab) => handleTabChange(tab)} 
            isDarkMode={isDarkMode}
            canInstall={!!deferredPrompt}
            onInstall={handleInstallClick}
            onCompleteOnboarding={handleOnboardingComplete}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
        {activeTab === 'budget' && (
          <BudgetDetails 
            profile={profile} 
            expenses={expenses} 
            onDeleteMovement={deleteMovement} 
            onEditMovement={editMovement}
            isDarkMode={isDarkMode} 
          />
        )}
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
            savedChats={savedChats}
            onDeleteSavedChat={deleteSavedChat}
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
            onNavigateToTab={(t) => handleTabChange(t as any)} 
            canInstall={!!deferredPrompt}
            onInstall={handleInstallClick}
          />
        )}
        {activeTab === 'settings' && <Settings profile={profile} onUpdateProfile={handleUpdateProfile} isDarkMode={isDarkMode} toggleDarkMode={() => setIsDarkMode(!isDarkMode)} onLogout={logout} onOpenPremiumUnlock={() => setShowUnlockModal(true)} />}
      </main>

      <nav className={`fixed bottom-8 left-6 right-6 max-w-4xl mx-auto rounded-[3rem] border p-2 z-50 transition-all duration-500 shadow-[0_30px_100px_-20px_rgba(0,0,0,0.3)] backdrop-blur-3xl ${isDarkMode ? 'bg-slate-950/80 border-white/10' : 'bg-white/95 border-slate-200'}`}>
        <div className="flex justify-start md:justify-around items-center px-4 overflow-x-auto no-scrollbar gap-2">
          <NavButton 
            active={activeTab === 'dashboard'} 
            onClick={() => handleTabChange('dashboard')} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} 
            label="Inicio" 
          />
          <NavButton 
            active={activeTab === 'budget'} 
            onClick={() => handleTabChange('budget')} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>} 
            label="Plan" 
          />
          <NavButton 
            active={activeTab === 'chat'} 
            onClick={() => handleTabChange('chat')} 
            icon={<div className="relative"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>{!profile.isPremium && <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full animate-ping" />}</div>} 
            label="Zcorp IA" 
          />
          <NavButton 
            active={activeTab === 'academy'} 
            onClick={() => handleTabChange('academy')} 
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} 
            label="Z-Academy" 
          />
          <NavButton 
            active={activeTab === 'profile' || activeTab === 'settings'} 
            onClick={() => handleTabChange('profile')} 
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

