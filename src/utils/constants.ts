import { TFunction } from "i18next";

export const modelChanged = (t: TFunction, newModel: string) => t('model_changed_to', { newModel });