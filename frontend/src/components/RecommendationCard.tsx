import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  DollarSign, 
  Scale,
  Info,
  Sprout,
  TrendingUp,
  Droplets,
  Zap
} from 'lucide-react';
import { Recommendation } from '@/src/types';

interface RecommendationCardProps {
  data: Recommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="premium-card relative overflow-hidden"
    >
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-agro-neon font-medium text-sm tracking-widest uppercase mb-4">Hero Crop Recommendation Card</p>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-agro-neon/10 rounded-3xl flex items-center justify-center border border-agro-neon/20">
                <Sprout className="w-10 h-10 text-agro-neon" />
              </div>
              <h3 className="text-7xl font-serif text-white">{data.crop.split(' ')[0]}</h3>
            </div>
            <p className="text-zinc-500 mt-6 max-w-xs text-sm leading-relaxed">
              Large display typography for clean sanslix typefaice font
            </p>
          </div>
          
          <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-white/5"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
              <motion.circle
                className="text-agro-neon"
                strokeWidth="8"
                strokeDasharray={251.2}
                initial={{ strokeDashoffset: 251.2 }}
                animate={{ strokeDashoffset: 251.2 - (251.2 * 94) / 100 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="40"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-white">94%</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-white/5 rounded-3xl border border-white/5 group hover:border-agro-neon/20 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-400 text-sm">Projected Revenue</span>
              <div className="w-8 h-8 bg-agro-neon/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-agro-neon" />
              </div>
            </div>
            <p className="text-4xl font-display font-bold text-white">₹{data.revenue.toLocaleString()}</p>
            <p className="text-zinc-500 text-xs mt-2">Estimated based on current market trends</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="p-5 bg-white/5 rounded-3xl border border-white/5">
              <div className="flex items-center gap-2 text-zinc-400 text-xs mb-3">
                <Zap className="w-4 h-4 text-yellow-400" /> Health
              </div>
              <p className="text-xl font-bold text-white">Optimal</p>
              <div className="h-1.5 bg-white/5 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-agro-neon w-full" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-4">
          <button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition-all duration-300">
            Learn more
          </button>
          <button className="px-6 bg-agro-neon/10 border border-agro-neon/20 text-agro-neon rounded-2xl hover:bg-agro-neon/20 transition-all duration-300">
            <ArrowUpRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Decorative glow */}
      <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-agro-neon/10 rounded-full blur-[100px]" />
    </motion.div>
  );
};
