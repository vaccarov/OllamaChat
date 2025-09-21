import { MantineTheme } from "@mantine/core";

const commonRadius: { radius: string } = {
    radius: 'xl',
};

const largeInput: { size: string; radius: string } = {
    size: 'lg',
    ...commonRadius,
};

const inputWithLabel: { size: string; radius: string; labelProps: { style: { fontSize: string; marginBottom: string } } } = {
    ...largeInput,
    labelProps: {
        style: {
            fontSize: 'var(--mantine-font-size-md)',
            marginBottom: 'var(--mantine-spacing-xs)'
        }
    },
};

export const theme: Partial<MantineTheme> = {
    components: {
        ActionIcon: {
            defaultProps: {
                variant: 'subtle',
                color: 'white',
                size: 'lg',
                ...commonRadius,
            },
        },
        Popover: {
            defaultProps: {
                ...commonRadius,
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
                ...commonRadius,
            },
        },
        Button: {
            defaultProps: {
                size: 'md',
                ...commonRadius,
                variant: 'outline'
            },
        },
        Select: {
            defaultProps: {
                ...inputWithLabel
            },
        },
        Textarea: {
            defaultProps: {
                ...largeInput
            },
        },
        TextInput: {
            defaultProps: {
                ...inputWithLabel
            },
        },
    },
};