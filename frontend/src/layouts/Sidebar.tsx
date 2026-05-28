import React from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  TrendingUp, 
  CloudSun, 
  Users, 
  History, 
  Settings,
  LogOut,
  Leaf,
  BarChart3,
  Wallet,
  Bug,
  Menu,
  X,
  Bell,
  User,
  Calendar,
  Package,
  Truck,
  Droplets,
  Zap,
  Bot
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignOut: () => void;
  unreadNotifications?: number;
}

import { useTranslation } from 'react-i18next';

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onSignOut,
  unreadNotifications = 0
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: t('home'), icon: Sprout },
    { id: 'disease', label: t('disease_detection'), icon: Bug },
    { id: 'calendar', label: t('agri_calendar'), icon: Calendar },
    { id: 'inventory', label: t('inventory'), icon: Package },
    { id: 'machinery', label: t('machinery_rental'), icon: Truck },
    { id: 'irrigation', label: t('smart_irrigation'), icon: Droplets },
    { id: 'simulator', label: t('yield_simulator'), icon: Zap },
    { id: 'consultant', label: t('ai_consultant'), icon: Bot },
    { id: 'analytics', label: t('analytics'), icon: BarChart3 },
    { id: 'market', label: t('market_prices'), icon: TrendingUp },
    { id: 'finance', label: t('financial_ledger'), icon: Wallet },
    { id: 'community', label: t('community'), icon: Users },
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'profile', label: t('user_profile'), icon: User },
  ];

  const handleTabClick = (id: string) => {
    setActiveTab(id);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 left-6 z-[100] p-3 bg-agro-card border border-[var(--border-color)] rounded-2xl text-[var(--text-main)] shadow-2xl"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="lg:hidden fixed inset-0 bg-agro-dark/80 backdrop-blur-sm z-[80]"
          />
        )}
      </AnimatePresence>

      <aside className={cn(
        "fixed left-0 top-0 h-screen w-72 bg-agro-dark border-r border-[var(--border-color)] flex flex-col z-[90] transition-transform duration-500 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-10 flex items-center gap-4">
          <div className="flex items-center gap-3 px-2 mb-10">
            <Leaf className="w-8 h-8 text-[#39FF14]" />
            <span className="font-display font-bold text-2xl tracking-tight text-[var(--text-main)]">AgriMind AI</span>
          </div>
        </div>

        <nav className="flex-1 px-6 space-y-2 mt-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                  isActive 
                    ? "bg-agro-neon/10 text-agro-neon font-semibold border border-agro-neon/20" 
                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-200"
                )}
              >
                <Icon className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isActive ? "text-agro-neon scale-110" : "text-zinc-500 group-hover:text-zinc-300"
                )} />
                <span className="text-[15px]">{item.label}</span>
                {item.id === 'notifications' && unreadNotifications > 0 && (
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full shadow-lg shadow-red-500/20">
                    {unreadNotifications}
                  </span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="active-pill"
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-l-full bg-agro-neon shadow-[0_0_15px_rgba(0,255,136,0.8)]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={onSignOut}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-zinc-500 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
          >
            <LogOut className="w-6 h-6 group-hover:rotate-12 transition-transform" />
            <span className="text-[15px]">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
