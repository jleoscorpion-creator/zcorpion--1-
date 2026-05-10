
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserProfile, Frequency } from '../types';
import { CURRENCY_LABELS, FREQUENCY_LABELS } from '../constants';

interface SettingsProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onOpenPremiumUnlock: () => void;
}

const Settings: React.FC<SettingsProps> = ({ isDarkMode, toggleDarkMode, onLogout, profile, onUpdateProfile, onOpenPremiumUnlock }) => {
  const [tempIncome, setTempIncome] = useState(profile.income.toString());
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    setTempIncome(profile.income.toString());
  }, [profile.income]);

  const triggerSaveFeedback = () => {
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

  const handleUpdate = (updates: Partial<UserProfile>) => {
    onUpdateProfile(updates);
    triggerSaveFeedback();
  };

  const handleIncomeBlur = () => {
    const val = parseFloat(tempIncome);
    if (!isNaN(val) && val >= 0) {
      handleUpdate({ income: val });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto pb-24 px-4 relative">
      <div className="flex justify-between items-center">
        <h2 className={`text-3xl font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Configuración</h2>
        {showSaved && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-emerald-500/20"
          >
            ✓ Guardado
          </motion.div>
        )}
      </div>
      
      {/* SECCIÓN PREMIUM */}
      <div className={`p-6 rounded-[2.5rem] border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
        <h3 className="text-lg font-black mb-6 uppercase tracking-tight italic flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse ring-4 ring-amber-500/20"/>
          Plan Premium
        </h3>
        <div className="flex items-center justify-between p-2">
           <div>
             <p className="font-black text-sm uppercase italic tracking-tight">{profile.isPremium ? 'Suscripción Activa' : 'Plan Gratuito'}</p>
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{profile.isPremium ? 'Tienes acceso ilimitado a todo' : 'Desbloquea IA y Academia Pro'}</p>
           </div>
           <button 
             onClick={() => {
               if (!profile.isPremium) {
                 onOpenPremiumUnlock();
               } else {
                 handleUpdate({ isPremium: false });
               }
             }}
             className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${profile.isPremium ? 'bg-slate-800 text-slate-400' : 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg'}`}
           >
             {profile.isPremium ? 'Cancelar' : 'Activar Pro'}
           </button>
        </div>
      </div>

      {/* SECCIÓN PERFIL */}
      <div className={`p-6 rounded-[2.5rem] border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
        <h3 className="text-lg font-black mb-6 uppercase tracking-tight italic flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-indigo-500"/>
          Información Personal
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Nombre de Usuario</label>
            <input 
              type="text"
              value={profile.username}
              onChange={(e) => handleUpdate({ username: e.target.value })}
              className={`w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
              placeholder="Tu nombre"
            />
          </div>

          <div className="flex items-center justify-between px-2 mb-2">
            <div>
              <p className="font-black text-xs uppercase italic tracking-tight">Ingreso Variable</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ideal para freelancers</p>
            </div>
            <button 
              onClick={() => handleUpdate({ isVariableIncome: !profile.isVariableIncome })}
              className={`w-12 h-6 rounded-full p-1 transition-all duration-300 flex items-center ${profile.isVariableIncome ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${profile.isVariableIncome ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {!profile.isVariableIncome && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Ingreso Neto ({FREQUENCY_LABELS[profile.frequency]})</label>
                <input 
                  type="number"
                  value={tempIncome}
                  onChange={(e) => setTempIncome(e.target.value)}
                  onBlur={handleIncomeBlur}
                  className={`w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
                  placeholder="Monto"
                />
              </div>
            )}
            <div className={profile.isVariableIncome ? 'col-span-full' : ''}>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Frecuencia de Ingreso</label>
              <select 
                value={profile.frequency}
                onChange={(e) => handleUpdate({ frequency: e.target.value as Frequency })}
                className={`w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
              >
                {Object.entries(FREQUENCY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Divisa Principal</label>
            <select 
              value={profile.currency}
              onChange={(e) => handleUpdate({ currency: e.target.value })}
              className={`w-full p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
            >
              {Object.entries(CURRENCY_LABELS).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECCIÓN APARIENCIA */}
      <div className={`p-6 rounded-[2.5rem] border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
        <h3 className="text-lg font-black mb-6 uppercase tracking-tight italic flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500"/>
          Apariencia
        </h3>
        <div className="flex items-center justify-between p-2">
          <div>
            <p className="font-black text-sm uppercase italic tracking-tight">Modo Oscuro</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Optimiza la visibilidad nocturna</p>
          </div>
          <button 
            onClick={toggleDarkMode} 
            className={`w-16 h-8 rounded-full p-1 transition-all duration-300 flex items-center ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-200'}`}
          >
            <div className={`w-6 h-6 bg-white rounded-full shadow-lg transform transition-transform duration-300 flex items-center justify-center text-[10px] ${isDarkMode ? 'translate-x-8' : 'translate-x-0'}`}>
              {isDarkMode ? '🌙' : '☀️'}
            </div>
          </button>
        </div>
      </div>

      <div className="pt-4">
        <button 
          onClick={onLogout}
          className="w-full bg-rose-500 text-white font-black uppercase tracking-widest py-5 rounded-[2rem] hover:bg-rose-600 transition-all shadow-xl active:scale-95"
        >
          Cerrar Sesión
        </button>
      </div>

      <div className="text-center pt-8 opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.6em] italic">ZCORPION ENGINE v3.2.0</p>
      </div>
    </div>
  );
};

export default Settings;

