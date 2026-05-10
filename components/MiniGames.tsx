
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { Trophy, Target, Sparkles, Gamepad2, Heart, Lock, Coins, TrendingUp, Rocket, ArrowLeft } from 'lucide-react';
import OnboardingGuide from './OnboardingGuide';
import InvestmentSimulator from './InvestmentSimulator';
import ExpenseDestructor from './ExpenseDestructor';

interface GameProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  isDarkMode: boolean;
  onCompleteOnboarding: (key: string) => void;
  onExitArcade?: () => void;
}

const MiniGames: React.FC<GameProps> = ({ profile, onUpdateProfile, isDarkMode, onCompleteOnboarding, onExitArcade }) => {
  const [activeGame, setActiveGame] = useState<'budget-match' | 'tap-the-savings' | 'investment-simulator' | 'expense-destructor' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleHeaderExit = () => {
    if (!activeGame) {
      if (onExitArcade) onExitArcade();
      return;
    }

    if (activeGame === 'investment-simulator') {
      setActiveGame(null);
      return;
    }

    let scoreToClaim = 0;
    let xpMultiplier = 1;
    let saveKey = '';

    if (activeGame === 'budget-match') {
      saveKey = 'budget_match_save';
      xpMultiplier = 2;
    } else if (activeGame === 'tap-the-savings') {
      saveKey = 'tap_the_savings_save';
      xpMultiplier = 1;
    } else if (activeGame === 'expense-destructor') {
      saveKey = 'expense_destructor_save';
    }

    if (saveKey) {
      const saved = localStorage.getItem(saveKey);
      if (saved) {
        const data = JSON.parse(saved);
        if (activeGame === 'expense-destructor') {
          scoreToClaim = Math.floor((data.score || 0) / 5) + ((data.collectedCoins || 0) * 2);
        } else {
          scoreToClaim = (data.score || 0) * xpMultiplier;
        }
      }
    }

    if (scoreToClaim > 0) {
      if (window.confirm(`¿Quieres salir y reclamar tus ${scoreToClaim} XP acumulados?`)) {
        if (saveKey) localStorage.removeItem(saveKey);
        onComplete(scoreToClaim);
      }
    } else {
      setActiveGame(null);
    }
  };

  const canPlay = () => {
    return true; // Investment simulator is always open to build wealth
  };

  const handleStartGame = (game: 'budget-match' | 'tap-the-savings' | 'investment-simulator' | 'expense-destructor') => {
    // Investment simulator is free to build wealth
    if (game === 'investment-simulator') {
      setActiveGame(game);
      return;
    }

    // Arcade games check
    if (!profile.isPremium) {
      if (profile.xp < 100) {
        setError('Necesitas al menos 100 XP para participar en un mini-juego.');
        setTimeout(() => setError(null), 3000);
        return;
      }
      
      // Deduct entry fee
      onUpdateProfile({ 
        xp: profile.xp - 100
      });
    }
    
    setActiveGame(game);
  };

  const onComplete = (xp: number, diamonds: number = 0) => {
    onUpdateProfile({ 
      xp: profile.xp + xp,
      diamonds: (profile.diamonds || 0) + diamonds
    });
    setActiveGame(null);
  };

  const arcadeSteps = [
    {
      title: "Zona de Juegos Zcorpion",
      content: "Aquí puedes ganar XP extra divirtiéndote. Participar en cada juego cuesta 100 XP, ¡pero las recompensas valen la pena!"
    },
    {
      title: "Variedad de Retos",
      content: "Elige entre poner a prueba tu lógica presupuestaria o tus reflejos cazando monedas."
    }
  ];

  return (
    <div className="space-y-6">
      {profile && !profile.onboardingSeen?.includes('arcade') && (
        <OnboardingGuide 
          guideKey="arcade" 
          steps={arcadeSteps} 
          onComplete={onCompleteOnboarding} 
          isDarkMode={isDarkMode} 
        />
      )}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] bg-rose-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 border-2 border-rose-300"
          >
            <Lock size={20} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {!activeGame ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <GameCard 
             title="Tu Primera Inversión" 
             desc="Opera en el mercado real de acciones y Bitcoin con tu XP."
             icon={<TrendingUp className="text-white" />}
             reward="Riqueza real"
             cost="GRATIS"
             color="from-amber-500 to-orange-700"
             onClick={() => handleStartGame('investment-simulator')}
           />
           <GameCard 
             title="Presupuesto Maestro" 
             desc="Asigna los gastos a su categoría correcta en 50/30/20."
             icon={<Target className="text-white" />}
             reward="2 XP / acierto"
             cost={profile.isPremium ? "GRATIS PRO" : "100 XP"}
             color="from-indigo-600 to-indigo-800"
             onClick={() => handleStartGame('budget-match')}
           />
           <GameCard 
             title="Caza-Ahorros" 
             desc="Atrapa todas las monedas antes de que desaparezcan."
             icon={<Sparkles className="text-white" />}
             reward="1 XP / moneda"
             cost={profile.isPremium ? "GRATIS PRO" : "100 XP"}
             color="from-emerald-600 to-emerald-800"
             onClick={() => handleStartGame('tap-the-savings')}
           />
           <GameCard 
             title="Expense Destructor" 
             desc="¡Galaga Style! Destruye los gastos con tus ahorros."
             icon={<Rocket className="text-white" />}
             reward="XP según ahorro"
             cost={profile.isPremium ? "GRATIS PRO" : "100 XP"}
             color="from-rose-600 to-rose-800"
             onClick={() => handleStartGame('expense-destructor')}
           />
        </div>
      ) : (
        <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col p-4 md:p-8 overflow-y-auto">
           <div className="flex justify-between items-center mb-6 shrink-0">
              <div className="flex items-center gap-3">
                 <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl">
                    <Gamepad2 className="text-indigo-400" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black text-white italic uppercase leading-none">
                       {activeGame === 'budget-match' ? 'Presupuesto Maestro' : 
                        activeGame === 'tap-the-savings' ? 'Caza Ahorros' : 
                         activeGame === 'expense-destructor' ? 'Expense Destructor' : ''}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-black tracking-widest uppercase mt-1">Zcorpion Arcade Edition</p>
                 </div>
              </div>
           </div>
           
           <div className="flex-1 flex items-center justify-center w-full max-w-4xl mx-auto h-full min-h-[600px] max-h-[800px] relative">
              {activeGame === 'budget-match' && <BudgetMatch onComplete={(xp: number) => { onComplete(xp); setActiveGame(null); }} isDarkMode={isDarkMode} profile={profile} onUpdateProfile={onUpdateProfile} onCompleteOnboarding={onCompleteOnboarding} />}
              {activeGame === 'tap-the-savings' && <TapTheSavings onComplete={(xp: number, diamonds: number) => onComplete(xp, diamonds)} isDarkMode={isDarkMode} profile={profile} onUpdateProfile={onUpdateProfile} onCompleteOnboarding={onCompleteOnboarding} />}
              {activeGame === 'expense-destructor' && <ExpenseDestructor onComplete={(xp: number, diamonds?: number) => onComplete(xp, diamonds)} isDarkMode={isDarkMode} profile={profile} />}
              {activeGame === 'investment-simulator' && (
                <InvestmentSimulator 
                  profile={profile} 
                  onUpdateProfile={onUpdateProfile} 
                  onClose={() => setActiveGame(null)} 
                  isDarkMode={isDarkMode} 
                />
              )}
           </div>
        </div>
      )}
    </div>
  );
};

const GameCard = ({ title, desc, icon, reward, cost, color, onClick }: any) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`p-6 rounded-[2.5rem] bg-gradient-to-br ${color} text-left flex flex-col justify-between h-56 shadow-xl relative overflow-hidden group`}
  >
    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
       <Gamepad2 size={80} />
    </div>
    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
       {icon}
    </div>
    <div>
      <h3 className="text-xl font-black text-white italic uppercase leading-tight">{title}</h3>
      <p className="text-white/70 text-[10px] mt-1 mb-3 leading-tight font-medium">{desc}</p>
      <div className="flex flex-wrap gap-2">
        <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-[9px] font-black text-white tracking-widest italic uppercase">{reward}</span>
        <span className={`inline-block bg-slate-950/30 px-3 py-1 rounded-full text-[9px] font-black tracking-widest italic uppercase ${cost === 'GRATIS' ? 'text-emerald-300' : 'text-amber-300'}`}>
          {cost}
        </span>
      </div>
    </div>
  </motion.button>
);

const BudgetMatch = ({ onComplete, isDarkMode, profile, onUpdateProfile, onCompleteOnboarding }: any) => {
  const categories = ['Necesidades', 'Deseos', 'Ahorro'];
  
  // Base database of items to ensure variety
  const ALL_ITEMS = [
    { name: 'Alquiler', cat: 'Necesidades' },
    { name: 'Electricidad', cat: 'Necesidades' },
    { name: 'Seguro Médico', cat: 'Necesidades' },
    { name: 'Transporte', cat: 'Necesidades' },
    { name: 'Comida Básica', cat: 'Necesidades' },
    { name: 'Agua y Gas', cat: 'Necesidades' },
    { name: 'Internet Básico', cat: 'Necesidades' },
    { name: 'Medicinas', cat: 'Necesidades' },
    { name: 'Suministros Hogar', cat: 'Necesidades' },
    { name: 'Ropa Trabajo', cat: 'Necesidades' },
    { name: 'Mantenimiento Coche', cat: 'Necesidades' },
    { name: 'Impuestos', cat: 'Necesidades' },
    { name: 'Dentista', cat: 'Necesidades' },
    { name: 'Netflix', cat: 'Deseos' },
    { name: 'Cena en Restaurante', cat: 'Deseos' },
    { name: 'Viajes', cat: 'Deseos' },
    { name: 'Videojuegos', cat: 'Deseos' },
    { name: 'Café de Marca', cat: 'Deseos' },
    { name: 'Ropa de Lujo', cat: 'Deseos' },
    { name: 'Conciertos', cat: 'Deseos' },
    { name: 'Sushi', cat: 'Deseos' },
    { name: 'Gimnasio Pro', cat: 'Deseos' },
    { name: 'Zapatos Nuevos', cat: 'Deseos' },
    { name: 'Entrada Cine', cat: 'Deseos' },
    { name: 'Libros Ficción', cat: 'Deseos' },
    { name: 'Decoración', cat: 'Deseos' },
    { name: 'Comida a Domicilio', cat: 'Deseos' },
    { name: 'Upgrade Celular', cat: 'Deseos' },
    { name: 'Fondo de Emergencia', cat: 'Ahorro' },
    { name: 'Inversión en Bolsa', cat: 'Ahorro' },
    { name: 'Plan Jubilación', cat: 'Ahorro' },
    { name: 'Criptomonedas', cat: 'Ahorro' },
    { name: 'Ahorro para Casa', cat: 'Ahorro' },
    { name: 'Abono Deuda Extra', cat: 'Ahorro' },
    { name: 'Inversión ETFs', cat: 'Ahorro' },
    { name: 'Fondo de Estudios', cat: 'Ahorro' },
    { name: 'Ahorro Vacaciones', cat: 'Ahorro' },
    { name: 'Oro Físico', cat: 'Ahorro' },
    { name: 'Seguro de Vida (Rescate)', cat: 'Ahorro' },
    { name: 'Ahorro Coche Nuevo', cat: 'Ahorro' }
  ];
  
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timeFlash, setTimeFlash] = useState<'plus' | 'minus' | null>(null);

  useEffect(() => {
    if (isStarted) {
       localStorage.setItem('budget_match_save', JSON.stringify({ 
         score, 
         timeLeft, 
         currentIdx,
         showResult 
       }));
    }
  }, [score, timeLeft, currentIdx, isStarted, showResult]);

  const playVictorySound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.15 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.5);
      });
    } catch (e) { console.error('Audio fail', e); }
  };

  useEffect(() => {
    if (isStarted && timeLeft > 0 && !showResult && !isPaused) {
      const speed = score >= 20 ? 150 : (score >= 5 ? 350 : 700);
      
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            playVictorySound();
            setShowResult(true);
            return 0;
          }
          return t - 1;
        });
      }, speed);
      return () => clearInterval(timer);
    }
  }, [isStarted, timeLeft, showResult, score, isPaused]);

  // Handle flash effect duration
  useEffect(() => {
    if (timeFlash) {
      const t = setTimeout(() => setTimeFlash(null), 500);
      return () => clearTimeout(t);
    }
  }, [timeFlash]);

  const startGame = () => {
    // Shuffle items and pick a sequence
    const shuffled = [...ALL_ITEMS].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    
    const saved = localStorage.getItem('budget_match_save');
    if (saved) {
      const data = JSON.parse(saved);
      setScore(data.score);
      setTimeLeft(data.timeLeft);
      setCurrentIdx(data.currentIdx);
      if (data.showResult) {
        setShowResult(true);
      } else {
        // Force pause when resuming
        setIsPaused(true);
      }
    } else {
      setTimeLeft(60);
      setScore(0);
      setCurrentIdx(0);
      setShowResult(false);
    }
    
    setIsStarted(true);
  };

  const budgetSteps = [
    {
      title: "Presupuesto Maestro",
      content: "Tu misión es clasificar los gastos que aparecen en el centro en una de las tres categorías de la regla 50/30/20."
    },
    {
      title: "Categorías",
      content: "Necesidades: Gastos vitales. Deseos: Gustos personales. Ahorro: Tu yo del futuro."
    },
    {
      title: "Tiempo es Dinero",
      content: "Cada acierto te da +5 segundos. Cada error te quita -20 segundos. ¡Sé preciso y rápido!"
    }
  ];

  const handleMatch = (cat: string) => {
    if (showResult || isPaused) return;
    
    const isCorrect = cat === items[currentIdx].cat;
    
    if (isCorrect) {
      setScore(s => s + 1);
      setTimeLeft(t => t + 5); 
      setTimeFlash('plus');
    } else {
      setTimeLeft(t => Math.max(0, t - 20)); // Increased from -10 to -20
      setTimeFlash('minus');
      if (onUpdateProfile && profile) {
        // No logic needed here for XP deduction as per user request
      }
      if (timeLeft <= 20) {
        playVictorySound();
        setShowResult(true);
      }
    }
    
    // Cycle through items indefinitely (variety)
    if (currentIdx < items.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      // Re-shuffle for infinite items
      const reshuffled = [...ALL_ITEMS].sort(() => Math.random() - 0.5);
      setItems(reshuffled);
      setCurrentIdx(0);
    }
  };

  if (!isStarted && !showResult) return (
    <div className="w-full h-full bg-slate-900/50 rounded-[3rem] flex flex-col items-center justify-center p-8 border-2 border-white/5 text-center overflow-y-auto custom-scrollbar">
       {profile && !profile.onboardingSeen?.includes('game-budget') && (
        <OnboardingGuide 
          guideKey="game-budget" 
          steps={budgetSteps} 
          onComplete={onCompleteOnboarding} 
          isDarkMode={isDarkMode} 
        />
      )}
       <motion.div 
         initial={{ scale: 0.8, opacity: 0 }} 
         animate={{ scale: 1, opacity: 1 }}
         className="w-28 h-28 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-[0_20px_50px_rgba(79,70,229,0.4)] border-4 border-indigo-400 rotate-3"
       >
         🎯
       </motion.div>
       <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-3">Presupuesto Maestro</h2>
       <p className="text-slate-400 mb-8 max-w-sm font-medium leading-relaxed">Categoriza los gastos antes de que se acabe el tiempo. ¡Cada acierto te da segundos extra!</p>
       
       <div className="flex flex-wrap justify-center gap-4 mb-10">
          <div className="bg-emerald-500/10 text-emerald-500 px-4 py-2 rounded-2xl border border-emerald-500/20 text-xs font-black uppercase tracking-widest flex items-center gap-2">
             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
             Acierto: +5s
          </div>
          <div className="bg-rose-500/10 text-rose-500 px-4 py-2 rounded-2xl border border-rose-500/20 text-xs font-black uppercase tracking-widest flex items-center gap-2">
             <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
             Error: -10s
          </div>
       </div>

       <button 
         onClick={startGame}
         className="group relative bg-white text-slate-900 px-16 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden"
       >
         <span className="relative z-10">
           {localStorage.getItem('budget_match_save') ? 'Continuar Reto' : '¡Empezar Reto!'}
         </span>
         <div className="absolute inset-0 bg-indigo-100 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
       </button>
    </div>
  );

  if (showResult) return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }} 
      className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-600 to-indigo-900 rounded-[3rem] text-center text-white p-10 shadow-2xl relative overflow-hidden"
    >
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
       <motion.div
         initial={{ y: 20 }}
         animate={{ y: 0 }}
         transition={{ type: 'spring', bounce: 0.5 }}
       >
          <Trophy size={100} className="mb-8 drop-shadow-[0_10px_30px_rgba(255,255,255,0.3)] mx-auto text-amber-300" />
       </motion.div>
       <h2 className="text-5xl font-black uppercase italic mb-4 tracking-tighter">¡Tiempo Agotado!</h2>
       <p className="text-2xl font-bold text-white/80 mb-10 decoration-indigo-300">
          Has categorizado <span className="text-white text-4xl underline underline-offset-8">{score}</span> gastos correctamente
       </p>
       
       <motion.button 
         whileHover={{ scale: 1.05 }}
         whileTap={{ scale: 0.95 }}
         onClick={() => {
           localStorage.removeItem('budget_match_save');
           onComplete(score * 2);
           // The parent should handle the state reset, but we ensure it happens
         }} 
         className="relative z-20 bg-white text-indigo-600 px-16 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xl shadow-2xl hover:bg-slate-100 transition-all active:scale-95"
       >
          Reclamar {score * 2} XP
       </motion.button>
    </motion.div>
  );

  return (
    <div className="w-full h-full bg-slate-900 rounded-[3rem] border-4 border-slate-800 relative overflow-hidden shadow-inner flex flex-col">
       {/* Timer HUD & Fixed Item - Fixed at top */}
       <div className="z-20 bg-slate-900/80 backdrop-blur-xl border-b border-white/5 pt-6 px-6 pb-2">
          <div className="flex justify-center items-center gap-4 md:gap-8 mb-6">
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="w-10 h-10 bg-slate-800 rounded-xl border border-white/5 text-white flex items-center justify-center"
            >
              {isPaused ? '▶️' : '⏸️'}
            </button>
            <div className="bg-slate-800 px-4 md:px-6 py-2 rounded-2xl border border-white/5 flex flex-col items-center">
              <span className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase block leading-none mb-1">Score</span>
              <span className="text-xl md:text-2xl font-black text-white italic leading-none">{score}</span>
            </div>
            
            <div className={`px-6 md:px-8 py-3 rounded-[2rem] border-4 transition-all relative ${
              timeFlash === 'plus' ? 'bg-emerald-500 border-emerald-300 scale-110' : 
              timeFlash === 'minus' ? 'bg-rose-500 border-rose-300 scale-110' : 
              'bg-slate-800 border-white/10'
            }`}>
              <span className={`text-2xl md:text-3xl font-black italic leading-none flex items-center gap-2 ${timeLeft < 10 && !timeFlash ? 'text-rose-500 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
              </span>
              {score >= 5 && (
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                  <span className={`text-[7px] md:text-[8px] font-black tracking-widest uppercase ${score >= 20 ? 'text-rose-500' : 'text-amber-500'}`}>
                    {score >= 20 ? '🔥 MODO DIABLO' : '⚡ ACELERANDO'}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center pb-4">
             <div className="bg-indigo-500/10 text-indigo-500 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 border border-indigo-500/20">
                Categoriza el Gasto
             </div>
             
             <motion.div 
               key={items[currentIdx]?.name} 
               initial={{ y: 20, opacity: 0, scale: 0.9 }} 
               animate={{ y: 0, opacity: 1, scale: 1 }} 
               className={`py-6 px-10 md:px-14 rounded-[2.5rem] border-2 transition-all duration-300 w-full max-w-lg ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-800 border-slate-700'}`}
             >
                <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter text-center leading-tight drop-shadow-2xl">
                   {items[currentIdx]?.name}
                </h2>
             </motion.div>
          </div>
       </div>

       {/* Game Body - Scrollable Categories */}
       <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 flex flex-col items-center justify-start relative">
          {isPaused && (
            <div className="absolute inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8">
               <h2 className="text-4xl font-black text-white italic uppercase mb-8">Pausado</h2>
               <div className="flex flex-col gap-4 w-full max-w-xs">
                 <button 
                   onClick={() => setIsPaused(false)}
                   className="bg-indigo-600 text-white px-12 py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl w-full"
                 >
                   Continuar
                 </button>
                 <button 
                   onClick={() => {
                     localStorage.removeItem('budget_match_save');
                     onComplete(score * 2);
                   }}
                   className="bg-rose-600/20 text-rose-400 border-2 border-rose-600/30 px-12 py-4 rounded-[2rem] font-black uppercase tracking-widest hover:bg-rose-600/30 transition-all w-full"
                 >
                   Abandonar y Reclamar
                 </button>
               </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl pb-12">
             {categories.map((cat, idx) => {
               const icons = ['🏠', '🎭', '💰'];
               return (
                 <motion.button 
                   key={cat} 
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                   onClick={() => handleMatch(cat)} 
                   className={`group relative flex flex-col items-center justify-center gap-3 p-6 md:p-8 rounded-[2.5rem] border-2 transition-all overflow-hidden ${
                     cat === 'Necesidades' ? 'hover:bg-blue-600/20 hover:border-blue-500/50' :
                     cat === 'Deseos' ? 'hover:bg-purple-600/20 hover:border-purple-500/50' :
                     'hover:bg-emerald-600/20 hover:border-emerald-500/50'
                   } bg-slate-800/50 border-white/5 text-white shadow-xl`}
                 >
                    <span className="text-3xl md:text-4xl transition-transform group-hover:scale-125 duration-300 drop-shadow-lg">{icons[idx]}</span>
                    <span className="text-[10px] md:text-sm font-black uppercase tracking-widest">{cat}</span>
                    <div className={`absolute bottom-0 left-0 right-0 h-1 transition-all group-hover:h-2 ${
                      cat === 'Necesidades' ? 'bg-blue-500' :
                      cat === 'Deseos' ? 'bg-purple-500' :
                      'bg-emerald-500'
                    }`} />
                 </motion.button>
               );
             })}
          </div>
       </div>
    </div>
  );
};

const TapTheSavings = ({ onComplete, isDarkMode, profile, onUpdateProfile, onCompleteOnboarding }: any) => {
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [showResult, setShowResult] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const idCounter = React.useRef(0);
  const processedIds = React.useRef<Set<number>>(new Set());
  
  const audioContext = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  // Sound effects
  const playSound = (type: 'coin' | 'bomb' | 'miss') => {
    try {
      initAudio();
      const ctx = audioContext.current!;
      if (ctx.state === 'suspended') ctx.resume();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      if (type === 'coin') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      } else if (type === 'bomb') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      } else {
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      }
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  };

  const spawnItem = () => {
    const isBomb = Math.random() < 0.25;
    // Difficulty scaling: speed increases with score
    const speedMultiplier = score >= 50 ? 1.5 : (score >= 20 ? 1.2 : 1.0);
    
    // Randomly choose entrance: Bottom or Sides
    const mode = Math.random() < 0.7 ? 'bottom' : 'side';
    
    let x, y, vx, vy;
    
    if (mode === 'bottom') {
      x = Math.random() * 60 + 20;
      y = 110;
      vx = (x < 50 ? 1 : -1) * (Math.random() * 0.3 + 0.1) * speedMultiplier;
      vy = -(Math.random() * 1.5 + 2.0) * speedMultiplier; // Slower upward toss
    } else {
      const fromLeft = Math.random() < 0.5;
      x = fromLeft ? -10 : 110;
      y = Math.random() * 40 + 20;
      vx = fromLeft ? (Math.random() * 1.0 + 0.5) : -(Math.random() * 1.0 + 0.5);
      vx *= speedMultiplier;
      vy = -(Math.random() * 0.5 + 1) * speedMultiplier;
    }
    
    const newItem = {
      id: idCounter.current,
      type: isBomb ? 'bomb' : 'coin',
      x,
      y,
      vx,
      vy,
      isBroken: false,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 1.5 // Fluid rotation
    };
    
    setItems(prev => [...prev, newItem]);
    idCounter.current += 1;
  };

  const tapSteps = [
    {
      title: "Caza-Ahorros",
      content: "¡Es hora de recolectar monedas! Toca o desliza el dedo sobre las monedas que saltan del centro."
    },
    {
      title: "¡Peligro!",
      content: "No toques las bombas. Si tocas una bomba o dejas pasar una moneda, perderás una vida."
    },
    {
      title: "Dificultad Dinámica",
      content: "A medida que ganes monedas, el juego se volverá más rápido y la gravedad cambiará. ¡Mantén tus sentidos alerta!"
    }
  ];

  useEffect(() => {
    if (!isStarted || showResult || isPaused) {
      return;
    }

    initAudio();

    const gameLoop = setInterval(() => {
      setItems(prev => {
        // Difficulty scaling: gravity increases with score
        const gravity = score >= 50 ? 0.08 : (score >= 20 ? 0.05 : 0.03); 
        return prev
          .map(item => ({
            ...item,
            x: item.x + item.vx,
            y: item.y + item.vy,
            vy: item.vy + gravity,
            rotation: item.rotation + item.rotationSpeed
          }))
          .filter(item => {
            const isInside = item.y < 125 && item.x > -20 && item.x < 120;
            if (!isInside) {
              processedIds.current.delete(item.id);
            }
            return isInside;
          });
      });
    }, 16);

    const spawner = setInterval(() => {
      const count = Math.random() > 0.85 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        spawnItem();
      }
    }, score >= 50 ? 400 : (score >= 20 ? 700 : 1200)); 

    return () => {
      clearInterval(gameLoop);
      clearInterval(spawner);
    };
  }, [isStarted, showResult, score, isPaused]);

  const startGame = () => {
    initAudio();
    const saved = localStorage.getItem('tap_the_savings_save');
    if (saved) {
      const data = JSON.parse(saved);
      setScore(data.score);
      setLives(data.lives);
      if (data.showResult) {
        setShowResult(true);
      } else {
        // Force pause when resuming
        setIsPaused(true);
      }
    } else {
      setScore(0);
      setLives(3);
    }
    setIsStarted(true);
  };

  useEffect(() => {
    if (isStarted) {
      localStorage.setItem('tap_the_savings_save', JSON.stringify({ score, lives, showResult }));
    }
  }, [score, lives, isStarted, showResult]);

  useEffect(() => {
    if (isStarted && lives <= 0 && !showResult) {
      setTimeout(() => setShowResult(true), 500);
    }
  }, [lives, isStarted, showResult]);

  const handleInteraction = (item: any) => {
    if (item.isBroken || showResult || processedIds.current.has(item.id) || item.y > 100 || isPaused) return;
    
    processedIds.current.add(item.id);

    if (item.type === 'coin') {
      playSound('coin');
      setScore(s => s + 1);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isBroken: true } : i));
    } else {
      playSound('bomb');
      setLives(l => Math.max(0, l - 1));
      
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isBroken: true } : i));
    }
  };

  if (!isStarted && !showResult) return (
    <div className="w-full h-full bg-slate-900/50 rounded-[3rem] flex flex-col items-center justify-center p-8 border-2 border-white/5 text-center relative overflow-hidden">
       {profile && !profile.onboardingSeen?.includes('game-tap') && (
        <OnboardingGuide 
          guideKey="game-tap" 
          steps={tapSteps} 
          onComplete={onCompleteOnboarding} 
          isDarkMode={isDarkMode} 
        />
      )}
       {/* Background Decorative Elements */}
       <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-500 rounded-full blur-[120px]" />
       </div>

       <motion.div 
         initial={{ scale: 0.8, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         className="w-28 h-28 bg-emerald-600 rounded-[2rem] flex items-center justify-center text-5xl mb-8 shadow-[0_20px_50px_rgba(16,185,129,0.4)] border-4 border-emerald-400 rotate-3 z-10"
       >
         💰
       </motion.div>
       
       <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter mb-4 z-10">Caza Ahorros</h2>
       <p className="text-slate-400 mb-10 max-w-sm font-medium leading-relaxed z-10">
         ¡Corta o toca las monedas que saltan! <br/>
         <span className="text-rose-400 font-bold">¡Cuidado con las bombas!</span> Tienes 3 vidas.
       </p>
       
       <button 
         onClick={startGame}
         className="group relative bg-emerald-500 text-white px-16 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] text-lg shadow-2xl hover:scale-105 active:scale-95 transition-all overflow-hidden z-10"
       >
         <span className="relative z-10">
           {localStorage.getItem('tap_the_savings_save') ? 'Continuar Caza' : 'Empezar Caza'}
         </span>
         <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
       </button>
    </div>
  );

  if (showResult) return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }}
      className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-[3rem] text-center text-white p-10 shadow-2xl relative overflow-hidden"
    >
       <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
       <motion.div
         initial={{ y: 20 }}
         animate={{ y: 0 }}
         transition={{ type: 'spring', bounce: 0.5 }}
       >
          <Trophy size={100} className="mb-8 drop-shadow-[0_10px_30px_rgba(255,255,255,0.3)] mx-auto text-amber-300" />
       </motion.div>
       <h2 className="text-5xl font-black uppercase italic mb-4 tracking-tighter">¡Fin de la Caza!</h2>
       <p className="text-2xl font-bold text-white/80 mb-6">
          Riqueza acumulada: <span className="text-white text-4xl underline underline-offset-8">{score}</span> monedas
       </p>
       
       {profile.isPremium && score >= 100 && (
         <motion.div 
           initial={{ scale: 0, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           className="mb-8 flex items-center gap-2 bg-white/20 px-6 py-3 rounded-2xl border border-white/30"
         >
           <span className="text-2xl">💎</span>
           <div className="text-left">
             <p className="text-[10px] font-black uppercase tracking-widest text-cyan-300">Bono Milestone</p>
             <p className="text-sm font-bold text-white">+5 Diamantes Ganados</p>
           </div>
         </motion.div>
       )}
       
       <motion.button 
         whileHover={{ scale: 1.05 }}
         whileTap={{ scale: 0.95 }}
         onClick={() => {
           localStorage.removeItem('tap_the_savings_save');
           const diamondBonus = (score >= 100 && profile.isPremium) ? 5 : 0;
           onComplete(score * 1, diamondBonus);
         }}
         className="relative z-20 bg-white text-emerald-600 px-16 py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-xl shadow-2xl hover:bg-slate-100 transition-all active:scale-95"
       >
          Reclamar {score * 1} XP {(score >= 100 && profile.isPremium) ? '+ 5 💎' : ''}
       </motion.button>
    </motion.div>
  );

  return (
    <div 
      className="w-full h-full bg-slate-950 rounded-[3rem] border-4 border-slate-800 relative overflow-hidden cursor-crosshair select-none touch-none scale-100"
      onPointerMove={(e) => {
        if (showResult || e.buttons === 0) return;
        const target = document.elementFromPoint(e.clientX, e.clientY);
        if (target) {
          const itemIdStr = target.getAttribute('data-item-id') || target.closest('[data-item-id]')?.getAttribute('data-item-id');
          if (itemIdStr) {
            const itemIdx = parseInt(itemIdStr);
            const item = items.find(i => i.id === itemIdx);
            if (item) handleInteraction(item);
          }
        }
      }}
    >
       {/* HUD */}
       <div className="absolute top-8 left-8 right-8 flex justify-between items-center z-50 pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <div className="bg-slate-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/5 shadow-2xl">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block leading-none mb-1">Score</span>
                <span className="text-2xl font-black text-white italic">{score}</span>
            </div>
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="w-12 h-12 bg-slate-900/80 backdrop-blur-md rounded-2xl border border-white/5 flex items-center justify-center text-white"
            >
              {isPaused ? '▶️' : '⏸️'}
            </button>
          </div>
          
          <div className="flex gap-2">
             {[...Array(3)].map((_, i) => (
                <Heart 
                  key={i} 
                  size={32} 
                  className={`transition-all duration-300 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-700'}`} 
                />
             ))}
          </div>
       </div>

       {/* Slice Trail Container - simplified */}
       <div className="absolute inset-0 z-40 overflow-hidden pointer-events-none" />

       {/* Game Stage */}
       <div className="absolute inset-0">
          {isPaused && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8"
            >
               <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-8">Pausado</h2>
               <div className="flex flex-col gap-4 w-full max-w-xs">
                 <button 
                   onClick={() => setIsPaused(false)}
                   className="bg-emerald-600 text-white px-12 py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform w-full"
                 >
                   Continuar
                 </button>
                 <button 
                   onClick={() => {
                     localStorage.removeItem('tap_the_savings_save');
                     onComplete(score * 1);
                   }}
                   className="bg-rose-600/20 text-rose-400 border-2 border-rose-600/30 px-12 py-4 rounded-[2rem] font-black uppercase tracking-widest hover:bg-rose-600/30 transition-all w-full"
                 >
                   Abandonar y Reclamar
                 </button>
               </div>
            </motion.div>
          )}

          {items.map(item => (
            <motion.div
              key={item.id}
              data-item-id={item.id}
              className="absolute pointer-events-auto"
              style={{ 
                left: `${item.x}%`, 
                top: `${item.y}%`, 
                transform: `translate(-50%, -50%) rotate(${item.rotation}deg)` 
              }}
              onPointerDown={(e) => {
                // Handle both mouse and touch start
                handleInteraction(item);
              }}
              onPointerEnter={(e) => {
                // Only trigger on enter if the pointer is currently "down" (swiping/slicing)
                if (e.buttons > 0) {
                  handleInteraction(item);
                }
              }}
            >
              <AnimatePresence mode="popLayout">
                {!item.isBroken ? (
                  <motion.div
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className={`w-20 h-20 flex items-center justify-center text-5xl rounded-full shadow-2xl relative ${
                      item.type === 'coin' 
                        ? 'bg-amber-400 border-4 border-amber-200 text-amber-900' 
                        : 'bg-slate-900 border-4 border-slate-700 grayscale'
                    }`}
                  >
                    <span className="relative z-10">{item.type === 'coin' ? '💰' : '💣'}</span>
                    {item.type === 'coin' && (
                      <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse pointer-events-none" />
                    )}
                  </motion.div>
                ) : (
                  item.type === 'coin' ? (
                    <div className="flex gap-4 pointer-events-none">
                       <motion.div 
                         initial={{ x: -10, y: 0, rotate: 0 }}
                         animate={{ x: -40, y: 100, rotate: -45, opacity: 0 }}
                         transition={{ duration: 0.5 }}
                         className="text-4xl"
                       >
                         🪙
                       </motion.div>
                       <motion.div 
                         initial={{ x: 10, y: 0, rotate: 0 }}
                         animate={{ x: 40, y: 100, rotate: 45, opacity: 0 }}
                         transition={{ duration: 0.5 }}
                         className="text-4xl"
                       >
                         🪙
                       </motion.div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0.5, opacity: 1 }}
                      animate={{ scale: 5, opacity: 0 }}
                      className="absolute inset-0 bg-rose-500 rounded-full blur-2xl"
                    />
                  )
                )}
              </AnimatePresence>
            </motion.div>
          ))}
       </div>

       {/* Floor/Launch Effect */}
       <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-t from-emerald-500/20 to-transparent" />
    </div>
  );
};

export default MiniGames;
