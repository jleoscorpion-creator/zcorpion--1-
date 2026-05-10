
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronRight, X } from 'lucide-react';

interface GuideStep {
  target?: string; // CSS selector
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingGuideProps {
  guideKey: string;
  steps: GuideStep[];
  onComplete: (key: string) => void;
  isDarkMode: boolean;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ guideKey, steps, onComplete, isDarkMode }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      onComplete(guideKey);
    }
  };

  const current = steps[currentStep];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none">
        {/* Backdrop for center modals or just overlay */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto"
          onClick={() => onComplete(guideKey)}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`relative w-full max-w-xs p-6 rounded-[2.5rem] border shadow-2xl pointer-events-auto transform transition-all ${
            isDarkMode 
              ? 'bg-slate-900 border-indigo-500/30 text-white' 
              : 'bg-white border-indigo-100 text-slate-900'
          }`}
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
              <HelpCircle className="text-indigo-500" size={20} />
            </div>
            <button 
              onClick={() => onComplete(guideKey)}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X size={18} className="text-slate-400" />
            </button>
          </div>

          <div className="mb-6">
            <h4 className="text-xl font-black italic uppercase tracking-tighter mb-2 leading-tight">
              {current.title}
            </h4>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {current.content}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'w-6 bg-indigo-500' : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                  }`} 
                />
              ))}
            </div>

            <button 
              onClick={handleNext}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-lg shadow-indigo-600/30"
            >
              {currentStep === steps.length - 1 ? '¡Entendido!' : 'Siguiente'}
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Target Highlight Effect (Visual Only) */}
          <div className="absolute -inset-1 rounded-[2.6rem] border-2 border-indigo-500/50 animate-pulse pointer-events-none" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OnboardingGuide;
