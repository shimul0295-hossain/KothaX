
import React from 'react';
import { motion } from 'framer-motion';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose: () => void;
}

const EMOJI_DATA = [
  {
    category: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵', '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕']
  },
  {
    category: 'Gestures',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '✍️', '💅', '🤳', '💪', '🦾']
  },
  {
    category: 'Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟']
  },
  {
    category: 'Activities',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏹', '🎣', '🤿', '🥊', '🥋', '⛸️', '🎿', '🛷', '🥌', '🎯', '🪀', '🪁', '🎮', '🕹️', '🎰', '🎲', '🧩', '🧸', '♟️']
  },
  {
    category: 'Food',
    emojis: ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙']
  }
];

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="absolute bottom-full mb-4 left-0 w-80 max-h-[400px] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col z-50"
    >
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
        <h4 className="text-xs font-black uppercase text-indigo-400 tracking-widest">Emoji Pack</h4>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
        {EMOJI_DATA.map((group) => (
          <div key={group.category} className="mb-4">
            <h5 className="text-[10px] font-bold text-slate-500 uppercase mb-2 ml-1">{group.category}</h5>
            <div className="grid grid-cols-8 gap-1">
              {group.emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onSelect(emoji)}
                  className="w-8 h-8 flex items-center justify-center text-xl hover:bg-slate-800 rounded-lg transition-all active:scale-90"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-2 bg-slate-800/50 border-t border-slate-800 flex justify-center gap-4">
        {EMOJI_DATA.map((group) => (
          <button 
            key={group.category} 
            title={group.category}
            className="text-lg opacity-50 hover:opacity-100 transition-opacity"
            onClick={(e) => {
              const el = e.currentTarget.closest('.absolute')?.querySelector(`h5:contains('${group.category}')`);
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            {group.emojis[0]}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default EmojiPicker;
