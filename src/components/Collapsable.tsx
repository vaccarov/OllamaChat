import { UnstyledButton } from '@mantine/core';
import type React from 'react';
import { ChevronDown, ChevronUp } from 'react-feather';
import { useTranslation } from 'react-i18next';
import './ChatBubble.css';

interface CollapsibleProps {
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

export function Collapsible({ children, isOpen, onToggle }: CollapsibleProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className='thinkTag'>
      <UnstyledButton
        className='thinkButton'
        onClick={onToggle}>
        {isOpen ? t('common.hide') : t('common.reasoning')}
        {isOpen ? <ChevronUp /> : <ChevronDown />}
      </UnstyledButton>
      {isOpen && <div className='thinkContent'>{children}</div>}
    </div>
  );
}
