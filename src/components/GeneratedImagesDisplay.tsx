'use client';

import { ActionIcon, Flex, Image as MantineImage, Overlay } from '@mantine/core';
import { memo, useCallback, useState } from 'react';
import { Download } from 'react-feather';
import { useTranslation } from 'react-i18next';

const GeneratedImagesDisplay = memo(({ images }: {images: string[]}) => {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<number | null>(null);

  const handleImageDownload = useCallback((src: string, index: number): void => {
    const link: HTMLAnchorElement = document.createElement('a');
    link.href = src;
    link.download = `image_${index}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  return images.length === 0 ? null : (
    <Flex
      gap="md"
      justify="center"
      direction="row"
      wrap="wrap">
      {images.map((src: string, index: number) => (
        <div
          key={index}
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(null)}
          style={{ position: 'relative' }}>
          <MantineImage src={src} alt={t('image_generation.generated_image_alt', { index: index + 1 })} w={300} radius='lg' />
          {hovered === index && (
            <Overlay backgroundOpacity={0.5} center radius="lg">
              <ActionIcon onClick={() => handleImageDownload(src, index + 1)}>
                <Download />
              </ActionIcon>
            </Overlay>
          )}
        </div>
      ))}
    </Flex>
  );
});

export { GeneratedImagesDisplay };
