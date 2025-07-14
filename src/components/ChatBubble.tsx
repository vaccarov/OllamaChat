import { MessageContext, MessageContextType } from "@/context/MessageContext";
import { ChatText } from "@/models/ChatText";
import { Modal } from "@mantine/core";
import { useContext, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from 'rehype-raw';
import "./ChatBubble.css";
import { Collapsible } from "./Collapsable";

type ChatProps = {
  message: ChatText;
};

export default function ChatBubble({ message }: ChatProps): React.ReactElement | null {
  const messageContext: MessageContextType | undefined = useContext(MessageContext);
  if (!messageContext) return null;

  const { collapsibleStates, toggleCollapsible } = messageContext;
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const isCollapsibleOpen: boolean = collapsibleStates.get(message.date) || false;
  const handleToggleCollapsible = (): void => toggleCollapsible(message.date);

  const content: string = message.content;
  const parts: string[] = content.split(/<think>(.*?)<\/think>/s);

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

    if (message.doc && message.doc.data.startsWith('data:image')) {
      return (
        <>
          <img src={message.doc.data} alt={message.doc.name} onClick={() => setIsModalOpen(true)} style={{ maxWidth: '100%', maxHeight: '200px', cursor: 'pointer' }} />
          <Modal opened={isModalOpen} onClose={() => setIsModalOpen(false)} title={message.doc.name}>
            <img src={message.doc.data} alt={message.doc.name} style={{ width: '100%' }} />
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
