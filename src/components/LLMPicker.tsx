import { ModelContext } from "@/context/ModelContext";
import { useOllama } from "@/context/OllamaContext";
import { Select } from "@mantine/core";
import { ListResponse, ModelResponse } from "ollama/browser";
import React, { useContext, useEffect, useRef, useState } from "react";
import "./LLMPicker.css";

export const LLMPicker: React.FC = (): React.ReactElement => {
  const ollama = useOllama();
  const { model, setModel } = useContext(ModelContext)!;
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
            setModel(sortedModels[0].model);
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des modèles", error);
        }
      };
      fetchModels();
      hasFetched.current = true;
    }
  }, [model, setModel, ollama]);

  return (
    <Select
      placeholder="Choose LLM"
      value={model}
      onChange={(model: string | null) => model && setModel(model)}
      data={models.map((m: ModelResponse) => m.model)}
      searchable
    />
  );
};