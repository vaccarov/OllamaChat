import { MessageContext, MessageContextType } from '@/context/MessageContext';
import { ChatSession } from '@/models/ChatHistory';
import { ActionIcon, Button, Menu, NavLink } from '@mantine/core';
import { useContext } from 'react';
import { Copy, Edit, MoreVertical, Plus, Trash2 } from 'react-feather';
import './ChatList.css';

export function ChatList(): React.ReactElement {
  console.log('OOO ChatList');
  const {
    sessions,
    activeSession,
    setActiveSessionId,
    startNewSession,
    renameSession,
    deleteSession,
    duplicateSession,
  }: MessageContextType = useContext(MessageContext)!;

  const handleRename = (id: string) => {
    const newName = prompt('Nom du chat');
    if (newName) {
      renameSession(id, newName);
    }
  };

  const handleNewChat = () => {
    const newName = prompt('Nom du chat');
    if (newName) {
      startNewSession(newName);
    }
  };

  return (
    <div className="chatListContainer">
      <Button onClick={handleNewChat} fullWidth variant="light" leftSection={<Plus size={16} />}>
        Nouvelle Discussion
      </Button>
      <div className="chatList">
        {sessions.map((session: ChatSession) => (
          <div key={session.id} className="chatListItem">
            <NavLink
              label={session.name}
              active={session.id === activeSession?.id}
              onClick={() => setActiveSessionId(session.id)}
              variant="subtle"
              style={{ flexGrow: 1 }}
            />
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon variant="subtle" size="sm">
                  <MoreVertical size={16} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item leftSection={<Edit size={14} />} onClick={() => handleRename(session.id)}>
                  Renommer
                </Menu.Item>
                <Menu.Item leftSection={<Copy size={14} />} onClick={() => duplicateSession(session.id)}>
                  Dupliquer
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={() => deleteSession(session.id)}>
                  Supprimer
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        ))}
      </div>
    </div>
  );
}