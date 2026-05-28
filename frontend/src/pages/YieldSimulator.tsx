import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  Settings, 
  Droplets, 
  Zap, 
  CloudRain, 
  Thermometer, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Info,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { cn } from '@/src/lib/utils';

export const YieldSimulator: React.FC = () => {
  const [inputs, setInputs] = useState({
    fertilizer: 100, // percentage
    irrigation: 100, // percentage
    pestControl: 100, // percentage
    rainfall: 100, // percentage
    temperature: 30 // degrees
  });

  const simulationResult = useMemo(() => {
    // Mock simulation logic
    const baseYield = 1000; // kg per acre
    const basePrice = 25; // per kg
    
    const fertilizerImpact = (inputs.fertilizer - 100) * 0.5;
    const irrigationImpact = (inputs.irrigation - 100) * 0.3;
    const pestImpact = (inputs.pestControl - 100) * 0.4;
    const weatherImpact = (inputs.rainfall - 100) * 0.2 + (30 - inputs.temperature) * 5;
    
    const totalImpact = fertilizerImpact + irrigationImpact + pestImpact + weatherImpact;
    const finalYield = baseYield * (1 + totalImpact / 100);
    const totalRevenue = finalYield * basePrice;
    const totalCost = 15000 + (inputs.fertilizer / 100) * 5000 + (inputs.irrigation / 100) * 2000;
    const netProfit = totalRevenue - totalCost;

    return {
      yield: Math.round(finalYield),
      revenue: Math.round(totalRevenue),
      cost: Math.round(totalCost),
      profit: Math.round(netProfit),
      yieldChange: totalImpact.toFixed(1)
    };
  }, [inputs]);

  const chartData = [
    { name: 'Base', yield: 1000 },
    { name: 'Simulated', yield: simulationResult.yield }
  ];

  const handleReset = () => {
    setInputs({
      fertilizer: 100,
      irrigation: 100,
      pestControl: 100,
      rainfall: 100,
      temperature: 30
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Yield Simulator</h2>
          <p className="text-zinc-500 mt-1">Predict your crop yield and profitability by adjusting key farming variables.</p>
        </div>
        <button 
          onClick={handleReset}
          className="bg-white/5 border border-white/10 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all text-white"
        >
          <RefreshCw className="w-5 h-5" /> Reset Variables
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="premium-card">
            <h3 className="font-bold text-white mb-8 flex items-center gap-2">
              <Settings className="w-5 h-5 text-agro-neon" /> Simulation Variables
            </h3>
            
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4 text-agro-neon" /> Fertilizer Usage
                  </label>
                  <span className="text-sm font-bold text-white">{inputs.fertilizer}%</span>
                </div>
                <input 
                  type="range" min="50" max="150" step="5"
                  value={inputs.fertilizer}
                  onChange={e => setInputs(prev => ({ ...prev, fertilizer: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-agro-neon"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-blue-400" /> Irrigation Level
                  </label>
                  <span className="text-sm font-bold text-white">{inputs.irrigation}%</span>
                </div>
                <input 
                  type="range" min="50" max="150" step="5"
                  value={inputs.irrigation}
                  onChange={e => setInputs(prev => ({ ...prev, irrigation: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-400"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <CloudRain className="w-4 h-4 text-zinc-400" /> Expected Rainfall
                  </label>
                  <span className="text-sm font-bold text-white">{inputs.rainfall}%</span>
                </div>
                <input 
                  type="range" min="50" max="150" step="5"
                  value={inputs.rainfall}
                  onChange={e => setInputs(prev => ({ ...prev, rainfall: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-zinc-400"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Thermometer className="w-4 h-4 text-red-400" /> Avg Temperature
                  </label>
                  <span className="text-sm font-bold text-white">{inputs.temperature}°C</span>
                </div>
                <input 
                  type="range" min="15" max="45" step="1"
                  value={inputs.temperature}
                  onChange={e => setInputs(prev => ({ ...prev, temperature: parseInt(e.target.value) }))}
                  className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-red-400"
                />
              </div>
            </div>
          </div>

          <div className="premium-card bg-gradient-to-br from-agro-card to-agro-neon/5">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-agro-neon" /> AI Prediction
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Based on your current inputs, the AI predicts a {simulationResult.yieldChange}% change in yield compared to your last season. Increasing irrigation by 10% could further improve yield by 3%.
            </p>
          </div>
        </div>

        {/* Results View */}
        <div className="lg:col-span-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="premium-card">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Predicted Yield</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-display font-bold text-white">{simulationResult.yield}</h3>
                <span className="text-zinc-500 font-medium">kg/acre</span>
              </div>
              <div className={cn(
                "mt-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest",
                parseFloat(simulationResult.yieldChange) >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {parseFloat(simulationResult.yieldChange) >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {simulationResult.yieldChange}% Change
              </div>
            </div>

            <div className="premium-card">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Estimated Revenue</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-display font-bold text-white">₹{simulationResult.revenue.toLocaleString()}</h3>
              </div>
              <p className="mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Based on ₹25/kg</p>
            </div>

            <div className="premium-card">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Net Profit</p>
              <div className="flex items-baseline gap-2">
                <h3 className={cn(
                  "text-3xl font-display font-bold",
                  simulationResult.profit >= 0 ? "text-agro-neon" : "text-red-400"
                )}>
                  ₹{simulationResult.profit.toLocaleString()}
                </h3>
              </div>
              <p className="mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">After all costs</p>
            </div>
          </div>

          <div className="premium-card h-[400px]">
            <h3 className="font-bold text-white mb-8 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-agro-neon" /> Yield Comparison
            </h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 12 }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#0a0a0a', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="yield" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={index === 0 ? '#3f3f46' : '#00ff88'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
