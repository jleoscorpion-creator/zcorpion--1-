
import React from 'react';
import { UserProfile, Expense } from '../types';

interface ProfilePageProps {
  profile: UserProfile;
  expenses: Expense[];
  onUpdateProfile: (u: Partial<UserProfile>) => void;
  isDarkMode: boolean;
  onLogout: () => void;
  onNavigateToTab: (t: string) => void;
  canInstall?: boolean;
  onInstall?: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, expenses, onUpdateProfile, isDarkMode, onLogout, onNavigateToTab, canInstall, onInstall }) => {
  
  const shareProgress = async () => {
    const text = `¡Mira mi racha en Zcorpion! 🔥 ${profile.streak} días dominando mis finanzas. He ganado ${profile.xp} XP ⭐ y ${profile.diamonds} 💎 diamantes. 🦂💰 #FinanzasZ #Zcorpion`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Mi Progreso Zcorpion', text: text, url: window.location.href });
      } catch (err) { console.error('Error al compartir', err); }
    } else {
      alert('Copiado al portapapeles: \n' + text);
    }
  };

  const academyProgress = (profile.completedLessons.length / 10) * 100;

  return (
    <div className={`space-y-8 animate-in fade-in duration-500 pb-24 min-h-screen transition-colors ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex flex-col items-center gap-6 py-8">
        <div className="relative">
          <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-emerald-500 flex items-center justify-center text-white text-5xl font-black shadow-2xl">
            {profile.username ? profile.username[0].toUpperCase() : '?'}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-xl border border-slate-200 flex items-center gap-1 text-[10px] font-black uppercase tracking-tighter">
             🔥 {profile.streak} {profile.isPremium && <><span className="mx-1">|</span> 💎 {profile.diamonds}</>}
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">{profile.username}</h2>
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.3em]">Nivel Arquitecto Z</p>
        </div>
      </div>

      {canInstall && (
        <div className="px-4">
          <div className={`p-6 rounded-[2.5rem] border-2 border-dashed flex items-center justify-between gap-4 ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center text-2xl shadow-md">
                📲
              </div>
              <div>
                <h4 className={`text-xs font-black italic uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Acceso Directo</h4>
                <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest leading-tight">Instala en tu pantalla</p>
              </div>
            </div>
            <button 
              onClick={onInstall}
              className="bg-indigo-600 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 hover:scale-105 transition-all"
            >
              Descargar App
            </button>
          </div>
        </div>
      )}

      <div className={`grid gap-4 px-4 ${profile.isPremium ? 'grid-cols-2 lg:grid-cols-3' : 'grid-cols-2'}`}>
        <StatCard label="Días de Racha" val={profile.streak} icon="🔥" isDarkMode={isDarkMode} />
        <StatCard label="XP Acumulado" val={profile.xp} icon="⭐" isDarkMode={isDarkMode} />
        {profile.isPremium && <StatCard label="Diamantes" val={profile.diamonds} icon="💎" isDarkMode={isDarkMode} />}
      </div>

      <div className={`mx-4 p-8 rounded-[2.5rem] border shadow-lg ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}>
        <h3 className="text-lg font-black italic uppercase mb-6 flex items-center gap-2">
          <span className="text-indigo-500">🏆</span> Avance Academia
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-xs font-black uppercase text-slate-400">Progreso Total</span>
            <span className="text-2xl font-black italic text-indigo-500">{Math.round(academyProgress)}%</span>
          </div>
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1 shadow-inner">
            <div className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${academyProgress}%` }} />
          </div>
        </div>
      </div>

      <div className="space-y-4 px-4">
        <button onClick={shareProgress} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          Compartir Logros
        </button>
        
        <button 
          onClick={() => onNavigateToTab('settings')}
          className={`w-full py-5 rounded-[2rem] border-2 font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          Configuración
        </button>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string, val: any, icon: string, isDarkMode: boolean }> = ({ label, val, icon, isDarkMode }) => (
  <div className={`p-8 rounded-[2.5rem] border transition-all duration-300 flex flex-col items-center justify-center gap-2 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-slate-200 shadow-xl shadow-slate-200/40'}`}>
    <div className={`p-4 rounded-3xl text-3xl ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
      {icon}
    </div>
    <div className="text-center mt-2">
      <div className={`text-3xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>{val}</div>
      <div className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] mt-1">{label}</div>
    </div>
  </div>
);

export default ProfilePage;
