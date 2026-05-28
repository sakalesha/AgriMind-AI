import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  Search, 
  MapPin, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  X, 
  Plus, 
  Filter,
  Star,
  Info,
  Clock
} from 'lucide-react';
import { MachineryItem } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface MachineryMarketplaceProps {
  items: MachineryItem[];
  onRent: (itemId: string) => void;
  onListMachinery: (item: Omit<MachineryItem, 'id'>) => void;
}

export const MachineryMarketplace: React.FC<MachineryMarketplaceProps> = ({
  items,
  onRent,
  onListMachinery
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MachineryItem | null>(null);
  const [newItem, setNewItem] = useState<Omit<MachineryItem, 'id' | 'available'>>({
    name: '',
    owner: '',
    pricePerDay: 0,
    location: '',
    image: 'https://picsum.photos/seed/tractor/800/600'
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPrice = item.pricePerDay <= maxPrice;
    const matchesAvailability = !availableOnly || item.available;
    return matchesSearch && matchesPrice && matchesAvailability;
  });

  const handleListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onListMachinery({ ...newItem, available: true });
    setShowListModal(false);
    setNewItem({ name: '', owner: '', pricePerDay: 0, location: '', image: 'https://picsum.photos/seed/tractor/800/600' });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-tight">Machinery Marketplace</h2>
          <p className="text-zinc-500 mt-1">Rent professional agricultural equipment from local farmers.</p>
        </div>
        <button 
          onClick={() => setShowListModal(true)}
          className="bg-agro-neon text-agro-dark px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg shadow-agro-neon/20"
        >
          <Plus className="w-5 h-5" /> List My Machinery
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search tractors, harvesters, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white outline-none focus:border-agro-neon transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Max Price: ₹{maxPrice}</span>
            <input 
              type="range" 
              min="500" 
              max="10000" 
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-32 accent-agro-neon"
            />
          </div>
          <button 
            onClick={() => setAvailableOnly(!availableOnly)}
            className={cn(
              "px-4 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest border transition-all flex items-center gap-2",
              availableOnly ? "bg-agro-neon/20 border-agro-neon/50 text-agro-neon" : "bg-white/5 border-white/10 text-zinc-500"
            )}
          >
            <CheckCircle2 className="w-4 h-4" /> Available Only
          </button>
        </div>
      </div>

      {/* Machinery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="premium-card group p-0 overflow-hidden flex flex-col"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={item.image} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md",
                    item.available ? "bg-agro-neon/20 text-agro-neon border-agro-neon/30" : "bg-red-500/20 text-red-400 border-red-500/30"
                  )}>
                    {item.available ? 'Available' : 'Rented'}
                  </span>
                </div>
                <div className="absolute bottom-4 right-4 bg-agro-dark/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-white font-bold text-sm">
                  ₹{item.pricePerDay}/day
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{item.name}</h3>
                    <div className="flex items-center gap-2 text-zinc-500 text-xs">
                      <MapPin className="w-3 h-3" /> {item.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs font-bold">4.8</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Owner</span>
                    <span className="text-white font-medium">{item.owner}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Condition</span>
                    <span className="text-agro-neon font-medium">Excellent</span>
                  </div>
                </div>

                <div className="mt-auto flex gap-3">
                  <button 
                    onClick={() => setSelectedItem(item)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl text-sm font-bold transition-all border border-white/10"
                  >
                    View Details
                  </button>
                  <button 
                    disabled={!item.available}
                    onClick={() => onRent(item.id)}
                    className={cn(
                      "flex-[1.5] py-3 rounded-xl text-sm font-bold transition-all shadow-lg",
                      item.available ? "bg-agro-neon text-agro-dark hover:bg-agro-neon/90 shadow-agro-neon/20" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    )}
                  >
                    Rent Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
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
              className="premium-card w-full max-w-2xl p-0 overflow-hidden"
            >
              <div className="relative h-64">
                <img 
                  src={selectedItem.image} 
                  alt={selectedItem.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => setSelectedItem(null)}
                  className="absolute top-4 right-4 bg-agro-dark/50 backdrop-blur-md p-2 rounded-full text-white hover:bg-agro-dark transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-3xl font-display font-bold text-white mb-2">{selectedItem.name}</h3>
                    <div className="flex items-center gap-4 text-zinc-500">
                      <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {selectedItem.location}</div>
                      <div className="flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500 fill-current" /> 4.8 (12 Reviews)</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Daily Rate</p>
                    <p className="text-3xl font-display font-bold text-agro-neon">₹{selectedItem.pricePerDay}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 text-zinc-500 mb-2">
                      <Truck className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-widest">Type</span>
                    </div>
                    <p className="font-bold text-white">Heavy Duty</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 text-zinc-500 mb-2">
                      <Clock className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-widest">Usage</span>
                    </div>
                    <p className="font-bold text-white">450 Hours</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3 text-zinc-500 mb-2">
                      <Info className="w-4 h-4" /> <span className="text-[10px] font-bold uppercase tracking-widest">Fuel</span>
                    </div>
                    <p className="font-bold text-white">Diesel</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    onRent(selectedItem.id);
                    setSelectedItem(null);
                  }}
                  disabled={!selectedItem.available}
                  className="w-full bg-agro-neon text-agro-dark font-bold py-5 rounded-2xl hover:bg-agro-neon/90 transition-all shadow-lg shadow-agro-neon/20 flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <Calendar className="w-6 h-6" /> Book for Rental
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Machinery Modal */}
      <AnimatePresence>
        {showListModal && (
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
                <h3 className="text-2xl font-display font-bold text-white">List Your Machinery</h3>
                <button onClick={() => setShowListModal(false)} className="text-zinc-500 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleListSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Equipment Name</label>
                  <input 
                    required
                    value={newItem.name}
                    onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Mahindra 575 DI Tractor"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Price Per Day (₹)</label>
                    <input 
                      type="number"
                      required
                      value={newItem.pricePerDay}
                      onChange={e => setNewItem(prev => ({ ...prev, pricePerDay: parseFloat(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Location</label>
                    <input 
                      required
                      value={newItem.location}
                      onChange={e => setNewItem(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="e.g., Ludhiana, Punjab"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Owner Name</label>
                  <input 
                    required
                    value={newItem.owner}
                    onChange={e => setNewItem(prev => ({ ...prev, owner: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-agro-neon text-agro-dark font-bold py-5 rounded-2xl hover:bg-agro-neon/90 transition-all shadow-lg shadow-agro-neon/20"
                >
                  List Equipment
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
