import { DEFAULT_LANG } from '@/constants/list';
import { STORAGE_KEYS } from '@/constants/storageKeys';
import usePersistentState from '@/hooks/usePersistentState';
import { transcribe } from '@/services/api';
import { ActionIcon } from '@mantine/core';
import { ChangeEvent, useRef, useState } from 'react';
import { Mic, MicOff } from 'react-feather';
import { useTranslation } from 'react-i18next';
import "./Record.css";

export default function AudioRecorder({ onTranscript, setLoading }: {
  onTranscript: (text: string, error?: boolean) => void,
  setLoading: (loading: boolean) => void
}): React.ReactElement {
  const { t } = useTranslation();
  const [recording, setRecording] = useState<boolean>(false);
  const [lang, setLang] = usePersistentState<string>(STORAGE_KEYS.speechLang, DEFAULT_LANG);
  const [transcribeServerUrl] = usePersistentState<string>(
    STORAGE_KEYS.transcribeServerUrl,
    `${process.env.NEXT_PUBLIC_SERVER_HOST}:${process.env.NEXT_PUBLIC_SERVER_PORT}`
  );
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

        try {
          setLoading(true);
          const { transcript }: {transcript: string } = await transcribe(audioBlob, lang, transcribeServerUrl);
          onTranscript(transcript);
        } catch (error) {
          console.error(t('errors.sending_audio'), error);
          onTranscript(t('errors.contacting_transcription_server'), true);
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
        id="voiceFlagPicker"
        value={lang}
        onChange={(e: ChangeEvent<HTMLSelectElement>) => setLang(e.target.value)}
        className="voiceFlagPicker"
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
        onClick={handleRecordClick}
        title={recording ? t('audio.stop_recording') : t('audio.start_recording')}
      >
        {recording ? <MicOff color="red"/> : <Mic />}
      </ActionIcon>
    </div>
  );
}