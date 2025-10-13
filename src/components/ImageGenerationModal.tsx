'use client';

import { GeneratedImagesDisplay } from '@/components/GeneratedImagesDisplay';
import { IMAGE_GEN_STATUS_PROGRESS, IMAGE_GEN_STATUS_STARTING_IMAGE, MAX_PROMPT_TOKENS, MODEL_LCM, MODEL_SDXL } from '@/constants/list';
import { imageNegativePromptPresets, imagePromptPresets } from '@/constants/prompts';
import { ModelContext } from '@/context/ModelContextDefinition';
import { PromptListSVG } from '@/lib/icons';
import { generateImage, getImageModels } from '@/services/image';
import { PromptItem } from '@/types';
import { DiffusionModel, ImageGenerationFormValues, ImageGenerationProgress } from '@/types/image-generation';
import {
  ActionIcon,
  Alert,
  Button,
  Collapse,
  ComboboxData,
  FileInput,
  Group,
  Loader,
  Menu,
  Modal,
  NumberInput,
  Select,
  Slider,
  Switch,
  Text,
  TextInput,
  Textarea,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { ChangeEvent, RefObject, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Download, HelpCircle, Image as ImageIcon, Upload } from 'react-feather';
import { useTranslation } from 'react-i18next';
import './ImageGenerationModal.css';

export const ImageGenerationModal = ({ opened, onClose }: { opened: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [models, setModels] = useState<ComboboxData>([]);
  const [modelsLoading, setModelsLoading] = useState<boolean>(false);
  const { chatServerUrl } = useContext(ModelContext)!;
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
        return wordCount > MAX_PROMPT_TOKENS ? `Prompt exceeds ${MAX_PROMPT_TOKENS} tokens (current: ${wordCount}).` : null;
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

  const handlePromptSelect = (value: string) => {
    const selectedPrompt: PromptItem | undefined = imagePromptPresets.find((p: PromptItem) => p.id === value);
    if (selectedPrompt) {
      form.setFieldValue('prompt', selectedPrompt.prompt);
    }
  };

  const handleNegativePromptSelect = (value: string) => {
    const selectedPrompt: PromptItem | undefined = imageNegativePromptPresets.find((p: PromptItem) => p.id === value);
    if (selectedPrompt) {
      form.setFieldValue('negative_prompt', selectedPrompt.prompt);
    }
  };

  useEffect(() => {
    if (opened) {
      const fetchModels = async () => {
        setModelsLoading(true);
        const fetchedModels: ComboboxData = (await getImageModels(chatServerUrl)).map((m: DiffusionModel) => ({
          value: m.name,
          label: m.fullname,
        }));
        setModels(fetchedModels);
        setModelsLoading(false);
      };
      fetchModels();
    }
  }, [opened, chatServerUrl]);

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
    const json: string = JSON.stringify(configToExport, null, 2);
    const blob: Blob = new Blob([json], { type: 'application/json' });
    const url: string = URL.createObjectURL(blob);
    const a: HTMLAnchorElement = document.createElement('a');
    a.href = url;
    a.download = 'image_gen_config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [form.values]);

  const handleImportConfigChange: (event: ChangeEvent<HTMLInputElement>) => void = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file: File | undefined = event.target.files?.[0];
      if (file) {
        const reader: FileReader = new FileReader();
        reader.onload = (e: ProgressEvent<FileReader>) => {
          try {
            const importedConfig: Partial<ImageGenerationFormValues> = JSON.parse(e.target?.result as string);
            form.setValues({ ...form.values, ...importedConfig });
          } catch (_err: unknown) {
            setError(t('image_generation.parse_config_error'));
          }
        };
        reader.readAsText(file);
      }
    },
    [form, t]
  );

  const handleGenerate: (values: ImageGenerationFormValues) => Promise<void> = useCallback(
    async (values: ImageGenerationFormValues): Promise<void> => {
      if (!form.isValid()) return;
      setLoading(true);
      setProgress(t('image_generation.starting_generation'));
      setError(null);

      const formData: FormData = new FormData();
      formData.append('prompt', values.prompt);
      formData.append('model_name', values.model_name);
      formData.append('steps', String(values.steps));

      if (values.image) {
        formData.append('num_images_per_prompt', '1');
      } else {
        formData.append('num_images_per_prompt', String(values.num_images_per_prompt));
      }

      if (values.negative_prompt) {
        formData.append('negative_prompt', values.negative_prompt);
      }

      if (!!values.image && values.strength !== null) {
        formData.append('strength', String(values.strength));
      }

      if (values.guidance_scale !== null) {
        formData.append('guidance_scale', String(values.guidance_scale));
      }
      if (values.denoising !== null) {
        formData.append('denoising', String(values.denoising));
      }

      if (values.model_name === MODEL_SDXL && values.use_refiner) {
        formData.append('use_refiner', 'true');
      }

      if (values.image) {
        formData.append('image', values.image);
      }

      try {
        generateImage(chatServerUrl, formData, {
          onProgress: (progressData: ImageGenerationProgress) => {
            const status: string = progressData.status;
            if (status === IMAGE_GEN_STATUS_PROGRESS) {
              setProgress(
                t('image_generation.step_progress', {
                  step: progressData.step,
                  total_steps: progressData.total_steps,
                })
              );
            } else if (status === IMAGE_GEN_STATUS_STARTING_IMAGE) {
              setProgress(
                t('image_generation.generating_image', {
                  image_number: progressData.image_number,
                  total_images: progressData.total_images,
                })
              );
            } else if (status) {
              const capitalizedStatus: string = status.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
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
    [form, t, chatServerUrl]
  );

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
            <Textarea
              required
              leftSectionWidth={52}
              leftSection={
                <Menu width={200}>
                  <Menu.Target>
                    <ActionIcon>
                      <PromptListSVG />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Label>{t('image_generation.presets', 'Presets')}</Menu.Label>
                    {imagePromptPresets.map((p: PromptItem) => (
                      <Menu.Item
                        key={p.id}
                        onClick={() => handlePromptSelect(p.id)}>
                        {p.name}
                      </Menu.Item>
                    ))}
                  </Menu.Dropdown>
                </Menu>
              }
              rightSection={
                <Tooltip
                  label={t('image_generation.prompt_tooltip')}
                  multiline
                  withArrow>
                  <ActionIcon variant='transparent'>
                    <HelpCircle />
                  </ActionIcon>
                </Tooltip>
              }
              placeholder={t('image_generation.prompt_placeholder')}
              {...form.getInputProps('prompt')}
              autosize
            />
            <Collapse
              in={showOptions}
              className='spaceVertical'>
              <TextInput
                placeholder={t('image_generation.negative_prompt_placeholder')}
                leftSectionWidth={52}
                leftSection={
                  <Menu width={200}>
                    <Menu.Target>
                      <ActionIcon>
                        <PromptListSVG />
                      </ActionIcon>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Label>{t('image_generation.presets')}</Menu.Label>
                      {imageNegativePromptPresets.map((p: PromptItem) => (
                        <Menu.Item
                          key={p.id}
                          onClick={() => handleNegativePromptSelect(p.id)}>
                          {p.name}
                        </Menu.Item>
                      ))}
                    </Menu.Dropdown>
                  </Menu>
                }
                rightSection={
                  <Tooltip
                    label={t('image_generation.negative_prompt_tooltip')}
                    multiline
                    withArrow>
                    <ActionIcon variant='transparent'>
                      <HelpCircle />
                    </ActionIcon>
                  </Tooltip>
                }
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
                <Tooltip
                  label={t('image_generation.model_tooltip')}
                  multiline
                  withArrow>
                  <ActionIcon variant='transparent'>
                    <HelpCircle />
                  </ActionIcon>
                </Tooltip>
              </div>
              <div className='formLine'>
                <div className='item'>
                  <Text className='label'>
                    {t('image_generation.steps')}
                    <Tooltip
                      label={t('image_generation.steps_tooltip')}
                      multiline
                      withArrow>
                      <ActionIcon variant='transparent'>
                        <HelpCircle />
                      </ActionIcon>
                    </Tooltip>
                  </Text>
                  <NumberInput
                    min={1}
                    max={100}
                    required
                    {...form.getInputProps('steps')}
                  />
                </div>
                <div className='item'>
                  <Text className='label'>
                    {t('image_generation.images')}
                    <Tooltip
                      label={t('image_generation.images_tooltip')}
                      multiline
                      withArrow>
                      <ActionIcon variant='transparent'>
                        <HelpCircle />
                      </ActionIcon>
                    </Tooltip>
                  </Text>
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
                rightSection={
                  <Tooltip
                    label={t('image_generation.set_image_tooltip')}
                    multiline
                    withArrow>
                    <ActionIcon variant='transparent'>
                      <HelpCircle />
                    </ActionIcon>
                  </Tooltip>
                }
                {...form.getInputProps('image')}
                onChange={(file: File | null) => file && form.setFieldValue('image', file)}
              />
              <Text className='label'>
                {t('image_generation.guidance_scale')}
                <Tooltip
                  label={t('image_generation.guidance_scale_tooltip')}
                  multiline
                  withArrow>
                  <ActionIcon variant='transparent'>
                    <HelpCircle />
                  </ActionIcon>
                </Tooltip>
              </Text>
              <Slider
                labelAlwaysOn
                min={0}
                max={20}
                step={0.01}
                {...form.getInputProps('guidance_scale')}
              />
              <Text className='label'>
                {t('image_generation.denoising')}
                <Tooltip
                  label={t('image_generation.denoising_tooltip')}
                  multiline
                  withArrow>
                  <ActionIcon variant='transparent'>
                    <HelpCircle />
                  </ActionIcon>
                </Tooltip>
              </Text>
              <Slider
                labelAlwaysOn
                min={0}
                max={1}
                step={0.01}
                {...form.getInputProps('denoising')}
              />
              {form.values.image && (
                <>
                  <Text className='label'>
                    {t('image_generation.strength')}
                    <Tooltip
                      label={t('image_generation.strength_tooltip')}
                      multiline
                      withArrow>
                      <ActionIcon variant='transparent'>
                        <HelpCircle />
                      </ActionIcon>
                    </Tooltip>
                  </Text>
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
              <Button onClick={() => setShowOptions(!showOptions)}>{showOptions ? t('image_generation.show_less_options') : t('image_generation.show_more_options')}</Button>
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
