import { CAPABILITIES, Capability } from '@/constants/capabilities';
import { MessageContext, MessageContextType } from '@/context/MessageContextDefinition';
import { ModelContext, ModelContextType } from '@/context/ModelContextDefinition';
import { ActionIcon, Select, Tooltip } from '@mantine/core';
import { ShowResponse } from 'ollama/browser';
import React, { useContext } from 'react';
import { HelpCircle, RefreshCw } from 'react-feather';
import { useTranslation } from 'react-i18next';
import './LLMPicker.css';

export const LLMPicker: React.FC = (): React.ReactElement => {
  const { t } = useTranslation();
  const { setModel, models, currentModel, refreshModels }: ModelContextType = useContext(ModelContext)!;
  const { updateModel, addMessage }: MessageContextType = useContext(MessageContext)!;

  const handleModelChange = (selectedModel: string | null): void => {
    if (selectedModel) {
      setModel(selectedModel);
      updateModel(selectedModel);
      addMessage('custom', t('model.changed', { selectedModel }));
    }
  };

  const getModelCapabilities = (m: ShowResponse): Capability[] =>
    CAPABILITIES.filter((capability: Capability) => m.capabilities?.includes(capability.id));

  const capabilitiesDescription: string = CAPABILITIES.map(
    (capability: Capability) => `${capability.icon}: ${t(capability.tooltipKey)}`
  ).join('\n');

  return (
    <div className='pickerContainer'>
      <Tooltip label={<div style={{ whiteSpace: 'pre-line' }}>{capabilitiesDescription}</div>} multiline>
        <ActionIcon variant='transparent' color='gray'>
          <HelpCircle />
        </ActionIcon>
      </Tooltip>
      <Select
        placeholder={t('model.select')}
        value={currentModel?.model}
        onChange={handleModelChange}
        className='picker'
        data={models.map((m) => {
          const capabilities: Capability[] = getModelCapabilities(m.show);
          const icons: string = capabilities.map((c: Capability) => c.icon).join(' ');
          const label: string = `${m.name} (${(m.size / 1e9).toFixed(2)} GB)`;
          return {
            value: m.model,
            label: icons ? `${icons} ${label}` : label,
            description: m.details?.family,
          };
        })}
        searchable
      />
      <ActionIcon variant='transparent' color='gray' onClick={refreshModels}>
        <RefreshCw />
      </ActionIcon>
    </div>
  );
};
