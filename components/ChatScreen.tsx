
import React, { useState, useEffect, useRef } from 'react';
import { User, Message, ChatEvent, ChannelInfo } from '../types';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import CallOverlay from './CallOverlay';
import { LogOut, Trash2, ShieldCheck, Users, X, Menu, Heart, Settings2, Save, Sun, Moon, Lock, ShieldAlert, EyeOff, Ban, Sparkles, Languages, Clock, ListRestart, Search, Download, Upload, Volume2, VolumeX, Bell, BellOff, Pin, Star, Palette, Crown, Phone, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";

interface ChatScreenProps {
  user: User;
  onLogout: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onUpdateUser: (user: User) => void;
}

interface OnlineUser {
  id: string;
  name: string;
  lastSeen: number;
  hideStatus: boolean;
  role: 'admin' | 'member';
}

const BACKGROUNDS = [
  { id: 'none', label: 'Default', url: '' },
  { id: 'cubes', label: 'Cubes', url: 'https://www.transparenttextures.com/patterns/cubes.png' },
  { id: 'dots', label: 'Dots', url: 'https://www.transparenttextures.com/patterns/carbon-fibre.png' },
  { id: 'subtle', label: 'Texture', url: 'https://www.transparenttextures.com/patterns/shattered.png' },
];

const THEME_COLORS = [
  { name: 'Indigo', accent: 'bg-indigo-600', text: 'text-indigo-400' },
  { name: 'Rose', accent: 'bg-rose-600', text: 'text-rose-400' },
  { name: 'Emerald', accent: 'bg-emerald-600', text: 'text-emerald-400' },
  { name: 'Amber', accent: 'bg-amber-600', text: 'text-amber-400' },
  { name: 'Sky', accent: 'bg-sky-600', text: 'text-sky-400' },
];

const decrypt = (encoded: string, key: string) => {
  if (!key) return encoded;
  try {
    const text = atob(encoded);
    const chars = text.split('').map((c, i) => 
      String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
    );
    return chars.join('');
  } catch(e) { return "Decrypt Error"; }
};

const encrypt = (text: string, key: string) => {
  if (!key) return text;
  const chars = text.split('').map((c, i) => 
    String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  );
  return btoa(chars.join(''));
};

const ChatScreen: React.FC<ChatScreenProps> = ({ user, onLogout, theme, onToggleTheme, onUpdateUser }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [scheduledMessages, setScheduledMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState<string | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<Record<string, OnlineUser>>({});
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [screenshotAlert, setScreenshotAlert] = useState<string | null>(null);
  const [smartReplies, setSmartReplies] = useState<string[]>([]);
  const [chatSummary, setChatSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'starred'>('members');
  
  // Call State
  const [activeCall, setActiveCall] = useState<{
    type: 'audio' | 'video';
    status: 'calling' | 'incoming' | 'connected';
    remoteUserId: string;
    remoteUserName: string;
  } | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const [channelInfo, setChannelInfo] = useState<ChannelInfo>({
    name: 'KothaX Group',
    emoji: '🚀',
    background: 'cubes',
    encryptionKey: 'kothax_default_key',
    accentColor: 'Indigo',
    pinnedMessageIds: []
  });

  const activeBg = BACKGROUNDS.find(bg => bg.id === channelInfo.background)?.url;
  
  const [editName, setEditName] = useState(channelInfo.name);
  const [editEmoji, setEditEmoji] = useState(channelInfo.emoji);
  const [editBg, setEditBg] = useState(channelInfo.background);
  const [editKey, setEditKey] = useState(channelInfo.encryptionKey);
  const [editAccent, setEditAccent] = useState(channelInfo.accentColor);

  const chatChannelRef = useRef<BroadcastChannel | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    notificationSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');
  }, []);

  const saveMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
    localStorage.setItem('kothax_history', JSON.stringify(newMessages));
  };

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    if (!isSearching) messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, smartReplies]);

  // Signaling & RTC Functions
  const createPeerConnection = (remoteUserId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        chatChannelRef.current?.postMessage({
          type: 'CALL_SIGNAL',
          senderId: user.id,
          senderName: user.name,
          payload: { targetId: remoteUserId, signal: { candidate: event.candidate } }
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const initiateCall = async (targetUserId: string, targetUserName: string, type: 'audio' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: type === 'video' 
      });
      setLocalStream(stream);
      setActiveCall({ type, status: 'calling', remoteUserId: targetUserId, remoteUserName: targetUserName });

      chatChannelRef.current?.postMessage({
        type: 'CALL_REQUEST',
        senderId: user.id,
        senderName: user.name,
        payload: { targetId: targetUserId, type }
      });
    } catch (err) {
      console.error('Call initialization failed', err);
      alert('Could not access camera/microphone');
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (activeCall) {
      chatChannelRef.current?.postMessage({
        type: 'CALL_END',
        senderId: user.id,
        senderName: user.name,
        payload: { targetId: activeCall.remoteUserId }
      });
    }

    setRemoteStream(null);
    setActiveCall(null);
  };

  const acceptCall = async () => {
    if (!activeCall) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: activeCall.type === 'video' 
      });
      setLocalStream(stream);
      setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);

      chatChannelRef.current?.postMessage({
        type: 'CALL_RESPONSE',
        senderId: user.id,
        senderName: user.name,
        payload: { targetId: activeCall.remoteUserId, accepted: true }
      });

      const pc = createPeerConnection(activeCall.remoteUserId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      chatChannelRef.current?.postMessage({
        type: 'CALL_SIGNAL',
        senderId: user.id,
        senderName: user.name,
        payload: { targetId: activeCall.remoteUserId, signal: { sdp: pc.localDescription } }
      });
    } catch (err) {
      console.error('Accept call failed', err);
      endCall();
    }
  };

  // Scheduled Messages & Auto-Delete logic
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      
      const toSend = scheduledMessages.filter(m => m.scheduledFor && m.scheduledFor <= now);
      if (toSend.length > 0) {
        toSend.forEach(m => {
          const finalMsg = { ...m, timestamp: Date.now(), scheduledFor: undefined };
          saveMessages([...messages, finalMsg]);
          chatChannelRef.current?.postMessage({ type: 'MESSAGE', senderId: user.id, senderName: user.name, payload: finalMsg });
        });
        setScheduledMessages(prev => prev.filter(m => !m.scheduledFor || m.scheduledFor > now));
      }

      const nextMessages = messages.filter(m => !m.expiry || m.expiry > now);
      if (nextMessages.length !== messages.length) {
        saveMessages(nextMessages);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [messages, scheduledMessages]);

  useEffect(() => {
    const storedHistory = localStorage.getItem('kothax_history');
    if (storedHistory) setMessages(JSON.parse(storedHistory));

    const storedChannel = localStorage.getItem('kothax_channel');
    if (storedChannel) {
      const parsed = JSON.parse(storedChannel);
      setChannelInfo(parsed);
      setEditName(parsed.name);
      setEditEmoji(parsed.emoji);
      setEditBg(parsed.background);
      setEditKey(parsed.encryptionKey);
      setEditAccent(parsed.accentColor);
    }

    const channel = new BroadcastChannel('kothax_v1');
    chatChannelRef.current = channel;

    channel.onmessage = async (event: MessageEvent<ChatEvent>) => {
      const { type, payload, senderId, senderName } = event.data;
      if (user.blockedUsers.includes(senderId)) return;

      switch (type) {
        case 'MESSAGE':
          if (senderId === user.id) return;
          const msg = { ...payload };
          if (msg.isEncrypted && msg.text && channelInfo.encryptionKey) {
            msg.text = decrypt(msg.text, channelInfo.encryptionKey);
          }
          setMessages(prev => {
            const newList = [...prev, msg];
            localStorage.setItem('kothax_history', JSON.stringify(newList));
            return newList;
          });
          break;

        case 'CALL_REQUEST':
          if (payload.targetId !== user.id) return;
          setActiveCall({ type: payload.type, status: 'incoming', remoteUserId: senderId, remoteUserName: senderName });
          notificationSoundRef.current?.play();
          break;

        case 'CALL_RESPONSE':
          if (payload.targetId !== user.id) return;
          if (payload.accepted) {
            setActiveCall(prev => prev ? { ...prev, status: 'connected' } : null);
          } else {
            endCall();
          }
          break;

        case 'CALL_SIGNAL':
          if (payload.targetId !== user.id) return;
          if (!peerConnectionRef.current) {
            createPeerConnection(senderId);
            if (localStream) {
              localStream.getTracks().forEach(track => peerConnectionRef.current?.addTrack(track, localStream));
            }
          }
          
          if (payload.signal.sdp) {
            await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(payload.signal.sdp));
            if (payload.signal.sdp.type === 'offer') {
              const answer = await peerConnectionRef.current?.createAnswer();
              await peerConnectionRef.current?.setLocalDescription(answer);
              chatChannelRef.current?.postMessage({
                type: 'CALL_SIGNAL',
                senderId: user.id,
                senderName: user.name,
                payload: { targetId: senderId, signal: { sdp: peerConnectionRef.current?.localDescription } }
              });
            }
          } else if (payload.signal.candidate) {
            await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(payload.signal.candidate));
          }
          break;

        case 'CALL_END':
          if (payload.targetId !== user.id) return;
          endCall();
          break;

        case 'CHANNEL_UPDATE':
          setChannelInfo(payload);
          break;
        case 'PIN_TOGGLE':
          setChannelInfo(prev => ({ ...prev, pinnedMessageIds: payload.pinnedIds }));
          break;
        case 'PRESENCE':
          setOnlineUsers(prev => ({ ...prev, [senderId]: { id: senderId, name: senderName, lastSeen: Date.now(), hideStatus: payload.hideOnline, role: payload.role } }));
          break;
      }
    };

    const heartbeat = setInterval(() => {
      channel.postMessage({ type: 'PRESENCE', senderId: user.id, senderName: user.name, payload: { hideOnline: user.privacy.hideOnline, role: user.role } });
    }, 3000);

    return () => {
      clearInterval(heartbeat);
      channel.close();
    };
  }, [user, localStream]);

  const togglePin = (msgId: string) => {
    const isPinned = channelInfo.pinnedMessageIds?.includes(msgId);
    const newPinned = isPinned 
      ? channelInfo.pinnedMessageIds?.filter(id => id !== msgId) 
      : [...(channelInfo.pinnedMessageIds || []), msgId];
    
    setChannelInfo(prev => ({ ...prev, pinnedMessageIds: newPinned }));
    chatChannelRef.current?.postMessage({ type: 'PIN_TOGGLE', senderId: user.id, senderName: user.name, payload: { pinnedIds: newPinned } });
  };

  const toggleStar = (msgId: string) => {
    const updated = messages.map(m => m.id === msgId ? { ...m, isStarred: !m.isStarred } : m);
    saveMessages(updated);
  };

  const filteredMessages = searchQuery.trim() 
    ? messages.filter(m => m.text?.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const starredMessages = messages.filter(m => m.isStarred);
  const pinnedMessagesList = messages.filter(m => channelInfo.pinnedMessageIds?.includes(m.id));

  const accentColorClass = THEME_COLORS.find(c => c.name === channelInfo.accentColor)?.accent || 'bg-indigo-600';

  return (
    <div className="flex h-full w-full overflow-hidden transition-colors duration-500">
      
      <AnimatePresence>
        {activeCall && (
          <CallOverlay 
            type={activeCall.type}
            status={activeCall.status}
            remoteUserName={activeCall.remoteUserName}
            remoteUserId={activeCall.remoteUserId}
            onEnd={endCall}
            onAccept={acceptCall}
            localStream={localStream}
            remoteStream={remoteStream}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSettingsOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden max-h-[85vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  {user.role === 'admin' ? <Crown className="text-amber-400" /> : <Settings2 />} Group Settings
                </h3>
                <button onClick={() => setIsSettingsOpen(false)} className="p-2 text-slate-400 hover:text-white"><X size={24} /></button>
              </div>
              
              <div className="space-y-8">
                {user.role === 'admin' && (
                  <section className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2"><Palette size={14} /> Custom Theme</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Group Name" className="bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-white col-span-2" />
                      <div className="flex gap-2 col-span-2">
                        {THEME_COLORS.map(c => (
                          <button key={c.name} onClick={() => setEditAccent(c.name)} className={`w-10 h-10 rounded-full border-2 ${c.accent} ${editAccent === c.name ? 'border-white' : 'border-transparent'}`} />
                        ))}
                      </div>
                    </div>
                  </section>
                )}

                <section className="space-y-4">
                   <h4 className="text-xs font-black uppercase text-indigo-400 tracking-widest flex items-center gap-2"><Download size={14} /> Chat Export</h4>
                   <button onClick={() => {
                     const blob = new Blob([JSON.stringify(messages)], { type: 'application/json' });
                     const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                     a.download = 'kothax_export.json';
                     a.click();
                   }} className="w-full py-3 bg-slate-800 text-slate-200 font-bold rounded-xl border border-slate-700 hover:bg-slate-700 transition-all">Download Chat History</button>
                </section>

                <section className="space-y-4 pt-6 border-t border-slate-800">
                  <button onClick={() => {
                    const newInfo = { ...channelInfo, name: editName, accentColor: editAccent, encryptionKey: editKey };
                    setChannelInfo(newInfo);
                    localStorage.setItem('kothax_channel', JSON.stringify(newInfo));
                    chatChannelRef.current?.postMessage({ type: 'CHANNEL_UPDATE', senderId: user.id, senderName: user.name, payload: newInfo });
                    setIsSettingsOpen(false);
                  }} className={`w-full py-4 ${accentColorClass} text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-xl`}>
                    <Save size={18} /> Apply Changes
                  </button>
                </section>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex w-80 flex-col border-r border-slate-800 bg-slate-900/40 backdrop-blur-md">
        <div className="p-6 border-b border-slate-800 flex flex-col gap-4">
          <div className="flex bg-slate-800 p-1 rounded-xl">
             <button onClick={() => setActiveTab('members')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'members' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Members</button>
             <button onClick={() => setActiveTab('starred')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'starred' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400'}`}>Starred</button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-950/50 border border-slate-700 rounded-xl text-xs text-white focus:border-indigo-500 outline-none" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === 'members' ? (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white uppercase">{user.name[0]}</div>
                 <div className="flex-1">
                   <p className="text-sm font-bold text-white flex items-center gap-1">{user.name} {user.role === 'admin' && <Crown size={12} className="text-amber-400" />}</p>
                   <p className="text-[10px] text-indigo-400 font-bold uppercase">You</p>
                 </div>
              </div>
              {Object.values(onlineUsers).map(u => (
                <div key={u.id} className="p-3 bg-slate-800/40 rounded-xl flex items-center gap-3 group">
                   <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white uppercase">{u.name[0]}</div>
                   <div className="flex-1">
                     <p className="text-sm font-bold text-white flex items-center gap-1">{u.name} {u.role === 'admin' && <Crown size={12} className="text-amber-400" />}</p>
                     <div className="flex items-center gap-1 text-[10px] text-slate-500 font-bold">
                       <div className="w-1.5 h-1.5 bg-green-500 rounded-full" /> Online
                     </div>
                   </div>
                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => initiateCall(u.id, u.name, 'audio')} className="p-2 text-indigo-400 hover:text-indigo-300"><Phone size={16} /></button>
                      <button onClick={() => initiateCall(u.id, u.name, 'video')} className="p-2 text-indigo-400 hover:text-indigo-300"><Video size={16} /></button>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {starredMessages.length === 0 ? (
                <div className="text-center py-10 opacity-30 flex flex-col items-center gap-2">
                  <Star size={32} />
                  <p className="text-xs font-bold">No starred messages</p>
                </div>
              ) : (
                starredMessages.map(m => (
                  <div key={m.id} className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">{m.senderName}</p>
                    <p className="text-xs text-slate-300 line-clamp-2">{m.text || '[Media]'}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="px-6 py-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-xl overflow-hidden p-1.5">
               <img src="logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="font-bold text-white tracking-tight">{channelInfo.name}</h2>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[10px] text-slate-400 font-black uppercase">
                  <ShieldCheck size={12} className="text-emerald-500" /> E2EE Secure
                </span>
                <span className="w-1 h-1 bg-slate-700 rounded-full" />
                <span className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{Object.keys(onlineUsers).length + 1} Members</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={onToggleTheme} className="p-3 text-slate-400 hover:text-indigo-400 transition-all"><Sun size={20} /></button>
            <button onClick={() => setIsSettingsOpen(true)} className="p-3 text-slate-400 hover:text-indigo-400 transition-all"><Settings2 size={20} /></button>
            <button onClick={onLogout} className="p-3 text-slate-400 hover:text-red-400 transition-all"><LogOut size={20} /></button>
          </div>
        </header>

        {pinnedMessagesList.length > 0 && (
          <div className="bg-indigo-600/10 border-b border-indigo-500/20 px-6 py-2 flex items-center justify-between group">
             <div className="flex items-center gap-3 overflow-hidden">
                <Pin size={14} className="text-indigo-400 shrink-0" />
                <div className="flex-1 truncate">
                   <p className="text-[10px] font-bold text-indigo-400 uppercase leading-none">Pinned Message</p>
                   <p className="text-xs text-slate-300 truncate">{pinnedMessagesList[0].text || 'Media'}</p>
                </div>
             </div>
             <button onClick={() => togglePin(pinnedMessagesList[0].id)} className="p-1 opacity-0 group-hover:opacity-100 transition-all text-slate-500 hover:text-red-400"><X size={14} /></button>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-4 py-6 custom-scrollbar relative" style={activeBg ? { backgroundImage: `url('${activeBg}')` } : {}}>
          <div className="max-w-4xl mx-auto flex flex-col gap-4">
             {filteredMessages.map(m => (
               <MessageBubble 
                 key={m.id} 
                 message={m} 
                 isMe={m.senderId === user.id} 
                 currentUserName={user.name}
                 onPin={() => togglePin(m.id)}
                 onStar={() => toggleStar(m.id)}
                 isPinned={channelInfo.pinnedMessageIds?.includes(m.id)}
               />
             ))}
             <div ref={messagesEndRef} />
          </div>
        </main>

        <ChatInput 
          onSend={(content) => {
             const newMessage = { 
               ...content, 
               id: Math.random().toString(36).substring(2, 11), 
               senderName: user.name, 
               senderId: user.id, 
               timestamp: Date.now(), 
               readBy: [], 
               reactions: {} 
             } as Message;
             
             if (content.scheduledFor) {
               setScheduledMessages([...scheduledMessages, newMessage]);
             } else {
               const newList = [...messages, newMessage];
               saveMessages(newList);
               chatChannelRef.current?.postMessage({ type: 'MESSAGE', senderId: user.id, senderName: user.name, payload: newMessage });
             }
          }} 
          onTyping={is => chatChannelRef.current?.postMessage({ type: 'TYPING', senderId: user.id, senderName: user.name, payload: { isTyping: is } })}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          userSettings={user.settings}
          onUpdateSettings={s => onUpdateUser({...user, settings: {...user.settings, ...s}})}
          aiClient={aiRef.current}
        />
      </div>
    </div>
  );
};

export default ChatScreen;
