import ReactMarkdown from "react-markdown";
import "./ChatBubble.css";
import { ChatText } from "@/models/ChatText";
// import { useContext } from "react";
// import { MessageContext } from "@/context/MessageContext";
// import { Collapsible } from "./Collapsable";
// import rehypeRaw from 'rehype-raw';
type ChatProps = {
  message: ChatText;
};

export default function ChatBubble({ message }: ChatProps): React.ReactElement {
	// const messages: ChatText[] = useContext(MessageContext)!.messages;
	// console.log('ChatBubble', useContext(MessageContext)!.conversation.current);
	// return messages?.map((msg: ChatText, i: number) => (
	return (<div
		key={message.date}
		className={`bubble ${message.role}`}
		title={message.date}
		>
		<ReactMarkdown
			// rehypePlugins={[rehypeRaw]}
			components={{
				// think: ({ children }: { children: string }) => <Collapsible>{children}</Collapsible>,
			} as any}>
			{message.content}
		</ReactMarkdown>
	</div>);
}