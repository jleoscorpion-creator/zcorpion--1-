
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { 
  Trophy, 
  Heart, 
  Star, 
  Lock, 
  ChevronRight, 
  BookOpen, 
  Gamepad2, 
  Volume2, 
  VolumeX, 
  Play,
  CheckCircle2,
  XCircle,
  Sparkles
} from 'lucide-react';
import MiniGames from './MiniGames';
import OnboardingGuide from './OnboardingGuide';

interface Step {
  type: 'info' | 'quiz' | 'practice';
  title: string;
  content: string;
  question?: string;
  options?: string[];
  correctIndex?: number;
}

interface Lesson {
  id: string;
  title: string;
  world: string;
  icon: string;
  xp: number;
  steps: Step[];
  isPremium?: boolean;
}

const LESSONS_DATABASE: Lesson[] = [
  // MUNDO 1: FUNDAMENTOS (BASIC)
  {
    id: 'inv_1',
    title: 'El Despertar',
    world: 'Fundamentos',
    icon: '🌱',
    xp: 150,
    isPremium: false,
    steps: [
      { type: 'info', title: 'Tu Dinero vs El Tiempo', content: 'Imaginas que guardas $1000 hoy. En 10 años, comprarán mucho menos debido a la inflación. ¡Debes moverte!' },
      { type: 'quiz', title: 'Reto Rápido', content: 'Si la inflación sube...', question: '¿Qué pasa con tu ahorro en efectivo?', options: ['Sube de valor', 'Baja su poder de compra', 'Se duplica'], correctIndex: 1 },
      { type: 'info', title: 'La Solución', content: 'Invertir es comprar activos que crezcan más que la inflación. No es una opción, es una necesidad.' }
    ]
  },
  {
    id: 'inv_2',
    title: 'Interés Compuesto',
    world: 'Fundamentos',
    icon: '⚙️',
    xp: 250,
    isPremium: false,
    steps: [
      { type: 'info', title: 'Bola de Nieve', content: 'Ganar intereses sobre los intereses ya ganados. A largo plazo, esto crea riqueza exponencial.' },
      { type: 'quiz', title: 'La Clave', content: '¿Qué es lo más importante en el interés compuesto?', question: 'Selecciona:', options: ['El banco', 'El tiempo', 'La suerte'], correctIndex: 1 }
    ]
  },
  {
      id: 'inv_3',
      title: 'Ahorro Inteligente',
      world: 'Fundamentos',
      icon: '🏛️',
      xp: 200,
      isPremium: false,
      steps: [
          { type: 'info', title: 'Págate a ti mismo', content: 'Antes de pagar tus facturas, separa tu ahorro. Trátalo como un gasto obligatorio.' },
          { type: 'quiz', title: 'Orden de Prioridad', content: '¿Cuándo deberías ahorrar?', question: 'Momento ideal:', options: ['A fin de mes', 'Apenas recibes tu sueldo', 'Cuando sobre dinero'], correctIndex: 1 }
      ]
  },
  // MUNDO 2: ACCIONES (PREMIUM)
  {
    id: 'inv_4',
    title: 'Tu Primer Broker',
    world: 'Z-PRO: Acciones',
    icon: '📱',
    xp: 300,
    isPremium: true,
    steps: [
      { type: 'info', title: '¿Qué es un Broker?', content: 'Es la app o institución que te da acceso a la bolsa. Debes buscar uno regulado y con bajas comisiones.' },
      { type: 'quiz', title: 'Seguridad', content: '¿Qué debes revisar antes de meter dinero a un Broker?', question: 'Prioridad:', options: ['Que sea bonito', 'Que esté regulado', 'Que me lo recomendó un amigo'], correctIndex: 1 },
      { type: 'practice', title: 'Tarea Práctica', content: 'Simulemos que eliges un broker:', question: 'Elige la mejor opción para empezar:', options: ['Broker A: $0 comisiones, regulado por la SEC', 'Broker B: $10 comisiones, no dice quién lo regula', 'Broker C: Te regalan $100 pero debes invitar a 10 personas'], correctIndex: 0 }
    ]
  },
  {
    id: 'inv_5',
    title: 'Comprar tu Acción',
    world: 'Z-PRO: Acciones',
    icon: '🎯',
    xp: 450,
    isPremium: true,
    steps: [
      { type: 'info', title: 'Tu Primera Orden', content: 'Para comprar una acción, buscas el Ticker (ej: AAPL) y eliges cuántas acciones o fracciones quieres.' },
      { type: 'quiz', title: 'Propiedad', content: '¿Qué recibes al comprar una acción?', question: 'Eres un...', options: ['Empleado', 'Socio/Dueño de una parte', 'Cliente VIP'], correctIndex: 1 }
    ]
  },
  {
    id: 'inv_6',
    title: 'Mundo ETF',
    world: 'Z-PRO: Diversificación',
    icon: '🧺',
    xp: 500,
    isPremium: true,
    steps: [
      { type: 'info', title: '¿Qué es un ETF?', content: 'Es un paquete de muchas acciones. Al comprar un ETF (como el S&P 500), estás comprando un pedazo de las 500 empresas más grandes de EE.UU. a la vez.' },
      { type: 'quiz', title: 'Diversificación', content: '¿Por qué es mejor un ETF que una sola acción?', question: 'Ventaja:', options: ['Es más barato siempre', 'Si una empresa quiebra, las otras te protegen', 'Ganas dinero garantizado'], correctIndex: 1 },
      { type: 'practice', title: 'Tarea Práctica', content: 'Decisión de Inversión: Tienes $100 para invertir a 20 años.', question: '¿Cuál es la estrategia más sólida?', options: ['Invertir todo en una moneda nueva', 'Poner los $100 en un ETF diversificado (VOO/SPY)', 'Esperar a que el mercado baje un 50% para entrar'], correctIndex: 1 }
    ]
  },
  // NUEVO: MUNDO 3: TU PRIMERA ACCIÓN (PREMIUM)
  {
    id: 'inv_7',
    title: 'Análisis de Gigantes',
    world: 'Z-PRO: Primera Acción',
    icon: '📊',
    xp: 600,
    isPremium: true,
    steps: [
      { type: 'info', title: '¿Qué mirar?', content: 'Antes de comprar, mira el PER (Precio/Ganancia) y si la empresa tiene deuda controlada. No compres solo porque el logo es famoso.' },
      { type: 'quiz', title: 'El Balance', content: 'Si una empresa gana mucho pero debe el doble...', question: '¿Es buena idea comprar sin investigar?', options: ['Sí, es famosa', 'No, la deuda puede hundirla', 'Tal vez si sube mañana'], correctIndex: 1 }
    ]
  },
  {
    id: 'inv_8',
    title: 'Comprando en Vivo',
    world: 'Z-PRO: Primera Acción',
    icon: '⚡',
    xp: 750,
    isPremium: true,
    steps: [
      { type: 'info', title: 'Orden Limit vs Market', content: 'Una orden "Market" compra al precio actual. Una "Limit" solo compra al precio que tú decidas. ¡Usa "Limit" para no pagar de más!' },
      { type: 'practice', title: 'Misión: El Ticker', content: 'Quieres comprar Apple.', question: '¿Cuál es su identificador oficial?', options: ['APLE', 'APPLE', 'AAPL'], correctIndex: 2 }
    ]
  },
  // NUEVO: MUNDO 4: CRIPTOMONEDAS (PREMIUM)
  {
    id: 'inv_9',
    title: 'Bitcoin y Blockchain',
    world: 'Z-PRO: Crypto',
    icon: '₿',
    xp: 800,
    isPremium: true,
    steps: [
      { type: 'info', title: 'Oro Digital', content: 'Bitcoin es escaso (solo habrá 21 millones). Blockchain es el libro contable que nadie puede hackear ni borrar.' },
      { type: 'quiz', title: 'Descentralización', content: '¿Quién controla Bitcoin?', question: 'Autoridad:', options: ['El gobierno de EE.UU', 'Nadie, es de la red', 'Google'], correctIndex: 1 }
    ]
  },
  {
    id: 'inv_10',
    title: 'Ethereum y Contratos',
    world: 'Z-PRO: Crypto',
    icon: '💎',
    xp: 900,
    isPremium: true,
    steps: [
      { type: 'info', title: 'Dinero Programable', content: 'Ethereum permite crear contratos inteligentes que se ejecutan solos sin abogados ni notarios.' },
      { type: 'quiz', title: 'Utilidad', content: '¿Para qué sirve Ethereum principalmente?', question: 'Uso:', options: ['Solo para comprar pan', 'Para apps descentralizadas (dApps)', 'Para enviar correos'], correctIndex: 1 }
    ]
  }
];

const StatCard = ({ label, value, icon, color, isDarkMode }: any) => (
  <div className={`p-5 rounded-[2.5rem] border transition-all duration-300 flex flex-col items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
    <div className={`p-3 rounded-2xl ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'} ${color}`}>{icon}</div>
    <div className="text-center">
      <div className={`text-xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{value}</div>
      <div className="text-[8px] font-black uppercase text-slate-400 tracking-[0.2em]">{label}</div>
    </div>
  </div>
);

interface AcademyProps {
  profile: UserProfile;
  onUpdateProfile: (u: Partial<UserProfile>) => void;
  onCompleteLesson: (id: string, xp: number) => void;
  isDarkMode: boolean;
  onCompleteOnboarding: (key: string) => void;
}

const Academy: React.FC<AcademyProps> = ({ profile, onUpdateProfile, onCompleteLesson, isDarkMode, onCompleteOnboarding }) => {
  const [activeTab, setActiveTab] = useState<'learn' | 'games'>('learn');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [stepFeedback, setStepFeedback] = useState<{ isCorrect: boolean, message: string } | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  const completedSet = new Set(profile.completedLessons);

  const academySteps = [
    {
      title: "Tu Camino al Éxito",
      content: "Aquí encontrarás lecciones interactivas para dominar el mundo financiero. Gana XP y sube de nivel con cada acierto."
    },
    {
      title: "Mundos y Lecciones",
      content: "Avanza por los diferentes mundos. Empieza por lo básico y ve desbloqueando temas más complejos de inversión."
    },
    {
      title: "Vidas y Retos",
      content: "Ten cuidado con los quizes. Si fallas una respuesta, perderás vidas. ¡Asegúrate de haber entendido bien el contenido!"
    },
    {
      title: "Sección de Juegos",
      content: "Haz clic en 'Juegos' para poner a prueba tus habilidades de forma divertida. ¡Cazar monedas también es una forma de aprender!"
    }
  ];

  const speakText = (text: string) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to find a natural Spanish voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('es-ES') && v.name.includes('Google')) || 
                           voices.find(v => v.lang.includes('es-ES')) ||
                           voices.find(v => v.lang.includes('es'));
    
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.lang = 'es-ES';
    utterance.rate = 0.95; // Slightly slower for better clarity
    utterance.pitch = 1.05; // Slightly higher for a more energetic/fluid tone
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleReplay = () => {
    if (activeLesson) {
      const step = activeLesson.steps[currentStepIdx];
      speakText(`${step.title}. ${step.content} ${step.question || ''}`);
    }
  };

  useEffect(() => {
    const handleVoicesChanged = () => {
      // Small delay to ensure voices are loaded
      if (activeLesson) handleReplay();
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    return () => window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
  }, [activeLesson, currentStepIdx]);

  useEffect(() => {
    if (activeLesson) {
      handleReplay();
    } else {
        window.speechSynthesis?.cancel();
        setIsSpeaking(false);
    }
  }, [activeLesson, currentStepIdx]);

  const startLesson = (lesson: Lesson) => {
    if (profile.lives <= 0 && !profile.isPremium) return;
    setActiveLesson(lesson);
    setCurrentStepIdx(0);
    setStepFeedback(null);
    setSelectedOption(null);
  };

  const handleNextStep = () => {
    if (!activeLesson) return;
    if (currentStepIdx < activeLesson.steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
      setStepFeedback(null);
      setSelectedOption(null);
    } else {
      onCompleteLesson(activeLesson.id, activeLesson.xp);
      setActiveLesson(null);
    }
  };

  const handleAnswer = (idx: number) => {
    if (!activeLesson || stepFeedback) return;
    const step = activeLesson.steps[currentStepIdx];
    setSelectedOption(idx);

    if (idx === step.correctIndex) {
      setStepFeedback({ isCorrect: true, message: '¡Excelente análisis financiero!' });
      setTimeout(handleNextStep, 1500);
    } else {
      setStepFeedback({ isCorrect: false, message: '¡Cuidado! Esa decisión afecta tu patrimonio. Pierdes 1 vida.' });
      if (!profile.isPremium) {
        onUpdateProfile({ lives: Math.max(0, profile.lives - 1) });
        if (profile.lives <= 1) setTimeout(() => setActiveLesson(null), 2000);
      }
    }
  };

  const renderLearningPath = () => {
    return (
      <div className="space-y-12">
        <div className="grid grid-cols-3 gap-6 px-2">
           <StatCard label="Racha" value={`${profile.streak} D`} icon={<Sparkles size={18} />} color="text-orange-500" isDarkMode={isDarkMode} />
           <StatCard label="Lecciones" value={profile.completedLessons.length.toString()} icon={<BookOpen size={18} />} color="text-indigo-500" isDarkMode={isDarkMode} />
           <StatCard label="Nivel" value={profile.level.toString()} icon={<Trophy size={18} />} color="text-amber-500" isDarkMode={isDarkMode} />
        </div>

        <div className="relative flex flex-col items-center gap-12 py-10">
          <div className={`absolute left-1/2 top-0 bottom-0 w-2 -translate-x-1/2 rounded-full hidden md:block ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
        
        {LESSONS_DATABASE.map((lesson, idx) => {
          const isCompleted = completedSet.has(lesson.id);
          const basicLessonsCount = LESSONS_DATABASE.filter(l => !l.isPremium).length;
          const isUnlocked = idx === 0 || completedSet.has(LESSONS_DATABASE[idx - 1].id);
          const isLockedByPremium = lesson.isPremium && !profile.isPremium;
          const isCurrent = isUnlocked && !isCompleted && !isLockedByPremium;
          
          return (
            <motion.div 
              key={lesson.id}
              initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className={`relative z-10 flex flex-col md:flex-row items-center gap-6 w-full max-w-lg ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              <div className="flex-1 text-center md:text-left">
                <div className={`transition-all ${isUnlocked && !isLockedByPremium ? 'opacity-100' : 'opacity-40'}`}>
                  <h4 className={`font-black italic uppercase text-[10px] mb-1 ${lesson.isPremium ? 'text-amber-500' : 'text-indigo-500'}`}>{lesson.world}</h4>
                  <h3 className={`text-xl font-black uppercase leading-tight ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{lesson.title}</h3>
                  <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-black tracking-widest">{lesson.xp} XP</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: (isUnlocked && !isLockedByPremium) ? 1.1 : 1 }}
                  whileTap={{ scale: (isUnlocked && !isLockedByPremium) ? 0.9 : 1 }}
                  disabled={!isUnlocked || isLockedByPremium}
                  onClick={() => startLesson(lesson)}
                  className={`w-24 h-24 rounded-[2.5rem] border-4 flex items-center justify-center text-4xl shadow-2xl transition-all ${
                    isCompleted 
                      ? 'bg-emerald-500 border-emerald-300 text-white' 
                      : isCurrent 
                        ? 'bg-indigo-600 border-indigo-400 text-white ring-8 ring-indigo-500/20' 
                        : (isUnlocked && !isLockedByPremium)
                          ? (isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200')
                          : (isDarkMode ? 'bg-slate-900 border-white/5 text-slate-600 grayscale' : 'bg-slate-100 border-slate-200 text-slate-400 grayscale')
                  }`}
                >
                  {isCompleted ? <CheckCircle2 size={36} /> : (isLockedByPremium ? <Lock size={28} /> : (isUnlocked ? lesson.icon : <Lock size={28} />))}
                </motion.button>
                {isCurrent && (
                  <div className="absolute -top-3 -right-3 bg-rose-500 text-white p-2 rounded-full shadow-lg shadow-rose-500/30 animate-bounce">
                     <Play size={14} fill="currentColor" />
                  </div>
                )}
                {isLockedByPremium && (
                   <div className="absolute -top-3 -right-3 bg-amber-500 text-white p-1.5 rounded-xl shadow-lg shadow-amber-500/30">
                      <Lock size={12} fill="currentColor" />
                   </div>
                )}
              </div>
              
              <div className="flex-1 hidden md:block" />
            </motion.div>
          );
        })}
        </div>

        {!profile.isPremium && (
          <div className={`mt-12 p-8 rounded-[3rem] text-center border-4 border-dashed ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200 text-slate-900'}`}>
             <div className="w-16 h-16 bg-amber-400/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-amber-500" size={32} />
             </div>
             <h4 className="text-2xl font-black italic uppercase mb-2">Más lecciones en Premium</h4>
             <p className="text-sm text-slate-500 font-medium mb-6">Desbloquea el nivel avanzado de inversiones y diversificación.</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen pb-32 animate-in fade-in duration-500 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
      {profile && !profile.onboardingSeen?.includes('academy') && (
        <OnboardingGuide 
          guideKey="academy" 
          steps={academySteps} 
          onComplete={onCompleteOnboarding} 
          isDarkMode={isDarkMode} 
        />
      )}
      <header className="px-6 py-6 border-b border-white/5 sticky top-0 z-40 backdrop-blur-md bg-opacity-80">
        <div className="flex justify-between items-end mb-6">
          <div>
             <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">Academy</h2>
                {!profile.isPremium && <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-[8px] font-black text-white px-2 py-0.5 rounded-full uppercase tracking-widest">PRO</span>}
             </div>
             <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">Saca tu máximo potencial financiero</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-2xl border border-white/5">
             <Heart size={14} className="text-rose-500 fill-rose-500" />
             <span className="text-sm font-black">{profile.isPremium ? '∞' : profile.lives}</span>
          </div>
        </div>

        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl">
          <button 
             onClick={() => setActiveTab('learn')}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'learn' ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-500' : 'text-slate-400'}`}
          >
             <BookOpen size={16} /> Aprender
          </button>
          <button 
             onClick={() => setActiveTab('games')}
             className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'games' ? 'bg-white dark:bg-slate-800 shadow-md text-indigo-500' : 'text-slate-400'}`}
          >
             <Gamepad2 size={16} /> Juegos
          </button>
        </div>
      </header>

      <main className="px-4 py-8">
        {activeTab === 'learn' ? renderLearningPath() : <MiniGames profile={profile} onUpdateProfile={onUpdateProfile} isDarkMode={isDarkMode} onCompleteOnboarding={onCompleteOnboarding} />}
      </main>

      <AnimatePresence>
        {activeLesson && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/98 backdrop-blur-3xl overflow-hidden"
          >
             <div className={`w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] bg-slate-900 rounded-[3rem] border border-white/10 flex flex-col overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)]`}>
                
                <div className="p-8 flex justify-between items-center border-b border-white/5">
                   <div className="flex items-center gap-3">
                      <span className="text-3xl">{activeLesson.icon}</span>
                      <div>
                         <h3 className="font-black italic uppercase text-lg text-white leading-tight">{activeLesson.title}</h3>
                         <div className="flex gap-1">
                            {activeLesson.steps.map((_, i) => (
                               <div key={i} className={`h-1 w-8 rounded-full ${i <= currentStepIdx ? 'bg-indigo-500' : 'bg-slate-700'}`} />
                            ))}
                         </div>
                      </div>
                   </div>
                   <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setVoiceEnabled(!voiceEnabled)}
                        className={`p-3 rounded-2xl transition-all ${voiceEnabled ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}
                      >
                         {voiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                      </button>
                      <button onClick={() => setActiveLesson(null)} className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white"><XCircle size={24} /></button>
                   </div>
                </div>

                <div className="flex-1 p-8 md:p-12 overflow-y-auto flex flex-col items-center justify-center text-center">
                   
                   <motion.div 
                      key={currentStepIdx}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="space-y-8 max-w-xl"
                   >
                       <div className="relative group">
                          <motion.div 
                            animate={{ 
                              y: [0, -10, 0],
                              rotate: [0, 2, -2, 0]
                            }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            onClick={handleReplay}
                            className="w-32 h-32 bg-indigo-500 rounded-[3rem] mx-auto flex items-center justify-center text-5xl shadow-2xl relative z-10 cursor-pointer hover:scale-105 active:scale-95 transition-transform"
                          >
                             🦊
                          </motion.div>
                          <AnimatePresence>
                             <motion.button 
                               key="audio-btn"
                               initial={{ scale: 0 }}
                               animate={{ scale: 1 }}
                               whileHover={{ scale: 1.2 }}
                               onClick={handleReplay}
                               className={`absolute -top-4 -right-4 p-3 rounded-full shadow-lg z-20 outline-none transition-all ${isSpeaking ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white text-indigo-600 shadow-xl'}`}
                             >
                                <Volume2 size={20} fill={isSpeaking ? "currentColor" : "none"} />
                             </motion.button>
                          </AnimatePresence>
                          <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] -z-10" />
                       </div>

                      <div className="space-y-4">
                         <h2 className="text-3xl md:text-4xl font-black italic uppercase text-white leading-tight">{activeLesson.steps[currentStepIdx].title}</h2>
                         <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed italic">"{activeLesson.steps[currentStepIdx].content}"</p>
                      </div>

                      {activeLesson.steps[currentStepIdx].type === 'info' && (
                         <button 
                           onClick={handleNextStep}
                           className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-2xl hover:scale-105 transition-all shadow-indigo-600/30"
                         >
                           Siguiente Paso <ChevronRight className="inline-block" />
                         </button>
                      )}

                      {activeLesson.steps[currentStepIdx].type === 'quiz' && (
                         <div className="space-y-4 pt-4 text-left">
                            <p className="text-center text-indigo-500 font-black uppercase tracking-widest text-sm mb-4">{activeLesson.steps[currentStepIdx].question}</p>
                            <div className="grid grid-cols-1 gap-3">
                               {activeLesson.steps[currentStepIdx].options?.map((opt, i) => (
                                 <button 
                                   key={i}
                                   disabled={!!stepFeedback}
                                   onClick={() => handleAnswer(i)}
                                   className={`p-6 rounded-3xl border-2 font-bold text-lg transition-all flex justify-between items-center ${
                                     selectedOption === i 
                                       ? (i === activeLesson.steps[currentStepIdx].correctIndex ? 'bg-emerald-500 border-emerald-400 text-white' : 'bg-rose-500 border-rose-400 text-white')
                                       : 'bg-slate-800 border-white/5 hover:border-indigo-500 text-white'
                                   }`}
                                 >
                                    <span className="flex-1 pr-4">{opt}</span>
                                    {selectedOption === i && (i === activeLesson.steps[currentStepIdx].correctIndex ? <CheckCircle2 /> : <XCircle />)}
                                 </button>
                               ))}
                            </div>
                         </div>
                      )}

                      {activeLesson.steps[currentStepIdx].type === 'practice' && (
                         <div className="space-y-4 pt-4 text-left">
                            <div className="bg-indigo-600/10 border border-indigo-500/20 p-4 rounded-2xl mb-4">
                                <p className="text-indigo-400 font-bold text-sm uppercase flex items-center gap-2">
                                    <Sparkles size={16} /> Misión Práctica
                                </p>
                                <p className="text-slate-300 text-sm mt-1">{activeLesson.steps[currentStepIdx].question}</p>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                               {activeLesson.steps[currentStepIdx].options?.map((opt, i) => (
                                 <button 
                                   key={i}
                                   disabled={!!stepFeedback}
                                   onClick={() => handleAnswer(i)}
                                   className={`p-5 rounded-3xl border-4 font-black italic uppercase text-sm transition-all flex justify-between items-center shadow-xl ${
                                     selectedOption === i 
                                       ? (i === activeLesson.steps[currentStepIdx].correctIndex ? 'bg-emerald-500 border-emerald-300 text-white scale-105' : 'bg-rose-500 border-rose-300 text-white scale-95')
                                       : 'bg-slate-800 border-white/5 hover:border-indigo-500 text-white'
                                   }`}
                                 >
                                    <span className="flex-1 pr-2">{opt}</span>
                                    {selectedOption === i && (i === activeLesson.steps[currentStepIdx].correctIndex ? <CheckCircle2 size={18} /> : <XCircle size={18} />)}
                                 </button>
                               ))}
                            </div>
                         </div>
                      )}

                      {stepFeedback && (
                        <motion.div 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          className={`p-6 rounded-[2rem] border-2 ${stepFeedback.isCorrect ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-rose-500/10 border-rose-500 text-rose-500'}`}
                        >
                           <p className="font-black uppercase italic tracking-tighter text-xl">{stepFeedback.isCorrect ? '¡Felicidades Maestro!' : '¡Oops! Reflexiona...'}</p>
                           <p className="text-sm font-bold opacity-80">{stepFeedback.message}</p>
                        </motion.div>
                      )}
                   </motion.div>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Academy;
