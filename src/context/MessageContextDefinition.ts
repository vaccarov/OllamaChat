import { createContext } from 'react';
import type { MessageContextType } from '@/types/MessageContextDefinition';

export const MessageContext = createContext<MessageContextType | undefined>(undefined);
