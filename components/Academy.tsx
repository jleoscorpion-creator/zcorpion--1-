
import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';

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
}

const INVESTMENT_MAP: Lesson[] = [
  // MUNDO 1: FUNDAMENTOS
  {
    id: 'inv_1',
    title: 'El Despertar',
    world: 'Fundamentos',
    icon: '🌱',
    xp: 150,
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
    steps: [
      { type: 'info', title: 'Bola de Nieve', content: 'Ganar intereses sobre los intereses ya ganados. A largo plazo, esto crea riqueza exponencial.' },
      { type: 'practice', title: 'Visualiza', content: 'Invirtiendo poco cada mes desde joven es más potente que invertir mucho pero empezar tarde.' },
      { type: 'quiz', title: 'La Clave', content: '¿Qué es lo más importante en el interés compuesto?', question: 'Selecciona:', options: ['El banco', 'El tiempo', 'La suerte'], correctIndex: 1 }
    ]
  },
  // MUNDO 2: EL BROKER (ACCIONES)
  {
    id: 'inv_3',
    title: 'Tu Primer Broker',
    world: 'Acciones',
    icon: '📱',
    xp: 300,
    steps: [
      { type: 'info', title: '¿Qué es un Broker?', content: 'Es la app o institución que te da acceso a la bolsa. Debes buscar uno regulado y con bajas comisiones.' },
      { type: 'info', title: 'Órdenes de Compra', content: 'La "Orden Limitada" es la mejor: tú pones el precio máximo que quieres pagar por una acción.' },
      { type: 'quiz', title: 'Seguridad', content: '¿Qué debes revisar antes de meter dinero a un Broker?', question: 'Prioridad:', options: ['Que sea bonito', 'Que esté regulado por autoridades', 'Que me lo recomendó un influencer'], correctIndex: 1 }
    ]
  },
  {
    id: 'inv_3_b',
    title: 'Comprar tu Acción',
    world: 'Acciones',
    icon: '🎯',
    xp: 450,
    steps: [
      { type: 'info', title: 'Ejecución Directa', content: 'Para comprar, buscas el Ticker (ej: AAPL para Apple), pones el monto y confirmas. ¡Felicidades, eres socio!' },
      { type: 'practice', title: 'Reto de Compra', content: 'Simula elegir una empresa que consumes diario (Amazon, Google, Netflix) y observa cuánto cuesta una fracción.' },
      { type: 'quiz', title: 'Horarios', content: '¿Cuándo puedes comprar acciones normalmente?', question: 'Horario:', options: ['Cualquier hora 24/7', 'En horario de apertura de la bolsa (L-V)', 'Solo los fines de semana'], correctIndex: 1 }
    ]
  },
  {
    id: 'inv_4',
    title: 'ETFs: La Canasta',
    world: 'Acciones',
    icon: '🧺',
    xp: 350,
    steps: [
      { type: 'info', title: 'Diversificación', content: 'Un ETF es un conjunto de cientos de empresas. Si una falla, el resto te protege.' },
      { type: 'quiz', title: 'Selección', content: '¿Cuál es la ventaja de un ETF sobre una acción sola?', question: 'Ventaja:', options: ['Ganas más rápido', 'Riesgo diversificado', 'Es más barato siempre'], correctIndex: 1 }
    ]
  },
  // MUNDO 3: TARJETAS Y CRÉDITO
  {
    id: 'inv_5',
    title: 'Débito vs Crédito',
    world: 'Banca y Tarjetas',
    icon: '💳',
    xp: 400,
    steps: [
      { type: 'info', title: 'El Gran Diferenciador', content: 'Débito es tu dinero real. Crédito es dinero prestado del banco que debes pagar a tiempo.' },
      { type: 'quiz', title: 'Uso Maestro', content: '¿Cómo debes usar una tarjeta de crédito para que sea "gratis"?', question: 'Estrategia:', options: ['Pagar el mínimo', 'Ser Totalero (pagar todo cada mes)', 'Solo usarla en emergencias'], correctIndex: 1 }
    ]
  },
  {
    id: 'inv_5_b',
    title: 'Conseguir tu Tarjeta',
    world: 'Banca y Tarjetas',
    icon: '🔓',
    xp: 500,
    steps: [
      { type: 'info', title: 'La Solicitud', content: 'Busca una tarjeta "Sin Anualidad" para empezar. El banco evaluará tus ingresos y te dará una línea de crédito.' },
      { type: 'info', title: 'El CAT', content: 'Es el Costo Anual Total. Si pagas todo a tiempo, no te importa, pero si te atrasas, el CAT define cuánto pagarás de más.' },
      { type: 'quiz', title: 'Elección', content: '¿Qué es lo primero que debes mirar en una tarjeta de entrada?', question: 'Criterio:', options: ['El color del plástico', 'Que no cobre anualidad', 'Que tenga un límite muy alto'], correctIndex: 1 }
    ]
  },
  {
    id: 'inv_6',
    title: 'Historial Crediticio',
    world: 'Banca y Tarjetas',
    icon: '📊',
    xp: 450,
    steps: [
      { type: 'info', title: 'Tu Score', content: 'Es una calificación de 300 a 850. Mientras más alto, más fácil te darán créditos hipotecarios o para autos.' },
      { type: 'quiz', title: '¿Qué lo daña?', content: '¿Cuál es el factor que más baja tu calificación?', question: 'Cuidado con:', options: ['Consultar mucho tu saldo', 'Pagar tarde o no pagar', 'Tener muchas tarjetas'], correctIndex: 1 }
    ]
  },
  // MUNDO 4: LA FRONTERA DIGITAL
  {
    id: 'inv_7',
    title: 'Cripto Fundamentos',
    world: 'Cripto',
    icon: '₿',
    xp: 500,
    steps: [
      { type: 'info', title: '¿Qué es Bitcoin?', content: 'Es oro digital. Una moneda limitada que no depende de ningún gobierno ni banco central.' },
      { type: 'quiz', title: 'Volatilidad', content: 'El precio de las criptomonedas puede caer 50% en un día.', question: '¿Cómo invertir en ellas?', options: ['Con todo mi ahorro', 'Con dinero que puedo permitirme perder', 'Vender cuando caen'], correctIndex: 1 }
    ]
  },
  {
    id: 'inv_7_b',
    title: 'Seguridad Cripto',
    world: 'Cripto',
    icon: '🔐',
    xp: 550,
    steps: [
      { type: 'info', title: 'Exchange vs Wallet', content: 'El Exchange es para comprar. La Wallet es para GUARDAR. "Not your keys, not your coins".' },
      { type: 'info', title: '2FA y Frase Semilla', content: 'Nunca compartas tus 12-24 palabras. Son la llave maestra de tu dinero digital.' },
      { type: 'quiz', title: 'Protección', content: '¿Dónde es más seguro guardar grandes cantidades de Cripto?', question: 'Opción:', options: ['En el exchange (app)', 'En una cartera fría (hardware wallet)', 'En un post-it pegado al monitor'], correctIndex: 1 }
    ]
  },
  // MUNDO 5: MAESTRÍA Y ADMIN
  {
    id: 'inv_8',
    title: 'Fondo de Emergencia',
    world: 'Administración',
    icon: '🛡️',
    xp: 600,
    steps: [
      { type: 'info', title: 'Tu Seguro de Vida', content: 'Antes de invertir fuerte, debes tener de 3 a 6 meses de tus gastos en una cuenta segura de fácil acceso.' },
      { type: 'quiz', title: 'Uso del Fondo', content: '¿Para qué sirve el fondo de emergencia?', question: 'Misión:', options: ['Comprar un auto nuevo', 'Sobrevivir si pierdo mi empleo', 'Invertir en criptomonedas'], correctIndex: 1 }
    ]
  },
  {
    id: 'inv_9',
    title: 'Independencia',
    world: 'Administración',
    icon: '🏆',
    xp: 1000,
    steps: [
      { type: 'info', title: 'La Regla del 4%', content: 'Si logras que tus inversiones paguen tus gastos anuales, eres libre. No necesitas trabajar por dinero nunca más.' },
      { type: 'quiz', title: 'Meta Final', content: '¿Qué define la verdadera riqueza?', options: ['Tener un Ferrari', 'Tener tiempo libre y paz financiera', 'Ganar más que el vecino'], correctIndex: 1 }
    ]
  }
];

const Academy: React.FC<{ 
  profile: UserProfile, 
  onUpdateProfile: (u: Partial<UserProfile>) => void, 
  onCompleteLesson: (id: string, xp: number) => void, 
  isDarkMode: boolean 
}> = ({ profile, onUpdateProfile, onCompleteLesson, isDarkMode }) => {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [stepFeedback, setStepFeedback] = useState<{ isCorrect: boolean, message: string } | null>(null);
  const [timer, setTimer] = useState(30);
  const [accumulatedXP, setAccumulatedXP] = useState(0);
  const timerRef = useRef<any>(null);

  const completedSet = new Set(profile.completedLessons);

  const startLesson = (lesson: Lesson) => {
    if (profile.lives <= 0) return;
    setActiveLesson(lesson);
    setCurrentStepIdx(0);
    setSelectedOption(null);
    setStepFeedback(null);
    setTimer(30);
    setAccumulatedXP(0);
    startTimer();
  };

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimer(30);
    timerRef.current = setInterval(() => {
      setTimer(t => (t > 0 ? t - 1 : 0));
    }, 1000);
  };

  const handleNextStep = () => {
    if (!activeLesson) return;
    if (currentStepIdx < activeLesson.steps.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
      setSelectedOption(null);
      setStepFeedback(null);
      startTimer();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      const totalXP = activeLesson.xp + accumulatedXP;
      onCompleteLesson(activeLesson.id, totalXP);
      setActiveLesson(null);
    }
  };

  const handleAnswer = (idx: number) => {
    if (!activeLesson || stepFeedback) return;
    const step = activeLesson.steps[currentStepIdx];
    setSelectedOption(idx);

    if (idx === step.correctIndex) {
      const timeBonus = timer > 15 ? 20 : 10;
      setAccumulatedXP(prev => prev + timeBonus);
      setStepFeedback({ isCorrect: true, message: `¡Correcto! Bonus: +${timeBonus} XP` });
      setTimeout(handleNextStep, 1500);
    } else {
      setStepFeedback({ isCorrect: false, message: '¡Error! Pierdes 1 vida.' });
      onUpdateProfile({ lives: profile.lives - 1 });
      if (profile.lives <= 1) {
        setTimeout(() => setActiveLesson(null), 2000);
      }
    }
  };

  const renderMap = () => {
    return (
      <div className="relative flex flex-col items-center gap-24 py-24 px-4 overflow-hidden">
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-full pointer-events-none opacity-10" viewBox="0 0 100 2500" preserveAspectRatio="none">
          <path 
            d="M50,0 Q80,200 50,400 T50,800 Q20,1000 50,1200 T50,1600 Q80,1800 50,2000 T50,2400" 
            fill="none" 
            stroke={isDarkMode ? "#6366f1" : "#4f46e5"} 
            strokeWidth="3" 
            strokeDasharray="12 12" 
          />
        </svg>

        {INVESTMENT_MAP.map((lesson, idx) => {
          const isCompleted = completedSet.has(lesson.id);
          const isUnlocked = idx === 0 || completedSet.has(INVESTMENT_MAP[idx - 1].id);
          const isCurrent = isUnlocked && !isCompleted;
          const offset = idx % 2 === 0 ? '-translate-x-14 md:-translate-x-20' : 'translate-x-14 md:translate-x-20';

          return (
            <div key={lesson.id} className={`relative z-10 flex flex-col items-center group transition-all duration-700 ${offset}`}>
               {(idx === 0 || INVESTMENT_MAP[idx-1].world !== lesson.world) && (
                 <div className="absolute -top-16 left-1/2 -translate-x-1/2 whitespace-nowrap">
                   <div className="flex flex-col items-center gap-1">
                     <span className="bg-indigo-600 text-white text-[8px] font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full shadow-2xl border border-white/20">
                       Mundo: {lesson.world}
                     </span>
                     <div className="w-0.5 h-6 bg-indigo-500/30" />
                   </div>
                 </div>
               )}

              <button
                disabled={!isUnlocked}
                onClick={() => startLesson(lesson)}
                className={`w-28 h-28 rounded-[2.5rem] border-4 flex items-center justify-center text-5xl transition-all duration-500 shadow-2xl relative ${
                  isCompleted 
                    ? 'bg-emerald-500 border-emerald-300 text-white rotate-12' 
                    : isCurrent 
                      ? 'bg-indigo-600 border-indigo-400 text-white animate-bounce ring-8 ring-indigo-500/20' 
                      : isUnlocked 
                        ? 'bg-white border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700' 
                        : 'bg-slate-100 border-slate-200 text-slate-300 dark:bg-slate-900 dark:border-slate-800 grayscale'
                }`}
              >
                {isUnlocked ? (isCompleted ? '🏆' : lesson.icon) : '🔒'}
                {isCompleted && (
                  <div className="absolute -bottom-2 -right-2 bg-emerald-400 text-white rounded-full p-2 shadow-lg border-2 border-white dark:border-slate-900 scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </button>
              
              <div className={`mt-4 text-center transition-all ${isUnlocked ? 'opacity-100 scale-100' : 'opacity-40 scale-90'}`}>
                <h4 className="font-black italic uppercase text-xs tracking-tight">{lesson.title}</h4>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-indigo-500 text-[10px] font-black">{lesson.xp} XP</span>
                  <div className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-slate-400 text-[10px] font-bold uppercase">{lesson.steps.length} Pasos</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`space-y-8 pb-32 min-h-screen transition-all duration-700 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <header className="px-6 py-10 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/5">
        <div>
          <h2 className="text-4xl font-black italic uppercase tracking-tighter bg-gradient-to-r from-indigo-500 to-emerald-500 bg-clip-text text-transparent">Academy</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Maestría Financiera Pro</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-white/80 dark:bg-slate-900/80 px-5 py-3 rounded-full border border-white/10 shadow-2xl">
          <div className="flex items-center gap-2">
            <span className="text-rose-500 text-xl">❤️</span>
            <span className="font-black text-xl">{profile.lives}</span>
          </div>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700" />
          <div className="flex items-center gap-2">
            <span className="text-indigo-500 text-xl">⭐</span>
            <span className="font-black text-xl">{profile.xp}</span>
          </div>
        </div>
      </header>

      {renderMap()}

      {activeLesson && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 bg-slate-950/98 backdrop-blur-3xl animate-in fade-in duration-500">
          <div className={`w-full h-full md:h-auto max-w-3xl md:rounded-[4rem] overflow-hidden flex flex-col shadow-2xl relative transition-all duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
            
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800">
              <div 
                className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                style={{ width: `${((currentStepIdx + 1) / activeLesson.steps.length) * 100}%` }}
              />
            </div>

            <button onClick={() => setActiveLesson(null)} className="absolute top-8 right-8 p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full z-10 transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="flex-1 p-10 md:p-16 overflow-y-auto flex flex-col items-center text-center">
              <div className="mb-10 flex justify-between items-center w-full">
                <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-500 bg-indigo-500/10 px-4 py-1.5 rounded-full">Paso {currentStepIdx + 1} / {activeLesson.steps.length}</span>
                <div className={`w-14 h-14 rounded-full border-4 flex items-center justify-center font-black text-lg ${timer < 10 ? 'border-rose-500 text-rose-500 animate-pulse' : 'border-indigo-500 text-indigo-500'}`}>
                  {timer}
                </div>
              </div>

              <div className="flex-1 space-y-10 animate-in slide-in-from-bottom-8 duration-700 w-full max-w-lg">
                <div className="text-8xl bg-slate-100 dark:bg-slate-800 p-8 rounded-[3rem] inline-block shadow-inner">{activeLesson.icon}</div>
                <h3 className="text-3xl md:text-5xl font-black italic uppercase leading-tight tracking-tighter">{activeLesson.steps[currentStepIdx].title}</h3>

                <p className="text-xl md:text-2xl leading-relaxed text-slate-600 dark:text-slate-300 font-medium">
                  {activeLesson.steps[currentStepIdx].content}
                </p>

                {activeLesson.steps[currentStepIdx].type === 'info' && (
                  <button 
                    onClick={handleNextStep}
                    className="w-full mt-12 bg-indigo-600 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4 group"
                  >
                    Entendido <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:translate-x-2 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  </button>
                )}

                {activeLesson.steps[currentStepIdx].type === 'quiz' && (
                  <div className="space-y-5 pt-8 w-full">
                    <p className="text-lg font-black uppercase text-indigo-500 tracking-tight">{activeLesson.steps[currentStepIdx].question}</p>
                    <div className="grid grid-cols-1 gap-4">
                      {activeLesson.steps[currentStepIdx].options?.map((opt, i) => (
                        <button 
                          key={i}
                          disabled={!!stepFeedback}
                          onClick={() => handleAnswer(i)}
                          className={`w-full p-6 text-left rounded-[1.5rem] border-3 font-bold text-lg transition-all flex justify-between items-center ${
                            selectedOption === i 
                              ? (i === activeLesson.steps[currentStepIdx].correctIndex ? 'bg-emerald-500 border-emerald-400 text-white shadow-emerald-500/40' : 'bg-rose-500 border-rose-400 text-white shadow-rose-500/40')
                              : isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 hover:border-indigo-400'
                          } shadow-lg`}
                        >
                          {opt}
                          {selectedOption === i && (
                            <span className="text-2xl">{i === activeLesson.steps[currentStepIdx].correctIndex ? '✓' : '✗'}</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {activeLesson.steps[currentStepIdx].type === 'practice' && (
                  <div className="bg-gradient-to-br from-indigo-500/20 to-emerald-500/20 p-10 rounded-[3rem] border-2 border-white/10 text-center shadow-2xl">
                    <div className="text-6xl mb-6">🚀 Misión Práctica</div>
                    <p className="text-lg italic font-bold text-indigo-600 dark:text-indigo-400 mb-8">"Pon en práctica lo aprendido para asegurar tu racha y tus puntos."</p>
                    <button 
                      onClick={handleNextStep}
                      className="bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 px-10 py-4 rounded-2xl font-black uppercase text-sm shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                      ¡Misión Cumplida!
                    </button>
                  </div>
                )}

                {stepFeedback && (
                  <div className={`p-6 rounded-[2rem] border-3 animate-bounce mt-10 shadow-2xl ${
                    stepFeedback.isCorrect ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' : 'bg-rose-500/10 border-rose-500 text-rose-600'
                  }`}>
                    <p className="font-black text-xl uppercase tracking-tighter">{stepFeedback.isCorrect ? '¡Impresionante!' : '¡Analiza de nuevo!'}</p>
                    <p className="text-sm font-bold opacity-80 mt-1">{stepFeedback.message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Academy;
