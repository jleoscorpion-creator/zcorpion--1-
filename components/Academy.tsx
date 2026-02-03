
import React, { useState } from 'react';

interface AcademyProps {
  isDarkMode: boolean;
}

const LEARNING_STEPS = [
  {
    id: 1,
    title: "Fundamentos: El Método 50/30/20",
    content: "La base de la salud financiera es saber a dónde va cada centavo. Destina el 50% a tus necesidades (renta, servicios), el 30% a tus deseos (hobbies, salidas) y el 20% al ahorro o pago de deudas. Este equilibrio te permite vivir hoy sin hipotecar tu futuro.",
    icon: "📊"
  },
  {
    id: 2,
    title: "El Fondo de Emergencia",
    content: "Antes de invertir, necesitas seguridad. Tu primer paso debe ser ahorrar entre 3 y 6 meses de tus gastos fijos en una cuenta de fácil acceso. Esto evita que una mala racha te obligue a endeudarte o vender inversiones a mal precio.",
    icon: "🛡️"
  },
  {
    id: 3,
    title: "Primeros Pasos para Invertir",
    content: "Invertir es poner tu dinero a trabajar. Empieza por opciones de bajo riesgo como bonos gubernamentales (Cetes en México) o Fondos de Índice (ETFs) que repliquen el mercado. La clave no es el monto, sino la constancia y el interés compuesto.",
    icon: "📈"
  }
];

const QUIZ_QUESTIONS = [
  {
    question: "¿Qué porcentaje de tus ingresos deberías destinar al ahorro según el método 50/30/20?",
    options: ["10%", "20%", "30%", "50%"],
    answer: 1
  },
  {
    question: "¿Qué es lo primero que debes construir antes de invertir agresivamente?",
    options: ["Un portafolio de criptomonedas", "Una cuenta para viajes", "Un fondo de emergencia", "Nada, invertir es prioridad"],
    answer: 2
  },
  {
    question: "¿Cuál es el beneficio principal del interés compuesto?",
    options: ["Pagar menos impuestos", "Que los intereses generen nuevos intereses", "Es un préstamo sin intereses", "No tiene beneficios reales"],
    answer: 1
  }
];

const Academy: React.FC<AcademyProps> = ({ isDarkMode }) => {
  const [quizStep, setQuizStep] = useState<'intro' | 'active' | 'results'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);

  const handleAnswer = (index: number) => {
    if (index === QUIZ_QUESTIONS[currentQuestion].answer) {
      setScore(s => s + 1);
    }
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestion(c => c + 1);
    } else {
      setQuizStep('results');
    }
  };

  const resetQuiz = () => {
    setQuizStep('intro');
    setCurrentQuestion(0);
    setScore(0);
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      <section className="space-y-4">
        <h2 className="text-2xl font-black italic uppercase tracking-tighter">Academia Zcorpion</h2>
        <div className="grid grid-cols-1 gap-4">
          {LEARNING_STEPS.map((step) => (
            <div key={step.id} className={`p-6 rounded-3xl border shadow-sm flex gap-4 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="text-4xl">{step.icon}</div>
              <div className="space-y-2">
                <h3 className="font-bold uppercase italic text-indigo-500">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{step.content}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className={`p-8 rounded-[2rem] border shadow-xl overflow-hidden relative transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12V13a1 1 0 00.528.885l4 2.143a1 1 0 00.944 0l4-2.143a1 1 0 00.528-.885v-2.88l1.69-.724a1 1 0 000-1.838l-7-3a1 1 0 00-.788 0l-7 3a1 1 0 000 1.838l.69.296z"/></svg>
        </div>
        
        <h2 className="text-2xl font-black italic uppercase mb-2">Examen Final</h2>
        <p className="text-xs text-slate-500 uppercase font-bold mb-6">Pon a prueba tu conocimiento financiero.</p>

        {quizStep === 'intro' && (
          <div className="text-center py-6">
            <p className="text-sm text-slate-500 italic mb-6">Un examen corto para validar lo aprendido y fortalecer tu mentalidad de inversor.</p>
            <button 
              onClick={() => setQuizStep('active')}
              className="bg-slate-900 text-white dark:bg-indigo-600 px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg transform active:scale-95 transition-all"
            >
              Iniciar Examen
            </button>
          </div>
        )}

        {quizStep === 'active' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Pregunta {currentQuestion + 1} de {QUIZ_QUESTIONS.length}</span>
              <span className="text-indigo-500">Zcorpion Exam</span>
            </div>
            <h3 className="text-lg font-bold leading-tight">{QUIZ_QUESTIONS[currentQuestion].question}</h3>
            <div className="grid grid-cols-1 gap-3">
              {QUIZ_QUESTIONS[currentQuestion].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  className={`w-full p-4 text-left rounded-2xl border font-bold text-sm transition-all active:scale-[0.98] ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-indigo-500' : 'bg-slate-50 border-slate-100 hover:border-indigo-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {quizStep === 'results' && (
          <div className="text-center py-6 animate-in zoom-in duration-300">
            <div className="text-6xl mb-4">{score === QUIZ_QUESTIONS.length ? '🎓' : '📚'}</div>
            <h3 className="text-2xl font-black italic uppercase">Resultado: {score}/{QUIZ_QUESTIONS.length}</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6">
              {score === QUIZ_QUESTIONS.length 
                ? "¡Excelente! Estás listo para dominar tus finanzas e invertir." 
                : "Buen intento. Sigue repasando los fundamentos para mejorar tu salud financiera."}
            </p>
            <button 
              onClick={resetQuiz}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-xs shadow-lg"
            >
              Reintentar
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default Academy;
