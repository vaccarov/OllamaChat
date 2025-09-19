'use client';

import { STORAGE_KEYS } from '@/constants/storageKeys';
import { ModelContext } from '@/context/ModelContextDefinition';
import usePersistentState from '@/hooks/usePersistentState';
import { listModels } from '@/services/api';
import { OllamaModel } from '@/types';
import React, { useCallback, useEffect, useState } from 'react';

export const ModelProvider = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [currentModel, setCurrentModel] = useState<OllamaModel | undefined>();
  const [ollamaServerUrl, setOllamaServerUrl] = usePersistentState<string>(
    STORAGE_KEYS.ollamaServerUrl,
    `${process.env.NEXT_PUBLIC_OLLAMA_URL ?? ''}`
  );
  const [transcribeServerUrl, setTranscribeServerUrl] = usePersistentState<string>(
    STORAGE_KEYS.transcribeServerUrl,
    `${process.env.NEXT_PUBLIC_TRANSCRIBE_URL ?? ''}`
  );
  const [savedModelName, setSavedModelName] = usePersistentState<string | null>(STORAGE_KEYS.selectedModel, null);

  const refreshModels = useCallback(async (): Promise<void> => {
    if (!ollamaServerUrl) return;
    const fetchedModels: OllamaModel[] = await listModels(ollamaServerUrl);
    setModels(fetchedModels);
  }, [ollamaServerUrl]);

  useEffect(() => {
    refreshModels();
  }, [refreshModels]);

  useEffect(() => {
    if (models.length > 0) {
      const savedModel: OllamaModel | undefined = models.find((m: OllamaModel) => m.model === savedModelName);
      setCurrentModel(savedModel || models[0]);
    }
  }, [models, savedModelName]);

  const setModel = (model: string): void => {
    const selectedModel: OllamaModel | undefined = models.find((m: OllamaModel) => m.model === model);
    if (selectedModel) {
      setCurrentModel(selectedModel);
      setSavedModelName(selectedModel.model);
    }
  };

  return (
    <ModelContext.Provider value={{ setModel, models, currentModel, refreshModels, ollamaServerUrl, setOllamaServerUrl, transcribeServerUrl, setTranscribeServerUrl }}>
      {children}
    </ModelContext.Provider>
  );
};
