import { ImageToSend } from '@/types/ImageToSend';
import { ActionIcon } from '@mantine/core';
import { ChangeEvent, memo, ReactElement, useRef } from 'react';
import { Image as ImageIcon } from 'react-feather';

const ImagePicker = memo(({ onImageSelect }: { onImageSelect: (image: ImageToSend) => void }): ReactElement => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file: File | undefined = e.target.files?.[0];
    if (!file) return;

    const reader: FileReader = new FileReader();
    reader.onload = (): void => {
      onImageSelect({
        name: file.name,
        size: file.size,
        data: reader.result as string,
      } as ImageToSend);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <ActionIcon onClick={() => fileInputRef.current!.click()}>
      <ImageIcon />
      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        onChange={handleFileChange}
        className='hidden'
      />
    </ActionIcon>
  );
});

ImagePicker.displayName = 'ImagePicker';
export default ImagePicker;
