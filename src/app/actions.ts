'use server';

import { ollama } from '@/lib/ollama';
import { OllamaModel } from '@/types';
import { ListResponse, ModelResponse, ShowResponse } from 'ollama';

export async function listModels(): Promise<OllamaModel[]> {
  try {
    const basicModels: ListResponse = await ollama.list();
    const detailedModels: OllamaModel[] = await Promise.all(
      basicModels.models.map(async (model: ModelResponse): Promise<OllamaModel> => {
        const show: ShowResponse = await ollama.show({ model: model.model });
        return {
          ...model,
          show
        };
      })
    );

    return detailedModels.sort((a: OllamaModel, b: OllamaModel) => a.size - b.size);
  } catch (error) {
    console.error('Error listing models:', error);
    return [];
  }
}