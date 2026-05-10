
import React, { useState } from 'react';
import { Frequency } from '../types';
import { CURRENCY_LABELS } from '../constants';

interface OnboardingProps {
  onComplete: (username: string, income: number, frequency: Frequency, currency: string, isVariable: boolean) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [username, setUsername] = useState<string>('');
  const [income, setIncome] = useState<string>('');
  const [frequency, setFrequency] = useState<Frequency>(Frequency.MONTHLY);
  const [currency, setCurrency] = useState<string>('USD');
  const [isVariableIncome, setIsVariableIncome] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    const numIncome = isVariableIncome ? 0 : parseFloat(income);
    if (!isVariableIncome && (isNaN(numIncome) || numIncome <= 0)) return;
    
    onComplete(username.trim(), numIncome, frequency, currency, isVariableIncome);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 font-sans relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 blur-[120px] rounded-full" />

      <div className="bg-slate-900 border border-white/5 rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-500 relative z-10">
        <div className="text-center mb-8">
          <div className="bg-indigo-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-xl shadow-indigo-600/20 rotate-3">
            🦂
          </div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter">zcorpion</h1>
          <p className="text-slate-400 mt-2 text-sm font-medium">Tu asistente inteligente de finanzas de élite.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">¿Cómo te llamas?</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-white/5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-white placeholder-slate-600"
              placeholder="Tu nombre de guerrero"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Divisa</label>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-white/5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-white"
            >
              {Object.entries(CURRENCY_LABELS).map(([code, label]) => (
                <option key={code} value={code} className="bg-slate-900">{label}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Ingreso neto</label>
              <button 
                type="button"
                onClick={() => setIsVariableIncome(!isVariableIncome)}
                className={`text-[10px] font-black uppercase tracking-widest transition-all ${isVariableIncome ? 'text-emerald-500' : 'text-slate-600'}`}
              >
                {isVariableIncome ? '✓ Ingreso Variable' : '¿Ingreso Variable?'}
              </button>
            </div>
            {!isVariableIncome && (
              <div className="relative animate-in slide-in-from-top-2 duration-300">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 font-black">$</span>
                <input
                  type="number"
                  required={!isVariableIncome}
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-slate-800 border border-white/5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-bold text-white shadow-inner"
                  placeholder="0.00"
                />
              </div>
            )}
            {isVariableIncome && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl animate-in zoom-in duration-300">
                <p className="text-[10px] font-bold text-emerald-400 leading-tight">Zcorpion registrará tus ingresos manualmente conforme los recibas. Ideal para freelancers y emprendedores.</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Frecuencia</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: Frequency.WEEKLY, label: 'Semanal' },
                { val: Frequency.BIWEEKLY, label: 'Quincenal' },
                { val: Frequency.MONTHLY, label: 'Mensual' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setFrequency(opt.val)}
                  className={`py-3 px-1 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${
                    frequency === opt.val
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20'
                      : 'bg-slate-800 text-slate-400 border-white/5 hover:border-indigo-500/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-slate-900 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-slate-100 transform active:scale-95 transition-all shadow-xl"
          >
            Configurar Plan
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;

