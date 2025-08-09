import { createContext } from 'react';
import { MessageContextType } from '@/types/MessageContextDefinition';

export const MessageContext = createContext<MessageContextType | undefined>(undefined);
