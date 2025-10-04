import { MessageContext } from '@/context/MessageContextDefinition';
import { ChatSession } from '@/types';
import { Button, Modal, TextInput } from '@mantine/core';
import { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface ChatRenameModalProps {
  opened: boolean;
  onClose: () => void;
  session: ChatSession | null;
}

export const ChatRenameModal = ({ opened, onClose, session }: ChatRenameModalProps) => {
  const { t } = useTranslation();
  const { renameSession, startNewSession } = useContext(MessageContext)!;
  const [name, setName] = useState<string>('');

  useEffect(() => {
    if (opened) setName(session?.name || '');
  }, [opened, session]);

  const handleSubmit = (): void => {
    if (name) {
      if (session) {
        renameSession(session.id, name);
      } else {
        startNewSession(name);
      }
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size='xs'
      title={t(session ? 'chat.rename' : 'chat.new')}
      centered>
      <TextInput
        value={name}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => setName(event.currentTarget.value)}
        data-autofocus
        placeholder={t('chat.name')}
        onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === 'Enter') {
            handleSubmit();
          }
        }}
      />
      <Button
        onClick={handleSubmit}
        mt={16}
        fullWidth>
        {t(session ? 'chat.rename' : 'chat.new')}
      </Button>
    </Modal>
  );
};
