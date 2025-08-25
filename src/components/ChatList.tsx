import LanguageSwitcher from '@/components/LanguageSwitcher';
import { MessageContext } from '@/context/MessageContextDefinition';
import { ChatSession, MessageContextType } from '@/types';
import { ActionIcon, Button, Menu, Text } from '@mantine/core';
import { useContext, useEffect, useRef, useState } from 'react';
import { Copy, Download, Edit, MoreVertical, Plus, Trash2, Upload } from 'react-feather';
import { useTranslation } from 'react-i18next';
import './ChatList.css';

export function ChatList({ show }: { show: boolean }): React.ReactElement | null {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    activeSession,
    sessionsInGroup,
    setActiveSessionId,
    startNewSession,
    renameSession,
    deleteSession,
    duplicateSession,
    exportSessions,
    importSessions,
  }: MessageContextType = useContext(MessageContext)!;
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => setIsClient(true), []);

  const handleRename = (id: string) => {
    const newName = prompt(t('chat.name_prompt'));
    if (newName) {
      renameSession(id, newName);
    }
  };

  const handleNewChat = () => {
    const newName = prompt(t('chat.name_prompt'));
    if (newName) {
      startNewSession(newName);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file: File | undefined = event.target.files?.[0];
    if (file) {
      const reader: FileReader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const content: string | ArrayBuffer | null | undefined = e.target?.result;
        if (typeof content === 'string') {
          importSessions(content);
        }
      };
      reader.readAsText(file);
    }
  };

  return !isClient ? null : (
    <div className={`chatListContainer ${show && 'show'}`}>
      <Button
        onClick={handleNewChat}
        variant='light'
        className='addChat'
        leftSection={<Plus size={16} />}>
        {t('chat.new')}
      </Button>
      <div className="chatList">
        {Object.entries(sessionsInGroup).map(([date, sessionsInGroup]: [string, ChatSession[]]) => (
          <div key={date}>
            <Text
              size="xs"
              fs="italic"
              ta="center"
              c="var(--lightcolor)">
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
                <Menu shadow="md" width={200}>
                  <Menu.Target>
                    <ActionIcon className="moreVerticals" onClick={(e) => e.stopPropagation()}>
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
                    <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}>
                      {t('chat.delete')}
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="sessionActions">
        <LanguageSwitcher />
        <div className="importExport">
          <ActionIcon
            onClick={exportSessions}
            color={'var(--maincolor)'}
            variant="light"
            title={t('chat.export')}>
            <Download size={16} />
          </ActionIcon>
          <ActionIcon
            onClick={handleImportClick}
            color={'var(--maincolor)'}
            variant="light"
            title={t('chat.import')}>
            <Upload size={16} />
          </ActionIcon>
          <input
            type="file"
            ref={fileInputRef}
            className='hidden'
            accept=".json"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
}