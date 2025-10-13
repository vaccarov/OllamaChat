import { createContext, Dispatch, SetStateAction } from 'react';

export interface SettingsContextDefinition {
  isSettingsOpen: boolean;
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
  isGenerateModalOpen: boolean;
  setIsGenerateModalOpen: Dispatch<SetStateAction<boolean>>;
  isRagModalOpen: boolean;
  setIsRagModalOpen: Dispatch<SetStateAction<boolean>>;
}

export const ModalContext = createContext<SettingsContextDefinition | null>(null);
