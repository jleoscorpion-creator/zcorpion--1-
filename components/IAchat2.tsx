
import React, { useEffect, useState, useRef } from 'react';
import { getFinancialAdvice } from '../services/geminiService';
import { UserProfile, Expense, SavingsGoal, ChatMessage, SavedChat } from '../types';
import { 
  CURRENCY_SYMBOLS 
} from '../constants';
import { motion } from 'motion/react';
import { Lock, Sparkles, MessageSquare, Send, Trash2 } from 'lucide-react';

interface AIChatProps {
  profile: UserProfile;
  expenses: Expense[];
  goals: SavingsGoal[];
  onUpdateGoals: (goals: SavingsGoal[]) => void;
  isDarkMode: boolean;
  messages: ChatMessage[];
  isChatting: boolean;
  onSendMessage: (text: string, payWithXP?: boolean) => void;
  onResetChat: () => void;
  savedChats: SavedChat[];
  onDeleteSavedChat: (id: string) => void;
}

const FeatureItem = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
  <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
    {icon}
    <span className="text-xs font-bold uppercase tracking-tight text-slate-600 dark:text-slate-300">{text}</span>
  </div>
);

const QuickChip = ({ label, onClick }: { label: string, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-500 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all border border-indigo-500/20"
  >
    {label}
  </button>
);

const AIChat: React.FC<AIChatProps> = ({ profile, expenses, goals, onUpdateGoals, isDarkMode, messages, isChatting, onSendMessage, onResetChat, savedChats, onDeleteSavedChat }) => {
  const [tips, setTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInput, setUserInput] = useState('');
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [contributingTo, setContributingTo] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [viewingSavedChat, setViewingSavedChat] = useState<SavedChat | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const currencySymbol = CURRENCY_SYMBOLS[profile.currency] || '$';
  const chatLimit = 7;
  const questionsUsed = profile.chatCount || 0;
  const limitReached = !profile.isPremium && questionsUsed >= chatLimit;

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
  }, [messages, isChatting]);

  const handleSendMessageInternal = (customInput?: string, payWithXP: boolean = false) => {
    const textToSend = customInput || userInput;
    if (!textToSend.trim() || isChatting) return;
    onSendMessage(textToSend, payWithXP);
    setUserInput('');
  };

  const onFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessageInternal();
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
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">ZC</div>
            <div>
              <h2 className="font-black italic uppercase text-lg leading-tight tracking-tight">Chat con Zcorpion</h2>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Consejos en tiempo real</p>
                {!profile.isPremium && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-lg ${limitReached ? 'bg-rose-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                    {questionsUsed}/{chatLimit} LIBRES
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button 
                onClick={onResetChat}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white' : 'bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white'}`}
                title="Reiniciar chat"
              >
                <Trash2 size={14} />
                <span>Reiniciar</span>
              </button>
            )}
          </div>
        </div>
        
        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center py-10 space-y-6">
              <div className="space-y-2">
                <p className="text-slate-400 text-sm font-bold uppercase tracking-widest italic animate-pulse">"TU RIQUEZA ES EL RESULTADO DE TUS HÁBITOS, NO DE TU SUERTE."</p>
                <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mb-4">Pregúntale a Zcorpion cómo multiplicar tu dinero hoy</p>
                <div className="flex flex-wrap justify-center gap-2 px-4">
                  <QuickChip label="¿Cómo reduzco gastos?" onClick={() => handleSendMessageInternal("¿Cómo puedo reducir mis gastos este mes basado en mis movimientos?")} />
                  <QuickChip label="Optimiza mi 50/30/20" onClick={() => handleSendMessageInternal("Analiza mis gastos y optimiza mi presupuesto bajo la regla 50/30/20")} />
                  <QuickChip label="Tips para ahorrar" onClick={() => handleSendMessageInternal("Dame consejos específicos para alcanzar mis metas de ahorro más rápido")} />
                  <QuickChip label="Analiza mis lujos" onClick={() => handleSendMessageInternal("Revisa mis gastos no fijos y dime cuáles podría eliminar")} />
                </div>
              </div>
            </div>
          )}
          {messages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`flex items-end gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mb-1 ${
                  msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-700'
                }`}>
                  {msg.role === 'user' ? <span className="text-[10px] text-white">👤</span> : <Sparkles size={12} className="text-white" />}
                </div>
                
                <div className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed tracking-tight relative ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-md shadow-indigo-600/20' 
                    : (isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-white text-slate-800 shadow-sm border border-slate-100') + ' rounded-bl-none'
                }`}>
                  {msg.role === 'model' ? (
                    <div className="whitespace-pre-wrap font-medium">
                      {msg.text}
                    </div>
                  ) : (
                    <p className="font-medium">{msg.text}</p>
                  )}
                  
                  {/* Visual tail for bubble */}
                  <div className={`absolute bottom-0 w-2 h-2 ${
                    msg.role === 'user' 
                      ? 'right-0 translate-x-1/2 bg-indigo-700 rounded-bl-full' 
                      : (isDarkMode ? 'bg-slate-800' : 'bg-white border-l border-b border-slate-100') + ' left-0 -translate-x-1/2 rounded-br-full'
                  }`} style={{ clipPath: msg.role === 'user' ? 'polygon(0 0, 0% 100%, 100% 100%)' : 'polygon(100% 0, 0 100%, 100% 100%)' }} />
                </div>
              </div>
            </motion.div>
          ))}
          {isChatting && (
            <div className="flex justify-start">
               <div className="flex items-end gap-2">
                <div className="w-6 h-6 rounded-lg bg-slate-700 flex items-center justify-center shrink-0 mb-1">
                  <Sparkles size={12} className="text-white animate-spin-slow" />
                </div>
                <div className={`px-4 py-3 rounded-2xl rounded-bl-none glass-morphism animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                  </div>
                </div>
               </div>
            </div>
          )}
        </div>

        <form onSubmit={onFormSubmit} className="space-y-4">
          {limitReached && (
            <div className={`p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border-2 border-dashed animate-in slide-in-from-bottom-4 transition-all ${isDarkMode ? 'border-amber-500/30 bg-amber-500/5' : 'border-amber-200 bg-amber-50'}`}>
               <div className="text-center sm:text-left">
                  <p className="text-[10px] font-black uppercase text-amber-600 tracking-tighter">Límite de 7 consultas diarias alcanzado.</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Gasta 25 XP para una consulta extra o espera a mañana.</p>
               </div>
               <div className="flex gap-2 w-full sm:w-auto">
                 <button 
                    type="button"
                    disabled={profile.xp < 25 || isChatting || !userInput.trim()}
                    onClick={() => {
                      handleSendMessageInternal(userInput, true);
                    }}
                    className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${profile.xp >= 25 && userInput.trim() ? 'bg-indigo-600 text-white shadow-indigo-600/20 hover:scale-105 active:scale-95' : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-50'}`}
                 >
                    Pagar 25 XP ⭐
                 </button>
                 <button 
                    type="button"
                    onClick={() => onSendMessage("DESBLOQUEAR PREMIUM")}
                    className="flex-1 sm:flex-none bg-amber-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95"
                 >
                    Ser PRO 👑
                 </button>
               </div>
            </div>
          )}
          
          <div className="relative">
            <input 
              type="text"
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder={limitReached ? "Escribe tu duda y paga 25 XP..." : "Pregúntale algo a Zcorpion..."}
              className={`w-full p-4 pr-12 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-900'} ${limitReached && profile.xp < 25 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={limitReached && profile.xp < 25 && !profile.isPremium}
            />
            <button 
              type="submit" 
              disabled={isChatting || (limitReached && !profile.isPremium)} 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 hover:scale-110 transition-transform disabled:opacity-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </form>
      </section>
      
      {/* Saved Conversations Section for Premium Users */}
      {profile.isPremium && savedChats.length > 0 && (
        <section className={`p-6 rounded-[2rem] border shadow-md transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          <h3 className="text-xl font-black italic uppercase mb-4 flex items-center gap-2">
            <span className="text-xl">📚</span> Conversaciones Guardadas
          </h3>
          <div className="flex flex-wrap gap-2">
            {savedChats.map((chat) => (
              <div key={chat.id} className="relative group">
                <button 
                  onClick={() => setViewingSavedChat(chat)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-indigo-500' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-500'
                  }`}
                >
                  {chat.title}
                </button>
                <button 
                  onClick={() => onDeleteSavedChat(chat.id)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

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
            <div key={idx} className={`p-5 rounded-3xl border shadow-sm transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg ${
                  tip.category === 'inversion' ? 'bg-emerald-500/10 text-emerald-500' :
                  tip.category === 'ahorro' ? 'bg-indigo-500/10 text-indigo-500' :
                  'bg-rose-500/10 text-rose-500'
                }`}>
                  {tip.category === 'inversion' ? '💰' : tip.category === 'ahorro' ? '🎯' : '⚠️'}
                </div>
                <h4 className="font-bold text-sm uppercase tracking-tight text-slate-700 dark:text-slate-200">{tip.title}</h4>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{tip.content}</p>
            </div>
          ))
        )}
      </div>
      
      {viewingSavedChat && (
        <SavedChatModal 
          chat={viewingSavedChat} 
          onClose={() => setViewingSavedChat(null)} 
          isDarkMode={isDarkMode} 
        />
      )}
    </div>
  );
};

const SavedChatModal = ({ chat, onClose, isDarkMode }: { chat: SavedChat, onClose: () => void, isDarkMode: boolean }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  >
    <motion.div 
      initial={{ scale: 0.9, y: 20 }}
      animate={{ scale: 1, y: 0 }}
      className={`w-full max-w-2xl max-h-[80vh] flex flex-col rounded-[2.5rem] shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
    >
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600 text-white">
        <div>
          <h3 className="font-black italic uppercase text-lg leading-tight">{chat.title}</h3>
          <p className="text-[10px] opacity-80 font-bold uppercase tracking-widest">{new Date(chat.timestamp).toLocaleDateString()} {new Date(chat.timestamp).toLocaleTimeString()}</p>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors font-black">×</button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {chat.messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : (isDarkMode ? 'bg-slate-800 text-slate-100' : 'bg-slate-50 text-slate-800 border border-slate-100') + ' rounded-bl-none'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

export default AIChat;
