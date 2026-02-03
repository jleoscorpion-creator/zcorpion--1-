
import React, { useState } from 'react';
import { Frequency } from '../types';
import { CURRENCY_LABELS } from '../constants';

interface OnboardingProps {
  onComplete: (username: string, income: number, frequency: Frequency, currency: string) => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [username, setUsername] = useState<string>('');
  const [income, setIncome] = useState<string>('');
  const [frequency, setFrequency] = useState<Frequency>(Frequency.MONTHLY);
  const [currency, setCurrency] = useState<string>('USD');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numIncome = parseFloat(income);
    if (!username.trim() || isNaN(numIncome) || numIncome <= 0) return;
    onComplete(username.trim(), numIncome, frequency, currency);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 to-emerald-500 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 2v2m0 16v2m10-10h-2M4 10H2" />
            </svg>
          </div>
          <h1 className="text-2xl font-black text-slate-800 italic uppercase">zcorpion</h1>
          <p className="text-slate-500 mt-2 text-sm">Tu asistente inteligente de finanzas.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">¿Cómo te llamas?</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
              placeholder="Tu nombre de usuario"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Divisa</label>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
            >
              {Object.entries(CURRENCY_LABELS).map(([code, label]) => (
                <option key={code} value={code}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Ingreso neto</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input
                type="number"
                required
                value={income}
                onChange={(e) => setIncome(e.target.value)}
                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-tight">Frecuencia</label>
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
                  className={`py-2 px-1 text-[10px] font-black uppercase tracking-widest rounded-lg border transition-all ${
                    frequency === opt.val
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 text-white font-black uppercase tracking-widest py-4 rounded-xl hover:bg-slate-800 transform active:scale-95 transition-all shadow-xl"
          >
            Configurar Plan
          </button>
        </form>
      </div>
    </div>
  );
};

export default Onboarding;
