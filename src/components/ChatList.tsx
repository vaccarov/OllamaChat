import { MessageContext, MessageContextType } from '@/context/MessageContext';
import { ChatSession } from '@/models/ChatHistory';
import { ActionIcon, Button, Menu, NavLink } from '@mantine/core';
import { useContext, useRef } from 'react';
import { Copy, Download, Edit, MoreVertical, Plus, Trash2, Upload } from 'react-feather';
import { useTranslation } from 'react-i18next';
import './ChatList.css';
import LanguageSwitcher from './LanguageSwitcher';

export function ChatList(): React.ReactElement {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    sessions,
    activeSession,
    setActiveSessionId,
    startNewSession,
    renameSession,
    deleteSession,
    duplicateSession,
    exportSessions,
    importSessions,
  }: MessageContextType = useContext(MessageContext)!;

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

  return (
    <div className="chatListContainer">
      <Button onClick={handleNewChat} fullWidth color={'var(--maincolor)'} variant='light' leftSection={<Plus size={16} />}>
        {t('chat.new')}
      </Button>
      <div className="chatList">
        {sessions.map((session: ChatSession) => (
          <div key={session.id} className="chatListItem">
            <NavLink
              label={session.name}
              active={session.id === activeSession?.id}
              onClick={() => setActiveSessionId(session.id)}
              variant="subtle"
              style={{ flexGrow: 1, color: session.id === activeSession?.id ? 'var(--maincolor)' : 'inherit' }}
            />
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle" size="sm">
                  <MoreVertical size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item leftSection={<Edit size={14} />} onClick={() => handleRename(session.id)}>
                  {t('chat.rename')}
                </Menu.Item>
                <Menu.Item leftSection={<Copy size={14} />} onClick={() => duplicateSession(session.id)}>
                  {t('chat.duplicate')}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={() => deleteSession(session.id)}>
                  {t('chat.delete')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        ))}
      </div>
      <div className="sessionActions">
        <div className="importExport">
          <ActionIcon
            onClick={exportSessions}
            color={'var(--maincolor)'} variant="light"
            title={t('chat.export')}>
            <Download size={16} />
          </ActionIcon>
          <ActionIcon onClick={handleImportClick} color={'var(--maincolor)'} variant="light" title={t('chat.import')}>
            <Upload size={16} />
          </ActionIcon>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept=".json"
            onChange={handleFileChange}
          />
        </div>
        <LanguageSwitcher />
      </div>
    </div>
  );
}