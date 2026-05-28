import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Droplets, 
  CloudRain, 
  Sun, 
  Thermometer, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Power,
  RefreshCw,
  Info,
  Wind
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

export const IrrigationScheduler: React.FC = () => {
  const [isIrrigating, setIsIrrigating] = useState(false);
  const [soilMoisture, setSoilMoisture] = useState(32);
  const [nextSchedule, setNextSchedule] = useState("06:00 PM Today");
  const [isSmartMode, setIsSmartMode] = useState(true);

  const weatherForecast = [
    { day: 'Mon', temp: 32, condition: 'Sunny', rainProb: 5, icon: <Sun className="w-5 h-5 text-yellow-500" /> },
    { day: 'Tue', temp: 30, condition: 'Partly Cloudy', rainProb: 15, icon: <CloudRain className="w-5 h-5 text-zinc-400" /> },
    { day: 'Wed', temp: 28, condition: 'Rainy', rainProb: 85, icon: <CloudRain className="w-5 h-5 text-blue-400" /> },
    { day: 'Thu', temp: 29, condition: 'Cloudy', rainProb: 40, icon: <CloudRain className="w-5 h-5 text-zinc-500" /> }
  ];

  const handleToggleIrrigation = () => {
    setIsIrrigating(!isIrrigating);
    if (!isIrrigating) {
      // Simulate moisture increase
      const interval = setInterval(() => {
        setSoilMoisture(prev => Math.min(100, prev + 1));
      }, 1000);
      setTimeout(() => clearInterval(interval), 10000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Smart Irrigation</h2>
          <p className="text-zinc-500 mt-1">Optimize water usage based on soil moisture and weather forecasts.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            <button 
              onClick={() => setIsSmartMode(true)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                isSmartMode ? "bg-agro-neon text-agro-dark shadow-lg" : "text-zinc-500 hover:text-white"
              )}
            >
              Smart Mode
            </button>
            <button 
              onClick={() => setIsSmartMode(false)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                !isSmartMode ? "bg-agro-neon text-agro-dark shadow-lg" : "text-zinc-500 hover:text-white"
              )}
            >
              Manual
            </button>
          </div>
          <button className="bg-white/5 border border-white/10 p-3 rounded-xl text-zinc-500 hover:text-white transition-all">
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Control Card */}
        <div className="lg:col-span-8">
          <div className="premium-card bg-gradient-to-br from-agro-card to-agro-neon/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Droplets className="w-48 h-48 text-agro-neon" />
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div>
                  <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-agro-neon" /> Current Soil Moisture
                  </h3>
                  <div className="flex items-baseline gap-4">
                    <span className={cn(
                      "text-7xl font-display font-bold",
                      soilMoisture < 30 ? "text-red-400" : soilMoisture > 80 ? "text-blue-400" : "text-white"
                    )}>
                      {soilMoisture}%
                    </span>
                    <span className="text-zinc-500 font-bold uppercase tracking-widest">Optimal: 40-60%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-zinc-500" />
                      <span className="text-sm text-zinc-300">Next Scheduled Run</span>
                    </div>
                    <span className="font-bold text-white">{nextSchedule}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <Zap className="w-5 h-5 text-agro-neon" />
                      <span className="text-sm text-zinc-300">Estimated Water Saved</span>
                    </div>
                    <span className="font-bold text-agro-neon">450 Liters</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center space-y-8">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full -rotate-90">
                    <circle 
                      cx="96" cy="96" r="88" 
                      className="stroke-white/5 fill-none" 
                      strokeWidth="12" 
                    />
                    <motion.circle 
                      cx="96" cy="96" r="88" 
                      className={cn(
                        "fill-none transition-all duration-1000",
                        isIrrigating ? "stroke-agro-neon" : "stroke-zinc-700"
                      )}
                      strokeWidth="12" 
                      strokeDasharray="552.92"
                      strokeDashoffset={552.92 - (552.92 * soilMoisture) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <button 
                      onClick={handleToggleIrrigation}
                      className={cn(
                        "w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all shadow-2xl",
                        isIrrigating 
                          ? "bg-red-500/20 border-2 border-red-500 text-red-500 shadow-red-500/20" 
                          : "bg-agro-neon/20 border-2 border-agro-neon text-agro-neon shadow-agro-neon/20"
                      )}
                    >
                      <Power className="w-10 h-10 mb-2" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">
                        {isIrrigating ? 'Stop' : 'Start'}
                      </span>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest text-center">
                  {isIrrigating ? 'Irrigation in progress...' : 'System on Standby'}
                </p>
              </div>
            </div>
          </div>

          {/* Smart Recommendation */}
          <div className="mt-8 p-6 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-6">
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
              <CloudRain className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                Smart Recommendation <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] rounded uppercase tracking-widest">Active</span>
              </h4>
              <p className="text-zinc-400 leading-relaxed">
                Heavy rainfall (85% probability) is predicted for Wednesday. Our AI suggests skipping the scheduled irrigation on Tuesday evening to prevent waterlogging and save energy.
              </p>
              <div className="flex gap-4 mt-4">
                <button className="bg-blue-500 text-white px-6 py-2 rounded-xl text-xs font-bold hover:bg-blue-600 transition-all">
                  Apply Suggestion
                </button>
                <button className="text-zinc-500 hover:text-white text-xs font-bold transition-all">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Forecast Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="premium-card">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-agro-neon" /> 4-Day Forecast
            </h3>
            <div className="space-y-4">
              {weatherForecast.map((day) => (
                <div key={day.day} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center">
                      {day.icon}
                    </div>
                    <div>
                      <p className="font-bold text-white">{day.day}</p>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest">{day.condition}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{day.temp}°C</p>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{day.rainProb}% Rain</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="premium-card">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-agro-neon" /> System Health
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Pump Status</span>
                <span className="text-green-400 font-bold uppercase tracking-widest">Healthy</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Sensor Connectivity</span>
                <span className="text-green-400 font-bold uppercase tracking-widest">98%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Last Maintenance</span>
                <span className="text-white font-bold uppercase tracking-widest">Mar 12, 2026</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
