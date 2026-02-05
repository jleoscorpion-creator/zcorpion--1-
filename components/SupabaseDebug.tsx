import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const mask = (s: string | undefined, start = 8, end = 6) => {
  if (!s) return 'not set';
  if (s.length <= start + end) return '*'.repeat(s.length);
  return `${s.slice(0, start)}…${s.slice(-end)}`;
};

const SupabaseDebug: React.FC = () => {
  const [status, setStatus] = useState<'idle' | 'checking' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState<string | null>(null);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  const testConnection = async () => {
    setStatus('checking');
    setMessage(null);
    try {
      // Intentamos obtener sesión (es una llamada leve a la API de Auth)
      const res = await supabase.auth.getSession();
      if ((res as any).error) {
        setStatus('error');
        setMessage((res as any).error.message || 'Unknown error');
        return;
      }
      setStatus('ok');
      setMessage('Conexión OK (respuesta recibida de Supabase)');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || String(err));
    }
  };

  return (
    <div className="p-4 rounded-lg border shadow-sm bg-white max-w-xl">
      <h3 className="text-lg font-bold mb-2">Supabase (Debug)</h3>
      <div className="text-sm text-slate-700 mb-3">
        <div><strong>VITE_SUPABASE_URL:</strong> {mask(supabaseUrl)}</div>
        <div><strong>VITE_SUPABASE_ANON_KEY:</strong> {mask(anonKey)}</div>
      </div>

      <div className="flex gap-2 items-center">
        <button
          onClick={testConnection}
          className="px-3 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
          disabled={status === 'checking'}
        >
          {status === 'checking' ? 'Comprobando...' : 'Probar conexión'}
        </button>
        <div className="text-sm">
          <span className={`font-bold ${status === 'ok' ? 'text-green-600' : status === 'error' ? 'text-red-600' : 'text-slate-500'}`}>
            {status === 'idle' && 'Listo'}
            {status === 'checking' && 'Comprobando'}
            {status === 'ok' && 'OK'}
            {status === 'error' && 'Error'}
          </span>
          {message && <div className="text-xs text-slate-500">{message}</div>}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">Nota: las variables se leen en build-time desde `import.meta.env`.</p>
    </div>
  );
};

export default SupabaseDebug;
