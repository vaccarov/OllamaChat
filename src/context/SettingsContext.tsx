import { SettingsModal } from '@/components/SettingsModal';
import React, { useMemo, useState } from 'react';
import { SettingsContext, SettingsContextDefinition } from './SettingsContextDefinition';

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }: SettingsProviderProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  const contextValue: SettingsContextDefinition = useMemo(
    () => ({
      isSettingsOpen,
      setIsSettingsOpen,
    }),
    [isSettingsOpen]
  );

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
      <SettingsModal
        opened={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </SettingsContext.Provider>
  );
};
