import { MessageContext, MessageContextType } from "@/context/MessageContext";
import { ModelContext, ModelContextType } from "@/context/ModelContext";
import { useOllama } from "@/context/OllamaContext";
import { modelChanged } from "@/utils/constants";
import { Select } from "@mantine/core";
import { ListResponse, ModelResponse } from "ollama/browser";
import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "./LLMPicker.css";

export const LLMPicker: React.FC = (): React.ReactElement => {
  const { t } = useTranslation();
  const ollama = useOllama();
  const { model, setModel }: ModelContextType = useContext(ModelContext)!;
  const { updateModel, addMessage }: MessageContextType = useContext(MessageContext)!;
  const [models, setModels] = useState<ModelResponse[]>([]);
  const hasFetched = useRef<boolean>(false);

  useEffect(() => {
    if (!hasFetched.current) {
      const fetchModels = async (): Promise<void> => {
        try {
          const data: ListResponse = await ollama.list();
          const sortedModels: ModelResponse[] = data.models.sort((a: ModelResponse, b: ModelResponse) => a.size - b.size);
          if (sortedModels.length) {
            setModels(sortedModels);
            if (!model && sortedModels[0]) {
              setModel(sortedModels[0].model);
            }
          }
        } catch (error: any) {
          console.error(t('error_fetching_models'), error);
        }
      };
      fetchModels();
      hasFetched.current = true;
    }
  }, [model, setModel, ollama]);

  const handleModelChange = (selectedModel: string | null): void => {
    if (selectedModel) {
      setModel(selectedModel);
      updateModel(selectedModel);
      addMessage('custom', modelChanged(t, selectedModel));
    }
  };

  return (
    <Select
      placeholder={t('select_model')}
      value={model}
      onChange={handleModelChange}
      data={models.map((m: ModelResponse) => ({
        value: m.model,
        label: `${m.name} (${(m.size / 1e9).toFixed(2)} GB)`,
        description: m.details?.family,
      }))}
      searchable
    />
  );
};
