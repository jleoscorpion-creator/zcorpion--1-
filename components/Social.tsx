
import React, { useState } from 'react';
import { UserProfile, SocialMessage } from '../types';

const MOCK_USERS = [
  { username: 'CryptoKing', xp: 2400, streak: 12 },
  { username: 'SavvySarah', xp: 1800, streak: 5 },
  { username: 'BudgetMaster', xp: 3200, streak: 30 },
  { username: 'InvestGirl', xp: 950, streak: 3 },
];

const Social: React.FC<{ profile: UserProfile, onUpdateProfile: (u: Partial<UserProfile>) => void, isDarkMode: boolean }> = ({ profile, onUpdateProfile, isDarkMode }) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'find' | 'chat'>('friends');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<SocialMessage[]>([]);

  const sendRequest = (target: string) => {
    alert(`Solicitud enviada a ${target}`);
  };

  const acceptRequest = (sender: string) => {
    onUpdateProfile({
      friendRequests: profile.friendRequests.filter(r => r !== sender),
      friends: [...profile.friends, sender]
    });
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat) return;
    const newMsg: SocialMessage = {
      id: Math.random().toString(),
      sender: profile.username,
      text: message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory([...chatHistory, newMsg]);
    setMessage('');
    
    // Simular respuesta
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        id: Math.random().toString(),
        sender: selectedChat,
        text: "¡Excelente avance hoy! Sigue así 🦂",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }, 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-24">
      <div className="flex gap-4 p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl">
        {['friends', 'find', 'chat'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            {tab === 'friends' ? 'Amigos' : tab === 'find' ? 'Descubrir' : 'Chat'}
          </button>
        ))}
      </div>

      {activeTab === 'friends' && (
        <div className="space-y-4">
          <h3 className="text-xl font-black italic uppercase tracking-tighter">Mis Contactos</h3>
          {profile.friendRequests.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] font-black text-indigo-500 uppercase px-2">Pendientes</p>
              {profile.friendRequests.map(req => (
                <div key={req} className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <span className="font-bold">{req}</span>
                  <div className="flex gap-2">
                    <button onClick={() => acceptRequest(req)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase">Aceptar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            {profile.friends.length === 0 ? (
              <p className="text-center py-12 text-slate-500 text-sm italic">Aún no tienes amigos. ¡Ve a descubrir!</p>
            ) : (
              profile.friends.map(friend => (
                <div key={friend} className={`p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold">{friend[0]}</div>
                    <span className="font-bold">{friend}</span>
                  </div>
                  <button onClick={() => { setSelectedChat(friend); setActiveTab('chat'); }} className="text-indigo-500">💬</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'find' && (
        <div className="space-y-4">
          <h3 className="text-xl font-black italic uppercase tracking-tighter">Cerca de ti</h3>
          <div className="grid grid-cols-1 gap-3">
            {MOCK_USERS.map(user => (
              <div key={user.username} className={`p-5 rounded-3xl border flex items-center justify-between ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                <div>
                  <p className="font-black italic uppercase text-indigo-600">{user.username}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase">{user.xp} XP • 🔥 {user.streak} Días</p>
                </div>
                <button onClick={() => sendRequest(user.username)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg">Seguir</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'chat' && (
        <div className={`h-[500px] flex flex-col rounded-3xl border ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
          {!selectedChat ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <span className="text-6xl opacity-20">🦂</span>
              <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">Selecciona un amigo para chatear</p>
            </div>
          ) : (
            <>
              <div className="p-4 border-b flex items-center gap-3">
                <button onClick={() => setSelectedChat(null)} className="text-slate-500">←</button>
                <span className="font-black italic uppercase">{selectedChat}</span>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatHistory.map(msg => (
                  <div key={msg.id} className={`flex ${msg.sender === profile.username ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === profile.username ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 rounded-tl-none'}`}>
                      <p>{msg.text}</p>
                      <span className="text-[8px] opacity-50 block text-right mt-1">{msg.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                <input type="text" value={message} onChange={e => setMessage(e.target.value)} placeholder="Escribe un mensaje..." className="flex-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 outline-none text-sm" />
                <button type="submit" className="bg-indigo-600 text-white p-3 rounded-xl">➤</button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Social;
