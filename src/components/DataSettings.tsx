import { MessageContext } from '@/context/MessageContextDefinition';
import { MessageContextType } from '@/types';
import { Button } from '@mantine/core';
import { ReactElement, useContext, useRef } from 'react';
import { Download, Upload } from 'react-feather';
import { useTranslation } from 'react-i18next';

export function DataSettings(): ReactElement {
  const { t } = useTranslation();
  const messageContext: MessageContextType | undefined = useContext(MessageContext);
  if (!messageContext) {
    throw new Error('DataSettings must be used within a MessageProvider');
  }
  const fileInputRef: React.RefObject<HTMLInputElement | null> = useRef<HTMLInputElement>(null);
  const { exportSessions, importSessions } = messageContext;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file: File | undefined = event.target.files?.[0];
    if (file) {
      const reader: FileReader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        const content: string | ArrayBuffer | null | undefined = e.target?.result;
        if (typeof content === 'string' && importSessions) {
          importSessions(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className='importExport'>
      <Button
        onClick={exportSessions}
        leftSection={<Download size={16} />}>
        {t('chat.export')}
      </Button>
      <Button
        onClick={() => fileInputRef.current?.click()}
        leftSection={<Upload size={16} />}>
        {t('chat.import')}
      </Button>
      <input
        type='file'
        ref={fileInputRef}
        className='hidden'
        accept='.json'
        onChange={handleFileChange}
      />
    </div>
  );
}
