
import React, { useState } from 'react';

interface TutorialProps {
  onComplete: () => void;
  isDarkMode: boolean;
}

const STEPS = [
  {
    title: "Bienvenido a Zcorpion 🦂",
    description: "Tu asistente financiero con colmillo. Vamos a enseñarte a dominar tu dinero con el método 50/30/20.",
    icon: "🚀"
  },
  {
    title: "El Ciclo y la Racha",
    description: "Tu dinero se gestiona en ciclos (semana, quincena o mes). Si registras al menos un movimiento por ciclo, ¡mantendrás tu racha viva! Si el tiempo llega a cero y no hay actividad, la racha muere.",
    icon: "🔥"
  },
  {
    title: "Registros Rápidos",
    description: "Usa el formulario del inicio para anotar tus gastos. Clasifícalos en Necesidades (50%), Deseos (30%) o Ahorro (20%). Si es un gasto fijo como Netflix o la renta, marcarlo como 'Fijo' para que no lo olvides.",
    icon: "⚡"
  },
  {
    title: "La Plantilla Mágica",
    description: "En la pestaña 'Plan' verás tu distribución ideal. Puedes elegir ver el presupuesto de todo el mes o solo lo que te corresponde gastar en este ciclo específico.",
    icon: "📊"
  },
  {
    title: "Metas y Chat AI",
    description: "Zcorpion no solo mira, también aconseja. En la pestaña Chat AI puedes crear metas de ahorro, sumarles dinero poco a poco y recibir consejos personalizados de nuestra inteligencia artificial.",
    icon: "🤖"
  }
];

const Tutorial: React.FC<TutorialProps> = ({ onComplete, isDarkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className={`w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl transition-all scale-in-center ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
        <div className="text-center space-y-6">
          <div className="text-6xl animate-bounce">{step.icon}</div>
          <div className="space-y-2">
            <h3 className={`text-2xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {step.title}
            </h3>
            <p className={`text-sm leading-relaxed font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {step.description}
            </p>
          </div>

          <div className="flex gap-2 justify-center py-2">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentStep ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>

          <button 
            onClick={handleNext}
            className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
          >
            {currentStep === STEPS.length - 1 ? "¡Empezar a Dominar!" : "Siguiente"}
          </button>
          
          <button 
            onClick={onComplete}
            className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-400"
          >
            Saltar Guía
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
