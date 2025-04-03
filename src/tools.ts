export const formatSize = (bytes: number) => {
    const units = ['octets', 'Ko', 'Mo', 'Go', 'To'];
    let i = 0;
    let size = bytes;

    // Calculer la taille en fonction des unités
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024;
        i++;
    }

    // Retourner la taille formatée avec 2 décimales
    return `${size.toFixed(2)} ${units[i]}`;
};