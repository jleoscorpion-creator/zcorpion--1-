 
import React, { useEffect, useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { getFinancialAdvice } from '../services/geminiService';
import { UserProfile, Expense, SavingsGoal } from '../types';
import { CURRENCY_SYMBOLS } from '../constants';

interface AIChatProps {
  profile: UserProfile;
  expenses: Expense[];
  goals: SavingsGoal[];
  onUpdateGoals: (goals: SavingsGoal[]) => void;
  isDarkMode: boolean;
}

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

const AIChat: React.FC<AIChatProps> = ({ profile, expenses, goals, onUpdateGoals, isDarkMode }) => {
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [contributingTo, setContributingTo] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const currencySymbol = CURRENCY_SYMBOLS[profile.currency] || '$';

  useEffect(() => {
    const fetchTips = async () => {
      setLoading(true);
      const advice = await getFinancialAdvice(profile, expenses, goals);
      setTips(advice);
      setLoading(false);
    };
    fetchTips();
  }, [profile, expenses, goals]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isChatting) return;

    const userText = userInput;
    setUserInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsChatting(true);

    try {
   
      // Llamar a la Netlify Function que maneja la comunicación con Gemini
      const resp = await fetch("/.netlify/functions/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: 'chat', message: userText, profile, expenses, goals }),
      });

      if (!resp.ok) {
        throw new Error(`API error: ${resp.status}`);
      }

      const data = await resp.json();
      const botText = data.text || "Lo siento, tuve un problema analizando eso.";
      setChatMessages(prev => [...prev, { role: 'model', text: botText }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'model', text: "Ocurrió un error con la conexión a la IA." }]);
    } finally {
      setIsChatting(false);
    }
  };


  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newGoalTarget);
    if (!newGoalName || isNaN(target) || target <= 0) return;
    
    const newGoal: SavingsGoal = {
      id: Math.random().toString(36).substr(2, 9),
      name: newGoalName,
      targetAmount: target,
      currentAmount: 0
    };
    onUpdateGoals([...goals, newGoal]);
    setNewGoalName('');
    setNewGoalTarget('');
    setIsAddingGoal(false);
  };

  const handleContribute = (goalId: string) => {
    const amount = parseFloat(contributionAmount);
    if (isNaN(amount) || amount <= 0) return;

    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        return { ...g, currentAmount: g.currentAmount + amount };
      }
      return g;
    });

    onUpdateGoals(updatedGoals);
    setContributionAmount('');
    setContributingTo(null);
  };

  const handleDeleteGoal = (goalId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta meta de ahorro?')) {
      onUpdateGoals(goals.filter(g => g.id !== goalId));
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <section className={`p-6 rounded-[2rem] border shadow-lg overflow-hidden flex flex-col h-[500px] transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">ZC</div>
          <div>
            <h2 className="font-black italic uppercase text-lg leading-tight tracking-tight">Chat con Zcorpion</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Consejos en tiempo real</p>
          </div>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
          {chatMessages.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-400 text-sm italic">"¿Cómo puedo ahorrar más este mes?"<br/>"¿Es buen momento para comprar un auto?"</p>
            </div>
          )}
          {chatMessages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : (isDarkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-800') + ' rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isChatting && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none animate-pulse text-xs font-bold text-slate-500 uppercase">
                Zcorpion pensando...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="relative">
          <input 
            type="text"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Pregúntale algo a Zcorpion..."
            className={`w-full p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-900'}`}
          />
          <button type="submit" disabled={isChatting} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 hover:scale-110 transition-transform disabled:opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </form>
      </section>

      {/* Goal Management Section - Updated with Delete option */}
      <section className={`p-6 rounded-[2rem] border shadow-lg transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black italic uppercase flex items-center gap-2">
            <span className="text-xl">🎯</span> Metas de Ahorro
          </h3>
          <button 
            onClick={() => setIsAddingGoal(!isAddingGoal)}
            className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
          >
            {isAddingGoal ? '×' : '+'}
          </button>
        </div>
        
        {isAddingGoal && (
          <form onSubmit={handleAddGoal} className="mb-6 space-y-3 p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800 animate-in slide-in-from-top-4">
            <input 
              type="text" 
              placeholder="¿Qué quieres lograr?" 
              value={newGoalName}
              onChange={e => setNewGoalName(e.target.value)}
              className={`w-full p-3 rounded-xl border-none outline-none text-sm ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currencySymbol}</span>
              <input 
                type="number" 
                placeholder="Monto objetivo" 
                value={newGoalTarget}
                onChange={e => setNewGoalTarget(e.target.value)}
                className={`w-full p-3 pl-7 rounded-xl border-none outline-none text-sm ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-lg">
              Confirmar Meta
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.length === 0 && !isAddingGoal && (
            <p className="text-xs text-slate-500 italic text-center col-span-2 py-4">Define tu próxima meta y deja que Zcorpion te ayude a llegar.</p>
          )}
          {goals.map(goal => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isContributing = contributingTo === goal.id;

            return (
              <div key={goal.id} className={`p-5 rounded-3xl border transition-all ${isDarkMode ? 'border-slate-800 bg-slate-800/30' : 'border-slate-100 bg-slate-50'} flex flex-col justify-between hover:shadow-md relative group`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-black uppercase italic tracking-tight">{goal.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{currencySymbol}{goal.currentAmount.toLocaleString()} / {currencySymbol}{goal.targetAmount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-lg">{progress.toFixed(0)}%</span>
                    
                    <button 
                      onClick={() => setContributingTo(isContributing ? null : goal.id)}
                      title="Sumar fondos"
                      className={`p-1.5 rounded-lg transition-colors ${isContributing ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-indigo-500 hover:text-white'}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9V5a1 1 0 112 0v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4z" clipRule="evenodd" />
                      </svg>
                    </button>

                    <button 
                      onClick={() => handleDeleteGoal(goal.id)}
                      title="Eliminar meta"
                      className="p-1.5 rounded-lg bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {isContributing && (
                  <div className="mt-2 mb-4 flex gap-2 animate-in slide-in-from-top-2 duration-200">
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">{currencySymbol}</span>
                      <input 
                        type="number"
                        placeholder="Monto"
                        autoFocus
                        value={contributionAmount}
                        onChange={(e) => setContributionAmount(e.target.value)}
                        className={`w-full p-2 pl-5 rounded-xl border-none outline-none text-xs font-bold ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}
                      />
                    </div>
                    <button 
                      onClick={() => handleContribute(goal.id)}
                      className="bg-indigo-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm active:scale-95"
                    >
                      Sumar
                    </button>
                  </div>
                )}

                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-indigo-500 transition-all duration-1000" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? Array(3).fill(0).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />) : (
          tips.map((tip, idx) => (
            <div key={idx} className={`p-5 rounded-3xl border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <h4 className="font-bold text-sm mb-1 uppercase text-indigo-500">{tip.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{tip.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AIChat;
