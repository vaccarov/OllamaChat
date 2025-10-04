import { MODEL_LCM, MODEL_SDXL } from '@/constants/list';

export type ModelName = typeof MODEL_SDXL | typeof MODEL_LCM;

export interface ImageGenerationFormValues {
  prompt: string;
  negative_prompt: string | undefined;
  model_name: ModelName;
  steps: number;
  num_images_per_prompt: number;
  strength: number | undefined;
  guidance_scale: number;
  denoising: number;
  use_refiner: boolean;
  image: File | undefined;
}

export interface ImageGenerationProgress {
  status: string;
  step?: number;
  total_steps?: number;
  image_number?: number;
  total_images?: number;
  image_data?: string; // Base64 encoded image data
}

export interface DiffusionModel {
  fullname: string;
  name: ModelName;
  loaded: boolean;
}
