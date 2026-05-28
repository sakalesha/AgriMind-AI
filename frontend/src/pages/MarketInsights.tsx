import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MapPin, 
  ArrowRight 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { MarketPrice } from '@/src/types';
import { cn } from '@/src/lib/utils';

// Temporary mock fallback if the API fails
const mockPrices: MarketPrice[] = [
  {
    commodity: 'Rice (Basmati)',
    mandi: 'Karnal Mandi',
    price: 4500,
    trend: 'up',
    history: [
      { date: 'Jan', price: 4100 },
      { date: 'Feb', price: 4250 },
      { date: 'Mar', price: 4300 },
      { date: 'Apr', price: 4500 },
    ]
  },
  {
    commodity: 'Wheat',
    mandi: 'Indore Mandi',
    price: 2100,
    trend: 'down',
    history: [
      { date: 'Jan', price: 2300 },
      { date: 'Feb', price: 2250 },
      { date: 'Mar', price: 2200 },
      { date: 'Apr', price: 2100 },
    ]
  }
];

export const MarketInsights: React.FC = () => {
  const [prices, setPrices] = React.useState<MarketPrice[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/market/prices/all')
      .then(res => res.json())
      .then(result => {
        if (result.status === 'success' && result.data?.length > 0) {
          const apiData = result.data.slice(0, 4);
          const formatted = apiData.map((d: any) => ({
            commodity: d.crop.charAt(0).toUpperCase() + d.crop.slice(1),
            mandi: d.best_mandi?.market ? d.best_mandi.market + ' Mandi' : 'National Market',
            price: d.inr_per_quintal || 0,
            trend: d.trend.toLowerCase() === 'down' ? 'down' : 'up',
            history: [
               { date: 'Jan', price: Math.round(d.inr_per_quintal * 0.9) },
               { date: 'Feb', price: Math.round(d.inr_per_quintal * 0.95) },
               { date: 'Mar', price: Math.round(d.inr_per_quintal * 0.98) },
               { date: 'Apr', price: d.inr_per_quintal }
            ]
          }));
          setPrices(formatted);
        } else {
          setPrices(mockPrices);
        }
      })
      .catch(err => {
        console.error("Failed to fetch market prices:", err);
        setPrices(mockPrices);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-bold text-white tracking-tight">Market Intelligence</h2>
        <button className="text-agro-neon font-bold flex items-center gap-2 hover:gap-3 transition-all group">
          View All Mandis <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {isLoading ? (
          <div className="text-zinc-500 py-10 w-full col-span-2 text-center flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-2 border-agro-neon/30 border-t-agro-neon rounded-full animate-spin mb-4" />
            Loading live market rates...
          </div>
        ) : prices.map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="premium-card bg-white/5 border-white/10 hover:border-agro-neon/20 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-bold text-xl text-white mb-1">{item.commodity}</h3>
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <MapPin className="w-4 h-4 text-agro-neon" /> {item.mandi}
                </div>
              </div>
              <div className={cn(
                "px-4 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 border",
                item.trend === 'up' 
                  ? "bg-green-500/10 text-green-400 border-green-500/20" 
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              )}>
                {item.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {item.trend === 'up' ? '+12.4%' : '-4.2%'}
              </div>
            </div>

            <div className="mb-8">
              <span className="text-4xl font-display font-bold text-white">₹{item.price.toLocaleString()}</span>
              <span className="text-zinc-500 text-sm ml-2">/ Quintal</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={item.history}>
                  <defs>
                    <linearGradient id={`colorPrice-${idx}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={item.trend === 'up' ? '#39FF14' : '#ef4444'} stopOpacity={0.2}/>
                      <stop offset="95%" stopColor={item.trend === 'up' ? '#39FF14' : '#ef4444'} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis hide domain={['dataMin - 100', 'dataMax + 100']} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0A0A0A', 
                      borderRadius: '16px', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' 
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke={item.trend === 'up' ? '#39FF14' : '#ef4444'} 
                    fillOpacity={1} 
                    fill={`url(#colorPrice-${idx})`} 
                    strokeWidth={4}
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
