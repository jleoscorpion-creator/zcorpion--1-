
import React, { useEffect, useState, useRef } from 'react';
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

      {/* Goal Management Section restored at the end */}
      <section className={`p-6 rounded-[2rem] border shadow-lg transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <h3 className="text-xl font-black italic uppercase mb-4 flex items-center gap-2">
          <span className="text-xl">🎯</span> Metas de Ahorro
        </h3>
        
        <div className="space-y-4 mb-6">
          {goals.length === 0 ? (
            <p className="text-xs text-slate-500 italic">No tienes metas activas. ¡Crea la primera!</p>
          ) : (
            goals.map(goal => {
              const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm font-bold uppercase italic tracking-tight">{goal.name}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">{currencySymbol}{goal.currentAmount.toLocaleString()} de {currencySymbol}{goal.targetAmount.toLocaleString()}</p>
                    </div>
                    <span className="text-xs font-black text-indigo-500">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <form onSubmit={handleAddGoal} className="space-y-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Nueva Meta</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input 
              type="text" 
              placeholder="¿Para qué ahorras? (ej. Viaje)" 
              value={newGoalName}
              onChange={e => setNewGoalName(e.target.value)}
              className={`p-3 rounded-xl border-none outline-none text-xs ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
            />
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">{currencySymbol}</span>
              <input 
                type="number" 
                placeholder="Monto meta" 
                value={newGoalTarget}
                onChange={e => setNewGoalTarget(e.target.value)}
                className={`w-full p-3 pl-7 rounded-xl border-none outline-none text-xs ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}
              />
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white dark:bg-indigo-600 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:scale-[1.01] active:scale-[0.98] transition-all">
            Crear Meta
          </button>
        </form>
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
