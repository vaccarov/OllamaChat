import { ChatRole } from '@/types/ChatRoleDefinition';
import { ImageToSend } from '@/types/ImageToSend';
import { Message } from 'ollama';

export type ChatText = Message & {
  date?: string;
  role: ChatRole;
  image?: ImageToSend;
};