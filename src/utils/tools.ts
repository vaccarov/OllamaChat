export const formatSize = (bytes: number): string => {
    const units: string[] = ['octets', 'Ko', 'Mo', 'Go', 'To'];
    let i: number = 0;
    let size: number = bytes;

    // Calculer la taille en fonction des unités
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }

    // Retourner la taille formatée avec 2 décimales
    return `${size.toFixed(2)} ${units[i]}`;
};

export const mapIsoToBcp47 = (isoCode: string): string => {
    switch (isoCode) {
        case 'en': return 'en-US';
        case 'fr': return 'fr-FR';
        case 'zh': return 'zh-CN';
        case 'ja': return 'ja-JP';
        case 'es': return 'es-ES';
        case 'de': return 'de-DE';
        case 'it': return 'it-IT';
        default: return 'fr-FR';
    }
};