import { ActionIcon, Select, Tooltip } from '@mantine/core';
import type React from 'react';
import { useCallback, useContext, useMemo } from 'react';
import { HelpCircle, RefreshCw } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { CAPABILITIES } from '@/constants/capabilities';
import { MessageContext } from '@/context/MessageContextDefinition';
import { ModelContext } from '@/context/ModelContextDefinition';
import {
  type Capability,
  ChatRole,
  type LlmModel,
  type MessageContextType,
  type ModelContextDefinition,
} from '@/types';
import './LLMPicker.css';

export const LLMPicker: React.FC = (): React.ReactElement => {
  const { t } = useTranslation();
  const { setModel, models, currentModel, refreshModels }: ModelContextDefinition =
    useContext(ModelContext)!;
  const { updateModel, addMessage }: MessageContextType = useContext(MessageContext)!;

  const handleModelChange = (selectedModel: string | null): void => {
    if (selectedModel) {
      setModel(selectedModel);
      updateModel(selectedModel);
      addMessage(ChatRole.custom, t('model.changed', { selectedModel }));
    }
  };

  const getModelCapabilities = useCallback(
    (m: LlmModel['show']): Capability[] =>
      CAPABILITIES.filter((capability: Capability) => m.capabilities?.includes(capability.id)),
    []
  );

  const capabilitiesDescription: string = useMemo(
    () =>
      CAPABILITIES.map(
        (capability: Capability) => `${capability.icon}: ${t(capability.tooltipKey)}`
      ).join('\n'),
    [t]
  );

  const selectData = useMemo(
    () =>
      models.map((m: LlmModel) => {
        const capabilities: Capability[] = getModelCapabilities(m.show);
        const icons: string = capabilities.map((c: Capability) => c.icon).join(' ');
        const size = m.size_bytes || m.size;
        const sizeGB = size ? (size / 1e9).toFixed(2) : '0.00';
        const label: string = `${m.name || m.model} (${sizeGB} GB)`;
        return {
          value: m.model,
          label: icons ? `${icons} ${label}` : label,
          description: m.details?.family,
        };
      }),
    [models, getModelCapabilities]
  );

  return (
    <div className='pickerContainer'>
      <Select
        placeholder={t('model.select')}
        value={currentModel?.model}
        onChange={handleModelChange}
        className='picker'
        data={selectData}
        searchable
        rightSectionPointerEvents='visible'
        rightSectionWidth={90}
        rightSection={
          <div className='rightSection'>
            <ActionIcon onClick={refreshModels}>
              <RefreshCw />
            </ActionIcon>
            <Tooltip
              label={<div className='tooltip'>{capabilitiesDescription}</div>}
              multiline>
              <ActionIcon>
                <HelpCircle />
              </ActionIcon>
            </Tooltip>
          </div>
        }
      />
    </div>
  );
};
