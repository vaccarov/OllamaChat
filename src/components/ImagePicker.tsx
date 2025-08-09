import { MessageContext } from "@/context/MessageContextDefinition";
import { ImageToSend } from "@/types/ImageToSend";
import { MessageContextType } from "@/types/MessageContextDefinition";
import { ActionIcon } from "@mantine/core";
import React, { memo, useContext, useRef } from "react";
import { Image } from "react-feather";

const ImagePicker = memo((): React.ReactElement => {
  console.log('OOO ImagePicker');
  const { setImage }: MessageContextType = useContext(MessageContext)!;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file: File | undefined = e.target.files?.[0];
    if (!file) return;

    const reader: FileReader = new FileReader();
    reader.onload = (): void => {
      setImage({
        name: file.name,
        size: file.size,
        data: reader.result as string
      } as ImageToSend);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <ActionIcon onClick={() => fileInputRef.current!.click()} color="white">
      <Image></Image>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden"/>
    </ActionIcon>
  );
});

export default ImagePicker;
