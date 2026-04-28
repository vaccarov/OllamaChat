import { createContext } from 'react';
import type { ModelContextDefinition } from '@/types/ModelContextDefinition';

export const ModelContext = createContext<ModelContextDefinition | undefined>(undefined);
