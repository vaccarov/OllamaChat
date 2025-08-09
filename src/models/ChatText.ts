import { Message } from 'ollama';
import { ChatRole } from './ChatRoleDefinition'; // Import ChatRole
import { ImageToSend } from './ImageToSend';

export type ChatText = Message & {
  date?: string;
  role: ChatRole;
  image?: ImageToSend;
};