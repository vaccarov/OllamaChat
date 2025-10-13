import { RagDocument } from '@/types/document';
import { createContext, Dispatch, SetStateAction } from 'react';

export interface RagContextDefinition {
  selectedRagModel: string | null;
  setSelectedRagModel: Dispatch<SetStateAction<string | null>>;
  ragDocuments: RagDocument[];
  setRagDocuments: Dispatch<SetStateAction<RagDocument[]>>;
  includeAllDocuments: boolean;
  setIncludeAllDocuments: Dispatch<SetStateAction<boolean>>;
}

export const RagContext = createContext<RagContextDefinition | null>(null);
