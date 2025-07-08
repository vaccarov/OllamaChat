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