
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code, Shield } from 'lucide-react';

interface LandingScreenProps {
  onStart: (name: string) => void;
}

const LandingScreen: React.FC<LandingScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length >= 2) {
      onStart(name.trim());
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md w-full px-8 py-14 text-center glass-card rounded-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500">
      {/* Decorative Blur Orbs */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600/20 rounded-full blur-[60px]"></div>
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-600/20 rounded-full blur-[60px]"></div>

      <motion.div
        initial={{ scale: 0.8, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="w-28 h-28 mb-8 relative z-10 p-1"
      >
        <img 
          src="logo.png" 
          alt="KothaX Logo" 
          className="w-full h-full object-contain drop-shadow-2xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900 shadow-sm"
        ></motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10"
      >
        <h1 className="text-5xl font-black tracking-tight dark:text-white light:text-slate-900 mb-2">
          KothaX
        </h1>
        <div className="flex items-center justify-center gap-2 text-indigo-500 font-bold uppercase tracking-[0.2em] text-[10px] mb-8">
          <Shield size={12} />
          Private & Secure
        </div>
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="dark:text-slate-400 light:text-slate-600 mb-10 text-lg font-medium leading-relaxed px-4"
      >
        Experience instant, real-time messaging without the hassle of accounts.
      </motion.p>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onSubmit={handleSubmit}
        className="w-full space-y-5 relative z-10"
      >
        <div className="relative group">
          <input
            type="text"
            placeholder="What's your name?"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-8 py-5 bg-white/5 dark:bg-white/5 light:bg-black/5 border border-white/10 dark:border-white/10 light:border-black/5 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all dark:text-white light:text-slate-900 text-lg font-semibold placeholder:text-slate-500 group-hover:bg-white/10"
            autoFocus
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          disabled={name.trim().length < 2}
          className="w-full py-5 px-8 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-lg rounded-[2rem] shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 transition-all group"
        >
          Let's Go
          <ArrowRight size={22} className="group-hover:translate-x-1.5 transition-transform" />
        </motion.button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-10 relative z-10"
      >
        <div className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500/5 dark:bg-indigo-500/5 light:bg-indigo-500/10 rounded-full border border-indigo-500/10 text-[11px] font-black uppercase tracking-widest text-indigo-500/80">
          <Code size={14} className="text-indigo-500" />
          Created By Shimul
        </div>
      </motion.div>
    </div>
  );
};

export default LandingScreen;
