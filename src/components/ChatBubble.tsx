import { Collapsible } from '@/components/Collapsable';
import { ChatText } from '@/types/ChatText';
import { Modal } from '@mantine/core';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import './ChatBubble.css';

export default function ChatBubble({ message }: { message: ChatText }): React.ReactElement | null {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [collapsibleStates, setCollapsibleStates] = useState<Map<string | undefined, boolean>>(new Map());
  const isCollapsibleOpen: boolean = collapsibleStates.get(message.date) || false;

  const handleToggleCollapsible = (): void => {
    setCollapsibleStates((prevStates: Map<string | undefined, boolean>) => {
      const newStates: Map<string | undefined, boolean> = new Map(prevStates);
      newStates.set(message.date, !newStates.get(message.date));
      return newStates;
    });
  };

  const renderContent = (): React.ReactElement | React.ReactElement[] => {
    const elements: React.ReactElement[] = [];

    if (message.thinking) {
      elements.push(
        <Collapsible
          key='thinking'
          isOpen={isCollapsibleOpen}
          onToggle={handleToggleCollapsible}>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message.thinking}</ReactMarkdown>
        </Collapsible>
      );
    }

    if (message.content) {
      elements.push(
        <ReactMarkdown
          key='content'
          rehypePlugins={[rehypeRaw]}>
          {message.content}
        </ReactMarkdown>
      );
    }

    if (message.image && message.image.data.startsWith('data:image')) {
      return (
        <>
          <img
            src={message.image.data}
            alt={message.image.name}
            onClick={() => setIsModalOpen(true)}
            className='imageBubble'
          />
          <Modal
            opened={isModalOpen}
            size='xl'
            onClose={() => setIsModalOpen(false)}
            title={message.image.name}>
            <img
              src={message.image.data}
              alt={message.image.name}
              className='imageModal'
            />
          </Modal>
          {elements}
        </>
      );
    }

    return elements;
  };

  return (
    <div
      key={message.date}
      className={`bubble ${message.role}`}
      title={message.date}>
      {renderContent()}
    </div>
  );
}
