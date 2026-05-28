import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Filter,
  MoreVertical,
  Trash2,
  Edit2,
  History
} from 'lucide-react';
import { InventoryItem } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface InventoryManagerProps {
  items: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
  onUpdateItem: (id: string, updates: Partial<InventoryItem>) => void;
  onDeleteItem: (id: string) => void;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({
  items,
  onAddItem,
  onUpdateItem,
  onDeleteItem
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'quantity'>('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Omit<InventoryItem, 'id'>>({
    name: '',
    category: 'Seeds',
    quantity: 0,
    unit: 'kg',
    minThreshold: 10
  });

  const categories = ['All', 'Seeds', 'Fertilizers', 'Pesticides', 'Tools'];

  const filteredItems = items
    .filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'All' || item.category === filterCategory;
      const matchesLowStock = !showLowStockOnly || item.quantity <= item.minThreshold;
      return matchesSearch && matchesCategory && matchesLowStock;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return b.quantity - a.quantity;
    });

  const lowStockItems = items.filter(item => item.quantity <= item.minThreshold);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddItem(newItem);
    setShowAddModal(false);
    setNewItem({ name: '', category: 'Seeds', quantity: 0, unit: 'kg', minThreshold: 10 });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Inventory Management</h2>
          <p className="text-zinc-500 mt-1">Track your farm resources, stock levels, and usage.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-agro-neon text-agro-dark px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-agro-neon/20"
        >
          <Plus className="w-5 h-5" /> Add Resource
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card bg-gradient-to-br from-agro-card to-agro-neon/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-agro-neon/10 rounded-2xl flex items-center justify-center border border-agro-neon/20">
              <Package className="w-6 h-6 text-agro-neon" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Resources</p>
              <h3 className="text-2xl font-display font-bold text-white">{items.length}</h3>
            </div>
          </div>
        </div>

        <div className={cn(
          "premium-card transition-all",
          lowStockItems.length > 0 ? "border-red-500/30 bg-red-500/5" : "bg-white/5"
        )}>
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center border",
              lowStockItems.length > 0 ? "bg-red-500/10 border-red-500/20" : "bg-white/10 border-white/10"
            )}>
              <AlertTriangle className={cn("w-6 h-6", lowStockItems.length > 0 ? "text-red-400" : "text-zinc-500")} />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Low Stock Alerts</p>
              <h3 className={cn("text-2xl font-display font-bold", lowStockItems.length > 0 ? "text-red-400" : "text-white")}>
                {lowStockItems.length}
              </h3>
            </div>
          </div>
        </div>

        <div className="premium-card bg-white/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <History className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Recent Usage</p>
              <h3 className="text-2xl font-display font-bold text-white">12 Units</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-agro-neon transition-all"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 overflow-x-auto">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all",
                  filterCategory === cat ? "bg-agro-neon text-agro-dark shadow-lg" : "text-zinc-500 hover:text-white"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowLowStockOnly(!showLowStockOnly)}
            className={cn(
              "px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2",
              showLowStockOnly ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-white/5 border-white/10 text-zinc-500"
            )}
          >
            <AlertTriangle className="w-3 h-3" /> Low Stock
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 outline-none focus:border-agro-neon"
          >
            <option value="name">Sort by Name</option>
            <option value="quantity">Sort by Quantity</option>
          </select>
        </div>
      </div>

      {/* Inventory List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={cn(
                "premium-card group relative overflow-hidden",
                item.quantity <= item.minThreshold && "border-red-500/20"
              )}
            >
              <div className="flex justify-between items-start mb-6">
                <div className={cn(
                  "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border",
                  item.category === 'Seeds' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                  item.category === 'Fertilizers' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                  item.category === 'Pesticides' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                  "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                )}>
                  {item.category}
                </div>
                <button className="text-zinc-600 hover:text-white transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
              
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Current Stock</p>
                  <div className="flex items-baseline gap-2">
                    <span className={cn(
                      "text-3xl font-display font-bold",
                      item.quantity <= item.minThreshold ? "text-red-400" : "text-white"
                    )}>
                      {item.quantity}
                    </span>
                    <span className="text-zinc-500 font-medium">{item.unit}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onUpdateItem(item.id, { quantity: Math.max(0, item.quantity - 1) })}
                    className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
                  >
                    <ArrowDownRight className="w-5 h-5 text-red-400" />
                  </button>
                  <button 
                    onClick={() => onUpdateItem(item.id, { quantity: item.quantity + 1 })}
                    className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-white/10 transition-all border border-white/10"
                  >
                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                  </button>
                </div>
              </div>

              {item.quantity <= item.minThreshold && (
                <div className="mt-4 flex items-center gap-2 text-red-400 text-[10px] font-bold uppercase tracking-widest bg-red-400/10 p-2 rounded-lg border border-red-400/20">
                  <AlertTriangle className="w-3 h-3" /> Low Stock Alert
                </div>
              )}

              {/* Progress Bar */}
              <div className="mt-6 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, (item.quantity / (item.minThreshold * 2)) * 100)}%` }}
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    item.quantity <= item.minThreshold ? "bg-red-500" : "bg-agro-neon"
                  )}
                />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Item Modal */}
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
                <h3 className="text-2xl font-display font-bold text-white">Add New Resource</h3>
                <button onClick={() => setShowAddModal(false)} className="text-zinc-500 hover:text-white">
                  <Trash2 className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Resource Name</label>
                  <input 
                    required
                    value={newItem.name}
                    onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Urea Fertilizer"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                    <select 
                      value={newItem.category}
                      onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value as any }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
                    >
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Unit</label>
                    <select 
                      value={newItem.unit}
                      onChange={e => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="liters">Liters (L)</option>
                      <option value="bags">Bags</option>
                      <option value="packets">Packets</option>
                      <option value="units">Units</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Initial Quantity</label>
                    <input 
                      type="number"
                      required
                      min="0"
                      value={newItem.quantity}
                      onChange={e => setNewItem(prev => ({ ...prev, quantity: parseFloat(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Min Threshold</label>
                    <input 
                      type="number"
                      required
                      min="0"
                      value={newItem.minThreshold}
                      onChange={e => setNewItem(prev => ({ ...prev, minThreshold: parseFloat(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-agro-neon text-agro-dark font-bold py-5 rounded-2xl hover:bg-agro-neon/90 transition-all shadow-lg shadow-agro-neon/20"
                >
                  Add to Inventory
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
