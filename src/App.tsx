import { ActionIcon, Autocomplete, Textarea } from "@mantine/core";
import { AbortableAsyncIterator, GenerateResponse, ListResponse, ModelResponse, Ollama } from "ollama";
import React, { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Send, StopCircle } from "react-feather";
import Markdown from 'react-markdown';
import "./App.css";
import { formatSize } from "./tools";

const App: React.FC = () => {
  const ollama = useRef(new Ollama({ host: import.meta.env.VITE_OLLAMA_URL })).current;
  const [systemPrompt, setSystemPrompt] = useState<string>(
    "Tu es un expert pour répondre aux questions des enfants. Les réponses doivent être scientifiquement exactes, courtes et faciles à comprendre."
  );
  const [userPrompt, setUserPrompt] = useState<string>("Pourquoi la lune est ronde ?");
  const [model, setModel] = useState<string>('');
  const [models, setModels] = useState<ModelResponse[]>([]);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showTopArrow, setShowTopArrow] = useState(false);
  const [showBottomArrow, setShowBottomArrow] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  // const {
  //   transcript,
  //   listening,
  //   resetTranscript,
  //   browserSupportsSpeechRecognition
  // } = useSpeechRecognition();

  useEffect(() => {
    const fetchModels = async (): Promise<void> => {
      try {
        const data: ListResponse = await ollama.list();
        setModels(data.models.sort((a: ModelResponse, b: ModelResponse) => a.size - b.size));
      } catch (error) {
        console.error("Erreur lors de la récupération des modèles", error);
      }
    };
    fetchModels();
  }, []);

  useEffect(() => {
    const chatEl = chatRef.current;
    if (!chatEl) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatEl;
      setShowTopArrow(scrollTop > 0);
      setShowBottomArrow(scrollTop + clientHeight < scrollHeight - 5);
    };
    handleScroll();
    chatEl.addEventListener("scroll", handleScroll);
    return () => chatEl.removeEventListener("scroll", handleScroll);
  }, [response]);

  const sendRequest = async (): Promise<void> => {
    if (loading) {
      ollama.abort()
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response: AbortableAsyncIterator<GenerateResponse> = await ollama.generate({
        model,
        system: systemPrompt,
        prompt: userPrompt,
        stream: true,
      });
      for await (const part of response) {
        setResponse((prev: string) => prev + part.response);
        scrollToBottom();
      }
    } catch (error: any) {
      setResponse((prev: string) => prev + '\n\n' + (error.name === 'AbortError' ? 'All requests have been aborted' : error.error));
    }
    setResponse((prev: string) => prev + '\n\n');
    scrollToBottom();
    setLoading(false);
  };

  const scrollToTop = () => {
    if (chatRef.current) chatRef.current.scrollTop = 0;
  };

  const scrollToBottom = () => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  };

  return (
    <div className="container">
      <Autocomplete
        placeholder="Choose LLM"
        onChange={setModel}
        data={models.map((m: ModelResponse) => m.model)}
        renderOption={({ option }) => (<span>{option.value} - {formatSize(models.find((m2 => m2.model === option.value))!.size)}</span>)}
      />
      <Textarea
        value={systemPrompt}
        onChange={(e) => setSystemPrompt(e.target.value)}
        autosize
        maxRows={4}/>
      {/* {browserSupportsSpeechRecognition ? (
        <div>
          <p>Microphone: {listening ? 'on' : 'off'}</p>
          <button onClick={SpeechRecognition.startListening}>Start</button>
          <button onClick={SpeechRecognition.stopListening}>Stop</button>
          <button onClick={resetTranscript}>Reset</button>
          <p>{transcript}</p>
        </div>
        ) : <span>Browser doesn't support speech recognition.</span>
        } */}
      <div className="chatContainer">
        <div className={"arrowsChat"}>
          {showTopArrow && (
            <ActionIcon variant="outline" color="white" onClick={scrollToTop}>
              <ArrowUp />
            </ActionIcon>
          )}
          {showBottomArrow && (
            <ActionIcon variant="outline" color="white" onClick={scrollToBottom}>
              <ArrowDown />
            </ActionIcon>
          )}
        </div>
        <div ref={chatRef} className="chat">
          <Markdown>{response}</Markdown>
        </div>
      </div>
      <Textarea
        placeholder="Écrire une question..."
        value={userPrompt}
        onChange={(event) => setUserPrompt(event.currentTarget.value)}
        maxRows={10}
        autosize
        rightSection={
          <ActionIcon
            variant="outline"
            color={loading ? "red" : "white"}
            disabled={!model}
            onClick={sendRequest}>
            {loading ? <StopCircle size="2rem"/> : <Send size="2rem" />}
          </ActionIcon>
        }
      />
    </div>
  );
};

export default App;
