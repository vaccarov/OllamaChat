import { MessageContext } from '@/context/MessageContextDefinition';
import { ModelContext } from '@/context/ModelContextDefinition';
import { transcribe } from '@/services/transcribe';
import { ApiStatus } from '@/types/api';
import { ActionIcon } from '@mantine/core';
import { useContext, useRef, useState } from 'react';
import { Mic, MicOff } from 'react-feather';
import { useTranslation } from 'react-i18next';

export default function AudioRecorder({
  onTranscript,
  setLoading,
}: {
  onTranscript: (text: string, error?: boolean) => void;
  setLoading: (loading: boolean) => void;
}): React.ReactElement {
  const { t } = useTranslation();
  const [recording, setRecording] = useState<boolean>(false);
  const { currentModel, chatServerUrl, isChatServerOnline } = useContext(ModelContext)!;
  const { speechLang } = useContext(MessageContext)!;
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async (): Promise<void> => {
    try {
      const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
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
          const { transcript }: { transcript: string } = await transcribe(audioBlob, speechLang, chatServerUrl);
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
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
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
    <ActionIcon
      onClick={handleRecordClick}
      disabled={!currentModel?.model || !isChatServerOnline}
      title={recording ? t('audio.stop_recording') : t('audio.start_recording')}>
      {recording ? <MicOff color='red' /> : <Mic />}
    </ActionIcon>
  );
}
