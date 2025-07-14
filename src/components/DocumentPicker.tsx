import { MessageContext, MessageContextType } from "@/context/MessageContext";
import { DocumentToSend } from "@/models/DocumentToSend";
import { ActionIcon } from "@mantine/core";
import React, { memo, useContext, useRef } from "react";
import { Image } from "react-feather";

const DocumentPicker = memo((): React.ReactElement => {
  console.log('OOO DocumentPicker');
  const { setDoc }: MessageContextType = useContext(MessageContext)!;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file: File | undefined = e.target.files?.[0];
    if (!file) return;

    const reader: FileReader = new FileReader();
    reader.onload = (): void => {
      setDoc({
        name: file.name,
        size: file.size,
        data: reader.result as string
      } as DocumentToSend);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <ActionIcon onClick={() => fileInputRef.current!.click()}>
      <Image></Image>
      <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden"/>
    </ActionIcon>
  );
});

export default DocumentPicker;
