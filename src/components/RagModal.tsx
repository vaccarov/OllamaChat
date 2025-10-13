import { MessageContext } from '@/context/MessageContextDefinition';
import { ModelContext } from '@/context/ModelContextDefinition';
import { RagContext } from '@/context/RagContextDefinition';
import { listDocuments, uploadDocuments } from '@/services/document';
import { MessageContextType } from '@/types';
import { RagDocument } from '@/types/document';
import { ActionIcon, Box, FileInput, List, Loader, Modal, Select, Switch, Text } from '@mantine/core';
import { ChangeEvent, Fragment, useContext, useState } from 'react';
import { Upload } from 'react-feather';
import { useTranslation } from 'react-i18next';

interface RagModalProps {
  opened: boolean;
  onClose: () => void;
}

export const RagModal: React.FC<RagModalProps> = ({ opened, onClose }) => {
  const { t } = useTranslation();
  const { selectedRagModel, setSelectedRagModel, ragDocuments, setRagDocuments, includeAllDocuments, setIncludeAllDocuments } = useContext(RagContext)!;
  const { chatServerUrl, embeddingModels } = useContext(ModelContext)!;
  const { activeSession }: MessageContextType = useContext(MessageContext)!;
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (filesToUpload.length === 0 || !selectedRagModel) return;
    setIsUploading(true);
    setUploadError(null);
    try {
      const chatId: string | undefined = includeAllDocuments ? undefined : activeSession?.id;
      await uploadDocuments(chatServerUrl, filesToUpload, selectedRagModel, chatId);
      const docs: RagDocument[] = await listDocuments(chatServerUrl, selectedRagModel, chatId);
      setRagDocuments(docs);
      setFilesToUpload([]);
    } catch (error) {
      const errorMessage = (error as Error).message;
      setUploadError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={t('modals.rag.title')}>
      <div className='vertical'>
        <Select
          label={t('modals.rag.select_embedding_model_label')}
          placeholder={t('modals.rag.pick_model_placeholder')}
          data={embeddingModels}
          value={selectedRagModel}
          onChange={setSelectedRagModel}
          clearable
        />
        {selectedRagModel && (
          <Fragment>
            <Box
              key='documents-in-collection'
              className='vertical'>
              <Switch
                label={t('modals.rag.include_all_documents')}
                checked={includeAllDocuments}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setIncludeAllDocuments(event.currentTarget.checked)}
              />
              <Text size='sm'>{t('modals.rag.documents_in_collection_label')}</Text>
              {ragDocuments.length > 0 ? (
                <List>
                  {ragDocuments.map((d: RagDocument) => (
                    <List.Item key={d.filename}>{d.filename}</List.Item>
                  ))}
                </List>
              ) : (
                <Text
                  size='xs'
                  c='dimmed'>
                  {t('modals.rag.no_documents_found')}
                </Text>
              )}
            </Box>
            <Box
              key='upload-documents'
              className='horizontal'>
              <FileInput
                placeholder={t('modals.rag.select_files_placeholder')}
                className='space'
                value={filesToUpload}
                onChange={(files: File[]) => {
                  setFilesToUpload(files);
                  setUploadError(null);
                }}
                multiple
              />
              <ActionIcon
                onClick={handleUpload}
                disabled={filesToUpload.length === 0 || isUploading}>
                {isUploading ? <Loader /> : <Upload />}
              </ActionIcon>
            </Box>
            {uploadError && (
              <Text
                c='red'
                size='sm'>
                {uploadError}
              </Text>
            )}
          </Fragment>
        )}
      </div>
    </Modal>
  );
};
