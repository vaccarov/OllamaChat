import { ModelContext } from '@/context/ModelContextDefinition';
import { useOllama } from '@/hooks/useOllama';
import { ListResponse, ModelResponse, ShowResponse } from 'ollama/browser';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

export const ModelProvider = ({ children }: { children: React.ReactNode }) => {
  const ollama = useOllama();
  const [model, setModel] = useState<string>(() => {
    const savedModel: string | null = localStorage.getItem('selectedModel');
    return savedModel || '';
  });
  const [models, setModels] = useState<(ModelResponse & { show: ShowResponse })[]>([]);

  const refreshModels = useCallback(async (): Promise<void> => {
    try {
      const data: ListResponse = await ollama.list();
      const modelsWithDetails = await Promise.all(
        data.models.map(async (model: ModelResponse) => {
          const show: ShowResponse = await ollama.show({ model: model.model });
          return { ...model, show };
        }),
      );
      setModels(modelsWithDetails.sort((a, b) => a.size - b.size));
    } catch (error) {
      console.error('Error fetching models', error);
    }
  }, [ollama]);

  useEffect(() => {
    localStorage.setItem('selectedModel', model);
  }, [model]);

  useEffect(() => {
    if (!model && models[0]) {
      setModel(models[0].model);
    }
  }, [models, model]);

  useEffect(() => {
    refreshModels();
  }, [refreshModels]);

  const currentModel = useMemo(() => {
    return models.find(m => m.model === model);
  }, [model, models]);

  return (
    <ModelContext.Provider value={{ setModel, models, currentModel, refreshModels }}>
      {children}
    </ModelContext.Provider>
  );
};
