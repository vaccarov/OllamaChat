import { MessageContext } from "@/context/MessageContext";
import { ActionIcon } from "@mantine/core";
import React, { useContext } from "react";
import { Paperclip } from "react-feather";

export default function DocumentPicker(): React.ReactElement {
  console.log('OOO DocumentPicker');
  const {setDoc} = useContext(MessageContext)!;
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ): Promise<void> => {
    const file: File | undefined = e.target.files?.[0];
    if (!file) return;

    const reader: FileReader = new FileReader();
    reader.onload = () => {
      setDoc({
        name: file.name,
        size: file.size,
        data: reader.result as string
      });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <ActionIcon onClick={() => fileInputRef.current!.click()}>
      <Paperclip></Paperclip>
      <input ref={fileInputRef} type="file" onChange={handleFileChange} className="hidden"/>
    </ActionIcon>
  );
}
