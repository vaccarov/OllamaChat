import { Collapsible } from '@/components/Collapsable';
import { ChatText } from '@/types/ChatText';
import { Modal } from '@mantine/core';
import { useState, ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import './ChatBubble.css';

export default function ChatBubble({ message }: { message: ChatText }): ReactElement | null {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isThinkingOpen, setIsThinkingOpen] = useState<boolean>(false);
  
  return (
    <div
      className={`bubble ${message.role}`}
      title={message.date}>
      {message.image && message.image.data.startsWith('data:image') && (
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
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>
          {message.content}
        </ReactMarkdown>
      )}
    </div>
  );
}
