import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon,
  Calendar,
  Tag,
  ArrowUpRight,
  ArrowDownRight,
  Sprout,
  Zap,
  Droplets,
  Scale,
  Download,
  Filter,
  BarChart3,
  X,
  Edit2,
  ChevronRight,
  ChevronLeft,
  Users
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { Expense, FinanceSummary, Category } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface FinancialLedgerProps {
  projectedRevenue: number;
}

const DEFAULT_CATEGORIES: Category[] = [
  { id: 'seeds', label: 'Seeds', color: '#39FF14' },
  { id: 'fertilizers', label: 'Fertilizers', color: '#3B82F6' },
  { id: 'labor', label: 'Labor', color: '#F59E0B' },
  { id: 'machinery', label: 'Machinery', color: '#8B5CF6' },
  { id: 'other', label: 'Other', color: '#6B7280' },
];

export const FinancialLedger: React.FC<FinancialLedgerProps> = ({ projectedRevenue }) => {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', category: 'seeds', amount: 12000, date: '2026-03-15', description: 'Basmati Rice Seeds' },
    { id: '2', category: 'fertilizers', amount: 8500, date: '2026-03-20', description: 'Urea & DAP' },
    { id: '3', category: 'labor', amount: 15000, date: '2026-03-25', description: 'Sowing Labor' },
    { id: '4', category: 'machinery', amount: 5000, date: '2026-04-01', description: 'Tractor Rental' },
    { id: '5', category: 'other', amount: 2000, date: '2026-04-02', description: 'Small Tools' },
  ]);

  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [isAdding, setIsAdding] = useState(false);
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [activeView, setActiveView] = useState<'ledger' | 'reports'>('ledger');
  
  // Filter states
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    category: 'seeds',
    amount: 0,
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const [newCategory, setNewCategory] = useState({ label: '', color: '#00ff88' });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const matchCategory = filterCategory === 'all' || e.category === filterCategory;
      const matchStart = !startDate || e.date >= startDate;
      const matchEnd = !endDate || e.date <= endDate;
      return matchCategory && matchStart && matchEnd;
    });
  }, [expenses, filterCategory, startDate, endDate]);

  const summary = useMemo(() => {
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    return {
      totalExpenses,
      projectedRevenue,
      netProfit: projectedRevenue - totalExpenses
    };
  }, [filteredExpenses, projectedRevenue]);

  const chartData = useMemo(() => {
    return categories.map(cat => ({
      name: cat.label,
      value: filteredExpenses.filter(e => e.category === cat.id).reduce((sum, e) => sum + e.amount, 0),
      color: cat.color
    })).filter(d => d.value > 0);
  }, [filteredExpenses, categories]);

  const monthlyTrends = useMemo(() => {
    const months: Record<string, number> = {};
    expenses.forEach(e => {
      const month = e.date.substring(0, 7); // YYYY-MM
      months[month] = (months[month] || 0) + e.amount;
    });
    return Object.entries(months)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({ month, amount }));
  }, [expenses]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!newExpense.amount || newExpense.amount <= 0) {
      newErrors.amount = 'Amount must be greater than zero';
    }
    if (!newExpense.description || newExpense.description.trim().length < 3) {
      newErrors.description = 'Description must be at least 3 characters';
    }
    if (!newExpense.date) {
      newErrors.date = 'Date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const expense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      category: newExpense.category as string,
      amount: Number(newExpense.amount),
      date: newExpense.date || new Date().toISOString().split('T')[0],
      description: newExpense.description || ''
    };

    setExpenses([expense, ...expenses]);
    setIsAdding(false);
    setNewExpense({ category: categories[0].id, amount: 0, description: '', date: new Date().toISOString().split('T')[0] });
    setErrors({});
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.label.trim()) return;
    
    const cat: Category = {
      id: newCategory.label.toLowerCase().replace(/\s+/g, '_'),
      label: newCategory.label,
      color: newCategory.color,
      isCustom: true
    };
    
    setCategories([...categories, cat]);
    setNewCategory({ label: '', color: '#00ff88' });
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    // Re-assign expenses with this category to 'other'
    setExpenses(expenses.map(e => e.category === id ? { ...e, category: 'other' } : e));
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Category', 'Description', 'Amount'];
    const rows = filteredExpenses.map(e => [
      e.date,
      categories.find(c => c.id === e.category)?.label || e.category,
      e.description,
      e.amount
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `agrimind_ai_expenses_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-[var(--text-main)] tracking-tight">Financial Ledger</h2>
          <div className="flex bg-white/5 p-1 rounded-xl border border-[var(--border-color)] mt-4 w-fit">
            <button 
              onClick={() => setActiveView('ledger')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                activeView === 'ledger' ? "bg-agro-neon text-agro-dark shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Scale className="w-4 h-4" /> Ledger
            </button>
            <button 
              onClick={() => setActiveView('reports')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2",
                activeView === 'reports' ? "bg-agro-neon text-agro-dark shadow-lg" : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <BarChart3 className="w-4 h-4" /> Reports
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="p-3 bg-white/5 border border-[var(--border-color)] rounded-2xl text-zinc-400 hover:text-agro-neon hover:border-agro-neon/30 transition-all"
            title="Export to CSV"
          >
            <Download className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setIsManagingCategories(true)}
            className="p-3 bg-white/5 border border-[var(--border-color)] rounded-2xl text-zinc-400 hover:text-agro-neon hover:border-agro-neon/30 transition-all"
            title="Manage Categories"
          >
            <Tag className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-agro-neon text-agro-dark px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-agro-neon/90 transition-all shadow-lg shadow-agro-neon/20"
          >
            <Plus className="w-5 h-5" /> Add Expense
          </button>
        </div>
      </div>

      {activeView === 'ledger' ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="premium-card bg-gradient-to-br from-agro-card to-agro-neon/5 border-agro-neon/10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">Projected Revenue</p>
                <div className="w-10 h-10 bg-agro-neon/10 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-agro-neon" />
                </div>
              </div>
              <p className="text-4xl font-display font-bold text-[var(--text-main)]">₹{summary.projectedRevenue.toLocaleString()}</p>
              <p className="text-[var(--text-muted)] text-xs mt-2">Based on AI yield prediction</p>
            </div>

            <div className="premium-card bg-gradient-to-br from-agro-card to-red-500/5 border-red-500/10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">Total Expenses</p>
                <div className="w-10 h-10 bg-red-500/10 rounded-2xl flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-red-400" />
                </div>
              </div>
              <p className="text-4xl font-display font-bold text-[var(--text-main)]">₹{summary.totalExpenses.toLocaleString()}</p>
              <p className="text-[var(--text-muted)] text-xs mt-2">{filteredExpenses.length} filtered transactions</p>
            </div>

            <div className="premium-card bg-gradient-to-br from-agro-card to-blue-500/5 border-blue-500/10">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">Net Profit</p>
                <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-4xl font-display font-bold text-[var(--text-main)]">₹{summary.netProfit.toLocaleString()}</p>
              <p className={cn(
                "text-xs mt-2 font-bold",
                summary.netProfit > 0 ? "text-agro-neon" : "text-red-400"
              )}>
                {summary.netProfit > 0 ? 'Profitable Season' : 'Loss Projected'}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="premium-card py-4">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <Filter className="w-5 h-5 text-zinc-500" />
                <span className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">Filters</span>
              </div>
              
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select 
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-white/5 border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-agro-neon/50"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
                
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white/5 border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-agro-neon/50"
                    placeholder="Start Date"
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white/5 border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-agro-neon/50"
                    placeholder="End Date"
                  />
                </div>
              </div>

              {(filterCategory !== 'all' || startDate || endDate) && (
                <button 
                  onClick={() => {
                    setFilterCategory('all');
                    setStartDate('');
                    setEndDate('');
                  }}
                  className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Expense List */}
            <div className="lg:col-span-8 space-y-6">
              <div className="premium-card">
                <h3 className="text-xl font-display font-bold text-[var(--text-main)] mb-6">Transactions</h3>
                <div className="space-y-4">
                  {filteredExpenses.map((expense) => {
                    const cat = categories.find(c => c.id === expense.category) || categories.find(c => c.id === 'other')!;
                    return (
                      <motion.div 
                        key={expense.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-[var(--border-color)] hover:border-agro-neon/20 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="w-12 h-12 rounded-2xl flex items-center justify-center border"
                            style={{ backgroundColor: `${cat.color}10`, borderColor: `${cat.color}30`, color: cat.color }}
                          >
                            {expense.category === 'seeds' && <Sprout className="w-6 h-6" />}
                            {expense.category === 'fertilizers' && <Zap className="w-6 h-6" />}
                            {expense.category === 'labor' && <Users className="w-6 h-6" />}
                            {expense.category === 'machinery' && <Scale className="w-6 h-6" />}
                            {expense.category === 'other' && <Tag className="w-6 h-6" />}
                            {!['seeds', 'fertilizers', 'labor', 'machinery', 'other'].includes(expense.category) && <Tag className="w-6 h-6" />}
                          </div>
                          <div>
                            <p className="font-bold text-[var(--text-main)]">{expense.description}</p>
                            <div className="flex items-center gap-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/5 text-zinc-500">{cat.label}</p>
                              <p className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                                <Calendar className="w-3 h-3" /> {expense.date}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <p className="text-lg font-bold text-[var(--text-main)]">₹{expense.amount.toLocaleString()}</p>
                          <button 
                            onClick={() => setExpenses(expenses.filter(e => e.id !== expense.id))}
                            className="p-2 text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                  {filteredExpenses.length === 0 && (
                    <div className="text-center py-12 text-[var(--text-muted)]">
                      No expenses match your filters.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Breakdown Chart */}
            <div className="lg:col-span-4">
              <div className="premium-card h-full">
                <h3 className="text-xl font-display font-bold text-[var(--text-main)] mb-6">Expense Breakdown</h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--bg-card)', 
                          borderRadius: '16px', 
                          border: '1px solid var(--border-color)',
                          boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' 
                        }}
                        itemStyle={{ color: 'var(--text-main)' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-6">
                  {chartData.map(data => (
                    <div key={data.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }} />
                        <span className="text-[var(--text-muted)]">{data.name}</span>
                      </div>
                      <span className="font-bold text-[var(--text-main)]">₹{data.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="premium-card">
              <h3 className="text-xl font-display font-bold text-[var(--text-main)] mb-8 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-agro-neon" /> Monthly Spending Trend
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrends}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00ff88" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="month" 
                      stroke="#71717a" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#71717a" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `₹${value/1000}k`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--bg-card)', 
                        borderRadius: '16px', 
                        border: '1px solid var(--border-color)' 
                      }}
                      itemStyle={{ color: '#00ff88' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#00ff88" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="premium-card">
              <h3 className="text-xl font-display font-bold text-[var(--text-main)] mb-8 flex items-center gap-3">
                <PieChartIcon className="w-6 h-6 text-blue-400" /> Category Distribution
              </h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#71717a" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#71717a" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false}
                      tickFormatter={(value) => `₹${value/1000}k`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ 
                        backgroundColor: 'var(--bg-card)', 
                        borderRadius: '16px', 
                        border: '1px solid var(--border-color)' 
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="premium-card">
            <h3 className="text-xl font-display font-bold text-[var(--text-main)] mb-6">Yearly Financial Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-white/5 rounded-2xl border border-[var(--border-color)]">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Total Spent</p>
                <p className="text-2xl font-bold text-[var(--text-main)]">₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}</p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-[var(--border-color)]">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Avg. Monthly</p>
                <p className="text-2xl font-bold text-[var(--text-main)]">₹{(expenses.reduce((sum, e) => sum + e.amount, 0) / (monthlyTrends.length || 1)).toLocaleString()}</p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-[var(--border-color)]">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Highest Category</p>
                <p className="text-2xl font-bold text-agro-neon">{chartData.sort((a, b) => b.value - a.value)[0]?.name || 'N/A'}</p>
              </div>
              <div className="p-6 bg-white/5 rounded-2xl border border-[var(--border-color)]">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-2">Transactions</p>
                <p className="text-2xl font-bold text-[var(--text-main)]">{expenses.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-agro-dark/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg premium-card bg-[var(--bg-card)] border-[var(--border-color)] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display font-bold text-[var(--text-main)]">Add New Expense</h3>
                <button 
                  onClick={() => setIsAdding(false)}
                  className="p-2 text-zinc-500 hover:text-[var(--text-main)] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Category</label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewExpense({ ...newExpense, category: cat.id })}
                        className={cn(
                          "py-3 rounded-xl text-[10px] font-bold border transition-all",
                          newExpense.category === cat.id 
                            ? "bg-agro-neon/10 border-agro-neon/50 text-agro-neon" 
                            : "bg-white/5 border-[var(--border-color)] text-zinc-500 hover:border-white/10"
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Amount (₹)</label>
                  <input 
                    type="number"
                    value={newExpense.amount || ''}
                    onChange={e => {
                      const val = Number(e.target.value);
                      setNewExpense({ ...newExpense, amount: val });
                      if (val > 0) setErrors(prev => ({ ...prev, amount: '' }));
                    }}
                    placeholder="0.00"
                    className={cn(
                      "w-full bg-white/5 border rounded-2xl py-4 px-4 text-[var(--text-main)] placeholder-zinc-600 outline-none transition-all",
                      errors.amount ? "border-red-500/50 focus:ring-red-500/20" : "border-[var(--border-color)] focus:ring-agro-neon/50 focus:border-agro-neon"
                    )}
                  />
                  {errors.amount && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1">{errors.amount}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Description</label>
                  <input 
                    type="text"
                    value={newExpense.description}
                    onChange={e => {
                      setNewExpense({ ...newExpense, description: e.target.value });
                      if (e.target.value.length >= 3) setErrors(prev => ({ ...prev, description: '' }));
                    }}
                    placeholder="What was this for?"
                    className={cn(
                      "w-full bg-white/5 border rounded-2xl py-4 px-4 text-[var(--text-main)] placeholder-zinc-600 outline-none transition-all",
                      errors.description ? "border-red-500/50 focus:ring-red-500/20" : "border-[var(--border-color)] focus:ring-agro-neon/50 focus:border-agro-neon"
                    )}
                  />
                  {errors.description && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Date</label>
                  <input 
                    type="date"
                    value={newExpense.date}
                    onChange={e => {
                      setNewExpense({ ...newExpense, date: e.target.value });
                      if (e.target.value) setErrors(prev => ({ ...prev, date: '' }));
                    }}
                    className={cn(
                      "w-full bg-white/5 border rounded-2xl py-4 px-4 text-[var(--text-main)] outline-none transition-all",
                      errors.date ? "border-red-500/50 focus:ring-red-500/20" : "border-[var(--border-color)] focus:ring-agro-neon/50 focus:border-agro-neon"
                    )}
                  />
                  {errors.date && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1">{errors.date}</p>}
                </div>

                <button 
                  type="submit"
                  className="w-full bg-agro-neon text-agro-dark font-bold py-4 rounded-2xl hover:bg-agro-neon/90 transition-all shadow-lg shadow-agro-neon/20"
                >
                  Save Transaction
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manage Categories Modal */}
      <AnimatePresence>
        {isManagingCategories && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-agro-dark/80 backdrop-blur-md z-[100] flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg premium-card bg-[var(--bg-card)] border-[var(--border-color)] p-8 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-display font-bold text-[var(--text-main)]">Manage Categories</h3>
                <button 
                  onClick={() => setIsManagingCategories(false)}
                  className="p-2 text-zinc-500 hover:text-[var(--text-main)] transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <form onSubmit={handleAddCategory} className="flex gap-2">
                  <input 
                    type="text"
                    value={newCategory.label}
                    onChange={e => setNewCategory({ ...newCategory, label: e.target.value })}
                    placeholder="New category name..."
                    className="flex-1 bg-white/5 border border-[var(--border-color)] rounded-xl px-4 py-2 text-sm text-[var(--text-main)] outline-none focus:border-agro-neon"
                  />
                  <input 
                    type="color"
                    value={newCategory.color}
                    onChange={e => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-10 h-10 bg-transparent border-none cursor-pointer"
                  />
                  <button 
                    type="submit"
                    className="bg-agro-neon text-agro-dark p-2 rounded-xl font-bold"
                  >
                    <Plus className="w-6 h-6" />
                  </button>
                </form>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-[var(--border-color)]">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-sm font-bold">{cat.label}</span>
                        {!cat.isCustom && <span className="text-[8px] uppercase tracking-widest text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">System</span>}
                      </div>
                      {cat.isCustom && (
                        <button 
                          onClick={() => removeCategory(cat.id)}
                          className="text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
