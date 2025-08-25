'use client';

import { listModels } from '@/app/actions';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { ModelContext } from '@/context/ModelContextDefinition';
import { OllamaModel } from '@/types';
import React, { useCallback, useEffect, useState } from 'react';

export const ModelProvider = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [currentModel, setCurrentModel] = useState<OllamaModel | undefined>();

  const refreshModels = useCallback(async (): Promise<void> => {
    const fetchedModels: OllamaModel[] = await listModels();
    setModels(fetchedModels);
  }, []);

  useEffect(() => {
    refreshModels();
  }, [refreshModels]);

  useEffect(() => {
    if (models.length > 0) {
      const savedModelName: string | null = localStorage.getItem(STORAGE_KEYS.selectedModel);
      const savedModel: OllamaModel | undefined = models.find((m: OllamaModel) => m.model === savedModelName);
      setCurrentModel(savedModel || models[0]);
    }
  }, [models]);

  const setModel = (model: string): void => {
    const selectedModel: OllamaModel | undefined = models.find((m: OllamaModel) => m.model === model);
    if (selectedModel) {
      setCurrentModel(selectedModel);
      localStorage.setItem(STORAGE_KEYS.selectedModel, selectedModel.model);
    }
  };

  return (
    <ModelContext.Provider value={{ setModel, models, currentModel, refreshModels }}>
      {children}
    </ModelContext.Provider>
  );
};
