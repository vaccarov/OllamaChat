import { MessageContext, MessageContextType } from "@/context/MessageContext";
import { ModelContext, ModelContextType } from "@/context/ModelContext";
import { useOllama } from "@/context/OllamaContext";
import { modelChanged } from "@/utils/constants";
import { Select } from "@mantine/core";
import { ListResponse, ModelResponse } from "ollama/browser";
import React, { useContext, useEffect, useRef, useState } from "react";
import "./LLMPicker.css";

export const LLMPicker: React.FC = (): React.ReactElement => {
  console.log('OOO LLMPicker');
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
            if (!model) {
              setModel(sortedModels[0].model);
            }
          }
        } catch (error: any) {
          console.error("Erreur lors de la récupération des modèles", error);
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
      addMessage('custom', modelChanged(selectedModel));
    }
  };

  return (
    <Select
      placeholder="Choose LLM"
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