import { listDocuments } from '@/services/document';
import { MessageContextType } from '@/types';
import { RagDocument } from '@/types/document';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { MessageContext } from './MessageContextDefinition';
import { ModelContext } from './ModelContextDefinition';
import { RagContext, RagContextDefinition } from './RagContextDefinition';

interface RagProviderProps {
  children: React.ReactNode;
}

export const RagProvider: React.FC<RagProviderProps> = ({ children }) => {
  const [selectedRagModel, setSelectedRagModel] = useState<string | null>(null);
  const [ragDocuments, setRagDocuments] = useState<RagDocument[]>([]);
  const [includeAllDocuments, setIncludeAllDocuments] = useState<boolean>(false);
  const { chatServerUrl } = useContext(ModelContext)!;
  const { activeSession }: MessageContextType = useContext(MessageContext)!;

  useEffect(() => {
    if (selectedRagModel) {
      const chatId: string | undefined = includeAllDocuments ? undefined : activeSession?.id;
      listDocuments(chatServerUrl, selectedRagModel, chatId)
        .then(setRagDocuments)
        .catch((_) => setRagDocuments([]));
    } else {
      setRagDocuments([]);
    }
  }, [chatServerUrl, selectedRagModel, activeSession?.id, includeAllDocuments]);

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
