import { ChatRole } from '@/types/ChatRoleDefinition';
import { ImageToSend } from '@/types/ImageToSend';

export interface Message {
  role: string;
  content: string;
  images?: string[];
  thinking?: string;
}

export interface ChatText {
  role: ChatRole;
  content: string;
  thinking?: string;
  date: string;
  image?: ImageToSend;
}
