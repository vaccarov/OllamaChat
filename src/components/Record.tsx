import { ActionIcon } from '@mantine/core';
import { useRef, useState } from 'react';
import { Mic, MicOff } from 'react-feather';
import { useTranslation } from 'react-i18next';
import "./Record.css";

type AudioRecorderProps = {
  onTranscript: (text: string) => void;
};

export default function AudioRecorder({ onTranscript }: AudioRecorderProps): React.ReactElement {
  const { t } = useTranslation();
  const [recording, setRecording] = useState<boolean>(false);
  const [lang, setLang] = useState<string>(localStorage.getItem('speechLang') || 'fr');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async (): Promise<void> => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder: MediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e: BlobEvent): void => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = async (): Promise<void> => {
        const audioBlob: Blob = new Blob(chunks, { type: 'audio/webm' });
        
        const formData: FormData = new FormData();
        formData.append("file", audioBlob, "audio.webm");
        formData.append("language", lang);

        try {
          const res: Response = await fetch(`${import.meta.env.VITE_SERVER_URL}/transcribe`, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            console.error(t('errors.server'), res.status, res.statusText);
            onTranscript(t('errors.transcription_code', { code: res.status }));
            return;
          }

          const json: { transcript: string } = await res.json();
          onTranscript(json.transcript);
        } catch (error) {
          console.error(t('errors.sending_audio'), error);
          onTranscript(t('errors.contacting_transcription_server'));
        }
      };

      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error(t('errors.microphone_access'), error);
      alert(t('errors.microphone_required'));
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      streamRef.current = null;
    }
    setRecording(false);
  };

  const handleRecordClick = (): void => {
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="langContainer">
      <select
        id="language"
        value={lang}
        onChange={(e) => {
          setLang(e.target.value);
          localStorage.setItem('speechLang', e.target.value);
        }}
        className="flagPicker"
        title="Langue pour la transcription"
      >
        <option value="fr">🇫🇷</option>
        <option value="en">🇬🇧</option>
        <option value="zh">🇨🇳</option>
        <option value="ja">🇯🇵</option>
        <option value="es">🇪🇸</option>
        <option value="de">🇩🇪</option>
        <option value="it">🇮🇹</option>
      </select>
      <ActionIcon
        variant="subtle"
        color="white"
        onClick={handleRecordClick}
        title={recording ? t('audio.stop_recording') : t('audio.start_recording')}
      >
        {recording ? <MicOff color="red"/> : <Mic />}
      </ActionIcon>
    </div>
  );
}