import type { Capability } from '@/types/Capability';

export const CAPABILITIES: Capability[] = [
  {
    id: 'vision',
    icon: '🖼️',
    tooltipKey: 'model.capabilities.images',
  },
  {
    id: 'thinking',
    icon: '🧠',
    tooltipKey: 'model.capabilities.thinking',
  },
  {
    id: 'embedding',
    icon: '📚',
    tooltipKey: 'model.capabilities.embedding',
  },
];
