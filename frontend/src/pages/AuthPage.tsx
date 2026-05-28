import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Leaf,
  Mail,
  Lock,
  User,
  ArrowRight,
  Github,
  Chrome,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AuthPageProps {
  onLogin: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    let name = '';
    if (!isLogin) {
      name = (form.elements.namedItem('name') as HTMLInputElement).value;
    }

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { email, password }
      : { fullName: name, email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      setIsLoading(false);
      if (data.status === 'success') {
        onLogin();
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Network error. Please check if the backend is running.');
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: 'demo@agrimind.ai', password: 'password123' })
      });
      const data = await res.json();
      
      setIsLoading(false);
      if (data.status === 'success') {
        onLogin();
      } else {
        setError(data.message || 'Demo authentication failed');
      }
    } catch (err) {
      setIsLoading(false);
      setError('Network error. Please check if the backend is running.');
    }
  };

  return (
    <div className="min-h-screen bg-agro-dark flex items-center justify-center p-6 agro-gradient relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-agro-neon/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse [animation-delay:2s]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-agro-neon/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-agro-neon/20 shadow-lg shadow-agro-neon/5"
          >
            <Leaf className="text-agro-neon w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight mb-2">AgriMind AI</h1>
          <p className="text-zinc-400 text-lg">Your Personal AI Agricultural Advisor</p>
          <button 
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full mt-4 p-4 bg-agro-neon/5 hover:bg-agro-neon/10 border border-agro-neon/10 hover:border-agro-neon/30 rounded-2xl text-left transition-all cursor-pointer group flex flex-col justify-start items-start gap-1"
          >
            <div className="flex justify-between items-center w-full">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Demo Account</p>
              <span className="text-agro-neon text-[10px] font-bold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                Login as Demo User &rarr;
              </span>
            </div>
            <p className="text-sm text-agro-neon font-mono">demo@agrimind.ai / password123</p>
          </button>
        </div>

        <div className="premium-card p-8 bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="flex p-1 bg-white/5 rounded-2xl mb-8 border border-white/5">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${isLogin ? 'bg-agro-neon text-agro-dark shadow-lg shadow-agro-neon/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${!isLogin ? 'bg-agro-neon text-agro-dark shadow-lg shadow-agro-neon/20' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-agro-neon transition-colors" />
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-agro-neon/50 focus:border-agro-neon outline-none transition-all"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-agro-neon transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="farmer@agrimind.ai"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-agro-neon/50 focus:border-agro-neon outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Password</label>
                {isLogin && (
                  <button type="button" className="text-[10px] text-agro-neon hover:underline font-bold uppercase tracking-widest">Forgot?</button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-agro-neon transition-colors" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 focus:ring-2 focus:ring-agro-neon/50 focus:border-agro-neon outline-none transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm">
                <AlertCircle className="w-5 h-5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-agro-neon text-agro-dark font-bold py-4 rounded-2xl hover:bg-agro-neon/90 transition-all flex items-center justify-center gap-3 shadow-lg shadow-agro-neon/20 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-agro-dark/30 border-t-agro-dark rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {isLogin && (
              <button 
                type="button" 
                onClick={handleDemoLogin}
                disabled={isLoading}
                className="w-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-agro-neon/30 text-agro-neon font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
              >
                Login as Demo User
              </button>
            )}
          </form>

          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-8">
              <div className="absolute w-full h-px bg-white/10" />
              <span className="relative px-4 bg-agro-card text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Or continue with</span>
            </div>

            <button className="w-full flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all text-sm font-bold text-zinc-300">
              <Chrome className="w-5 h-5" /> Google Account
            </button>
          </div>
        </div>

        <p className="text-center mt-8 text-zinc-500 text-xs">
          By continuing, you agree to AgriMind AI's <br />
          <span className="text-white hover:text-agro-neon cursor-pointer transition-colors">Terms of Service</span> and <span className="text-white hover:text-agro-neon cursor-pointer transition-colors">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
};
