import { MessageContext } from '@/context/MessageContextDefinition';
import { SettingsContext, SettingsContextDefinition } from '@/context/SettingsContextDefinition';
import { ChatSession, MessageContextType } from '@/types';
import { ActionIcon, Menu, Text } from '@mantine/core';
import { useContext } from 'react';
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

  const handleRename = (id: string) => {
    const newName = prompt(t('chat.name_prompt'));
    if (newName) {
      renameSession(id, newName);
    }
  };

  const handleNewChat = () => {
    const newName: string | null = prompt(t('chat.name_prompt'));
    if (newName) {
      startNewSession(newName);
    }
  };

  return (
    <div className={`chatListContainer ${show && 'show'}`}>
      <div className='sessionActions'>
        <ActionIcon onClick={() => setIsSettingsOpen(true)}>
          <Settings />
        </ActionIcon>
        <ActionIcon onClick={handleNewChat}>
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
                    <ActionIcon className='moreVerticals' onClick={(e) => e.stopPropagation()}>
                      <MoreVertical size={16} />
                    </ActionIcon>
                  </Menu.Target>
                  <Menu.Dropdown>
                    <Menu.Item leftSection={<Edit size={14} />} onClick={(e) => { e.stopPropagation(); handleRename(session.id); }}>
                      {t('chat.rename')}
                    </Menu.Item>
                    <Menu.Item leftSection={<Copy size={14} />} onClick={(e) => { e.stopPropagation(); duplicateSession(session.id); }}>
                      {t('chat.duplicate')}
                    </Menu.Item>
                    <Menu.Divider />
                    <Menu.Item color='red' leftSection={<Trash2 size={14} />} onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}>
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