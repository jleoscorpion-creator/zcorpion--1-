
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Activity, 
  ArrowLeft, 
  Search, 
  Plus, 
  Minus, 
  Info,
  Wallet,
  Briefcase,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sparkles,
  Star,
  CheckCircle2,
  X,
  CreditCard,
  History,
  ExternalLink,
  Globe,
  TrendingUp as MarketIcon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { UserProfile, Position } from '../types';

interface InvestmentSimulatorProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

const STOCKS = [
  // Tech & Growth
  { symbol: 'AAPL', name: 'Apple Inc.', logo: '🍎', domain: 'apple.com', market: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', logo: '⚡', domain: 'tesla.com', market: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft', logo: '🪟', domain: 'microsoft.com', market: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', logo: '🎮', domain: 'nvidia.com', market: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com', logo: '📦', domain: 'amazon.com', market: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', logo: '🔍', domain: 'google.com', market: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms', logo: '♾️', domain: 'meta.com', market: 'NASDAQ' },
  
  // Mexicanas (BMV)
  { symbol: 'WALMEX', name: 'Walmart de México', logo: '🛒', domain: 'walmartmexico.com', market: 'BMV' },
  { symbol: 'AMX', name: 'América Móvil', logo: '📱', domain: 'americamovil.com', market: 'BMV' },
  { symbol: 'CEMEX', name: 'Cemex', logo: '🏗️', domain: 'cemex.com', market: 'BMV' },
  { symbol: 'FEMSA', name: 'Femsa', logo: '🥤', domain: 'femsa.com', market: 'BMV' },
  { symbol: 'GRUMA', name: 'Gruma', logo: '🫓', domain: 'gruma.com', market: 'BMV' },

  // Dividendos & Valor
  { symbol: 'KO', name: 'Coca-Cola Co.', logo: '🥤', domain: 'coca-cola.com', market: 'NYSE' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', logo: '💊', domain: 'jnj.com', market: 'NYSE' },
  { symbol: 'PG', name: 'Procter & Gamble', logo: '🧼', domain: 'pg.com', market: 'NYSE' },
  { symbol: 'MCD', name: 'McDonald\'s', logo: '🍔', domain: 'mcdonalds.com', market: 'NYSE' },

  // ETFs
  { symbol: 'VOO', name: 'Vanguard S&P 500', logo: '📊', domain: 'vanguard.com', market: 'NYSE' },
  { symbol: 'QQQ', name: 'Invesco NASDAQ 100', logo: '💻', domain: 'invesco.com', market: 'NASDAQ' },
  { symbol: 'SCHD', name: 'Schwab US Dividend', logo: '💰', domain: 'schwab.com', market: 'NYSE' },

  // Criptomonedas
  { symbol: 'BTCUSD', name: 'Bitcoin', logo: '₿', domain: 'bitcoin.org', market: 'CRYPTO' },
  { symbol: 'ETHUSD', name: 'Ethereum', logo: '💎', domain: 'ethereum.org', market: 'CRYPTO' },
  { symbol: 'SOLUSD', name: 'Solana', logo: '☀️', domain: 'solana.com', market: 'CRYPTO' },
];

const STOCK_INFO: Record<string, string> = {
  'AAPL': 'Apple lidera la tecnología de consumo. Su ecosistema de hardware y servicios genera una lealtad de marca inigualable.',
  'TSLA': 'Tesla es el referente mundial en vehículos eléctricos y energía renovable, conocido por su alta volatilidad.',
  'MSFT': 'Microsoft domina el software empresarial y la nube con Azure, liderando actualmente en soluciones de IA.',
  'NVDA': 'NVIDIA es el principal diseñador de chips GPU, esenciales para el desarrollo de la IA y centros de datos.',
  'AMZN': 'Amazon domina el e-commerce global y es el mayor proveedor de infraestructura en la nube con AWS.',
  'GOOGL': 'Alphabet (Google) lidera la publicidad digital y búsqueda web, con avances significativos en IA generativa.',
  'META': 'Meta Platforms opera Facebook, Instagram y WhatsApp, enfocándose ahora en el desarrollo del Metaverso.',
  'WALMEX': 'Walmart de México es el mayor minorista de la región.',
  'AMX': 'América Móvil es la gigante de las telecomunicaciones en LatAm.',
  'CEMEX': 'Cemex es un líder global en materiales para la construcción.',
  'FEMSA': 'Conglomerado mexicano que opera OXXO y embotella Coca-Cola.',
  'GRUMA': 'Líder mundial en la producción de productos de maíz.',
  'KO': 'Coca-Cola es un activo de dividendos clásico y estable.',
  'JNJ': 'Johnson & Johnson es un líder diversificado en salud.',
  'PG': 'Procter & Gamble es dueña de marcas líderes de consumo diario.',
  'MCD': 'McDonald\'s es un gigante inmobiliario y de alimentos.',
  'VOO': 'ETF que replica el S&P 500 para inversión diversificada.',
  'QQQ': 'ETF que sigue el índice Nasdaq 100 de tecnología.',
  'SCHD': 'ETF diseñado para capturar el rendimiento de dividendos sólidos.',
  'BTCUSD': 'Bitcoin es la criptomoneda original y reserva de valor digital.',
  'ETHUSD': 'La red líder para contratos inteligentes y DeFi.',
  'SOLUSD': 'Blockchain de ultra alta velocidad para transacciones rápidas.',
};

const MarketTicker = ({ stocks, prices, isDarkMode }: { stocks: typeof STOCKS, prices: any, isDarkMode: boolean }) => (
  <div className={`overflow-hidden whitespace-nowrap py-2 border-b flex items-center relative ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
    <motion.div 
      initial={{ x: "0%" }}
      animate={{ x: "-50%" }}
      transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
      className="flex gap-8 items-center"
    >
      {[...stocks, ...stocks].map((stock, i) => {
        const price = prices[stock.symbol];
        return (
          <div key={`${stock.symbol}-${i}`} className="flex items-center gap-2">
            <span className="text-[10px] font-black italic uppercase tracking-tighter">{stock.symbol}</span>
            <span className="text-[10px] font-bold">{price?.price.toFixed(2)}</span>
            <span className={`text-[9px] font-black italic ${price?.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {price?.change >= 0 ? '+' : ''}{price?.change.toFixed(1)}%
            </span>
          </div>
        );
      })}
    </motion.div>
  </div>
);

const GoogleFinanceChart = ({ symbol, price, change, isDarkMode }: { symbol: string, price: number, change: number, isDarkMode: boolean }) => {
  const data = Array.from({ length: 20 }, (_, i) => ({
    name: i,
    value: price * (1 + (Math.random() - 0.5) * 0.05)
  }));

  return (
    <div className="w-full h-full flex flex-col p-4 bg-slate-950">
       <div className="mb-4">
          <div className="flex items-baseline gap-2">
             <h4 className="text-3xl font-medium tracking-tight text-white">{price.toFixed(2)}</h4>
             <span className="text-sm font-medium text-slate-500">USD</span>
          </div>
          <p className={`text-sm font-medium ${change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
             {change >= 0 ? '+' : ''}{change.toFixed(2)} ({((change/price)*100).toFixed(2)}%) mañana
          </p>
       </div>
       <div className="flex-1 min-h-0 text-white">
          <ResponsiveContainer width="100%" height="100%">
             <AreaChart data={data}>
                <defs>
                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0.4}/>
                      <stop offset="95%" stopColor={change >= 0 ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                   </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis hide dataKey="name" />
                <YAxis hide domain={['auto', 'auto']} />
                <Tooltip 
                   contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}
                   itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                />
                <Area 
                   type="monotone" 
                   dataKey="value" 
                   stroke={change >= 0 ? "#10b981" : "#ef4444"} 
                   strokeWidth={3}
                   fillOpacity={1} 
                   fill="url(#colorValue)" 
                />
             </AreaChart>
          </ResponsiveContainer>
       </div>
       <div className="mt-4 grid grid-cols-7 gap-1 overflow-x-auto no-scrollbar py-2">
          {['1D', '5D', '1M', '6M', 'YTD', '5Y', 'Max'].map(period => (
             <button key={period} className={`px-2 py-1 rounded-full text-[10px] font-bold transition-all ${period === '1D' ? 'bg-indigo-600/30 text-indigo-400 border border-indigo-500/30' : 'text-slate-500 hover:bg-slate-800'}`}>
                {period}
             </button>
          ))}
       </div>
    </div>
  );
};

const REAL_BASE_PRICES: Record<string, number> = {
  'AAPL': 228.23, 'TSLA': 252.64, 'MSFT': 442.20, 'NVDA': 141.54,
  'AMZN': 198.32, 'GOOGL': 186.20, 'META': 530.12, 'WALMEX': 68.45,
  'AMX': 15.20, 'CEMEX': 11.80, 'FEMSA': 212.50, 'GRUMA': 315.40,
  'KO': 64.12, 'JNJ': 162.30, 'PG': 168.45, 'MCD': 292.10,
  'VOO': 545.20, 'QQQ': 495.30, 'SCHD': 82.15, 'BTCUSD': 94500.00,
  'ETHUSD': 3850.50, 'SOLUSD': 214.20
};

const InvestmentSimulator: React.FC<InvestmentSimulatorProps> = ({ profile, onUpdateProfile, onClose }) => {
  const isDarkMode = true; // Forced dark mode for the investment game
  const [activeTab, setActiveTab] = useState<'market' | 'portfolio' | 'watchlist'>('market');
  const [selectedStock, setSelectedStock] = useState<typeof STOCKS[0] | null>(null);
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>(() => {
    const initialPrices: Record<string, { price: number; change: number }> = {};
    STOCKS.forEach(stock => {
      const basePrice = REAL_BASE_PRICES[stock.symbol] || 150;
      initialPrices[stock.symbol] = {
        price: basePrice,
        change: 0
      };
    });
    return initialPrices;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [buyPercentage, setBuyPercentage] = useState(10);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState<string | null>(null);
  const [currentChartIndex, setCurrentChartIndex] = useState(0); // 0: TradingView, 1: External/Analysis
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const secondaryChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPrices = () => {
      const newPrices: Record<string, { price: number; change: number }> = {};

      STOCKS.forEach(stock => {
        const basePrice = REAL_BASE_PRICES[stock.symbol] || 150;
        
        newPrices[stock.symbol] = {
          price: basePrice * (1 + (Math.random() - 0.5) * 0.01),
          change: (Math.random() - 0.45) * 3
        };
      });
      setPrices(newPrices);
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedStock) {
      // Default to Google View (Index 1) for Mexican stocks as TV widget often fails for them
      if (selectedStock.market === 'BMV') {
        setCurrentChartIndex(1);
      } else {
        setCurrentChartIndex(0);
      }
    }
  }, [selectedStock]);

  useEffect(() => {
    if (selectedStock && chartContainerRef.current) {
      chartContainerRef.current.innerHTML = '';
      
      const ticker = selectedStock.market === 'CRYPTO' ? `COINBASE:${selectedStock.symbol}` : 
                     selectedStock.market === 'BMV' ? `BMV:${selectedStock.symbol}` : 
                     `NASDAQ:${selectedStock.symbol}`;

      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-symbol-overview.js';
      script.type = 'text/javascript';
      script.async = true;
      script.innerHTML = JSON.stringify({
        "symbols": [[ticker]],
        "chartOnly": false,
        "width": "100%",
        "height": "100%",
        "locale": "es",
        "colorTheme": isDarkMode ? "dark" : "light",
        "autosize": true,
        "showVolume": false,
        "showMA": false,
        "hideDateRanges": false,
        "hideMarketStatus": false,
        "hideSymbolLogo": false,
        "scalePosition": "right",
        "scaleMode": "Normal",
        "fontFamily": "-apple-system, BlinkMacSystemFont, Trebuchet MS, Roboto, Ubuntu, sans-serif",
        "fontSize": "10",
        "noTimeScale": false,
        "valuesTracking": "1",
        "changeMode": "price-and-percent",
        "chartType": "area",
        "maLineColor": "#6366f1",
        "maLineWidth": 1,
        "maLength": 9,
        "lineWidth": 2,
        "lineType": 0,
        "dateRanges": ["1d", "1m", "3m", "12m", "all"]
      });
      chartContainerRef.current.appendChild(script);
    }
  }, [selectedStock, isDarkMode]);

  const handleBuy = () => {
    if (!selectedStock || !prices[selectedStock.symbol]) return;
    
    const price = prices[selectedStock.symbol].price;
    const amountToInvest = (profile.xp * (buyPercentage / 100));
    const sharesToBuy = amountToInvest / price;
    
    const currentPortfolio = profile.portfolio || [];
    const existingPosition = currentPortfolio.find(p => p.symbol === selectedStock.symbol);

    let newPortfolio: Position[];
    if (existingPosition) {
      const totalShares = existingPosition.shares + sharesToBuy;
      const totalCost = (existingPosition.shares * existingPosition.avgPrice) + (sharesToBuy * price);
      newPortfolio = currentPortfolio.map(p => 
        p.symbol === selectedStock.symbol 
        ? { ...p, shares: totalShares, avgPrice: totalCost / totalShares }
        : p
      );
    } else {
      newPortfolio = [...currentPortfolio, {
        symbol: selectedStock.symbol,
        name: selectedStock.name,
        logo: selectedStock.logo,
        shares: sharesToBuy,
        avgPrice: price
      }];
    }

    onUpdateProfile({
      xp: Math.floor(profile.xp - amountToInvest),
      portfolio: newPortfolio
    });

    setShowConfirm(false);
    setShowSuccess(`¡Compra exitosa de ${selectedStock.symbol}!`);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const handleWithdraw = (symbol: string) => {
    if (!prices[symbol]) return;
    const currentPortfolio = profile.portfolio || [];
    const position = currentPortfolio.find(p => p.symbol === symbol);
    if (!position) return;

    const currentPrice = prices[symbol].price;
    const saleValue = position.shares * currentPrice;

    onUpdateProfile({
      xp: Math.floor(profile.xp + saleValue),
      portfolio: currentPortfolio.filter(p => p.symbol !== symbol)
    });

    setShowSuccess(`Venta exitosa. +${saleValue.toFixed(0)} XP retirado.`);
    setTimeout(() => setShowSuccess(null), 3000);
  };

  const toggleWatchlist = (symbol: string) => {
    const currentWatchlist = profile.watchlist || [];
    const newWatchlist = currentWatchlist.includes(symbol)
      ? currentWatchlist.filter(s => s !== symbol)
      : [...currentWatchlist, symbol];
    onUpdateProfile({ watchlist: newWatchlist });
  };

  const calculateTotalValue = () => {
    if (!profile.portfolio) return 0;
    return profile.portfolio.reduce((acc, pos) => {
      const currentPrice = prices[pos.symbol]?.price || pos.avgPrice;
      return acc + (pos.shares * currentPrice);
    }, 0);
  };

  const calculateTotalProfit = () => {
    if (!profile.portfolio) return 0;
    return profile.portfolio.reduce((acc, pos) => {
      const currentPrice = prices[pos.symbol]?.price || pos.avgPrice;
      return acc + (pos.shares * (currentPrice - pos.avgPrice));
    }, 0);
  };

  const portfolioValue = calculateTotalValue();
  const totalWealth = profile.xp + portfolioValue;

  const filteredStocks = STOCKS.filter(s => 
    activeTab === 'watchlist' ? profile.watchlist?.includes(s.symbol) :
    (s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[100] flex flex-col ${isDarkMode ? 'bg-slate-950 text-white font-sans' : 'bg-slate-50 text-slate-900 font-sans'}`}
    >
      {/* Top Ticker */}
      <MarketTicker stocks={STOCKS} prices={prices} isDarkMode={isDarkMode} />

      {/* Header HUD */}
      <div className={`p-4 md:px-6 border-b flex items-center justify-between transition-colors sticky top-0 z-20 ${isDarkMode ? 'bg-slate-900/90 border-white/5 backdrop-blur-md' : 'bg-white/90 border-slate-200 backdrop-blur-md'}`}>
        <div className="flex items-center gap-4">
          <button onClick={onClose} className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}>
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-black uppercase italic tracking-tighter leading-none">Broker Zcorpion</h2>
            <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-0.5">Xp Wealth Management</p>
          </div>
        </div>

        <div className={`px-4 py-1.5 rounded-2xl border shadow-xl flex items-center gap-6 ${isDarkMode ? 'bg-slate-800 border-white/5' : 'bg-white border-slate-200'}`}>
          <div className="flex flex-col items-start leading-none gap-0.5">
            <span className="text-[8px] font-black text-slate-500 uppercase">Patrimonio</span>
            <span className="text-base font-black italic text-indigo-500">{Math.floor(totalWealth).toLocaleString()}</span>
          </div>
          <div className={`w-px h-5 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`} />
          <div className="flex flex-col items-start leading-none gap-0.5">
            <span className="text-[8px] font-black text-slate-500 uppercase">Disponible</span>
            <span className="text-base font-black italic">{profile.xp.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {activeTab === 'market' || activeTab === 'watchlist' ? (
          <div className="p-4 space-y-4 max-w-2xl mx-auto">
            <div className={`relative flex items-center rounded-2xl p-3 border transition-all ${isDarkMode ? 'bg-slate-800 border-white/5 focus-within:border-indigo-500/50' : 'bg-white border-slate-200 shadow-sm focus-within:border-indigo-500'}`}>
              <Search size={18} className="text-slate-500 ml-1" />
              <input 
                type="text" 
                placeholder={activeTab === 'market' ? "Buscar activos..." : "Buscar favoritos..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none px-3 text-sm flex-1 font-bold"
              />
            </div>

            <div className="space-y-3">
              {filteredStocks.length > 0 ? filteredStocks.map(stock => {
                const priceData = prices[stock.symbol];
                const isFavorite = profile.watchlist?.includes(stock.symbol);
                return (
                  <motion.div 
                    layoutId={stock.symbol}
                    key={stock.symbol}
                    onClick={() => setSelectedStock(stock)}
                    className={`p-4 rounded-3xl border flex items-center justify-between cursor-pointer group transition-all ${isDarkMode ? 'bg-slate-900 hover:bg-slate-800 border-white/5' : 'bg-white hover:bg-indigo-50/30 border-slate-200 shadow-sm'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 dark:border-white/5 overflow-hidden flex items-center justify-center p-2 shadow-sm">
                          <img 
                            src={`https://logo.clearbit.com/${stock.domain}`} 
                            className="w-full h-full object-contain" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              // Show emoji as fallback
                              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-emoji');
                              if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                            }}
                          />
                          <span className="fallback-emoji hidden text-xl">{stock.logo}</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleWatchlist(stock.symbol); }}
                          className={`absolute -top-2 -right-2 p-1.5 rounded-full shadow-lg border transition-all ${isFavorite ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-white/5'}`}
                        >
                          <Star size={10} fill={isFavorite ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black italic tracking-tighter">{stock.symbol}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase truncate max-w-[120px]">{stock.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-black italic">{priceData ? priceData.price.toFixed(2) : '---'}</p>
                      <p className={`text-[10px] font-black italic flex items-center justify-end gap-1 ${priceData?.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {priceData?.change >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                        {priceData?.change >= 0 ? '+' : ''}{priceData?.change.toFixed(2)}%
                      </p>
                    </div>
                  </motion.div>
                );
              }) : (
                <div className="py-20 text-center opacity-30">
                  <Search size={40} className="mx-auto mb-4" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sin resultados</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Portfolio Section */
          <div className="p-4 space-y-6 max-w-4xl mx-auto">
             <div className={`p-6 rounded-[2.5rem] border overflow-hidden relative ${isDarkMode ? 'bg-indigo-600 border-indigo-500' : 'bg-white border-slate-200 shadow-xl'}`}>
                <div className="relative z-10 flex justify-between items-start">
                   <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">Valor de Cartera</p>
                      <h3 className="text-4xl font-black italic tracking-tighter">{Math.floor(portfolioValue).toLocaleString()} <span className="text-sm">XP</span></h3>
                   </div>
                   <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <Briefcase className="text-white" />
                   </div>
                </div>
                <div className="mt-8 flex gap-4">
                   <div className="flex-1 p-3 rounded-2xl bg-black/10">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1 leading-none">Ganancia Total</p>
                      <p className={`text-lg font-black italic border-none leading-none ${calculateTotalProfit() >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                        {calculateTotalProfit() >= 0 ? '+' : ''}{calculateTotalProfit().toFixed(0)} XP
                      </p>
                   </div>
                   <div className="flex-1 p-3 rounded-2xl bg-black/10">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-60 mb-1 leading-none">Activos</p>
                      <p className="text-lg font-black italic leading-none">{profile.portfolio?.length || 0}</p>
                   </div>
                </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-2">Posiciones activas</h4>
                {profile.portfolio && profile.portfolio.length > 0 ? profile.portfolio.map(pos => {
                   const currentPrice = prices[pos.symbol]?.price || pos.avgPrice;
                   const profit = (currentPrice - pos.avgPrice) * pos.shares;
                   const pnlPercent = ((currentPrice / pos.avgPrice) - 1) * 100;
                   return (
                     <div key={pos.symbol} className={`p-5 rounded-[2rem] border ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-200'}`}>
                        <div className="flex justify-between items-center mb-4">
                           <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center p-1.5 overflow-hidden">
                                 <img 
                                   src={`https://logo.clearbit.com/${STOCKS.find(s => s.symbol === pos.symbol)?.domain}`} 
                                   className="w-full h-full object-contain" 
                                   onError={(e) => {
                                     e.currentTarget.style.display = 'none';
                                     const fallback = e.currentTarget.parentElement?.querySelector('.fallback-emoji');
                                     if (fallback) (fallback as HTMLElement).classList.remove('hidden');
                                   }}
                                 />
                                 <span className="fallback-emoji hidden text-sm">{pos.logo}</span>
                              </div>
                              <div>
                                 <p className="text-sm font-black italic">{pos.symbol}</p>
                                 <p className="text-[9px] text-slate-500 font-black uppercase">{pos.shares.toFixed(4)} Acciones</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-lg font-black italic">{(pos.shares * currentPrice).toFixed(0)} <span className="text-xs">XP</span></p>
                              <p className={`text-[10px] font-black italic ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                 {profit >= 0 ? '+' : ''}{profit.toFixed(0)} ({pnlPercent.toFixed(1)}%)
                              </p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button 
                            onClick={() => { setSelectedStock(STOCKS.find(s => s.symbol === pos.symbol) || null); setActiveTab('market'); }}
                            className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200'}`}
                           >
                              Analizar
                           </button>
                           <button 
                            onClick={() => handleWithdraw(pos.symbol)}
                            className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20"
                           >
                              Retirar XP
                           </button>
                        </div>
                     </div>
                   );
                }) : (
                  <div className="py-20 text-center opacity-30 border-2 border-dashed rounded-[3rem]">
                    <PieChart size={40} className="mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest text-slate-400">Sin inversiones activas</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className={`p-4 pb-8 border-t transition-all fixed bottom-0 left-0 right-0 z-30 ${isDarkMode ? 'bg-slate-950/90 border-white/5 backdrop-blur-2xl' : 'bg-white/95 border-slate-200 backdrop-blur-2xl'}`}>
         <div className="flex items-center justify-around max-w-lg mx-auto bg-black/5 dark:bg-white/5 p-2 rounded-[2.5rem]">
            <NavBtn label="Mercado" icon={<MarketIcon size={20} />} active={activeTab === 'market'} onClick={() => setActiveTab('market')} />
            <NavBtn label="Seguimiento" icon={<Star size={20} />} active={activeTab === 'watchlist'} onClick={() => setActiveTab('watchlist')} />
            <NavBtn label="Cartera" icon={<Briefcase size={20} />} active={activeTab === 'portfolio'} onClick={() => setActiveTab('portfolio')} />
         </div>
      </div>

      {/* Side Drawer: Detailed Buy View */}
      <AnimatePresence>
        {selectedStock && (
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed inset-0 z-[110] flex flex-col ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}
          >
             <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-between shrink-0">
                <button onClick={() => setSelectedStock(null)} className="p-2.5 rounded-2xl hover:bg-white/5 transition-colors">
                  <X size={24} />
                </button>
                <div className="text-center flex-1 pr-10">
                   <h3 className="text-lg font-black italic uppercase tracking-tighter leading-none">{selectedStock.name}</h3>
                   <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mt-1">{selectedStock.market} • {selectedStock.symbol}</p>
                </div>
                <button 
                  onClick={() => toggleWatchlist(selectedStock.symbol)}
                  className={`p-2.5 rounded-2xl transition-all ${profile.watchlist?.includes(selectedStock.symbol) ? 'text-indigo-500' : 'text-slate-400'}`}
                >
                  <Star fill={profile.watchlist?.includes(selectedStock.symbol) ? 'currentColor' : 'none'} size={24} />
                </button>
             </div>

             <div className="flex-1 overflow-y-auto no-scrollbar pb-40">
                <div className="h-[400px] w-full bg-slate-950 relative overflow-hidden">
                   <motion.div 
                     className="flex h-full"
                     animate={{ x: `-${currentChartIndex * 100}%` }}
                     transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                   >
                      {/* Chart 1: TradingView */}
                      <div className="min-w-full h-full relative">
                         <div ref={chartContainerRef} className="w-full h-full" />
                         <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest pointer-events-none">Tecnológico • TV</div>
                      </div>
                      
                      {/* Chart 2: Google Finance Style */}
                      <div className="min-w-full h-full bg-white dark:bg-slate-950 flex flex-col relative">
                         <div className="absolute top-4 right-4 z-10 px-3 py-1 rounded-full bg-blue-600 text-white text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                            <Globe size={10} /> Google Finance Data
                         </div>
                         <div className="flex-1 min-h-0">
                            <GoogleFinanceChart 
                              symbol={selectedStock.symbol} 
                              price={prices[selectedStock.symbol]?.price || 0} 
                              change={prices[selectedStock.symbol]?.change || 0}
                              isDarkMode={isDarkMode}
                            />
                         </div>
                         <div className="p-4 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Cap. de Mercado</p>
                               <p className="text-sm font-black">{(Math.random() * 2 + 1).toFixed(2)}T</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Relación P/E</p>
                               <p className="text-sm font-black">{(Math.random() * 20 + 15).toFixed(1)}</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Rend. Dividendos</p>
                               <p className="text-sm font-black">{(Math.random() * 3).toFixed(2)}%</p>
                            </div>
                            <div className="space-y-1">
                               <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Sede Central</p>
                               <p className="text-sm font-black truncate">{selectedStock.market === 'BMV' ? 'Ciudad de México' : 'California, USA'}</p>
                            </div>
                         </div>
                      </div>
                   </motion.div>

                   {/* Swipe Indicators */}
                   <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-20">
                      <button onClick={() => setCurrentChartIndex(0)} className={`w-2 h-2 rounded-full transition-all ${currentChartIndex === 0 ? 'bg-indigo-500 w-6' : 'bg-white/20 hover:bg-white/40'}`} />
                      <button onClick={() => setCurrentChartIndex(1)} className={`w-2 h-2 rounded-full transition-all ${currentChartIndex === 1 ? 'bg-indigo-500 w-6' : 'bg-white/20 hover:bg-white/40'}`} />
                   </div>

                   {/* Side Arrows */}
                   <button 
                    onClick={() => setCurrentChartIndex(i => i === 0 ? 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/5 hover:bg-white/10 transition-all z-20"
                   >
                     {currentChartIndex === 0 ? <ArrowUpRight size={20} className="rotate-45" /> : <ArrowLeft size={20} />}
                   </button>
                </div>

                <div className="max-w-xl mx-auto p-6 space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                     <div className={`p-5 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Precio actual</span>
                        <p className="text-2xl font-black italic">{prices[selectedStock.symbol]?.price.toFixed(2)} <span className="text-xs">XP</span></p>
                     </div>
                     <div className={`p-5 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-slate-800/50 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block mb-1">Cambio 24h</span>
                        <p className={`text-2xl font-black italic ${prices[selectedStock.symbol]?.change >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                           {prices[selectedStock.symbol]?.change >= 0 ? '+' : ''}{prices[selectedStock.symbol]?.change.toFixed(2)}%
                        </p>
                     </div>
                  </div>

                  <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                    <div className="flex items-center gap-3 mb-3">
                       <Info size={16} className="text-indigo-500" />
                       <span className="font-black uppercase tracking-[0.2em] text-[10px] text-indigo-500">Perspectiva del Activo</span>
                    </div>
                    <p className={`text-sm font-medium leading-relaxed italic ${isDarkMode ? 'text-indigo-100' : 'text-indigo-900'}`}>
                      {STOCK_INFO[selectedStock.symbol]}
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end px-2">
                       <h4 className="text-lg font-black uppercase italic tracking-tighter">Monto de inversión</h4>
                       <p className="text-lg font-black italic text-indigo-500">{Math.floor(profile.xp * (buyPercentage / 100))} <span className="text-[10px]">XP</span></p>
                    </div>

                    <div className="space-y-4">
                        <input 
                          type="range" 
                          min="1" 
                          max="100" 
                          step="1"
                          value={buyPercentage}
                          onChange={(e) => setBuyPercentage(parseInt(e.target.value))}
                          className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-600"
                        />
                        <div className="grid grid-cols-4 gap-2">
                          {[10, 25, 50, 100].map(p => (
                            <button 
                              key={p}
                              onClick={() => setBuyPercentage(p)}
                              className={`py-3 rounded-2xl text-[10px] font-black transition-all ${buyPercentage === p ? 'bg-indigo-600 text-white shadow-lg' : (isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-slate-100 hover:bg-slate-200')}`}
                            >
                              {p}%
                            </button>
                          ))}
                        </div>
                    </div>
                  </div>
                </div>
             </div>

             <div className={`p-6 pb-12 border-t absolute bottom-0 left-0 right-0 shadow-2xl z-20 ${isDarkMode ? 'bg-slate-900/95 border-white/5 backdrop-blur-xl' : 'bg-white border-slate-200 backdrop-blur-xl'}`}>
                <div className="max-w-md mx-auto grid grid-cols-2 gap-4">
                   <div className="flex flex-col justify-center">
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-widest pl-2">Recibirás</span>
                      <p className="text-xl font-black italic pl-2">
                        {((profile.xp * (buyPercentage / 100)) / (prices[selectedStock.symbol]?.price || 1)).toFixed(4)} <span className="text-[10px]">Acciones</span>
                      </p>
                   </div>
                   <button 
                      onClick={() => setShowConfirm(true)}
                      disabled={profile.xp < 10}
                      className="py-5 rounded-[2rem] bg-indigo-600 text-white font-black italic uppercase tracking-[0.2em] text-xs shadow-2xl shadow-indigo-600/30 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      Comprar Ahora
                    </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 backdrop-blur-sm bg-black/60">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className={`w-full max-w-sm rounded-[3rem] p-8 shadow-2xl border ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}
             >
                <div className="text-center mb-8">
                   <div className="w-16 h-16 bg-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <Layers size={32} className="text-indigo-500" />
                   </div>
                   <h3 className="text-xl font-black italic uppercase tracking-tighter">¿Confirmar Inversión?</h3>
                   <p className="text-sm text-slate-500 font-medium mt-2">
                      Estás por invertir {Math.floor(profile.xp * (buyPercentage / 100))} XP en {selectedStock?.symbol}. ¿Es correcto?
                   </p>
                </div>
                <div className="space-y-3">
                   <button 
                    onClick={handleBuy}
                    className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black italic uppercase tracking-[0.2em] text-xs shadow-xl active:scale-95 transition-all"
                   >
                     Confirmar Orden
                   </button>
                   <button 
                    onClick={() => setShowConfirm(false)}
                    className="w-full py-5 rounded-[2rem] bg-transparent text-slate-500 font-black italic uppercase tracking-[0.2em] text-xs transition-all hover:text-rose-500"
                   >
                     Cancelar
                   </button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Notification */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full bg-emerald-500 text-white shadow-2xl flex items-center gap-3 font-black italic uppercase tracking-widest text-[10px]"
          >
             <CheckCircle2 size={16} />
             {showSuccess}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const NavBtn = ({ label, icon, active, onClick }: { label: string, icon: React.ReactNode, active: boolean, onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-3xl transition-all relative ${active ? 'text-indigo-500 scale-110 translate-y-[-4px]' : 'text-slate-500 opacity-60'}`}
  >
    <div className={`p-2 rounded-2xl transition-all ${active ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/40' : 'hover:scale-110'}`}>
      {icon}
    </div>
    <span className="text-[7px] font-black uppercase tracking-[0.2em]">{label}</span>
    {active && (
      <motion.div 
        layoutId="active-indicator" 
        className="absolute -bottom-1 w-1 h-1 bg-indigo-500 rounded-full" 
      />
    )}
  </button>
);

export default InvestmentSimulator;
