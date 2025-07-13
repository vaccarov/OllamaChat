import ReactMarkdown from "react-markdown";
import "./ChatBubble.css";
import { ChatText } from "@/models/ChatText";
import { useContext } from "react";
import { MessageContext } from "@/context/MessageContext";
import { Collapsible } from "./Collapsable";
import rehypeRaw from 'rehype-raw';

type ChatProps = {
  message: ChatText;
};

export default function ChatBubble({ message }: ChatProps): React.ReactElement | null {
  const messageContext = useContext(MessageContext);
  if (!messageContext) return null;

  const { collapsibleStates, toggleCollapsible } = messageContext;

  const isCollapsibleOpen: boolean = collapsibleStates.get(message.date) || false;
  const handleToggleCollapsible = () => toggleCollapsible(message.date);

  const content: string = message.content;
  const parts: string[] = content.split(/<think>(.*?)<\/think>/s);

  return (
    <div
      key={message.date}
      className={`bubble ${message.role}`}
      title={message.date}>
      {parts.length === 1 ?
        // If there are no think tags, just render the content
        <ReactMarkdown rehypePlugins={[rehypeRaw]}>{content}</ReactMarkdown>
      :
        parts.map((part, index) => {
          return index % 2 === 1
          ? (
            // inside <think> tag
            <Collapsible key={index} isOpen={isCollapsibleOpen} onToggle={handleToggleCollapsible}>
              <ReactMarkdown rehypePlugins={[rehypeRaw]}>{part}</ReactMarkdown>
            </Collapsible>
          )
          : // outside <think> tag
          <ReactMarkdown key={index} rehypePlugins={[rehypeRaw]}>{part}</ReactMarkdown>;
        })
      }
    </div>
  );
}
