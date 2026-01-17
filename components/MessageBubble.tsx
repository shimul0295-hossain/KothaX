
import React, { useState, useEffect } from 'react';
import { Message } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, CheckCheck, Play, Edit2, Trash, MoreVertical, X, FileText, Download, Reply, Forward, Languages, Clock, Headphones, Pin, Star } from 'lucide-react';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onReaction?: (emoji: string) => void;
  onPin?: () => void;
  onStar?: () => void;
  isPinned?: boolean;
  currentUserName: string;
}

const COMMON_EMOJIS = ['❤️', '👍', '😂', '🔥'];

const formatTime = (ts: number) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// Simple regex to check if a string consists only of emojis
const isOnlyEmoji = (str: string) => {
  if (!str) return false;
  const emojiRegex = /^(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]|\s)+$/gi;
  return emojiRegex.test(str.trim());
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe, onReaction, onPin, onStar, isPinned, currentUserName }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (message.expiry) {
      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.round((message.expiry! - Date.now()) / 1000));
        setTimeLeft(remaining);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [message.expiry]);

  const handleEmojiClick = (emoji: string) => {
    onReaction?.(emoji);
    setShowEmojiPicker(false);
  };

  const isBigEmoji = message.type === 'text' && message.text && isOnlyEmoji(message.text) && message.text.length <= 12;

  if (message.isDeleted) return <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-2`}><div className="px-3 py-1 text-[10px] italic text-slate-500 bg-slate-800/30 rounded-lg">Deleted</div></div>;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'} mb-2 relative`}>
      <div className={`flex items-center gap-2 mb-1 text-[10px] font-bold uppercase tracking-widest ${isMe ? 'flex-row-reverse text-indigo-400' : 'text-slate-500'}`}>
        {!isMe && <span>{message.senderName}</span>}
        {message.isPinned && <Pin size={10} className="text-indigo-400" />}
        {message.isStarred && <Star size={10} className="text-amber-400 fill-amber-400" />}
      </div>

      <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : ''}`}>
        <div className={`rounded-2xl shadow-xl transition-all relative ${
          isBigEmoji 
            ? 'bg-transparent shadow-none border-none' 
            : isMe ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
        }`}>
          <div className={`px-4 py-3 leading-relaxed ${isBigEmoji ? 'text-4xl px-0 py-1' : 'text-sm'}`}>
            {message.type === 'image' && <img src={message.imageUrl} className="mb-2 rounded-lg max-h-64" />}
            {message.type === 'gif' && <img src={message.gifUrl} className="mb-2 rounded-xl" />}
            <p className="whitespace-pre-wrap">{message.text}</p>
            
            {!isBigEmoji && (
              <div className={`flex items-center gap-2 text-[9px] mt-1.5 font-black uppercase opacity-60 ${isMe ? 'justify-end' : ''}`}>
                {timeLeft !== null && <span className="text-orange-400">{timeLeft}s</span>}
                <span>{formatTime(message.timestamp)}</span>
                {isMe && <CheckCheck size={12} className="text-cyan-400" />}
              </div>
            )}
          </div>
          {isBigEmoji && (
            <div className={`flex items-center gap-2 text-[9px] mt-0 font-black uppercase opacity-40 ${isMe ? 'justify-end' : 'justify-start'}`}>
              <span>{formatTime(message.timestamp)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity">
           <button onClick={() => setShowMenu(!showMenu)} className="p-1.5 text-slate-500 hover:text-white"><MoreVertical size={16} /></button>
           <AnimatePresence>
             {showMenu && (
               <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className={`absolute bottom-full mb-2 z-40 bg-slate-900 border border-slate-700 rounded-xl p-1 shadow-2xl min-w-[120px] ${isMe ? 'right-0' : 'left-0'}`}>
                 <button onClick={() => { onPin?.(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"><Pin size={12} /> {isPinned ? 'Unpin' : 'Pin'}</button>
                 <button onClick={() => { onStar?.(); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"><Star size={12} /> {message.isStarred ? 'Unstar' : 'Star'}</button>
                 <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 rounded-lg"><Forward size={12} /> Forward</button>
                 <button className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-400/10 rounded-lg"><Trash size={12} /> Delete</button>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
