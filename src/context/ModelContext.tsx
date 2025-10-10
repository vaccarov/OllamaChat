'use client';

import { DEBOUNCE_SERVER_URL_MS } from '@/constants/list';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import { ModelContext } from '@/context/ModelContextDefinition';
import usePersistentState from '@/hooks/usePersistentState';
import { checkOllamaServer, listModels } from '@/services/ollama';
import { checkChatServer } from '@/services/transcribe';
import { OllamaModel } from '@/types';
import { ApiStatus } from '@/types/api';
import { ComboboxData } from '@mantine/core';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export const ModelProvider = ({ children }: { children: React.ReactNode }): React.JSX.Element => {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [embeddingModels, setEmbeddingModels] = useState<ComboboxData>([]);
  const [currentModel, setCurrentModel] = useState<OllamaModel | undefined>();
  const [savedModelName, setSavedModelName] = usePersistentState<string | null>(STORAGE_KEYS.selectedModel, null);
  const [ollamaServerUrl, setOllamaServerUrl] = usePersistentState<string>(STORAGE_KEYS.ollamaServerUrl, `${process.env.NEXT_PUBLIC_OLLAMA_URL ?? ''}`);
  const [chatServerUrl, setChatServerUrl] = usePersistentState<string>(STORAGE_KEYS.chatServerUrl, `${process.env.NEXT_PUBLIC_TRANSCRIBE_URL ?? ''}`);
  const [ollamaServerStatus, setOllamaServerStatus] = useState<ApiStatus>(ApiStatus.UNKNOWN);
  const [chatServerStatus, setChatServerStatus] = useState<ApiStatus>(ApiStatus.UNKNOWN);
  const isChatServerOnline: boolean = useMemo(() => chatServerStatus === ApiStatus.VALID, [chatServerStatus]);

  useEffect(() => {
    if (ollamaServerUrl) {
      setOllamaServerStatus(ApiStatus.CHECKING);
      const handler: NodeJS.Timeout = setTimeout(() => {
        checkOllamaServer(ollamaServerUrl).then((result: { success: boolean }) => {
          setOllamaServerStatus(result.success ? ApiStatus.VALID : ApiStatus.INVALID);
        });
      }, DEBOUNCE_SERVER_URL_MS);
      return () => clearTimeout(handler);
    }
  }, [ollamaServerUrl]);

  useEffect(() => {
    if (chatServerUrl) {
      setChatServerStatus(ApiStatus.CHECKING);
      const handler: NodeJS.Timeout = setTimeout(() => {
        checkChatServer(chatServerUrl).then((result: { success: boolean }) => {
          setChatServerStatus(result.success ? ApiStatus.VALID : ApiStatus.INVALID);
        });
      }, DEBOUNCE_SERVER_URL_MS);
      return () => clearTimeout(handler);
    }
  }, [chatServerUrl]);

  const refreshModels = useCallback(async (): Promise<void> => {
    if (!ollamaServerUrl) return;
    const fetchedModels: OllamaModel[] = await listModels(ollamaServerUrl);
    setEmbeddingModels(
      fetchedModels
        .filter((m: OllamaModel) => m.show.capabilities?.includes('embedding'))
        .map((m: OllamaModel) => ({
          value: m.model.replace(/:latest$/, ''),
          label: m.model,
        }))
    );
    setModels(fetchedModels.filter((m: OllamaModel) => !m.show.capabilities?.includes('embedding')));
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
    <ModelContext.Provider
      value={{
        setModel,
        models,
        embeddingModels,
        currentModel,
        refreshModels,
        ollamaServerUrl,
        setOllamaServerUrl,
        chatServerUrl,
        setChatServerUrl,
        ollamaServerStatus,
        chatServerStatus,
        isChatServerOnline,
      }}>
      {children}
    </ModelContext.Provider>
  );
};
