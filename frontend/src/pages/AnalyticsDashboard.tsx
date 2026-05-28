import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  Droplets, 
  DollarSign, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Download,
  Filter,
  RefreshCw,
  Info
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { AnalyticsData } from '../types';

interface AnalyticsDashboardProps {
  data: AnalyticsData;
  onExport: () => void;
}

const COLORS = ['#00ff88', '#3b82f6', '#ef4444', '#eab308', '#a855f7'];

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ data, onExport }) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Farm Analytics</h2>
          <p className="text-zinc-500 mt-1">Deep insights into your farm's performance and health.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-white/10 transition-all text-white">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button 
            onClick={onExport}
            className="bg-agro-neon text-agro-dark px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-agro-neon/20"
          >
            <Download className="w-5 h-5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="premium-card">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Avg. Annual Yield</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-display font-bold text-white">4.8</h3>
            <span className="text-zinc-500 font-medium">tons/acre</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-green-400 uppercase tracking-widest">
            <ArrowUpRight className="w-3 h-3" /> 12% vs Last Year
          </div>
        </div>

        <div className="premium-card">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Soil Health Score</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-display font-bold text-white">82/100</h3>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-green-400 uppercase tracking-widest">
            <ArrowUpRight className="w-3 h-3" /> +5 Points
          </div>
        </div>

        <div className="premium-card">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Resource Efficiency</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-display font-bold text-white">94%</h3>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            Optimal Usage
          </div>
        </div>

        <div className="premium-card">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Net Profit Margin</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-display font-bold text-white">28%</h3>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase tracking-widest">
            <ArrowDownRight className="w-3 h-3" /> -2% vs Target
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Historical Yield Chart */}
        <div className="premium-card h-[400px]">
          <h3 className="font-bold text-white mb-8 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-agro-neon" /> Historical Yield Trends
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.historicalYield}>
              <defs>
                <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="year" 
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
                contentStyle={{ 
                  backgroundColor: '#0a0a0a', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Area type="monotone" dataKey="yield" stroke="#00ff88" fillOpacity={1} fill="url(#colorYield)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Soil Health Chart */}
        <div className="premium-card h-[400px]">
          <h3 className="font-bold text-white mb-8 flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" /> Soil Nutrient Levels (NPK)
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.soilHealth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis 
                dataKey="month" 
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
                contentStyle={{ 
                  backgroundColor: '#0a0a0a', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
              />
              <Legend iconType="circle" />
              <Line type="monotone" dataKey="n" stroke="#00ff88" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="p" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="k" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Financial Breakdown */}
        <div className="premium-card h-[400px]">
          <h3 className="font-bold text-white mb-8 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-agro-neon" /> Financial Breakdown
          </h3>
          <div className="flex flex-col md:flex-row h-full">
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.financialBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="amount"
                  >
                    {data.financialBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#0a0a0a', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-4 px-8">
              {data.financialBreakdown.map((item, index) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm text-zinc-400">{item.category}</span>
                  </div>
                  <span className="text-sm font-bold text-white">₹{item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations based on Analytics */}
        <div className="premium-card bg-gradient-to-br from-agro-card to-agro-neon/5">
          <h3 className="font-bold text-white mb-6 flex items-center gap-2">
            <Info className="w-5 h-5 text-agro-neon" /> AI Analytics Insights
          </h3>
          <div className="space-y-6">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <h4 className="text-sm font-bold text-agro-neon mb-2">Yield Optimization</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your yield has been steadily increasing, but the soil health data suggests a slight decline in Potassium (K) levels over the last 3 months. We recommend a targeted application of Potash before the next sowing cycle.
              </p>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
              <h4 className="text-sm font-bold text-blue-400 mb-2">Cost Efficiency</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Machinery rental costs account for 25% of your total expenses. Based on your farm size and usage frequency, purchasing a pre-owned tractor could save you approximately ₹45,000 annually.
              </p>
            </div>
            <button className="w-full py-4 bg-agro-neon/10 hover:bg-agro-neon/20 text-agro-neon rounded-2xl text-sm font-bold transition-all border border-agro-neon/20 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" /> Recalculate Insights
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
