import { createContext, Dispatch, SetStateAction } from 'react';

export interface SettingsContextDefinition {
  isSettingsOpen: boolean;
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
}

export const SettingsContext = createContext<SettingsContextDefinition | null>(null);
