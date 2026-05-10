
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { Heart, Trophy, Rocket, Shield } from 'lucide-react';

interface ExpenseDestructorProps {
  onComplete: (xp: number, diamonds?: number) => void;
  isDarkMode: boolean;
  profile: UserProfile;
}

interface GameObject {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  type?: 'enemy' | 'bullet' | 'particle';
  speed?: number;
  health?: number;
}

const ExpenseDestructor: React.FC<ExpenseDestructorProps> = ({ onComplete, isDarkMode, profile }) => {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'paused'>('start');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [collectedCoins, setCollectedCoins] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const audioContext = useRef<AudioContext | null>(null);
  const gameStateRef = useRef(gameState);

  const playerPos = useRef({ x: 50, y: 90 }); // Percentages
  const bullets = useRef<GameObject[]>([]);
  const enemies = useRef<GameObject[]>([]);
  const coins = useRef<GameObject[]>([]);
  const particles = useRef<any[]>([]);
  const lastSpawnTime = useRef(0);
  const lastCoinSpawnTime = useRef(0);
  const nextId = useRef(0);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  const EXPENSE_LABELS = [
    'ALQUILER', 'NETFLIX', 'DEUDA', 'TARJETA', 'SUSHI', 
    'ZARA', 'HIPOTECA', 'COMIDA', 'LUZ', 'GASOLINA',
    'INTERESES', 'IMPUESTOS', 'SUBSCRIPCIÓN', 'ANTOJO'
  ];

  const initAudio = () => {
    if (!audioContext.current) {
      audioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }
  };

  const playSound = (freq: number, type: OscillatorType, duration: number, endFreq?: number, volume = 0.05) => {
    if (!isAudioEnabled || !audioContext.current) return;
    const ctx = audioContext.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  };

  const initGame = () => {
    initAudio();
    
    // Try to load saved game
    const saved = localStorage.getItem('expense_destructor_save');
    if (saved) {
      const data = JSON.parse(saved);
      setScore(data.score);
      setLives(data.lives);
      setLevel(data.level);
      setCollectedCoins(data.collectedCoins);
      // Force pause on resume if it was playing
      setGameState(data.gameState === 'playing' ? 'paused' : (data.gameState || 'playing'));
    } else {
      setScore(0);
      setLives(3);
      setLevel(1);
      setCollectedCoins(0);
      setGameState('playing');
    }
    
    bullets.current = [];
    enemies.current = [];
    coins.current = [];
    particles.current = [];
    playerPos.current = { x: 50, y: 90 };
  };

  useEffect(() => {
    gameStateRef.current = gameState;
    if (gameState === 'playing' || gameState === 'paused' || gameState === 'gameover') {
      localStorage.setItem('expense_destructor_save', JSON.stringify({
        score,
        lives,
        level,
        collectedCoins,
        gameState
      }));
    }
  }, [score, lives, level, collectedCoins, gameState]);

  const togglePause = () => {
    if (gameState === 'playing') {
      setGameState('paused');
    } else if (gameState === 'paused') {
      // Reset spawn timers to prevent immediate mass-spawn on resume
      lastSpawnTime.current = 0;
      lastCoinSpawnTime.current = 0;
      setGameState('playing');
      initAudio();
    }
  };
  const spawnEnemy = (time: number) => {
    // Aggressive difficulty scaling
    const levelBonus = level > 5 ? (level - 5) * 100 : 0;
    const spawnRate = Math.max(150, 1600 - (level * 200) - levelBonus);
    if (time - lastSpawnTime.current > spawnRate) {
      const label = EXPENSE_LABELS[Math.floor(Math.random() * EXPENSE_LABELS.length)];
      // Significantly faster enemies
      const extraSpeed = level > 5 ? (level - 5) * 0.12 : 0;
      
      // Armored enemies appear earlier and are tougher
      let health = 1;
      if (level >= 3) {
        const chance = Math.min(0.7, (level - 2) * 0.15);
        if (Math.random() < chance) {
          health = Math.min(10, Math.floor(Math.random() * (level)) + 2);
        }
      }

      enemies.current.push({
        id: nextId.current++,
        x: Math.random() * 90 + 5,
        y: -10,
        width: 10,
        height: 5,
        label,
        type: 'enemy',
        speed: (0.5 + (level * 0.15) + extraSpeed) / Math.sqrt(health),
        health: health
      });
      lastSpawnTime.current = time;
    }
  };

  const spawnCoin = (time: number) => {
    if (time - lastCoinSpawnTime.current > 3000) {
      coins.current.push({
        id: nextId.current++,
        x: Math.random() * 90 + 5,
        y: -10,
        width: 5,
        height: 5,
        type: 'bullet', // Reusing bullet type for simple representation or adding new behavior
        speed: 0.3 + (level * 0.02)
      });
      lastCoinSpawnTime.current = time;
    }
  };

  const fireBullet = () => {
    bullets.current.push({
      id: nextId.current++,
      x: playerPos.current.x,
      y: playerPos.current.y - 5,
      width: 1,
      height: 3,
      type: 'bullet',
      speed: 1.5
    });
    
    playSound(440, 'square', 0.1, 880);
  };

  const update = (time: number) => {
    if (gameStateRef.current !== 'playing') {
      // Ensure we keep the loop alive or restart it properly, 
      // but for now, just stop and let the useEffect restart it.
      return;
    }

    // Fix time jump issues
    if (lastSpawnTime.current === 0) lastSpawnTime.current = time;
    if (lastCoinSpawnTime.current === 0) lastCoinSpawnTime.current = time;
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) playerPos.current.x = Math.max(5, playerPos.current.x - 1.5);
    if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) playerPos.current.x = Math.min(95, playerPos.current.x + 1.5);
    
    // Auto-fire every few frames if holding space
    if (keysPressed.current[' '] && Math.floor(time / 150) % 2 === 0) {
      if (bullets.current.length < 10) fireBullet();
    }

    // Move bullets
    bullets.current = bullets.current.filter(b => {
      b.y -= b.speed!;
      return b.y > -10;
    });

    // Move enemies
    enemies.current = enemies.current.filter(e => {
      e.y += e.speed!;
      
      // Collision with player
      const dist = Math.sqrt(Math.pow(e.x - playerPos.current.x, 2) + Math.pow(e.y - playerPos.current.y, 2));
      if (dist < 8) {
        setLives(l => {
          if (l <= 1) {
            setGameState('gameover');
            playSound(110, 'sawtooth', 0.5, 55);
            return 0;
          }
          playSound(220, 'sawtooth', 0.2, 110);
          return l - 1;
        });
        // Explode enemy
        createExplosion(e.x, e.y, '#f43f5e');
        return false;
      }

      // Check bullet collisions
      let destroyed = false;
      bullets.current = bullets.current.filter(b => {
        const bDist = Math.sqrt(Math.pow(e.x - b.x, 2) + Math.pow(e.y - b.y, 2));
        if (bDist < 7) {
          e.health = (e.health || 1) - 1;
          playSound(600, 'square', 0.05, 300, 0.02);
          if (e.health <= 0) {
            destroyed = true;
          } else {
            createExplosion(e.x, e.y, '#ffffff'); // Small hit spark
          }
          return false;
        }
        return true;
      });

      if (destroyed) {
        setScore(s => {
          const newScore = s + 10;
          if (newScore > 0 && newScore % 150 === 0) {
            setLevel(lv => lv + 1);
            setShowLevelUp(true);
            playSound(523.25, 'triangle', 0.3, 1046.5);
            setTimeout(() => setShowLevelUp(false), 2000);
          }
          return newScore;
        });
        createExplosion(e.x, e.y, '#10b981');
        return false;
      }

      // Exit bottom
      if (e.y > 110) {
        setLives(l => {
          if (l <= 1) {
            setGameState('gameover');
            playSound(110, 'sawtooth', 0.5, 55);
            return 0;
          }
          playSound(220, 'sawtooth', 0.2, 110);
          return l - 1;
        });
        return false;
      }

      return true;
    });

    // Move coins
    coins.current = coins.current.filter(c => {
      c.y += c.speed!;
      
      const dist = Math.sqrt(Math.pow(c.x - playerPos.current.x, 2) + Math.pow(c.y - playerPos.current.y, 2));
      if (dist < 8) {
        setCollectedCoins(prev => prev + 1);
        createExplosion(c.x, c.y, '#fbbf24');
        playSound(880, 'sine', 0.1, 1760);
        return false;
      }
      
      return c.y < 110;
    });

    // Particles
    particles.current = particles.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
      return p.life > 0;
    });

    spawnEnemy(time);
    spawnCoin(time);
    render();
    requestRef.current = requestAnimationFrame(update);
  };

  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 8; i++) {
      particles.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        life: 1,
        color
      });
    }
  };

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Draw Space Background (Stars)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 20; i++) {
      const sx = (Math.sin(i * 1234.5) * 0.5 + 0.5) * w;
      const sy = ((Date.now() * 0.05 + i * 200) % h);
      ctx.globalAlpha = 0.2;
      ctx.fillRect(sx, sy, 2, 2);
    }
    ctx.globalAlpha = 1.0;

    // Draw Particles
    particles.current.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life;
      ctx.beginPath();
      ctx.arc(p.x * w / 100, p.y * h / 100, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Draw Bullets (Savings coins)
    bullets.current.forEach(b => {
      const bx = b.x * w / 100;
      const by = b.y * h / 100;
      ctx.fillStyle = '#60a5fa'; // Blue
      ctx.beginPath();
      ctx.arc(bx, by, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw Coins
    coins.current.forEach(c => {
      const cx = c.x * w / 100;
      const cy = c.y * h / 100;
      
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 8px Inter';
      ctx.textAlign = 'center';
      ctx.fillText('$', cx, cy + 3);
    });

    // Draw Player
    const px = playerPos.current.x * w / 100;
    const py = playerPos.current.y * h / 100;
    
    // Ship body
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.moveTo(px, py - 20);
    ctx.lineTo(px - 15, py + 10);
    ctx.lineTo(px + 15, py + 10);
    ctx.closePath();
    ctx.fill();
    
    // Cockpit
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(px, py - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Draw Enemies (Expenses)
    enemies.current.forEach(e => {
      const ex = e.x * w / 100;
      const ey = e.y * h / 100;
      
      // Enemy Box
      ctx.fillStyle = e.health! > 1 ? '#991b1b' : '#ef4444'; // Darker red for armored
      ctx.shadowBlur = e.health! > 1 ? 15 : 10;
      ctx.shadowColor = e.health! > 1 ? '#000000' : '#f43f5e';
      
      const textWidth = ctx.measureText(e.label!).width;
      const boxW = textWidth + 20;
      const boxH = 25;
      
      ctx.beginPath();
      ctx.roundRect(ex - boxW/2, ey - boxH/2, boxW, boxH, 8);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Health indicator
      if (e.health! > 1) {
        ctx.fillStyle = '#facc15';
        ctx.font = 'black 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(`x${e.health}`, ex + boxW/2 + 10, ey + 4);
      }
      
      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(e.label!, ex, ey + 4);
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current[e.key] = true;
      if (e.key === ' ' && gameState === 'playing' && bullets.current.length < 10) {
        fireBullet();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => delete keysPressed.current[e.key];

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState]);

  // Handle Resize
  useEffect(() => {
    const resize = () => {
      const canvas = canvasRef.current;
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener('resize', resize);
    resize();
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className="w-full h-full bg-slate-950 rounded-[3rem] border-4 border-slate-800 relative overflow-hidden flex flex-col">
      {/* HUD */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50 pointer-events-none">
        <div className="flex gap-2 pointer-events-auto">
          <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 flex gap-4">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Ahorro</span>
              <span className="text-xl font-black text-emerald-400 italic leading-none">{score}</span>
            </div>
            <div className="w-px h-6 bg-white/10 self-center" />
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Monedas</span>
              <span className="text-xl font-black text-amber-400 italic leading-none">{collectedCoins}</span>
            </div>
          </div>
          
          <button 
            onClick={togglePause}
            className="w-12 h-12 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-white/5 flex items-center justify-center text-white hover:bg-slate-800 transition-colors"
          >
            {gameState === 'paused' ? '▶️' : '⏸️'}
          </button>
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <Heart 
                key={i} 
                size={20} 
                className={`transition-all duration-300 ${i < lives ? 'text-rose-500 fill-rose-500' : 'text-slate-800'}`} 
              />
            ))}
          </div>
          <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">NIVEL {level}</span>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-950">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block"
          onMouseMove={(e) => {
            if (gameState !== 'playing') return;
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect) {
              const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
              playerPos.current.x = Math.max(5, Math.min(95, xPercent));
            }
          }}
          onClick={() => {
            if (gameState === 'playing' && bullets.current.length < 10) fireBullet();
          }}
          onTouchMove={(e) => {
            if (gameState !== 'playing') return;
            const rect = canvasRef.current?.getBoundingClientRect();
            if (rect && e.touches[0]) {
              const xPercent = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
              playerPos.current.x = Math.max(5, Math.min(95, xPercent));
            }
          }}
        />

        {/* Start / Game Over / Pause Screens */}
        <AnimatePresence>
          {gameState === 'paused' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center text-center p-8"
            >
              <h2 className="text-5xl font-black text-white italic uppercase tracking-tighter mb-8">Pausado</h2>
              <div className="flex flex-col gap-4 w-full max-w-xs">
                <button 
                  onClick={togglePause}
                  className="bg-indigo-600 text-white px-12 py-4 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform w-full"
                >
                  Continuar
                </button>
                <button 
                  onClick={() => {
                    localStorage.removeItem('expense_destructor_save');
                    const xpReward = Math.floor(score / 5) + (collectedCoins * 2);
                    const diamondReward = collectedCoins >= 20 ? 3 : 0;
                    onComplete(xpReward, diamondReward);
                  }}
                  className="bg-rose-600/20 text-rose-400 border-2 border-rose-600/30 px-12 py-4 rounded-[2rem] font-black uppercase tracking-widest hover:bg-rose-600/30 transition-all w-full"
                >
                  Abandonar y Reclamar
                </button>
              </div>
            </motion.div>
          )}

          {showLevelUp && (
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <div className="px-8 py-4 bg-indigo-600 rounded-full shadow-2xl skew-x-[-12deg]">
                <h3 className="text-3xl font-black text-white italic uppercase italic">NIVEL {level}</h3>
              </div>
            </motion.div>
          )}

          {gameState === 'start' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-5xl mb-6 shadow-2xl animate-bounce">
                🚀
              </div>
              <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Expense Destructor</h2>
              <p className="text-slate-400 mb-8 max-w-xs font-medium leading-relaxed">
                ¡Destruye los gastos antes de que acaben con tu presupuesto! Usa las flechas o el mouse para moverte y ESPACIO para disparar.
              </p>
              <button 
                onClick={initGame}
                className="bg-white text-slate-900 px-12 py-4 rounded-[2rem] font-black uppercase tracking-widest hover:scale-105 transition-transform"
              >
                {localStorage.getItem('expense_destructor_save') ? 'Continuar Operación' : 'Iniciar Operación'}
              </button>
            </motion.div>
          )}

          {gameState === 'gameover' && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute inset-0 z-40 bg-rose-600 flex flex-col items-center justify-center p-8 text-center text-white"
            >
              <Trophy size={80} className="mb-6 text-amber-300" />
              <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">¡Misión Fallida!</h2>
              <div className="bg-black/20 p-6 rounded-[2rem] mb-10 w-full max-w-xs">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold opacity-70">Puntos:</span>
                  <span className="font-black">{score}</span>
                </div>
                <div className="flex justify-between items-center text-amber-300 mb-2">
                  <span className="font-bold">Monedas:</span>
                  <span className="font-black">{collectedCoins}</span>
                </div>
                {collectedCoins >= 20 && (
                  <div className="flex justify-between items-center text-cyan-400 mb-2">
                    <span className="font-bold">Bono Coleccionista:</span>
                    <span className="font-black">+3 💎</span>
                  </div>
                )}
                <div className="h-px bg-white/20 mb-4" />
                <div className="flex justify-between items-center text-xs opacity-70 mb-2">
                   <span>XP por ahorro:</span>
                   <span>+{Math.floor(score / 5)} XP</span>
                </div>
                <div className="flex justify-between items-center text-xs opacity-70 mb-4">
                   <span>XP por monedas:</span>
                   <span>+{collectedCoins * 2} XP</span>
                </div>
                <div className="h-px bg-white/20 mb-4" />
                <div className="flex justify-between items-center text-2xl">
                  <span className="font-black italic uppercase">Total XP:</span>
                  <span className="font-black italic">{Math.floor(score / 5) + (collectedCoins * 2)}</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  localStorage.removeItem('expense_destructor_save');
                  const xpReward = Math.floor(score / 5) + (collectedCoins * 2);
                  const diamondReward = collectedCoins >= 20 ? 3 : 0;
                  onComplete(xpReward, diamondReward);
                }}
                className="bg-white text-rose-600 px-16 py-6 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-transform"
              >
                Reclamar Recompensa
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls Help */}
      <div className="p-4 bg-slate-900 border-t border-white/5 flex justify-center items-center gap-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-black">A-D</div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Mover</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-3 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-black text-white hover:bg-slate-700 transition-colors">ESPACIO / CLICK</div>
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Disparar</span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDestructor;
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProfile } from '../types';
import { Heart, Trophy, Rocket, Shield } from 'lucide-react';

interface ExpenseDestructorProps {
  onComplete: (xp: number, diamonds?: number) => void;
  isDarkMode: boolean;
  profile: UserProfile;
}

interface GameObject {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  type?: 'enemy' | 'bullet' | 'particle';
  speed?: number;
  health?: number;
}

