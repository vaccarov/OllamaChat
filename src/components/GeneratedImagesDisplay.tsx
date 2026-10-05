'use client';

import { Flex, Image as MantineImage, Overlay } from '@mantine/core';
import { memo } from 'react';
import { Download } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { downloadFile } from '@/utils/tools';

const GeneratedImagesDisplay = memo(({ images }: { images: string[] }) => {
  const { t } = useTranslation();

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
          aria-label={t('common.download')}
          onClick={() => downloadFile(`image_${index + 1}`, src)}>
          <MantineImage
            src={src}
            alt={t('image_generation.generated_image_alt', {
              index: index + 1,
            })}
            w={300}
            radius='lg'
          />
          <Overlay
            backgroundOpacity={0.5}
            center
            radius='lg'
            className='imageItemOverlay'>
            <Download />
          </Overlay>
        </button>
      ))}
    </Flex>
  );
});

GeneratedImagesDisplay.displayName = 'GeneratedImagesDisplay';

export { GeneratedImagesDisplay };
