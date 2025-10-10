'use client';

import ImagePicker from '@/components/ImagePicker';
import AudioRecorder from '@/components/Record';
import { MessageContext } from '@/context/MessageContextDefinition';
import { ModelContext } from '@/context/ModelContextDefinition';
import { ModalContext, SettingsContextDefinition } from '@/context/ModalContextDefinition';
import { useTts } from '@/hooks/useTts';
import { GenerateImageSVG } from '@/lib/icons';
import { listDocuments, uploadDocuments } from '@/services/documentService';
import { MessageContextType } from '@/types';
import { ChatRole } from '@/types/ChatRoleDefinition';
import { RagDocument } from '@/types/document';
import { ImageToSend } from '@/types/ImageToSend';
import { ActionIcon, Box, Button, Chip, Collapse, FileInput, List, Menu, Select, Text } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { Database, Paperclip, Volume2, VolumeX, X } from 'react-feather';
import { useTranslation } from 'react-i18next';

interface QuestionActionsProps {
  image: ImageToSend | undefined;
  visible: boolean;
  onImageSelect: (image: ImageToSend | undefined) => void;
  onTranscript: (transcript: string, error?: boolean) => void;
  setLoading: (loading: boolean) => void;
  selectedRagModel: string | null;
  setSelectedRagModel: (model: string | null) => void;
}

export const QuestionActions: React.FC<QuestionActionsProps> = ({
  image,
  visible,
  onImageSelect,
  onTranscript,
  setLoading,
  selectedRagModel,
  setSelectedRagModel,
}) => {
  const { t } = useTranslation();
  const { chatServerUrl, currentModel, embeddingModels, isChatServerOnline } = useContext(ModelContext)!;
  const { addMessage, activeSession }: MessageContextType = useContext(MessageContext)!;
  const { setIsGenerateModalOpen }: SettingsContextDefinition = useContext(ModalContext)!;
  const { isTtsEnabled, setIsTtsEnabled, isSpeaking, cancel } = useTts();
  const [ragDocuments, setRagDocuments] = useState<RagDocument[]>([]);
  const [uploadModel, setUploadModel] = useState<string>('');
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);

  useEffect(() => {
    if (selectedRagModel && activeSession?.id) {
      listDocuments(chatServerUrl, selectedRagModel, activeSession.id)
        .then(setRagDocuments)
        .catch(_ => setRagDocuments([]));
    } else {
      setRagDocuments([]);
    }
  }, [selectedRagModel, activeSession?.id]);

  const handleUpload = async () => {
    if (filesToUpload.length === 0 || !activeSession?.id) return;
    try {
      await uploadDocuments(chatServerUrl, filesToUpload, uploadModel, activeSession.id);
      if (uploadModel === selectedRagModel) {
        const docs: RagDocument[] = await listDocuments(chatServerUrl, uploadModel, activeSession.id);
        setRagDocuments(docs);
      }
      setFilesToUpload([]);
    } catch (error) {
      console.error('Error uploading files:', error);
      addMessage(ChatRole.custom, `Error uploading files: ${(error as Error).message}`);
    }
  };

  const handleTtsButtonClick = (): void => {
    setIsTtsEnabled(!isTtsEnabled);
    if (isSpeaking) {
      cancel();
    }
  };

  return (
    <Collapse in={visible}>
      <div className='actionGroup'>
        <ActionIcon
          onClick={() => setIsGenerateModalOpen(true)}
          title={t('actions.generate_image_title')}
          disabled={!(isChatServerOnline && embeddingModels.length)}>
          <GenerateImageSVG />
        </ActionIcon>

        <Menu position="bottom-start" withArrow>
          <Menu.Target>
            <ActionIcon
              title={t('actions.rag_settings_title')}
              disabled={!(isChatServerOnline && embeddingModels.length)}>
              <Database color={selectedRagModel ? 'var(--maincolor)' : 'currentColor'}/>
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{t('actions.rag_search_label')}</Menu.Label>
            <Select
              label={t('actions.select_embedding_model_label')}
              placeholder={t('actions.pick_model_placeholder')}
              data={embeddingModels}
              value={selectedRagModel}
              onChange={setSelectedRagModel}
              clearable
            />
            {selectedRagModel && (
              <Box mt="sm">
                <Text size="sm">{t('actions.documents_in_collection_label')}</Text>
                {ragDocuments.length > 0 ? (
                  <List size="sm">
                    {ragDocuments.map(d => <List.Item key={d.filename}>{d.filename}</List.Item>)}
                  </List>
                ) : (
                  <Text size="xs" c="dimmed">{t('actions.no_documents_found')}</Text>
                )}
              </Box>
            )}
          </Menu.Dropdown>
        </Menu>

        <Menu position="bottom-start" withArrow>
          <Menu.Target>
            <ActionIcon
              title={t('actions.upload_documents_title')}
              disabled={!(isChatServerOnline && embeddingModels.length)}>
              <Paperclip />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{t('actions.upload_documents_label')}</Menu.Label>
            <Select
              label={t('actions.embedding_model_for_upload_label')}
              data={embeddingModels}
              value={uploadModel}
              onChange={(value: string | null) => setUploadModel(value || '')}
            />
            <FileInput
              placeholder={t('actions.select_files_placeholder')}
              value={filesToUpload}
              onChange={setFilesToUpload}
              multiple
            />
            <Button onClick={handleUpload} disabled={filesToUpload.length === 0} mt="sm">{t('actions.upload_button')}</Button>
          </Menu.Dropdown>
        </Menu>
      
        <AudioRecorder onTranscript={onTranscript} setLoading={setLoading} />

        <ImagePicker onImageSelect={onImageSelect} disabled={!currentModel?.show?.capabilities?.includes('vision')} />

        <ActionIcon
          onClick={handleTtsButtonClick}
          title={isTtsEnabled ? (isSpeaking ? t('audio.stop_reading') : t('audio.disable_reading')) : t('audio.enable_reading')}>
          {isTtsEnabled ? <Volume2 /> : <VolumeX />}
        </ActionIcon>

        {image && <div className='imageChip'>
          <Chip
            icon={<X size={16} onClick={() => onImageSelect(undefined)} />}
            checked={true}>
            {image.name.substring(0, 30)}{image.name.length > 30 && '...'}
          </Chip>
        </div>}
      </div>
    </Collapse>
  );
};