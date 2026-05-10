
import React, { useState, useEffect } from 'react';
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
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  icon: string;
  xp: number;
  steps: Step[];
  isPremium?: boolean;
}

const LESSONS_DATABASE: Lesson[] = [
  // MUNDO 1: FUNDAMENTOS
  {
    id: 'inv_1',
    title: 'El Despertar',
    world: 'Fundamentos',
    difficulty: 'Básico',
    icon: '🌱',
    xp: 50,
    isPremium: false,
    steps: [
      { type: 'info', title: 'Tu Dinero vs El Tiempo', content: 'Imaginas que guardas $1000 hoy. En 10 años, comprarán mucho menos debido a la inflación. ¡Debes moverte!' },
      { type: 'quiz', title: 'Reto Rápido', content: 'Si la inflación sube...', question: '¿Qué pasa con tu ahorro en efectivo?', options: ['Sube de valor', 'Baja su poder de compra', 'Se duplica'], correctIndex: 1 },
      { type: 'practice', title: 'Misión Inflación', content: 'Calcula el impacto de la inflación.', question: 'Si la inflación es del 5%, ¿cuánto valdrán $100 en un año?', options: ['$105', '$95', '$100'], correctIndex: 1 }
    ]
  },
  {
    id: 'inv_2',
    title: 'Interés Compuesto',
    world: 'Fundamentos',
    difficulty: 'Básico',
    icon: '⚙️',
    xp: 80,
    isPremium: false,
    steps: [
      { type: 'info', title: 'Bola de Nieve', content: 'Ganar intereses sobre los intereses ya ganados. A largo plazo, esto crea riqueza exponencial.' },
      { type: 'quiz', title: 'La Clave', content: '¿Qué es lo más importante en el interés compuesto?', question: 'Selecciona:', options: ['El banco', 'El tiempo', 'La suerte'], correctIndex: 1 },
      { type: 'practice', title: 'Proyección Z', content: 'Imagina que inviertes $100 al 10% anual.', question: '¿Tendrás más dinero en el año 2 que en el año 1?', options: ['Sí, mucho más', 'No, es lo mismo', 'Depende del mercado'], correctIndex: 0 }
    ]
  },
  {
      id: 'inv_3',
      title: 'Ahorro Inteligente',
      world: 'Fundamentos',
      difficulty: 'Básico',
      icon: '🏛️',
      xp: 60,
      isPremium: false,
      steps: [
          { type: 'info', title: 'Págate a ti mismo', content: 'Antes de pagar tus facturas, separa tu ahorro. Trátalo como un gasto obligatorio.' },
          { type: 'quiz', title: 'Orden de Prioridad', content: '¿Cuándo deberías ahorrar?', question: 'Momento ideal:', options: ['A fin de mes', 'Apenas recibes tu sueldo', 'Cuando sobre dinero'], correctIndex: 1 },
          { type: 'practice', title: 'Misión Ahorro', content: 'Decide cuándo ahorrar.', question: 'Si recibes tu sueldo hoy, ¿cuándo separas el 10%?', options: ['Hoy mismo', 'En 2 semanas', 'A fin de mes'], correctIndex: 0 }
      ]
  },
  // NUEVO: FINANZAS PERSONALES
  {
    id: 'fin_1',
    title: 'Regla 50/30/20',
    world: 'Finanzas',
    difficulty: 'Básico',
    icon: '📊',
    xp: 100,
    isPremium: false,
    steps: [
      { type: 'info', title: 'El Presupuesto Perfecto', content: '50% Necesidades, 30% Deseos, 20% Ahorro/Inversión. Es la brújula de tu salud financiera.' },
      { type: 'quiz', title: 'Distribución', content: '¿A qué categoría pertenecen las suscripciones de streaming?', question: 'Categoría:', options: ['Necesidades', 'Deseos', 'Ahorro'], correctIndex: 1 },
      { type: 'practice', title: 'Ajuste Quirúrgico', content: 'Ganas $2000.', question: '¿Cuánto deberías ahorrar según la regla?', options: ['$200', '$400', '$1000'], correctIndex: 1 }
    ]
  },
  {
    id: 'fin_2',
    title: 'Fondo de Emergencia',
    world: 'Finanzas',
    difficulty: 'Intermedio',
    icon: '🛡️',
    xp: 120,
    isPremium: false,
    steps: [
      { type: 'info', title: 'Tu Escudo Personal', content: 'Debes tener entre 3 a 6 meses de gastos ahorrados en una cuenta líquida para cualquier imprevisto.' },
      { type: 'quiz', title: 'La Reserva', content: '¿Para qué NO es el fondo de emergencia?', question: 'Uso prohibido:', options: ['Reparar el auto', 'Comprar un nuevo iPhone', 'Gastos médicos'], correctIndex: 1 },
      { type: 'practice', title: 'Cálculo de Supervivencia', content: 'Tus gastos mensuales son $800.', question: '¿Cuál es el fondo de emergencia mínimo recomendado?', options: ['$800', '$1600', '$2400'], correctIndex: 2 }
    ]
  },
  {
    id: 'fin_3',
    title: 'Tarjetas de Crédito/Débito',
    world: 'Finanzas',
    difficulty: 'Intermedio',
    icon: '💳',
    xp: 150,
    isPremium: false,
    steps: [
      { 
        type: 'info', 
        title: 'El Juego del Plástico', 
        content: 'Débito: Usas tu dinero. Crédito: Usas dinero del banco. El CAT (Costo Anual Total) incluye intereses y comisiones. La Anualidad es lo que pagas solo por tener la tarjeta.' 
      },
      { 
        type: 'quiz', 
        title: 'Entendiendo el CAT', 
        content: 'El CAT es el indicador más importante para comparar el costo real de un crédito.', 
        question: '¿Qué es mejor para tu bolsillo?', 
        options: ['Un CAT del 80%', 'Un CAT del 35%', 'Ignorar el CAT y ver solo la tasa'], 
        correctIndex: 1 
      },
      { 
        type: 'practice', 
        title: 'Uso Inteligente', 
        content: 'Tienes una tarjeta de crédito. La fecha de corte es hoy y tienes 20 días para pagar sin intereses.', 
        question: '¿Cómo evitas pagar intereses?', 
        options: ['Pagando el mínimo', 'Pagando el "Para no generar intereses"', 'Esperando al próximo mes'], 
        correctIndex: 1 
      }
    ]
  },
  // MUNDO: BANCA Y TARJETAS
  {
    id: 'bank_1',
    title: 'Débito vs Crédito',
    world: 'Banca y Tarjetas',
    difficulty: 'Básico',
    icon: '⚔️',
    xp: 110,
    isPremium: false,
    steps: [
      { 
        type: 'info', 
        title: 'La Gran Diferencia', 
        content: 'Débito: Usas tu propio dinero (lo que tienes en la cuenta). Crédito: Usas dinero prestado del banco que debes devolver en una fecha fija.' 
      },
      { 
        type: 'quiz', 
        title: 'Historial Crediticio', 
        content: 'El historial crediticio es tu reputación financiera ante el Buró.', 
        question: '¿Qué tarjeta te ayuda a construir este historial?', 
        options: ['Tarjeta de Débito', 'Tarjeta de Crédito', 'Tarjeta de Regalo'], 
        correctIndex: 1 
      },
      { 
        type: 'practice', 
        title: 'Reto de Origen', 
        content: 'Imaginas que compras un café. Si el dinero sale instantáneamente de tu saldo bancario...', 
        question: '¿Qué tipo de tarjeta usaste?', 
        options: ['Débito', 'Crédito', 'Monedero electrónico'], 
        correctIndex: 0 
      }
    ]
  },
  {
    id: 'bank_2',
    title: 'Conseguir tu Tarjeta',
    world: 'Banca y Tarjetas',
    difficulty: 'Intermedio',
    icon: '🏦',
    xp: 130,
    isPremium: false,
    steps: [
      { 
        type: 'info', 
        title: 'Puerta al Crédito', 
        content: 'Para tu primera tarjeta suelen pedir: Identificación, comprobante de domicilio e ingresos. Si no tienes historial, una "Tarjeta Garantizada" es tu mejor opción.' 
      },
      { 
        type: 'quiz', 
        title: 'Requisitos Clave', 
        content: 'Sin historial, los bancos dudan de prestarte.', 
        question: '¿Qué tarjeta te ayuda a construir este historial?', 
        options: ['Tarjeta Gold', 'Tarjeta Garantizada', 'Tarjeta Departamental'], 
        correctIndex: 1 
      },
      { 
        type: 'practice', 
        title: 'Comparador de Riesgo', 
        content: 'Banco A ofrece CAT de 120% y anualidad gratis. Banco B ofrece CAT de 45% y anualidad de $600.', 
        question: 'Si planeas financiarte (no pagar el total cada mes), ¿cuál es menos costosa?', 
        options: ['Banco A', 'Banco B', 'Es lo mismo'], 
        correctIndex: 1 
      }
    ]
  },
  // MUNDO 2: INVERSIONES
  {
    id: 'inv_4',
    title: 'Tu Primer Broker',
    world: 'Inversiones',
    difficulty: 'Intermedio',
    icon: '📱',
    xp: 100,
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
    world: 'Inversiones',
    difficulty: 'Intermedio',
    icon: '🎯',
    xp: 150,
    isPremium: true,
    steps: [
      { type: 'info', title: 'Tu Primera Orden', content: 'Para comprar una acción, buscas el Ticker (ej: AAPL) y eliges cuántas acciones o fracciones quieres.' },
      { type: 'quiz', title: 'Propiedad', content: '¿Qué recibes al comprar una acción?', question: 'Eres un...', options: ['Empleado', 'Socio/Dueño de una parte', 'Cliente VIP'], correctIndex: 1 },
      { type: 'practice', title: 'Misión Ticker', content: 'Busca el ticker de Microsoft.', question: '¿Cuál es?', options: ['MSFT', 'MICR', 'SOFT'], correctIndex: 0 }
    ]
  },
  {
    id: 'inv_6',
    title: 'ETFs y Bolsa',
    world: 'Inversiones',
    difficulty: 'Intermedio',
    icon: '🧺',
    xp: 180,
    isPremium: true,
    steps: [
      { type: 'info', title: 'El Poder del ETF', content: 'Un ETF es una canasta de activos. En lugar de apostar a un caballo, apuestas a toda la carrera.' },
      { type: 'quiz', title: 'Diversificación', content: '¿Qué significa diversificar con un ETF?', question: 'Efecto:', options: ['Ganas más rápido', 'Reduces el riesgo individual', 'No pagas impuestos'], correctIndex: 1 },
      { type: 'practice', title: 'Análisis de Cartera', content: 'Tienes $500 para 10 años.', question: '¿Qué ETF elegirías para seguir a las 500 empresas más grandes de EE.UU.?', options: ['EEM (Emergentes)', 'VOO (S&P 500)', 'GLD (Oro)'], correctIndex: 1 }
    ]
  },
  {
    id: 'inv_7',
    title: 'Análisis Fundamental',
    world: 'Inversiones',
    difficulty: 'Avanzado',
    icon: '🔍',
    xp: 200,
    isPremium: true,
    steps: [
      { type: 'info', title: 'Entendiendo el Valor', content: 'El análisis fundamental evalúa la salud financiera de una empresa: ventas, deuda y proyecciones.' },
      { type: 'quiz', title: 'Métricas Clave', content: 'Si una empresa tiene mucha deuda y pocas ventas...', question: '¿Qué diría un analista fundamental?', options: ['Es una oportunidad', 'Es de alto riesgo', 'Es irrelevante'], correctIndex: 1 },
      { type: 'practice', title: 'Examen de Balanza', content: 'La Empresa Z tiene un PER de 100 mientras su sector promedia 20.', question: '¿Cómo podrías calificar su precio?', options: ['Está barata', 'Está costosa/sobrevalorada', 'Normal'], correctIndex: 1 }
    ]
  },
  // MUNDO 3: CRIPTO
  {
    id: 'crypto_1',
    title: 'Cripto Fundamentos',
    world: 'Cripto',
    difficulty: 'Básico',
    icon: '🪙',
    xp: 130,
    isPremium: true,
    steps: [
      { type: 'info', title: '¿Qué es Blockchain?', content: 'Es un libro contable digital que nadie puede borrar ni editar. La base de las criptomonedas.' },
      { type: 'quiz', title: 'Descentralización', content: '¿Quién controla la red Bitcoin?', question: 'Entidad:', options: ['El Gobierno de EE.UU.', 'Nadie, es descentralizada', 'Elon Musk'], correctIndex: 1 },
      { type: 'practice', title: 'Misión Bloque', content: '¿Qué pasa si intentas cambiar una transacción antigua en la blockchain?', question: 'Resultado:', options: ['Se actualiza en todos lados', 'La red la rechaza por inválida', 'Te cobran una multa'], correctIndex: 1 }
    ]
  },
  {
    id: 'crypto_2',
    title: 'Seguridad Cripto',
    world: 'Cripto',
    difficulty: 'Avanzado',
    icon: '🔐',
    xp: 180,
    isPremium: true,
    steps: [
      { type: 'info', title: 'Llaves Privadas', content: 'No tus llaves, no tus monedas. Una frase semilla (12/24 palabras) es el acceso total a tu dinero.' },
      { type: 'quiz', title: 'Almacenamiento', content: '¿Cuál es la forma más segura de guardar grandes cantidades de cripto?', question: 'Método:', options: ['En un Exchange', 'En una Cold Wallet (Física)', 'En una captura de pantalla'], correctIndex: 1 },
      { type: 'practice', title: 'Simulacro de Phishing', content: 'Alguien del "soporte" te pide tus 12 palabras para arreglar tu cuenta.', question: '¿Qué haces?', options: ['Se las das con confianza', 'Le bloqueas inmediatamente', 'Le darás solo las primeras 6'], correctIndex: 1 }
    ]
  },
  // MUNDO 4: ESTRATEGIA
  {
    id: 'strat_1',
    title: 'Planificación Patrimonial',
    world: 'Patrimonio',
    difficulty: 'Avanzado',
    icon: '🏰',
    xp: 250,
    isPremium: true,
    steps: [
      { type: 'info', title: 'El Legado', content: 'Planificar tu patrimonio implica proteger tus activos para el futuro y tus herederos.' },
      { type: 'quiz', title: 'Protección', content: '¿Qué herramienta ayuda a proteger activos de demandas o impuestos excesivos?', question: 'Herramienta:', options: ['Una cuenta de ahorros', 'Un Fideicomiso o Trust', 'Esconder dinero en casa'], correctIndex: 1 },
      { type: 'practice', title: 'Visión a 30 Años', content: 'Quieres que tu riqueza sobreviva a tu jubilación y pase a tus hijos.', question: '¿Cuál es la base de esta estrategia?', options: ['Gastar todo ahora', 'Inversión recurrente y protección legal', 'Vivir solo de la seguridad social'], correctIndex: 1 }
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
      setShowCompletion(true);
      onCompleteLesson(activeLesson.id, activeLesson.xp);
      // We'll close the modal after some delay or user interaction
    }
  };

  const [showCompletion, setShowCompletion] = useState(false);

  const renderCompletion = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center text-center p-8 space-y-8"
    >
      <div className="relative">
         <motion.div 
           initial={{ scale: 0 }}
           animate={{ scale: [0, 1.2, 1] }}
           transition={{ delay: 0.2 }}
           className="w-40 h-40 bg-emerald-500 rounded-[3rem] flex items-center justify-center text-6xl shadow-[0_20px_60px_rgba(16,185,129,0.5)]"
         >
            🏆
         </motion.div>
         {/* Particle burst */}
         {[...Array(12)].map((_, i) => (
           <motion.div
             key={i}
             initial={{ x: 0, y: 0, opacity: 1 }}
             animate={{ 
               x: Math.cos(i * 30 * (Math.PI / 180)) * 120, 
               y: Math.sin(i * 30 * (Math.PI / 180)) * 120,
               opacity: 0 
             }}
             transition={{ duration: 1, delay: 0.3 }}
             className="absolute top-1/2 left-1/2 w-2 h-2 bg-amber-400 rounded-full"
           />
         ))}
      </div>

      <div className="space-y-2">
        <h2 className="text-4xl font-black italic uppercase text-white tracking-tight">¡Misión Cumplida!</h2>
        <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">Has dominado {activeLesson?.title}</p>
      </div>

      <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] w-full max-w-xs flex items-center justify-between">
         <div className="text-left">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Recompensa</span>
            <div className="text-2xl font-black text-amber-500">+{activeLesson?.xp} XP</div>
         </div>
         <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
            <Star size={24} fill="currentColor" />
         </div>
      </div>

      <button 
        onClick={() => {
          setActiveLesson(null);
          setShowCompletion(false);
        }}
        className="w-full max-w-xs bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-2xl hover:scale-105 transition-all shadow-indigo-600/30"
      >
        Continuar Camino
      </button>
    </motion.div>
  );

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

        {profile.isPremium && (
          <div className={`mx-2 p-6 rounded-[2rem] border-2 border-dashed flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-500 ${isDarkMode ? 'bg-cyan-500/5 border-cyan-500/20' : 'bg-cyan-50 border-cyan-100'}`}>
             <div className="flex items-center gap-4 text-center md:text-left">
               <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-2xl shadow-lg">💎</div>
                 <div>
                   <h4 className="text-xs font-black uppercase tracking-widest text-cyan-500">Bono de Estudio</h4>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mt-1">
                     {profile.claimedLessonTier2 ? '¡Máximo bono alcanzado! Eres un maestro.' : 
                      profile.claimedLessonTier1 ? `Completa 8 lecciones para ganar 10 diamantes más. (${profile.completedLessons.length}/8)` : 
                      `Completa 4 lecciones para ganar tus primeros 5 diamantes. (${profile.completedLessons.length}/4)`}
                   </p>
                 </div>
             </div>
             <div className="w-full md:w-32 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-cyan-500 transition-all duration-1000" 
                  style={{ width: `${Math.min(100, (profile.completedLessons.length / (profile.claimedLessonTier1 ? 8 : 4)) * 100)}%` }} 
                />
             </div>
          </div>
        )}

        <div className="relative flex flex-col items-center gap-24 py-16 overflow-hidden">
          {/* Dynamic Background Path Line */}
          <svg className="absolute top-0 left-0 w-full h-full -z-10 pointer-events-none" preserveAspectRatio="none">
            {/* The base path (inactive) */}
            <path 
              d={`M ${typeof window !== 'undefined' ? window.innerWidth / 2 : 200} 0 
                  ${LESSONS_DATABASE.map((_, i) => (
                    `C ${i % 2 === 0 ? '50' : '350'} ${i * 200 + 100}, 
                       ${i % 2 === 0 ? '350' : '50'} ${i * 200 + 100}, 
                       ${typeof window !== 'undefined' ? window.innerWidth / 2 : 200} ${i * 200 + 200}`
                  )).join(' ')}`}
              fill="none" 
              stroke={isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(79,70,229,0.03)'} 
              strokeWidth="60"
              strokeLinecap="round"
            />
            {/* The Progress Path (active) */}
            <motion.path 
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              d={`M ${typeof window !== 'undefined' ? window.innerWidth / 2 : 200} 0 
                  ${LESSONS_DATABASE.map((_, i) => {
                    if (!completedSet.has(LESSONS_DATABASE[i].id) && i > 0 && !completedSet.has(LESSONS_DATABASE[i-1].id)) return '';
                    return `C ${i % 2 === 0 ? '50' : '350'} ${i * 200 + 100}, 
                       ${i % 2 === 0 ? '350' : '50'} ${i * 200 + 100}, 
                       ${typeof window !== 'undefined' ? window.innerWidth / 2 : 200} ${i * 200 + 200}`;
                  }).join(' ')}`}
              fill="none" 
              stroke={isDarkMode ? 'rgba(79,70,229,0.2)' : 'rgba(79,70,229,0.1)'} 
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="1 15"
            />
          </svg>
        
        {LESSONS_DATABASE.map((lesson, idx) => {
          const isCompleted = completedSet.has(lesson.id);
          const isUnlocked = idx === 0 || completedSet.has(LESSONS_DATABASE[idx - 1].id);
          const isLockedByPremium = lesson.isPremium && !profile.isPremium;
          const isCurrent = isUnlocked && !isCompleted && !isLockedByPremium;
          
          // Calculate horizontal offset for the "wavy" path
          const xOffset = Math.sin(idx * 2) * 80;

          return (
            <motion.div 
              key={lesson.id}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              style={{ x: xOffset }}
              className="relative z-10 flex flex-col items-center transition-all"
            >
              <div className="absolute -top-14 text-center w-48 pointer-events-none">
                  <motion.h4 
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: isUnlocked ? 1 : 0.4 }}
                    className={`font-black italic uppercase text-[9px] tracking-[0.25em] mb-1 transition-all ${lesson.isPremium ? 'text-amber-500' : 'text-indigo-500'}`}
                  >
                    {lesson.world}
                  </motion.h4>
                  <h3 className={`text-sm font-black italic uppercase leading-none truncate transition-all duration-500 ${
                    isCompleted ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') :
                    isCurrent ? (isDarkMode ? 'text-white' : 'text-slate-900') :
                    'text-slate-500'
                  }`}>
                    {lesson.title}
                  </h3>
              </div>

              <div className="relative group p-4">
                {/* Glow behind current node */}
                {isCurrent && (
                   <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute inset-0 bg-indigo-500 blur-3xl opacity-30 invisible group-hover:visible" 
                   />
                )}

                <motion.button
                  whileHover={{ scale: (isUnlocked && !isLockedByPremium) ? 1.2 : 1 }}
                  whileTap={{ scale: (isUnlocked && !isLockedByPremium) ? 0.9 : 1 }}
                  disabled={!isUnlocked || isLockedByPremium}
                  onClick={() => startLesson(lesson)}
                  className={`w-24 h-24 rounded-[2.5rem] border-4 flex items-center justify-center text-4xl transition-all duration-500 relative ${
                    isCompleted 
                      ? 'bg-emerald-500 border-emerald-300 text-white shadow-[0_15px_40px_rgba(16,185,129,0.4)]' 
                      : isCurrent 
                        ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_20px_50px_rgba(79,70,229,0.5)] ring-[12px] ring-indigo-500/10' 
                        : (isUnlocked && !isLockedByPremium)
                          ? (isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 shadow-xl' : 'bg-white border-slate-200 text-slate-600 shadow-xl shadow-slate-200/50')
                          : (isDarkMode ? 'bg-slate-900 border-white/5 text-slate-700 grayscale opacity-40' : 'bg-slate-100 border-slate-200 text-slate-400 grayscale opacity-50')
                  }`}
                >
                  <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                    {isCompleted ? <CheckCircle2 size={40} className="drop-shadow-lg" /> : (isLockedByPremium ? <Lock size={32} /> : (isUnlocked ? lesson.icon : <Lock size={32} />))}
                  </div>
                  
                  {/* Rotating dashed ring for current */}
                  {isCurrent && (
                     <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                        className="absolute -inset-4 rounded-[3rem] border-2 border-dashed border-indigo-500/40"
                     />
                  )}

                  {/* Progress Ring for current/unlocked */}
                  {isUnlocked && !isCompleted && !isLockedByPremium && (
                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                      <circle 
                        cx="48" cy="48" r="44" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeDasharray="276" 
                        strokeDashoffset="276"
                        className="text-white/10"
                      />
                    </svg>
                  )}
                </motion.button>

                <AnimatePresence>
                  {isCurrent && (
                    <motion.div 
                      initial={{ scale: 0, opacity: 0, y: 10 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0, opacity: 0, y: 10 }}
                      className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-2xl shadow-xl shadow-indigo-600/30 border border-white/20 text-[9px] font-black italic uppercase tracking-[0.2em] whitespace-nowrap z-30"
                    >
                       ¡Empezar AHORA!
                       <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-indigo-600" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {isLockedByPremium && (
                   <motion.div 
                     whileHover={{ rotate: [0, -10, 10, 0] }}
                     className="absolute -bottom-1 -right-1 bg-gradient-to-br from-amber-400 to-orange-600 text-white p-2 rounded-2xl shadow-lg border border-white/30 z-20"
                   >
                      <Lock size={14} fill="currentColor" />
                   </motion.div>
                )}
              </div>
              
              <div className={`flex items-center gap-1.5 mt-2 transition-all duration-500 ${isUnlocked ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="flex -space-x-1">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                  </div>
                  <span className={`text-[10px] font-black italic tracking-tighter ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{lesson.xp} XP</span>
              </div>

              {/* Connecting line to status text if needed */}
              {isCompleted && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="mt-2 h-1 bg-emerald-500/20 rounded-full max-w-[40px]" 
                />
              )}
            </motion.div>
          );
        })}
        </div>
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
        {activeTab === 'learn' ? renderLearningPath() : <MiniGames profile={profile} onUpdateProfile={onUpdateProfile} isDarkMode={isDarkMode} onCompleteOnboarding={onCompleteOnboarding} onExitArcade={() => setActiveTab('learn')} />}
      </main>

      <AnimatePresence>
        {activeLesson && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/98 backdrop-blur-3xl overflow-hidden"
          >
             <div className="w-full max-w-4xl h-full md:h-auto md:max-h-[90vh] bg-slate-900 rounded-[3rem] border border-white/10 flex flex-col overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)]">
                
                {/* Modal Header */}
                <div className="p-8 flex justify-between items-center border-b border-white/5">
                   <div className="flex items-center gap-3">
                      <span className="text-3xl">{activeLesson.icon}</span>
                      <div>
                         <h3 className="font-black italic uppercase text-lg text-white leading-tight">{activeLesson.title}</h3>
                         <div className="flex gap-1">
                            {activeLesson.steps.map((_, i) => (
                               <div key={i} className={`h-1 w-8 rounded-full transition-all duration-500 ${i <= currentStepIdx ? 'bg-indigo-500 w-12' : 'bg-slate-700'}`} />
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
                      <button 
                        onClick={() => {
                          setActiveLesson(null);
                          setShowCompletion(false);
                        }} 
                        className="p-3 bg-slate-800 rounded-2xl text-slate-400 hover:text-white transition-colors"
                      >
                        <XCircle size={24} />
                      </button>
                   </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto flex flex-col items-center justify-center text-center">
                   <AnimatePresence mode="wait">
                    {showCompletion ? (
                      <div key="completion">
                        {renderCompletion()}
                      </div>
                    ) : (
                      <motion.div 
                        key={currentStepIdx}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="space-y-8 w-full max-w-xl"
                      >
                        {/* Interactive Character / Icon */}
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
                              {activeLesson.icon}
                           </motion.div>
                           <motion.button 
                             whileHover={{ scale: 1.2 }}
                             onClick={handleReplay}
                             className={`absolute -top-4 -right-4 p-3 rounded-full shadow-lg z-20 outline-none transition-all ${isSpeaking ? 'bg-indigo-600 text-white animate-pulse' : 'bg-white text-indigo-600 shadow-xl'}`}
                           >
                              <Volume2 size={20} fill={isSpeaking ? "currentColor" : "none"} />
                           </motion.button>
                           <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] -z-10" />
                        </div>

                       {/* Question / Info Text */}
                       <div className="space-y-4">
                          <h2 className="text-3xl md:text-4xl font-black italic uppercase text-white leading-tight">{activeLesson.steps[currentStepIdx].title}</h2>
                          <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed italic">"{activeLesson.steps[currentStepIdx].content}"</p>
                       </div>

                       {/* Step Controls */}
                       {activeLesson.steps[currentStepIdx].type === 'info' && (
                          <button 
                            onClick={handleNextStep}
                            className="w-full bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-2xl hover:scale-105 transition-all shadow-indigo-600/30"
                          >
                            Siguiente Paso <ChevronRight className="inline-block ml-2" />
                          </button>
                       )}

                       {(activeLesson.steps[currentStepIdx].type === 'quiz' || activeLesson.steps[currentStepIdx].type === 'practice') && (
                          <div className="space-y-4 pt-4 text-left">
                             <p className="text-center text-indigo-500 font-black uppercase tracking-widest text-sm mb-4">
                                {activeLesson.steps[currentStepIdx].question}
                             </p>
                             <div className="grid grid-cols-1 gap-3">
                                {activeLesson.steps[currentStepIdx].options?.map((opt, i) => (
                                  <button 
                                    key={i}
                                    disabled={!!stepFeedback}
                                    onClick={() => handleAnswer(i)}
                                    className={`p-6 rounded-3xl border-2 font-bold text-lg transition-all flex justify-between items-center ${
                                      selectedOption === i 
                                        ? (i === activeLesson.steps[currentStepIdx].correctIndex ? 'bg-emerald-500 border-emerald-400 text-white shadow-lg shadow-emerald-500/20' : 'bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20')
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

                       {/* Feedback Message */}
                       <AnimatePresence>
                         {stepFeedback && (
                           <motion.div 
                             initial={{ y: 20, opacity: 0 }}
                             animate={{ y: 0, opacity: 1 }}
                             exit={{ opacity: 0 }}
                             className={`p-6 rounded-[2rem] border-2 mt-6 ${stepFeedback.isCorrect ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'bg-rose-500/10 border-rose-500 text-rose-500'}`}
                           >
                              <p className="font-black uppercase italic tracking-tighter text-xl">{stepFeedback.isCorrect ? '¡Excelente!' : '¡Inténtalo de nuevo!'}</p>
                              <p className="text-sm font-bold opacity-80">{stepFeedback.message}</p>
                           </motion.div>
                         )}
                       </AnimatePresence>
                      </motion.div>
                    )}
                   </AnimatePresence>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Academy;
