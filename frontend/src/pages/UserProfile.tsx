import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Maximize, 
  Sprout, 
  Settings, 
  Bell, 
  Moon, 
  Sun,
  Save,
  CheckCircle2,
  AlertCircle,
  Home
} from 'lucide-react';
import { UserProfile as UserProfileType, DiseaseRecord } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface UserProfileProps {
  profile: UserProfileType;
  onUpdate: (profile: UserProfileType) => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ profile, onUpdate }) => {
  const [formData, setFormData] = useState<UserProfileType>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (name: string, value: any) => {
    let error = '';
    if (name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      error = 'Invalid email address';
    }
    if (name === 'phone' && !/^\+?[\d\s-]{10,}$/.test(value)) {
      error = 'Invalid phone number';
    }
    if (name === 'farmSize' && value <= 0) {
      error = 'Farm size must be positive';
    }
    if (typeof value === 'string' && value.trim() === '') {
      error = 'This field is required';
    }
    
    setErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'number' ? parseFloat(value) : value;
    
    if (name.startsWith('pref_')) {
      const prefName = name.replace('pref_', '');
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefName]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: val }));
      validate(name, val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation check
    const hasErrors = Object.values(errors).some(err => err !== '');
    if (hasErrors) return;

    setIsSaving(true);
    setTimeout(() => {
      onUpdate(formData);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1000);
  };

  const inputClasses = (name: string) => cn(
    "w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-4 text-[var(--text-main)] placeholder-zinc-600 outline-none transition-all",
    errors[name] ? "border-red-500/50 focus:ring-2 focus:ring-red-500/20" : "border-[var(--border-color)] focus:ring-2 focus:ring-agro-neon/20 focus:border-agro-neon"
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-bold text-[var(--text-main)] tracking-tight">User Profile</h2>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-agro-neon font-bold text-sm"
          >
            <CheckCircle2 className="w-5 h-5" /> Profile Updated Successfully
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <section className="premium-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-agro-neon/10 rounded-2xl flex items-center justify-center">
                <User className="w-5 h-5 text-agro-neon" />
              </div>
              <h3 className="text-xl font-display font-bold">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={inputClasses('name')}
                  />
                </div>
                {errors.name && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={inputClasses('email')}
                  />
                </div>
                {errors.email && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className={inputClasses('phone')}
                  />
                </div>
                {errors.phone && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1">{errors.phone}</p>}
              </div>
            </div>
          </section>

          {/* Farm Details */}
          <section className="premium-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-blue-500/10 rounded-2xl flex items-center justify-center">
                <Home className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-xl font-display font-bold">Farm Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Farm Name</label>
                <div className="relative">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    name="farmName"
                    value={formData.farmName}
                    onChange={handleChange}
                    className={inputClasses('farmName')}
                  />
                </div>
                {errors.farmName && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1">{errors.farmName}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    name="farmLocation"
                    value={formData.farmLocation}
                    onChange={handleChange}
                    className={inputClasses('farmLocation')}
                  />
                </div>
                {errors.farmLocation && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1">{errors.farmLocation}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Farm Size (Acres)</label>
                <div className="relative">
                  <Maximize className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input 
                    name="farmSize"
                    type="number"
                    value={formData.farmSize}
                    onChange={handleChange}
                    className={inputClasses('farmSize')}
                  />
                </div>
                {errors.farmSize && <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1">{errors.farmSize}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Primary Crop</label>
                <div className="relative">
                  <Sprout className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <select 
                    name="primaryCrop"
                    value={formData.primaryCrop}
                    onChange={handleChange}
                    className={inputClasses('primaryCrop')}
                  >
                    <option value="Rice">Rice</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Maize">Maize</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Sugarcane">Sugarcane</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Disease History Section */}
          <section className="premium-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-red-500/10 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-xl font-display font-bold">Disease History</h3>
            </div>

            <div className="space-y-4">
              {profile.diseaseHistory && profile.diseaseHistory.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {profile.diseaseHistory.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-[var(--border-color)] group hover:border-red-500/30 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center border",
                          record.severity === 'High' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                          record.severity === 'Medium' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" :
                          "bg-green-500/10 border-green-500/20 text-green-400"
                        )}>
                          <AlertCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-[var(--text-main)]">{record.diseaseName}</p>
                          <p className="text-xs text-[var(--text-muted)] flex items-center gap-2">
                            <Sprout className="w-3 h-3" /> {record.crop} • {record.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border",
                          record.severity === 'High' ? "bg-red-500/10 text-red-400 border-red-500/20" :
                          record.severity === 'Medium' ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                          "bg-green-500/10 text-green-400 border-green-500/20"
                        )}>
                          {record.severity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-dashed border-[var(--border-color)]">
                  <p className="text-[var(--text-muted)]">No disease history recorded yet.</p>
                </div>
              )}
            </div>
          </section>

          {/* Preferences */}
          <section className="premium-card">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center">
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-xl font-display font-bold">Preferences</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-zinc-500" />
                  <div>
                    <p className="font-bold">Push Notifications</p>
                    <p className="text-xs text-[var(--text-muted)]">Alerts for market & weather</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    name="pref_notifications"
                    checked={formData.preferences.notifications}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-agro-neon"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  {formData.preferences.theme === 'dark' ? <Moon className="w-5 h-5 text-zinc-500" /> : <Sun className="w-5 h-5 text-yellow-500" />}
                  <div>
                    <p className="font-bold">Theme Mode</p>
                    <p className="text-xs text-[var(--text-muted)]">Switch between light and dark</p>
                  </div>
                </div>
                <div className="flex bg-white/5 p-1 rounded-xl border border-[var(--border-color)]">
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, theme: 'light' } }))}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      formData.preferences.theme === 'light' ? "bg-white text-agro-dark shadow-lg" : "text-zinc-500"
                    )}
                  >
                    <Sun className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, theme: 'dark' } }))}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      formData.preferences.theme === 'dark' ? "bg-agro-neon text-agro-dark shadow-lg" : "text-zinc-500"
                    )}
                  >
                    <Moon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 px-4 pb-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Currency</label>
                <select 
                  name="pref_currency"
                  value={formData.preferences.currency}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
                >
                  <option value="INR">Indian Rupee (₹)</option>
                  <option value="USD">US Dollar ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Language</label>
                <select 
                  name="pref_language"
                  value={formData.preferences.language}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white outline-none focus:border-agro-neon transition-all"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi (हिन्दी)</option>
                </select>
              </div>
            </div>
          </section>

          <button 
            type="submit"
            disabled={isSaving}
            className="w-full bg-agro-neon text-agro-dark font-bold py-5 rounded-3xl hover:bg-agro-neon/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-agro-neon/20 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-6 h-6 border-2 border-agro-dark/30 border-t-agro-dark rounded-full animate-spin" />
            ) : (
              <>
                <Save className="w-6 h-6" /> Save Profile Changes
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
