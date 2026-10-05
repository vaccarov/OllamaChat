import { Image, Modal, UnstyledButton } from '@mantine/core';
import { type ReactElement, useState } from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import type { ChatText } from '@/types/ChatText';
import './ChatBubble.css';

export default function ChatBubble({ message }: { message: ChatText }): ReactElement | null {
  const { t } = useTranslation();
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
        <div className='thinkTag'>
          <UnstyledButton
            className='thinkButton'
            onClick={() => setIsThinkingOpen(!isThinkingOpen)}>
            {isThinkingOpen ? t('common.hide') : t('common.reasoning')}
            {isThinkingOpen ? <ChevronUp /> : <ChevronDown />}
          </UnstyledButton>
          {isThinkingOpen && (
            <div className='thinkContent'>
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message.thinking}</ReactMarkdown>
            </div>
          )}
        </div>
      )}

      {message.content && (
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{message.content}</ReactMarkdown>
      )}
    </div>
  );
}
