import { MessageContext } from '@/context/MessageContextDefinition';
import { SettingsContext, SettingsContextDefinition } from '@/context/SettingsContextDefinition';
import { ChatSession, MessageContextType } from '@/types';
import { ActionIcon, Button, Menu, Modal, Text, TextInput } from '@mantine/core';
import { useContext, useState } from 'react';
import { Copy, Edit, MessageCircle, MoreVertical, Settings, Trash2 } from 'react-feather';
import { useTranslation } from 'react-i18next';
import './ChatList.css';

export function ChatList({ show }: { show: boolean }): React.ReactElement | null {
  const { t } = useTranslation();
  const {
    activeSession,
    sessionsInGroup,
    setActiveSessionId,
    startNewSession,
    renameSession,
    deleteSession,
    duplicateSession,
  }: MessageContextType = useContext(MessageContext)!;
  const { setIsSettingsOpen }: SettingsContextDefinition = useContext(SettingsContext)!;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [sessionToEdit, setSessionToEdit] = useState<string | null>(null);
  const [newName, setNewName] = useState<string>('');

  const handleRename = (session: ChatSession | null): void => {
    setSessionToEdit(session?.id || null);
    setNewName(session?.name || '');
    setIsModalOpen(true);
  };

  const handleModalSubmit = (): void => {
    if (newName) {
      if (sessionToEdit) {
        renameSession(sessionToEdit, newName);
      } else {
        startNewSession(newName);
      }
      closeModal();
    }
  };

  const closeModal = (): void => {
    setIsModalOpen(false);
    setSessionToEdit(null);
    setNewName('');
  };

  return (
    <div className={`chatListContainer ${show && 'show'}`}>
      <Modal
        opened={isModalOpen}
        onClose={closeModal}
        size='xs'
        title={t(sessionToEdit ? 'chat.rename' : 'chat.new')}
        centered>
        <TextInput
          value={newName}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewName(event.currentTarget.value)}
          data-autofocus
          placeholder={t('chat.name')}
          onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
              handleModalSubmit();
            }
          }}
        />
        <Button onClick={handleModalSubmit} mt={16} fullWidth>
          {t(sessionToEdit ? 'chat.rename' : 'chat.new')}
        </Button>
      </Modal>
      <div className='sessionActions'>
        <ActionIcon onClick={() => setIsSettingsOpen(true)}>
          <Settings />
        </ActionIcon>
        <ActionIcon onClick={() => handleRename(null)}>
          <MessageCircle />
        </ActionIcon>
      </div>
      <div className='chatList'>
        {Object.entries(sessionsInGroup).map(([date, sessionsInGroup]: [string, ChatSession[]]) => (
          <div key={date}>
            <Text
              size='xs'
              fs='italic'
              ta='center'
              c='var(--lightcolor)'>
              {date}
            </Text>
            {sessionsInGroup.map((session: ChatSession) => (
              <div
                key={session.id}
                className={`chatListItem ${session.id === activeSession?.id && 'active'}`}
                onClick={() => setActiveSessionId(session.id)}>
                <Text className='conversationLink'>
                  {session.name}
                </Text>
                <Menu width={200}>
                  <Menu.Target>
                    <ActionIcon className='moreVerticals' onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <MoreVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<Edit size={14} />}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleRename(session);
                      }}>
                      {t('chat.rename')}
                    </Menu.Item>
                    <Menu.Item
                      leftSection={<Copy size={14} />}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        duplicateSession(session.id);
                      }}>
                      {t('chat.duplicate')}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item
                      color='red'
                      leftSection={<Trash2 size={14} />}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}>
                      {t('chat.delete')}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}