import React, { useState } from 'react';

interface TutorialProps {
  onComplete: () => void;
  isDarkMode?: boolean;
}

const TUTORIAL_STEPS = [
  {
    title: 'Bienvenido a ZCORPION',
    body: 'Aprende a registrar gastos, seguir metas de ahorro y usar el chat AI para planificar tu dinero.'
  },
  {
    title: 'Rachas y gamificación',
    body: 'Gana XP por completar lecciones y mantén una racha diaria para desbloquear recompensas.'
  },
  {
    title: 'Panel y presupuesto',
    body: 'Desde el panel puedes agregar gastos rápidos y navegar al detalle del presupuesto.'
  }
];

const Tutorial: React.FC<TutorialProps> = ({ onComplete, isDarkMode = false }) => {
  const [step, setStep] = useState(0);

  const next = () => {
    if (step < TUTORIAL_STEPS.length - 1) setStep(step + 1);
    else onComplete();
  };

  const prev = () => { if (step > 0) setStep(step - 1); };

  const skip = () => onComplete();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className={`relative w-full max-w-xl mx-4 p-6 rounded-xl shadow-xl ${isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-900'}`}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-bold">{TUTORIAL_STEPS[step].title}</h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{TUTORIAL_STEPS[step].body}</p>
          </div>
          <button onClick={skip} className="text-sm text-slate-400 hover:text-slate-600">Saltar</button>
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {TUTORIAL_STEPS.map((_, i) => (
              <span key={i} className={`w-2 h-2 rounded-full ${i === step ? 'bg-indigo-600' : 'bg-slate-300'}`} />
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={prev} disabled={step === 0} className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50">Atrás</button>
            <button onClick={next} className="px-4 py-1 rounded-lg bg-indigo-600 text-white">{step === TUTORIAL_STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;
