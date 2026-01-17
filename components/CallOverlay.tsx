
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Video, X, Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, User as UserIcon } from 'lucide-react';

interface CallOverlayProps {
  type: 'audio' | 'video';
  status: 'calling' | 'incoming' | 'connected';
  remoteUserName: string;
  remoteUserId: string;
  onEnd: () => void;
  onAccept: () => void;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
}

const CallOverlay: React.FC<CallOverlayProps> = ({ 
  type, 
  status, 
  remoteUserName, 
  onEnd, 
  onAccept, 
  localStream, 
  remoteStream 
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream && type === 'video') {
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center overflow-hidden"
    >
      <div className="relative w-full h-full max-w-4xl flex flex-col items-center justify-center p-6">
        
        {/* Remote Video Area */}
        <div className="relative w-full h-full max-h-[70vh] bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-800">
          {type === 'video' && remoteStream ? (
            <video 
              ref={remoteVideoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-6">
              <div className="w-32 h-32 rounded-full bg-indigo-600/20 border-4 border-indigo-500/30 flex items-center justify-center relative">
                <UserIcon size={64} className="text-indigo-400" />
                {status === 'calling' && (
                  <motion.div 
                    animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-indigo-500 rounded-full"
                  />
                )}
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-black text-white mb-2">{remoteUserName}</h2>
                <p className="text-indigo-400 font-bold uppercase tracking-widest text-sm">
                  {status === 'calling' ? 'Calling...' : status === 'incoming' ? 'Incoming Call' : 'Connected'}
                </p>
              </div>
            </div>
          )}

          {/* Local Floating Video */}
          {type === 'video' && localStream && (
            <motion.div 
              drag
              dragConstraints={{ left: -200, right: 200, top: -200, bottom: 200 }}
              className="absolute top-6 right-6 w-40 h-56 bg-slate-800 rounded-2xl shadow-2xl border-2 border-slate-700 overflow-hidden"
            >
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover" 
              />
            </motion.div>
          )}
        </div>

        {/* Call Controls */}
        <div className="mt-12 flex items-center gap-6">
          {status === 'incoming' ? (
            <>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onAccept}
                className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20"
              >
                {type === 'video' ? <Video size={28} /> : <Phone size={28} />}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEnd}
                className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/20"
              >
                <PhoneOff size={28} />
              </motion.button>
            </>
          ) : (
            <>
              <button 
                onClick={toggleMute}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              
              {type === 'video' && (
                <button 
                  onClick={toggleVideo}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isVideoOff ? 'bg-red-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  {isVideoOff ? <VideoOff size={24} /> : <VideoIcon size={24} />}
                </button>
              )}

              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onEnd}
                className="w-16 h-16 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-red-500/20"
              >
                <PhoneOff size={28} />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CallOverlay;
