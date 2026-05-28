import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  TrendingUp, 
  CloudSun, 
  Bug, 
  Info, 
  CheckCircle2, 
  X, 
  Trash2,
  Clock
} from 'lucide-react';
import { Notification } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface NotificationCenterProps {
  notifications: Notification[];
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications, 
  onMarkRead, 
  onDelete, 
  onClearAll 
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-[var(--text-main)] tracking-tight">Notification Center</h2>
          <p className="text-[var(--text-muted)] mt-1">Stay updated with real-time alerts and warnings.</p>
        </div>
        {notifications.length > 0 && (
          <button 
            onClick={onClearAll}
            className="flex items-center gap-2 text-zinc-500 hover:text-red-400 transition-colors text-sm font-bold uppercase tracking-widest"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="premium-card py-20 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-[var(--border-color)]">
            <Bell className="w-10 h-10 text-zinc-700" />
          </div>
          <h3 className="text-xl font-bold text-zinc-500">No Notifications</h3>
          <p className="text-zinc-700 max-w-xs mt-2">You're all caught up! We'll notify you when something important happens.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.map((notification) => (
              <motion.div 
                key={notification.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={cn(
                  "premium-card relative group",
                  !notification.read && "border-agro-neon/20 bg-agro-neon/5"
                )}
              >
                <div className="flex items-start gap-6">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border flex-shrink-0",
                    notification.type === 'market' && "bg-agro-neon/10 border-agro-neon/20 text-agro-neon",
                    notification.type === 'weather' && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                    notification.type === 'disease' && "bg-red-500/10 border-red-500/20 text-red-400",
                    notification.type === 'system' && "bg-purple-500/10 border-purple-500/20 text-purple-400",
                  )}>
                    {notification.type === 'market' && <TrendingUp className="w-6 h-6" />}
                    {notification.type === 'weather' && <CloudSun className="w-6 h-6" />}
                    {notification.type === 'disease' && <Bug className="w-6 h-6" />}
                    {notification.type === 'system' && <Info className="w-6 h-6" />}
                  </div>

                  <div className="flex-1 pr-12">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-lg font-bold text-[var(--text-main)]">{notification.title}</h4>
                      {!notification.read && (
                        <span className="px-2 py-0.5 bg-agro-neon text-agro-dark text-[8px] font-bold uppercase tracking-widest rounded-full">New</span>
                      )}
                    </div>
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-3">{notification.message}</p>
                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {notification.timestamp}</span>
                      {!notification.read && (
                        <button 
                          onClick={() => onMarkRead(notification.id)}
                          className="text-agro-neon hover:underline"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => onDelete(notification.id)}
                    className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
