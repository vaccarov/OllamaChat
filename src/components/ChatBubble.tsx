import { Collapsible } from '@/components/Collapsable';
import { ChatText } from '@/types/ChatText';
import { Modal } from '@mantine/core';
import Image from 'next/image';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import './ChatBubble.css';

export default function ChatBubble({ message }: { message: ChatText }): React.ReactElement | null {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [collapsibleStates, setCollapsibleStates] = useState<Map<string | undefined, boolean>>(new Map());
  const isCollapsibleOpen: boolean = collapsibleStates.get(message.date) || false;
  const parts: string[] = message.content.split(/<think>(.*?)<\/think>/s);

  const handleToggleCollapsible = (): void => {
    setCollapsibleStates((prevStates: Map<string | undefined, boolean>) => {
      const newStates: Map<string | undefined, boolean> = new Map(prevStates);
      newStates.set(message.date, !newStates.get(message.date));
      return newStates;
    });
  };

  const renderContent = (): React.ReactElement | React.ReactElement[] => {
    const contentParts: React.ReactElement[] = parts.map((part: string, index: number) => {
      return index % 2 === 1 ? (
        <Collapsible
          key={index}
          isOpen={isCollapsibleOpen}
          onToggle={handleToggleCollapsible}>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{part}</ReactMarkdown>
        </Collapsible>
      ) : (
        <ReactMarkdown
          key={index}
          rehypePlugins={[rehypeRaw]}>
          {part}
        </ReactMarkdown>
      );
    });

    if (message.image && message.image.data.startsWith('data:image')) {
      return (
        <>
          <Image
            src={message.image.data}
            alt={message.image.name}
            onClick={() => setIsModalOpen(true)}
            className='imageBubble'
          />
          <Modal
            opened={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={message.image.name}>
            <Image
              src={message.image.data}
              alt={message.image.name}
              className='imageModal'
            />
          </Modal>
          {contentParts}
        </>
      );
    }

    return contentParts;
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
