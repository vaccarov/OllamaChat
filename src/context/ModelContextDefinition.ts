import { createContext } from 'react';
import { ModelContextDefinition } from '@/types/ModelContextDefinition';

export const ModelContext = createContext<ModelContextDefinition | undefined>(undefined);
