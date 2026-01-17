
import React, { useState, useEffect } from 'react';
import LandingScreen from './components/LandingScreen';
import ChatScreen from './components/ChatScreen';
import { User } from './types';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const savedUser = localStorage.getItem('kothax_user');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    
    const savedTheme = localStorage.getItem('kothax_theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('kothax_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleStartChat = (name: string) => {
    // Role is member by default, but first user in session could be admin
    const newUser: User = {
      name,
      id: Math.random().toString(36).substring(2, 9),
      role: localStorage.getItem('kothax_history') ? 'member' : 'admin',
      privacy: {
        hideOnline: false,
        hideLastSeen: false
      },
      settings: {
        targetLanguage: 'English',
        autoTranslate: false,
        profanityFilter: true,
        defaultExpiry: 0,
        soundEnabled: true,
        notificationsEnabled: true
      },
      blockedUsers: []
    };
    setCurrentUser(newUser);
    localStorage.setItem('kothax_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kothax_user');
  };

  const updateUserSettings = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('kothax_user', JSON.stringify(updatedUser));
  };

  return (
    <div className="h-screen w-full bg-slate-950 dark:bg-slate-950 light:bg-slate-50 flex flex-col items-center justify-center p-0 md:p-4 overflow-hidden transition-colors duration-500">
      <AnimatePresence mode="wait">
        {!currentUser ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex items-center justify-center"
          >
            <LandingScreen onStart={handleStartChat} />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full h-full max-w-5xl bg-slate-900 dark:bg-slate-900 light:bg-white md:rounded-3xl shadow-2xl border border-slate-800 dark:border-slate-800 light:border-slate-200 flex flex-col overflow-hidden"
          >
            <ChatScreen 
              user={currentUser} 
              onLogout={handleLogout} 
              theme={theme} 
              onToggleTheme={toggleTheme}
              onUpdateUser={updateUserSettings}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
