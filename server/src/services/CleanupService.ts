import fs from 'fs/promises';
import path from 'path';

export class CleanupService {
    private downloadsRoot: string;
    private retentionTimeMs: number; // Tempo de retenção em milissegundos
    private cleanupIntervalMs: number; // Intervalo de verificação
    private intervalId: NodeJS.Timeout | null = null;

    constructor(retentionMinutes: number = 10) {
        this.downloadsRoot = path.resolve(__dirname, '../../downloads');
        this.retentionTimeMs = retentionMinutes * 60 * 1000;
        this.cleanupIntervalMs = 60 * 1000; // Verificar a cada 1 minuto
    }

    /**
     * Inicia o serviço de limpeza automática
     */
    start(): void {
        console.log(`[Cleanup] 🧹 Serviço iniciado - Retenção: ${this.retentionTimeMs / 60000} minutos`);
        console.log(`[Cleanup] 🔄 Verificação a cada: ${this.cleanupIntervalMs / 1000} segundos`);

        // Executa imediatamente na primeira vez
        this.cleanup();

        // Agenda execuções periódicas
        this.intervalId = setInterval(() => this.cleanup(), this.cleanupIntervalMs);
    }

    /**
     * Para o serviço de limpeza
     */
    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('[Cleanup] ⏹️  Serviço parado');
        }
    }

    /**
     * Varre todas as pastas e deleta arquivos antigos
     */
    private async cleanup(): Promise<void> {
        try {
            const now = Date.now();
            let deletedFiles = 0;
            let deletedFolders = 0;

            // Verifica se o diretório de downloads existe
            try {
                await fs.access(this.downloadsRoot);
            } catch {
                // Diretório não existe, nada a fazer
                return;
            }

            const folders = await fs.readdir(this.downloadsRoot);

            for (const folder of folders) {
                const folderPath = path.join(this.downloadsRoot, folder);

                try {
                    const stat = await fs.stat(folderPath);

                    if (!stat.isDirectory()) continue;

                    const files = await fs.readdir(folderPath);

                    for (const file of files) {
                        const filePath = path.join(folderPath, file);

                        try {
                            const fileStat = await fs.stat(filePath);
                            const age = now - fileStat.mtimeMs;

                            if (age > this.retentionTimeMs) {
                                await fs.unlink(filePath);
                                deletedFiles++;
                                console.log(`[Cleanup] 🗑️  Deletado: ${folder}/${file} (${Math.round(age / 60000)} min)`);
                            }
                        } catch (fileError) {
                            console.warn(`[Cleanup] ⚠️  Erro ao processar arquivo ${file}:`, fileError);
                        }
                    }

                    // Remove pasta vazia
                    const remainingFiles = await fs.readdir(folderPath);
                    if (remainingFiles.length === 0) {
                        await fs.rmdir(folderPath);
                        deletedFolders++;
                        console.log(`[Cleanup] 📁 Pasta vazia removida: ${folder}`);
                    }
                } catch (folderError) {
                    console.warn(`[Cleanup] ⚠️  Erro ao processar pasta ${folder}:`, folderError);
                }
            }

            if (deletedFiles > 0 || deletedFolders > 0) {
                console.log(`[Cleanup] ✅ Limpeza concluída - Arquivos: ${deletedFiles}, Pastas: ${deletedFolders}`);
            }
        } catch (error) {
            console.error('[Cleanup] ❌ Erro fatal:', error);
        }
    }

    /**
     * Executa limpeza manual imediata
     */
    async cleanupNow(): Promise<void> {
        console.log('[Cleanup] 🚀 Limpeza manual iniciada...');
        await this.cleanup();
    }
}
