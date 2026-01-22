/**
 * Gera o nome da pasta baseado na data atual (DD_MM)
 */
export const getDateFolder = (): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Mês começa em 0
    return `${day}_${month}`;
};

/**
 * Sanitiza o nome do arquivo removendo protocolos e caracteres inválidos
 */
export const sanitizeFilename = (url: string): string => {
    // Remove protocol e www
    let clean = url.replace(/^https?:\/\//, '').replace(/^www\./, '');
    // Substitui caracteres especiais por underscore
    return clean.replace(/[^a-z0-9]/gi, '_').toLowerCase();
};
