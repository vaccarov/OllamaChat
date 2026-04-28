import { Image, Modal, UnstyledButton } from '@mantine/core';
import { type ReactElement, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Collapsible } from '@/components/Collapsable';
import type { ChatText } from '@/types/ChatText';
import './ChatBubble.css';

export default function ChatBubble({ message }: { message: ChatText }): ReactElement | null {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isThinkingOpen, setIsThinkingOpen] = useState<boolean>(false);

  return (
    <div
      className={`bubble ${message.role}`}
      title={message.date}>
      {message.image?.data.startsWith('data:image') && (
        <>
          <UnstyledButton
            onClick={() => setIsModalOpen(true)}
            className='imageButton'>
            <Image
              src={message.image.data}
              alt={message.image.name}
              className='imageBubble'
            />
          </UnstyledButton>
          <Modal
            opened={isModalOpen}
            size='xl'
            onClose={() => setIsModalOpen(false)}
            title={message.image.name}>
            <Image
              src={message.image.data}
              alt={message.image.name}
              className='imageModal'
            />
          </Modal>
        </>
      )}

      {message.thinking && (
        <Collapsible
          isOpen={isThinkingOpen}
          onToggle={() => setIsThinkingOpen(!isThinkingOpen)}>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message.thinking}</ReactMarkdown>
        </Collapsible>
      )}

      {message.content && (
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message.content}</ReactMarkdown>
      )}
    </div>
  );
}
