import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle,
  Droplets,
  Zap,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import { FarmTask } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface AgriCalendarProps {
  tasks: FarmTask[];
  onAddTask: (task: Omit<FarmTask, 'id'>) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

export const AgriCalendar: React.FC<AgriCalendarProps> = ({ 
  tasks, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask 
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [newTask, setNewTask] = useState<Omit<FarmTask, 'id' | 'completed'>>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Other',
    priority: 'medium'
  });

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const categories = ['Irrigation', 'Fertilizer', 'Weeding', 'Harvesting', 'Other'];
  const priorities = ['low', 'medium', 'high'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTask({ ...newTask, completed: false });
    setShowAddModal(false);
    setNewTask({
      title: '',
      date: new Date().toISOString().split('T')[0],
      category: 'Other',
      priority: 'medium'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Farm Calendar</h2>
          <p className="text-zinc-500 mt-1">Manage your daily agricultural tasks and schedules.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
            {(['all', 'pending', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all",
                  filter === f ? "bg-agro-neon text-agro-dark shadow-lg" : "text-zinc-500 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-agro-neon text-agro-dark p-3 rounded-xl hover:scale-105 transition-transform shadow-lg shadow-agro-neon/20"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar View (Mock) */}
        <div className="lg:col-span-4">
          <div className="premium-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white">April 2026</h3>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-500"><ChevronLeft className="w-4 h-4" /></button>
                <button className="p-2 hover:bg-white/5 rounded-lg text-zinc-500"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center mb-4">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <span key={`${d}-${i}`} className="text-[10px] font-bold text-zinc-600 uppercase">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 30 }).map((_, i) => {
                const day = i + 1;
                const hasTask = tasks.some(t => new Date(t.date).getDate() === day);
                return (
                  <div 
                    key={i} 
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all cursor-pointer",
                      day === 5 ? "bg-agro-neon text-agro-dark font-bold" : "text-zinc-400 hover:bg-white/5 border border-transparent",
                      hasTask && day !== 5 && "border-agro-neon/30"
                    )}
                  >
                    {day}
                    {hasTask && <div className={cn("w-1 h-1 rounded-full mt-1", day === 5 ? "bg-agro-dark" : "bg-agro-neon")} />}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 premium-card bg-gradient-to-br from-agro-card to-agro-neon/5">
            <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-agro-neon" /> Upcoming Today
            </h4>
            <div className="space-y-4">
              {tasks.filter(t => t.date === new Date().toISOString().split('T')[0]).map(task => (
                <div key={task.id} className="flex items-center gap-3">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    task.priority === 'high' ? "bg-red-500" : task.priority === 'medium' ? "bg-yellow-500" : "bg-blue-500"
                  )} />
                  <span className="text-sm text-zinc-300">{task.title}</span>
                </div>
              ))}
              {tasks.filter(t => t.date === new Date().toISOString().split('T')[0]).length === 0 && (
                <p className="text-xs text-zinc-500 italic">No tasks scheduled for today.</p>
              )}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="lg:col-span-8">
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "premium-card group transition-all",
                    task.completed ? "opacity-60 grayscale-[0.5]" : "hover:border-agro-neon/30"
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <button 
                        onClick={() => onToggleTask(task.id)}
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center transition-all",
                          task.completed ? "bg-agro-neon text-agro-dark" : "border-2 border-zinc-700 text-transparent hover:border-agro-neon"
                        )}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <div>
                        <h4 className={cn(
                          "font-bold transition-all",
                          task.completed ? "text-zinc-500 line-through" : "text-white"
                        )}>
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-1">
                            <CalendarIcon className="w-3 h-3" /> {task.date}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-agro-neon px-2 py-0.5 bg-agro-neon/10 rounded">
                            {task.category}
                          </span>
                          <span className={cn(
                            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded",
                            task.priority === 'high' ? "bg-red-500/10 text-red-400" :
                            task.priority === 'medium' ? "bg-yellow-500/10 text-yellow-400" :
                            "bg-blue-500/10 text-blue-400"
                          )}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteTask(task.id)}
                      className="p-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {filteredTasks.length === 0 && (
              <div className="text-center py-20 premium-card border-dashed border-white/5">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-xl font-bold text-zinc-600">No tasks found</h3>
                <p className="text-zinc-700">Try changing your filters or add a new task.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-agro-dark/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="premium-card w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display font-bold text-white">Add New Task</h3>
                <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Task Title</label>
                  <input 
                    required
                    value={newTask.title}
                    onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Water the North Field"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Date</label>
                    <input 
                      type="date"
                      required
                      value={newTask.date}
                      onChange={e => setNewTask(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={newTask.category}
                      onChange={e => setNewTask(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Priority</label>
                  <div className="flex gap-2">
                    {priorities.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTask(prev => ({ ...prev, priority: p as any }))}
                        className={cn(
                          "flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all border",
                          newTask.priority === p 
                            ? "bg-agro-neon/10 border-agro-neon text-agro-neon" 
                            : "bg-white/5 border-white/10 text-zinc-500 hover:border-white/20"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-agro-neon text-agro-dark font-bold py-5 rounded-2xl hover:bg-agro-neon/90 transition-all shadow-lg shadow-agro-neon/20"
                >
                  Create Task
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
