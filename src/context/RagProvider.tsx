import type React from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { listDocuments } from '@/services/document';
import type { RagDocument } from '@/types/document';
import { MessageContext } from './MessageContextDefinition';
import { ModelContext } from './ModelContextDefinition';
import { RagContext, type RagContextDefinition } from './RagContextDefinition';

interface RagProviderProps {
  children: React.ReactNode;
}

export const RagProvider: React.FC<RagProviderProps> = ({ children }) => {
  const [selectedRagModel, setSelectedRagModel] = useState<string | null>(null);
  const [ragDocuments, setRagDocuments] = useState<RagDocument[]>([]);
  const [includeAllDocuments, setIncludeAllDocuments] = useState<boolean>(false);
  const modelContext = useContext(ModelContext);
  const messageContext = useContext(MessageContext);

  useEffect(() => {
    const chatId: string | undefined = includeAllDocuments
      ? undefined
      : messageContext?.activeSession?.id;
    if (modelContext?.chatServerUrl && selectedRagModel) {
      listDocuments(modelContext.chatServerUrl, selectedRagModel, chatId)
        .then(setRagDocuments)
        .catch(() => setRagDocuments([]));
    } else {
      setRagDocuments([]);
    }
  }, [
    modelContext?.chatServerUrl,
    selectedRagModel,
    messageContext?.activeSession?.id,
    includeAllDocuments,
  ]);

  const contextValue: RagContextDefinition = useMemo(
    () => ({
      selectedRagModel,
      setSelectedRagModel,
      ragDocuments,
      setRagDocuments,
      includeAllDocuments,
      setIncludeAllDocuments,
    }),
    [selectedRagModel, ragDocuments, includeAllDocuments]
  );

  return <RagContext.Provider value={contextValue}>{children}</RagContext.Provider>;
};
