'use client';

import { ActionIcon, Menu, Textarea, type TextareaProps, Tooltip } from '@mantine/core';
import type { ChangeEventHandler, ReactElement } from 'react';
import { HelpCircle } from 'react-feather';
import { PromptListSVG } from '@/lib/icons';
import type { PromptItem } from '@/types';

interface ControlledTextareaProps extends TextareaProps {
  value?: string;
  onValueChange?: (value: string) => void;
  presets?: PromptItem[];
  presetLabel?: string;
  onPresetSelect?: (preset: PromptItem) => void;
  tooltip?: string;
}

export function ControlledTextarea({
  value,
  onChange,
  onValueChange,
  presets,
  presetLabel,
  onPresetSelect,
  tooltip,
  ...others
}: ControlledTextareaProps): ReactElement {
  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    if (onValueChange) {
      onValueChange(event.currentTarget.value);
    }
    if (onChange) {
      onChange(event);
    }
  };

  return (
    <Textarea
      value={value}
      onChange={handleChange}
      autosize
      maxRows={10}
      leftSectionWidth={presets ? 52 : undefined}
      leftSection={
        presets ? (
          <Menu width={200}>
            <Menu.Target>
              <ActionIcon>
                <PromptListSVG />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {presetLabel && <Menu.Label>{presetLabel}</Menu.Label>}
              {presets.map((p) => (
                <Menu.Item
                  key={p.id}
                  onClick={() => onPresetSelect?.(p)}>
                  {p.name}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        ) : undefined
      }
      rightSection={
        tooltip ? (
          <Tooltip
            label={tooltip}
            multiline
            withArrow>
            <ActionIcon variant='transparent'>
              <HelpCircle />
            </ActionIcon>
          </Tooltip>
        ) : (
          others.rightSection
        )
      }
      {...others}
    />
  );
}
