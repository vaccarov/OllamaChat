'use client';

import ImagePicker from '@/components/ImagePicker';
import AudioRecorder from '@/components/Record';
import { ModalContext } from '@/context/ModalContextDefinition';
import { MessageContext } from '@/context/MessageContextDefinition';
import { ModelContext } from '@/context/ModelContextDefinition';
import { RagContext } from '@/context/RagContextDefinition';
import { useTts } from '@/hooks/useTts';
import { GenerateImageSVG, ThinkSVG } from '@/lib/icons';
import { ImageToSend } from '@/types/ImageToSend';
import { MessageContextType } from '@/types/MessageContextDefinition';
import { ActionIcon, Chip, Collapse } from '@mantine/core';
import { useContext } from 'react';
import { Database, Volume2, VolumeX, X } from 'react-feather';
import { useTranslation } from 'react-i18next';

interface QuestionActionsProps {
  image: ImageToSend | undefined;
  visible: boolean;
  onImageSelect: (image: ImageToSend | undefined) => void;
  onTranscript: (transcript: string, error?: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const QuestionActions: React.FC<QuestionActionsProps> = ({ image, visible, onImageSelect, onTranscript, setLoading }) => {
  const { t } = useTranslation();
  const { currentModel, embeddingModels, isChatServerOnline } = useContext(ModelContext)!;
  const { setIsGenerateModalOpen, setIsRagModalOpen } = useContext(ModalContext)!;
  const { selectedRagModel } = useContext(RagContext)!;
  const { isTtsEnabled, setIsTtsEnabled, isSpeaking, cancel } = useTts();
  const { isThinkingEnabled, setIsThinkingEnabled }: MessageContextType = useContext(MessageContext)!;

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
          disabled={!isChatServerOnline}>
          <GenerateImageSVG />
        </ActionIcon>

        <ActionIcon
          onClick={() => setIsRagModalOpen(true)}
          title={t('actions.rag_settings_title')}
          disabled={!(isChatServerOnline && embeddingModels.length)}>
          <Database color={selectedRagModel ? 'var(--maincolor)' : 'currentColor'} />
        </ActionIcon>

        <ActionIcon
          onClick={() => setIsThinkingEnabled(!isThinkingEnabled)}
          title={t('actions.think_title')}>
          <ThinkSVG color={isThinkingEnabled ? 'var(--maincolor)' : 'currentColor'} />
        </ActionIcon>

        <AudioRecorder
          onTranscript={onTranscript}
          setLoading={setLoading}
        />

        <ImagePicker
          onImageSelect={onImageSelect}
          disabled={!currentModel?.show?.capabilities?.includes('vision')}
        />

        <ActionIcon
          onClick={handleTtsButtonClick}
          title={isTtsEnabled ? (isSpeaking ? t('audio.stop_reading') : t('audio.disable_reading')) : t('audio.enable_reading')}>
          {isTtsEnabled ? <Volume2 /> : <VolumeX />}
        </ActionIcon>

        {image && (
          <div className='imageChip'>
            <Chip
              icon={
                <X
                  size={16}
                  onClick={() => onImageSelect(undefined)}
                />
              }
              checked={true}>
              {image.name.substring(0, 30)}
              {image.name.length > 30 && '...'}
            </Chip>
          </div>
        )}
      </div>
    </Collapse>
  );
};
