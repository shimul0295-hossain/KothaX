
export interface Message {
  id: string;
  senderName: string;
  senderId: string;
  type: 'text' | 'audio' | 'image' | 'file' | 'sticker' | 'gif';
  text?: string;
  translation?: string;
  transcription?: string;
  audio?: string;
  audioDuration?: number;
  imageUrl?: string;
  fileData?: {
    name: string;
    size: number;
    mimeType: string;
    data: string; // base64
  };
  stickerUrl?: string;
  gifUrl?: string;
  timestamp: number;
  expiry?: number;
  scheduledFor?: number; // timestamp for future sending
  isEdited?: boolean;
  isDeleted?: boolean;
  isPinned?: boolean;
  isStarred?: boolean;
  replyTo?: {
    id: string;
    senderName: string;
    text?: string;
    type: string;
  };
  reactions?: Record<string, string[]>;
  readBy?: string[];
  isEncrypted?: boolean;
}

export interface User {
  name: string;
  id: string;
  role: 'admin' | 'member';
  privacy: {
    hideOnline: boolean;
    hideLastSeen: boolean;
  };
  settings: {
    targetLanguage: string;
    autoTranslate: boolean;
    profanityFilter: boolean;
    defaultExpiry: number;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
  };
  blockedUsers: string[];
}

export interface ChannelInfo {
  name: string;
  emoji: string;
  background?: string;
  encryptionKey?: string;
  accentColor?: string;
  bubbleColor?: string;
  pinnedMessageIds?: string[];
}

export type ChatEventType = 
  | 'MESSAGE' 
  | 'TYPING' 
  | 'PRESENCE' 
  | 'CLEAR' 
  | 'REACTION' 
  | 'READ' 
  | 'CHANNEL_UPDATE' 
  | 'MESSAGE_EDIT' 
  | 'MESSAGE_DELETE' 
  | 'SCREENSHOT' 
  | 'SUMMARIZE' 
  | 'PIN_TOGGLE'
  | 'CALL_REQUEST'
  | 'CALL_RESPONSE'
  | 'CALL_SIGNAL'
  | 'CALL_END';

export interface ChatEvent {
  type: ChatEventType;
  payload: any;
  senderId: string;
  senderName: string;
}
