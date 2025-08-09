export type Capability = {
  id: string;
  icon: string;
  tooltipKey: string;
};

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
    id: 'insert',
    icon: '✍️',
    tooltipKey: 'model.capabilities.insert',
  },
];