import { ChatRenameModal } from '@/components/ChatRenameModal';
import { MessageContext } from '@/context/MessageContextDefinition';
import { ModalContext, SettingsContextDefinition } from '@/context/ModalContextDefinition';
import { ChatSession, MessageContextType } from '@/types';
import { ActionIcon, Menu, Text } from '@mantine/core';
import { useContext, useState } from 'react';
import { Copy, Edit, MessageCircle, MoreVertical, Settings, Trash2 } from 'react-feather';
import { useTranslation } from 'react-i18next';
import './ChatList.css';

export function ChatList({ show }: { show: boolean }): React.ReactElement | null {
  const { t } = useTranslation();
  const { activeSession, sessionsInGroup, setActiveSessionId, deleteSession, duplicateSession }: MessageContextType = useContext(MessageContext)!;
  const { setIsSettingsOpen }: SettingsContextDefinition = useContext(ModalContext)!;
  const [renameModalOpen, setRenameModalOpen] = useState<boolean>(false);
  const [sessionToEdit, setSessionToEdit] = useState<ChatSession | null>(null);

  const handleRenameClick = (session: ChatSession | null): void => {
    setSessionToEdit(session);
    setRenameModalOpen(true);
  };

  const closeRenameModal = (): void => {
    setRenameModalOpen(false);
    setSessionToEdit(null);
  };

  return (
    <div className={`chatListContainer ${show && 'show'}`}>
      <ChatRenameModal
        opened={renameModalOpen}
        onClose={closeRenameModal}
        session={sessionToEdit}
      />
      <div className='sessionActions'>
        <ActionIcon onClick={() => setIsSettingsOpen(true)}>
          <Settings />
        </ActionIcon>
        <ActionIcon onClick={() => handleRenameClick(null)}>
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
                <Text className='conversationLink'>{session.name}</Text>
                <Menu width={200}>
                  <Menu.Target>
                    <ActionIcon
                      className='moreVerticals'
                      onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                      <MoreVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item
                      leftSection={<Edit size={14} />}
                      onClick={(e: React.MouseEvent) => {
                        e.stopPropagation();
                        handleRenameClick(session);
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
