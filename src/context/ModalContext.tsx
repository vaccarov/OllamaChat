import { ImageGenerationModal } from '@/components/ImageGenerationModal';
import { RagModal } from '@/components/RagModal';
import { SettingsModal } from '@/components/SettingsModal';
import React, { useMemo, useState } from 'react';
import { ModalContext, SettingsContextDefinition } from './ModalContextDefinition';

interface ModalProviderProps {
  children: React.ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }: ModalProviderProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [isRagModalOpen, setIsRagModalOpen] = useState<boolean>(false);

  const contextValue: SettingsContextDefinition = useMemo(
    () => ({
      isSettingsOpen,
      setIsSettingsOpen,
      isGenerateModalOpen,
      setIsGenerateModalOpen,
      isRagModalOpen,
      setIsRagModalOpen,
    }),
    [isSettingsOpen, isGenerateModalOpen, isRagModalOpen]
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <SettingsModal
        opened={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      <ImageGenerationModal
        opened={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      />
      <RagModal
        opened={isRagModalOpen}
        onClose={() => setIsRagModalOpen(false)}
      />
    </ModalContext.Provider>
  );
};
