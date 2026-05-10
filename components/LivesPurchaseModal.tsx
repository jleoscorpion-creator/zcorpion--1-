import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Star, Sparkles } from 'lucide-react';

interface LivesPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuy: (lives: number, cost: number) => void;
  currentXP: number;
  currentLives: number;
  isDarkMode: boolean;
}

const LivesPurchaseModal: React.FC<LivesPurchaseModalProps> = ({ isOpen, onClose, onBuy, currentXP, currentLives, isDarkMode }) => {
  const options = [
    { lives: 1, cost: 50, label: "+1 Vida", icon: "❤️" },
    { lives: 3, cost: 200, label: "+3 Vidas", icon: "❤️" },
    { lives: 5, cost: 500, label: "+5 Vidas", icon: "❤️" },
  ];

  const maxLives = 5;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className={`relative w-full max-w-[340px] overflow-hidden rounded-[2rem] border shadow-2xl ${
              isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}
          >
            {/* Minimal Header */}
            <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute -top-10 -left-10 w-24 h-24 bg-white rounded-full blur-2xl" />
                <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-white rounded-full blur-2xl" />
              </div>
              
              <button 
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
              >
                <X size={16} />
              </button>

              <motion.div 
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl mb-3 text-2xl border border-white/20"
              >
                ❤️
              </motion.div>
              <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">Recargar Vidas</h2>
              <p className="text-rose-100/70 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Vuelve a la acción de inmediato</p>
            </div>

            <div className="p-5">
              <div className={`mb-5 p-3 rounded-xl flex items-center justify-between ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-2">
                   <Heart className="text-rose-500" fill="currentColor" size={12} />
                   <span className="text-xs font-black italic">{currentLives}/5</span>
                </div>
                <div className="flex items-center gap-2">
                   <Star className="text-amber-500" fill="currentColor" size={12} />
                   <span className="text-xs font-black italic text-amber-500">{currentXP}</span>
                </div>
              </div>

              <div className="space-y-2">
                {options.map((option) => {
                  const canBuy = currentXP >= option.cost && currentLives < maxLives;
                  const willExceed = currentLives + option.lives > maxLives;
                  const finalLives = Math.min(maxLives, currentLives + option.lives);
                  const actualGain = finalLives - currentLives;

                  return (
                    <button
                      key={option.lives}
                      disabled={!canBuy || actualGain <= 0}
                      onClick={() => onBuy(option.lives, option.cost)}
                      className={`w-full group relative overflow-hidden p-3 rounded-xl border transition-all flex items-center justify-between ${
                        canBuy && actualGain > 0
                          ? 'hover:bg-slate-800/80 active:scale-[0.98]' 
                          : 'opacity-40 grayscale cursor-not-allowed'
                      } ${
                        isDarkMode 
                          ? 'bg-slate-800/30 border-slate-800 hover:border-rose-500/30' 
                          : 'bg-white border-slate-100 hover:border-rose-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-500/5 rounded-lg flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                          {option.icon}
                        </div>
                        <div className="text-left">
                          <h4 className="text-[10px] font-black uppercase tracking-widest">{option.label}</h4>
                          <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tight">
                            {willExceed ? `Llegarás al máximo` : `Ganar ${option.lives} vidas`}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs font-black italic text-amber-500 bg-amber-500/10 px-2 py-1 rounded-lg">
                        <span>{option.cost}</span>
                        <Star size={10} fill="currentColor" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-800/5 dark:border-slate-800/40 flex items-center gap-2">
                 <div className="shrink-0 w-6 h-6 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                    <Sparkles size={12} />
                 </div>
                 <p className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter leading-tight">
                   Recuperación automática cada 30 min.
                 </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LivesPurchaseModal;
