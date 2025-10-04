import { MantineTheme } from '@mantine/core';

const RADIUS: string = 'xl';
const INPUT_SIZE: string = 'lg';

export const theme: Partial<MantineTheme> = {
  components: {
    ActionIcon: {
      defaultProps: {
        variant: 'subtle',
        color: 'white',
        size: 'lg',
        radius: RADIUS,
      },
    },
    Popover: {
      defaultProps: {
        radius: RADIUS,
      },
    },
    Modal: {
      defaultProps: {
        radius: RADIUS,
      },
    },
    ModalContent: {
      defaultProps: {
        radius: RADIUS,
      },
    },
    Alert: {
      defaultProps: {
        radius: RADIUS,
      },
    },
    Chip: {
      defaultProps: {
        variant: 'outline',
      },
    },
    Menu: {
      defaultProps: {
        shadow: 'xl',
        radius: RADIUS,
      },
    },
    Button: {
      defaultProps: {
        size: 'md',
        radius: RADIUS,
        variant: 'outline',
      },
    },
    Select: {
      defaultProps: {
        size: INPUT_SIZE,
        radius: RADIUS,
        labelProps: {
          style: {
            fontSize: 'var(--mantine-font-size-md)',
            marginBottom: 'var(--mantine-spacing-xs)',
          },
        },
      },
    },
    TextInput: {
      defaultProps: {
        size: INPUT_SIZE,
        radius: RADIUS,
        labelProps: {
          style: {
            fontSize: 'var(--mantine-font-size-md)',
            marginBottom: 'var(--mantine-spacing-xs)',
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        size: INPUT_SIZE,
        radius: RADIUS,
      },
    },
    NumberInput: {
      defaultProps: {
        size: INPUT_SIZE,
        radius: RADIUS,
      },
    },
    FileInput: {
      defaultProps: {
        size: INPUT_SIZE,
        radius: RADIUS,
      },
    },
  },
};
