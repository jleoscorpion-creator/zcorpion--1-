
import React, { useState } from 'react';
import { UserProfile, Frequency, ReminderConfig } from '../types';
import { CURRENCY_LABELS, FREQUENCY_LABELS } from '../constants';

interface SettingsProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onLogout: () => void;
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const Settings: React.FC<SettingsProps> = ({ isDarkMode, toggleDarkMode, onLogout, profile, onUpdateProfile }) => {
  const [income, setIncome] = useState(profile.income.toString());
  const [reminderConfig, setReminderConfig] = useState<ReminderConfig>(profile.reminders || {
    enabled: false,
    time: '20:00',
    frequency: 'DAILY',
    customMessage: '¡Es hora de registrar tus movimientos del día! 🦂'
  });

  const handleUpdateReminders = (updates: Partial<ReminderConfig>) => {
    const newConfig = { ...reminderConfig, ...updates };
    setReminderConfig(newConfig);
    onUpdateProfile({ reminders: newConfig });
    
    if (updates.enabled && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl mx-auto pb-24">
      <h2 className="text-3xl font-bold italic uppercase tracking-tight">Ajustes</h2>
      
      <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h3 className="text-lg font-bold mb-6 uppercase tracking-tight italic flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"/>
          Perfil Financiero
        </h3>
        
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Nombre de Usuario</label>
            <input 
              type="text"
              value={profile.username}
              onChange={(e) => onUpdateProfile({ username: e.target.value })}
              className={`w-full p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Ingreso</label>
              <input 
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                onBlur={() => onUpdateProfile({ income: parseFloat(income) || 0 })}
                className={`w-full p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
              />
            </div>
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Frecuencia</label>
              <select 
                value={profile.frequency}
                onChange={(e) => onUpdateProfile({ frequency: e.target.value as Frequency })}
                className={`w-full p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
              >
                {Object.entries(FREQUENCY_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1">
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Divisa</label>
              <select 
                value={profile.currency}
                onChange={(e) => onUpdateProfile({ currency: e.target.value })}
                className={`w-full p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
              >
                {Object.entries(CURRENCY_LABELS).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h3 className="text-lg font-bold mb-6 uppercase tracking-tight italic flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"/>
          Recordatorios
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-bold text-sm uppercase">Notificaciones Push</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Alertas para registrar tus gastos.</p>
            </div>
            <button 
              onClick={() => handleUpdateReminders({ enabled: !reminderConfig.enabled })}
              className={`w-12 h-6 rounded-full p-1 transition-colors ${reminderConfig.enabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${reminderConfig.enabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          {reminderConfig.enabled && (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Hora de Alerta</label>
                  <input 
                    type="time"
                    value={reminderConfig.time}
                    onChange={(e) => handleUpdateReminders({ time: e.target.value })}
                    className={`w-full p-3 rounded-xl border-none outline-none ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Repetir cada</label>
                  <select 
                    value={reminderConfig.frequency}
                    onChange={(e) => handleUpdateReminders({ frequency: e.target.value as 'DAILY' | 'WEEKLY' })}
                    className={`w-full p-3 rounded-xl border-none outline-none ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}
                  >
                    <option value="DAILY">Día</option>
                    <option value="WEEKLY">Semana</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Mensaje Personalizado</label>
                <textarea 
                  value={reminderConfig.customMessage}
                  onChange={(e) => handleUpdateReminders({ customMessage: e.target.value })}
                  placeholder="Escribe el mensaje que recibirás..."
                  className={`w-full p-3 rounded-xl border-none outline-none focus:ring-2 focus:ring-indigo-500 resize-none h-20 ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50'}`}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className={`p-6 rounded-3xl border shadow-sm transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h3 className="text-lg font-bold mb-4 uppercase italic">Apariencia</h3>
        <div className="flex items-center justify-between">
          <p className="font-bold text-sm uppercase">Tema Oscuro</p>
          <button onClick={toggleDarkMode} className={`w-12 h-6 rounded-full p-1 transition-colors ${isDarkMode ? 'bg-indigo-600' : 'bg-slate-300'}`}>
            <div className={`w-4 h-4 bg-white rounded-full transform transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full bg-rose-500/10 text-rose-500 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-rose-500/20 transition-all border border-rose-500/20"
      >
        Cerrar Sesión
      </button>

      <div className="text-center pt-6">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest italic">zcorpion v2.0.0</p>
      </div>
    </div>
  );
};

export default Settings;
