import React, { createContext, useContext, useState } from 'react';
import { MessageContext } from './MessageContext';
import { modelChanged } from '@/utils/constants';

export type ModelContextType = {
  model: string;
  setModel: (newModel: string) => void;
};

export const ModelContext = createContext<ModelContextType | undefined>(undefined);

export const ModelProvider = ({ children }: { children: React.ReactNode }) => {
  const [model, setModelState] = useState<string>('');
  const { addMessage } = useContext(MessageContext)!;

  const setModel = (newModel: string): void => {
    setModelState(newModel);
    if (newModel) {
      addMessage('custom', modelChanged(newModel));
    }
  };

  return (
    <ModelContext.Provider value={{ model, setModel }}>
      {children}
    </ModelContext.Provider>
  );
};
