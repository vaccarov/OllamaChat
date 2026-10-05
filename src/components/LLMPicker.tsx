import { ActionIcon, Select, Tooltip } from '@mantine/core';
import type React from 'react';
import { useContext, useMemo } from 'react';
import { HelpCircle, RefreshCw } from 'react-feather';
import { useTranslation } from 'react-i18next';
import { CAPABILITIES } from '@/constants/capabilities';
import { MessageContext } from '@/context/MessageContextDefinition';
import { ModelContext } from '@/context/ModelContextDefinition';
import { type Capability, ChatRole, type LlmModel } from '@/types';
import './LLMPicker.css';

export const LLMPicker: React.FC = (): React.ReactElement | null => {
  const { t } = useTranslation();
  const modelContext = useContext(ModelContext);
  const messageContext = useContext(MessageContext);

  const capabilitiesDescription: string = CAPABILITIES.map(
    (capability: Capability) => `${capability.icon}: ${t(capability.tooltipKey)}`
  ).join('\n');

  const selectData = useMemo(
    () =>
      modelContext?.models.map((m: LlmModel) => {
        const capabilities: Capability[] = CAPABILITIES.filter((capability: Capability) =>
          m.show.capabilities?.includes(capability.id)
        );
        const icons: string = capabilities.map((c: Capability) => c.icon).join(' ');
        const label: string = m.size
          ? `${m.name || m.model} (${(m.size / 1e9).toFixed(2)} GB)`
          : m.name || m.model;
        return {
          value: m.model,
          label: icons ? `${icons} ${label}` : label,
          description: m.details?.family,
        };
      }) || [],
    [modelContext?.models]
  );

  if (!modelContext || !messageContext) return null;

  const { currentModel, refreshModels } = modelContext;

  const handleModelChange = (selectedModel: string | null): void => {
    if (selectedModel) {
      modelContext.setModel(selectedModel);
      messageContext.updateModel(selectedModel);
      messageContext.addMessage(ChatRole.custom, t('model.changed', { selectedModel }));
    }
  };

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
