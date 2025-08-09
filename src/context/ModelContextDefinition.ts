import { createContext } from 'react';
import { ModelContextType } from '@/types/ModelContextDefinition';

export const ModelContext = createContext<ModelContextType | undefined>(undefined);