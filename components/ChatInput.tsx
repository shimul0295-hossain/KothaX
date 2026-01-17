
import React, { useState, useRef } from 'react';
import { Send, Smile, Mic, Square, Trash2, Image as ImageIcon, Paperclip, X, Clock, Languages, Headphones, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, User } from '../types';
import { GoogleGenAI } from "@google/genai";
import EmojiPicker from './EmojiPicker';

interface ChatInputProps {
  onSend: (content: Partial<Message>) => void;
  onTyping: (isTyping: boolean) => void;
  replyingTo: Message | null;
  onCancelReply: () => void;
  userSettings: User['settings'];
  onUpdateSettings: (s: Partial<User['settings']>) => void;
  aiClient: GoogleGenAI | null;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, onTyping, replyingTo, onCancelReply, userSettings, onUpdateSettings, aiClient }) => {
  const [text, setText] = useState('');
  const [showSchedule, setShowSchedule] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const handleSend = (scheduledDelay?: number) => {
    if (!text.trim()) return;
    const content: Partial<Message> = { type: 'text', text: text.trim() };
    if (scheduledDelay) {
      content.scheduledFor = Date.now() + scheduledDelay;
    }
    onSend(content);
    setText('');
    setShowSchedule(false);
    setShowEmojiPicker(false);
  };

  const scheduleOptions = [
    { label: 'Now', delay: 0 },
    { label: 'In 1 min', delay: 60000 },
    { label: 'In 5 mins', delay: 300000 },
    { label: 'In 1 hour', delay: 3600000 },
  ];

  const handleEmojiSelect = (emoji: string) => {
    setText(prev => prev + emoji);
  };

  return (
    <footer className="px-4 py-4 bg-slate-900 border-t border-slate-800 relative">
      <div className="max-w-4xl mx-auto flex items-center gap-2">
        <div className="flex items-center gap-1">
          <button className="p-2.5 text-slate-500 hover:text-indigo-400"><ImageIcon size={20} /></button>
          
          <div className="relative">
             <button onClick={() => setShowSchedule(!showSchedule)} className={`p-2.5 rounded-xl transition-all ${showSchedule ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-indigo-400'}`}>
                <Calendar size={20} />
             </button>
             <AnimatePresence>
               {showSchedule && (
                 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute bottom-full left-0 mb-4 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-2 min-w-[120px] flex flex-col">
                   <span className="text-[10px] font-black uppercase text-slate-500 p-2 border-b border-slate-700 mb-1">Schedule</span>
                   {scheduleOptions.map(opt => (
                     <button key={opt.delay} onClick={() => handleSend(opt.delay)} className="px-4 py-2 text-xs font-bold text-slate-300 hover:bg-indigo-600 hover:text-white rounded-xl text-left transition-all">
                       {opt.label}
                     </button>
                   ))}
                 </motion.div>
               )}
             </AnimatePresence>
          </div>

          <div className="relative">
             <button 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
              className={`p-2.5 rounded-xl transition-all ${showEmojiPicker ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-indigo-400'}`}
             >
                <Smile size={20} />
             </button>
             <AnimatePresence>
               {showEmojiPicker && (
                 <EmojiPicker 
                   onSelect={handleEmojiSelect} 
                   onClose={() => setShowEmojiPicker(false)} 
                 />
               )}
             </AnimatePresence>
          </div>

          <div className="relative">
             <button onClick={() => setShowTimer(!showTimer)} className={`p-2.5 rounded-xl transition-all ${userSettings.defaultExpiry > 0 ? 'text-orange-400 bg-orange-400/10' : 'text-slate-500 hover:text-orange-400'}`}>
                <Clock size={20} />
             </button>
          </div>
        </div>

        <div className="flex-1">
          <input 
            type="text" 
            placeholder="Type your message..." 
            value={text} 
            onChange={e => { setText(e.target.value); onTyping(true); }}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-5 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
          />
        </div>

        <button onClick={() => handleSend()} disabled={!text.trim()} className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-600/20 disabled:opacity-30 transition-all">
          <Send size={20} />
        </button>
      </div>
    </footer>
  );
};

export default ChatInput;
