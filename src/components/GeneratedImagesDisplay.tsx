'use client';

import { ActionIcon, Flex, Image as MantineImage, Overlay } from '@mantine/core';
import { memo, useCallback, useState } from 'react';
import { Download } from 'react-feather';
import { useTranslation } from 'react-i18next';

const GeneratedImagesDisplay = memo(({ images }: { images: string[] }) => {
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
      gap='md'
      justify='center'
      direction='row'
      wrap='wrap'>
      {images.map((src: string, index: number) => (
        <button
          type='button'
          key={src}
          className='imageItem'
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(null)}
          onFocus={() => setHovered(index)}
          onBlur={() => setHovered(null)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              handleImageDownload(src, index + 1);
            }
          }}
          style={{
            position: 'relative',
            border: 'none',
            background: 'none',
            padding: 0,
            cursor: 'pointer',
          }}>
          <MantineImage
            src={src}
            alt={t('image_generation.generated_image_alt', {
              index: index + 1,
            })}
            w={300}
            radius='lg'
          />
          {hovered === index && (
            <Overlay
              backgroundOpacity={0.5}
              center
              radius='lg'>
              <ActionIcon
                onClick={() => handleImageDownload(src, index + 1)}
                aria-label={t('common.download')}>
                <Download />
              </ActionIcon>
            </Overlay>
          )}
        </button>
      ))}
    </Flex>
  );
});

GeneratedImagesDisplay.displayName = 'GeneratedImagesDisplay';

export { GeneratedImagesDisplay };
