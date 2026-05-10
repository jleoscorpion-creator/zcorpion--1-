
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Sparkles, X, ShieldCheck } from 'lucide-react';

interface PremiumUnlockProps {
  onUnlock: () => void;
  onClose: () => void;
  isDarkMode: boolean;
}

const PremiumUnlock: React.FC<PremiumUnlockProps> = ({ onUnlock, onClose, isDarkMode }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '210611') {
      onUnlock();
    } else {
      setError(true);
      setPassword('');
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-slate-950/60"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`w-full max-w-md p-8 rounded-[2.5rem] border-4 shadow-2xl relative ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-all"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-orange-500/20">
            <Lock className="text-white" size={32} />
          </div>
          <h2 className={`text-2xl font-black italic uppercase italic tracking-tight mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Desbloquear ZCorp Premium</h2>
          <p className="text-sm text-slate-500 font-medium px-4">Ingresa la clave maestra para acceder al ecosistema de IA avanzado y academia extendida.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
             <input 
               type="password" 
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="Contraseña Maestra"
               className={`w-full py-4 px-6 rounded-2xl border-2 text-center text-xl font-black tracking-[0.5em] transition-all outline-none ${
                 error 
                   ? 'border-rose-500 bg-rose-50 text-rose-500 animate-shake' 
                   : (isDarkMode ? 'bg-slate-800 border-white/5 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-indigo-500')
               }`}
             />
             {error && (
               <motion.p 
                 initial={{ opacity: 0, y: -10 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 className="text-center text-xs font-bold text-rose-500 mt-2 uppercase tracking-widest"
               >
                 Acceso Denegado
               </motion.p>
             )}
          </div>

          <button 
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-black uppercase italic py-5 rounded-2xl tracking-widest shadow-xl shadow-indigo-600/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck size={20} /> Autenticar
          </button>
        </form>

        <div className="mt-8 flex justify-center gap-3">
           <div className="flex items-center gap-1.5 opacity-40">
              <Sparkles size={12} className="text-amber-500" />
              <span className="text-[10px] font-black uppercase tracking-widest bg-clip-text">Powered by Gemini Pro</span>
           </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PremiumUnlock;
