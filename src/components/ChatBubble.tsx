import { Collapsible } from "@/components/Collapsable";
import { MessageContext } from "@/context/MessageContextDefinition";
import { ChatText } from "@/types/ChatText";
import { MessageContextType } from "@/types/MessageContextDefinition";
import { Modal } from "@mantine/core";
import { useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import "./ChatBubble.css";

export default function ChatBubble({ message }: { message: ChatText }): React.ReactElement | null {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const messageContext: MessageContextType | undefined = useContext(MessageContext);
  if (!messageContext) return null;

  const { collapsibleStates, toggleCollapsible } = messageContext;

  const isCollapsibleOpen: boolean = collapsibleStates.get(message.date) || false;
  const handleToggleCollapsible = (): void => toggleCollapsible(message.date);

  const parts: string[] = message.content.split(/<think>(.*?)<\/think>/s);

  const renderContent = (): React.ReactElement | React.ReactElement[] => {
    const contentParts: React.ReactElement[] = parts.map((part: string, index: number) => {
      return index % 2 === 1 ? (
        <Collapsible key={index} isOpen={isCollapsibleOpen} onToggle={handleToggleCollapsible}>
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{part}</ReactMarkdown>
        </Collapsible>
      ) : (
        <ReactMarkdown key={index} rehypePlugins={[rehypeRaw]}>{part}</ReactMarkdown>
      );
    });

    if (message.image && message.image.data.startsWith('data:image')) {
      return (
        <>
          <img
            src={message.image.data}
            alt={message.image.name}
            onClick={() => setIsModalOpen(true)}
            className='imageBubble' />
          <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title={message.image.name}>
            <img
              src={message.image.data}
              alt={message.image.name}
              className='imageModal' />
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
