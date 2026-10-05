'use client';

import {
  ActionIcon,
  Alert,
  Button,
  Collapse,
  type ComboboxData,
  FileInput,
  Group,
  Loader,
  Modal,
  NumberInput,
  Select,
  Slider,
  Switch,
  Text,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  type ChangeEvent,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Download, HelpCircle, Image as ImageIcon, Upload } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { ControlledTextarea } from '@/components/ControlledTextarea';
import { GeneratedImagesDisplay } from '@/components/GeneratedImagesDisplay';
import { MAX_PROMPT_TOKENS, MODEL_LCM, MODEL_SDXL } from '@/constants/list';
import { imageNegativePromptPresets, imagePromptPresets } from '@/constants/prompts';
import { ModelContext } from '@/context/ModelContextDefinition';
import { generateImage, getImageModels } from '@/services/image';
import type { PromptItem } from '@/types';
import {
  type DiffusionModel,
  type ImageGenerationFormValues,
  type ImageGenerationProgress,
  ImageGenerationStatus,
} from '@/types/image-generation';
import { downloadFile } from '@/utils/tools';
import './ImageGenerationModal.css';

const HelpTooltip = ({ label }: { label: string }) => (
  <Tooltip
    label={label}
    multiline
    withArrow>
    <ActionIcon variant='transparent'>
      <HelpCircle />
    </ActionIcon>
  </Tooltip>
);

const Field = ({ label, tooltip }: { label: string; tooltip: string }) => (
  <Text className='label'>
    {label}
    <HelpTooltip label={tooltip} />
  </Text>
);

export const ImageGenerationModal = ({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [models, setModels] = useState<ComboboxData>([]);
  const [modelsLoading, setModelsLoading] = useState<boolean>(false);
  const modelContext = useContext(ModelContext);

  const importFileInputRef: RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);
  const viewportRef: React.RefObject<HTMLDivElement | null> = useRef<HTMLDivElement>(null);

  const form = useForm<ImageGenerationFormValues>({
    initialValues: {
      prompt: '',
      negative_prompt: '',
      model_name: MODEL_LCM,
      steps: 8,
      num_images_per_prompt: 1,
      guidance_scale: 9,
      denoising: 0.9,
      use_refiner: false,
      strength: undefined,
      image: undefined,
    },
    validate: {
      prompt: (value: string) => {
        const wordCount: number = value.trim().split(/\s+/).filter(Boolean).length;
        return wordCount > MAX_PROMPT_TOKENS
          ? `Prompt exceeds ${MAX_PROMPT_TOKENS} tokens (current: ${wordCount}).`
          : null;
      },
    },
    onValuesChange: (values: ImageGenerationFormValues) => {
      if (values.model_name === MODEL_LCM && values.use_refiner) {
        form.setFieldValue('use_refiner', false);
      }
      if (values.image) {
        if (values.num_images_per_prompt !== 1) {
          form.setFieldValue('num_images_per_prompt', 1);
        }
        if (!values.strength) {
          form.setFieldValue('strength', 0.5);
        }
      } else if (values.strength) {
        form.setFieldValue('strength', undefined);
      }
    },
  });

  useEffect(() => {
    if (!opened || !modelContext?.serverUrl) return;
    setModelsLoading(true);
    getImageModels(modelContext.serverUrl)
      .then((fetched: DiffusionModel[]) =>
        setModels(fetched.map((m) => ({ value: m.name, label: m.fullname })))
      )
      .finally(() => setModelsLoading(false));
  }, [opened, modelContext?.serverUrl]);

  useEffect(() => {
    if (generatedImages.length > 0) {
      const viewport: HTMLDivElement | null = viewportRef.current;
      if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
      }
    }
  }, [generatedImages]);

  const handleExportConfig: () => void = useCallback(() => {
    const { image, ...configToExport }: ImageGenerationFormValues = form.values;
    const blob: Blob = new Blob([JSON.stringify(configToExport, null, 2)], {
      type: 'application/json',
    });
    downloadFile('image_gen_config.json', URL.createObjectURL(blob));
  }, [form.values]);

  const handleImportConfigChange: (event: ChangeEvent<HTMLInputElement>) => void = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file: File | undefined = event.target.files?.[0];
      if (!file) return;
      try {
        const importedConfig: Partial<ImageGenerationFormValues> = JSON.parse(await file.text());
        form.setValues({ ...form.values, ...importedConfig });
      } catch (_err: unknown) {
        setError(t('image_generation.parse_config_error'));
      }
    },
    [form, t]
  );

  const handleGenerate: (values: ImageGenerationFormValues) => Promise<void> = useCallback(
    async (values: ImageGenerationFormValues): Promise<void> => {
      if (!form.isValid() || !modelContext?.serverUrl) return;
      setLoading(true);
      setProgress(t('image_generation.starting_generation'));
      setError(null);

      const { image, ...params } = values;
      const formData: FormData = new FormData();
      const fields: Record<string, string | number | boolean | undefined> = {
        ...params,
        // Image-to-image is always a single image, and strength only applies to it.
        num_images_per_prompt: image ? 1 : values.num_images_per_prompt,
        use_refiner: values.model_name === MODEL_SDXL && values.use_refiner,
      };
      for (const [key, value] of Object.entries(fields)) {
        if (value !== undefined && value !== null && value !== '' && value !== false) {
          formData.append(key, String(value));
        }
      }
      if (image) formData.append('image', image);

      try {
        generateImage(modelContext.serverUrl, formData, {
          onProgress: (progressData: ImageGenerationProgress) => {
            const status: string = progressData.status;
            if (status === ImageGenerationStatus.PROGRESS) {
              setProgress(
                t('image_generation.step_progress', {
                  step: progressData.step,
                  total_steps: progressData.total_steps,
                })
              );
            } else if (status === ImageGenerationStatus.STARTING_IMAGE) {
              setProgress(
                t('image_generation.generating_image', {
                  image_number: progressData.image_number,
                  total_images: progressData.total_images,
                })
              );
            } else if (status) {
              const capitalizedStatus: string = status
                .replace(/_/g, ' ')
                .replace(/\b\w/g, (l: string) => l.toUpperCase());
              setProgress(`${capitalizedStatus}...`);
            }
          },
          onSuccess: (imageData: string) => {
            setGeneratedImages((prev: string[]) => [...prev, imageData]);
            setLoading(false);
            setProgress(null);
          },
          onError: (err: Error) => {
            setError(err.message);
            setLoading(false);
            setProgress(null);
          },
          onComplete: () => {},
        });
      } catch (err: unknown) {
        setError((err as Error).message);
      }
    },
    [form, t, modelContext?.serverUrl]
  );

  if (!modelContext) return null;

  return (
    <Modal.Root
      opened={opened}
      onClose={onClose}
      size='xl'>
      <Modal.Overlay />
      <Modal.Content ref={viewportRef}>
        <Modal.Header>
          <Modal.Title>{t('image_generation.title')}</Modal.Title>
          <Modal.CloseButton />
        </Modal.Header>
        <Modal.Body className='spaceVertical'>
          <form
            onSubmit={form.onSubmit(handleGenerate)}
            className='spaceVertical'>
            <ControlledTextarea
              required
              presets={imagePromptPresets}
              presetLabel={t('image_generation.presets')}
              onPresetSelect={(preset: PromptItem) => form.setFieldValue('prompt', preset.prompt)}
              tooltip={t('image_generation.prompt_tooltip')}
              placeholder={t('image_generation.prompt_placeholder')}
              {...form.getInputProps('prompt')}
            />
            <Collapse
              in={showOptions}
              className='spaceVertical'>
              <ControlledTextarea
                presets={imageNegativePromptPresets}
                presetLabel={t('image_generation.presets')}
                onPresetSelect={(preset: PromptItem) =>
                  form.setFieldValue('negative_prompt', preset.prompt)
                }
                tooltip={t('image_generation.negative_prompt_tooltip')}
                placeholder={t('image_generation.negative_prompt_placeholder')}
                {...form.getInputProps('negative_prompt')}
              />
              <div className='formLine'>
                <Select
                  className='takeSpace'
                  placeholder={t('image_generation.model_placeholder')}
                  data={models}
                  disabled={modelsLoading}
                  rightSection={modelsLoading && <Loader size='xs' />}
                  required
                  {...form.getInputProps('model_name')}
                />
                <Switch
                  label={t('image_generation.use_refiner')}
                  disabled={form.values.model_name === MODEL_LCM}
                  {...form.getInputProps('use_refiner', { type: 'checkbox' })}
                />
                <HelpTooltip label={t('image_generation.model_tooltip')} />
              </div>
              <div className='formLine'>
                <div className='item'>
                  <Field
                    label={t('image_generation.steps')}
                    tooltip={t('image_generation.steps_tooltip')}
                  />
                  <NumberInput
                    min={1}
                    max={100}
                    required
                    {...form.getInputProps('steps')}
                  />
                </div>
                <div className='item'>
                  <Field
                    label={t('image_generation.images')}
                    tooltip={t('image_generation.images_tooltip')}
                  />
                  <NumberInput
                    min={1}
                    max={4}
                    {...form.getInputProps('num_images_per_prompt')}
                    disabled={!!form.values.image}
                  />
                </div>
              </div>
              <FileInput
                clearable
                placeholder={t('image_generation.set_image_placeholder')}
                leftSection={<ImageIcon />}
                rightSection={<HelpTooltip label={t('image_generation.set_image_tooltip')} />}
                {...form.getInputProps('image')}
                onChange={(file: File | null) => file && form.setFieldValue('image', file)}
              />
              <Field
                label={t('image_generation.guidance_scale')}
                tooltip={t('image_generation.guidance_scale_tooltip')}
              />
              <Slider
                labelAlwaysOn
                min={0}
                max={20}
                step={0.01}
                {...form.getInputProps('guidance_scale')}
              />
              <Field
                label={t('image_generation.denoising')}
                tooltip={t('image_generation.denoising_tooltip')}
              />
              <Slider
                labelAlwaysOn
                min={0}
                max={1}
                step={0.01}
                {...form.getInputProps('denoising')}
              />
              {form.values.image && (
                <>
                  <Field
                    label={t('image_generation.strength')}
                    tooltip={t('image_generation.strength_tooltip')}
                  />
                  <Slider
                    labelAlwaysOn
                    min={0}
                    max={1}
                    step={0.01}
                    {...form.getInputProps('strength')}
                  />
                </>
              )}
              <Group gap='xs'>
                <Button
                  leftSection={<Download />}
                  variant='default'
                  onClick={handleExportConfig}>
                  {t('image_generation.export_config')}
                </Button>
                <Button
                  leftSection={<Upload />}
                  variant='default'
                  onClick={() => importFileInputRef.current?.click()}>
                  {t('image_generation.import_config')}
                </Button>
                <input
                  ref={importFileInputRef}
                  type='file'
                  accept='application/json'
                  style={{ display: 'none' }}
                  onChange={handleImportConfigChange}
                />
              </Group>
            </Collapse>
            <Group justify='space-between'>
              <Button onClick={() => setShowOptions(!showOptions)}>
                {showOptions
                  ? t('image_generation.show_less_options')
                  : t('image_generation.show_more_options')}
              </Button>
              <Button
                type='submit'
                leftSection={loading && <Loader size='sm' />}
                disabled={!!progress}>
                {progress || t('image_generation.generate')}
              </Button>
            </Group>
          </form>
          {error && (
            <Alert
              title={error}
              color='red'></Alert>
          )}
          <GeneratedImagesDisplay images={generatedImages} />
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};
