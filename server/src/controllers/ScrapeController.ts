import { Request, Response } from 'express';
import { ScraperService } from '../services/ScraperService';

export class ScrapeController {

    async handle(req: Request, res: Response): Promise<void> {
        const { links, format, slowScroll } = req.body;

        if (!links || !Array.isArray(links) || links.length === 0) {
            res.status(400).json({ error: 'Lista de links inválida.' });
            return;
        }

        // Validação: máximo 10 URLs por vez
        if (links.length > 10) {
            res.status(400).json({ error: 'Limite de 10 URLs por vez. Divida em lotes menores.' });
            return;
        }

        const validFormats = ['png', 'webp', 'pdf'];
        const selectedFormat = validFormats.includes(format) ? format : 'webp';

        // 1. Configura Headers para Streaming
        // Isso impede que o navegador/proxy faça buffer e espera tudo terminar
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        const scraperService = new ScraperService();
        const protocol = req.protocol;
        const host = req.get('host');
        const baseUrl = `${protocol}://${host}`;

        try {
            // 2. Executa passando o Callback
            await scraperService.execute(
                links,
                selectedFormat as 'png' | 'webp' | 'pdf',
                slowScroll || false,
                (progress) => {
                    // Enriquece o resultado parcial com URL completa se houver
                    if (progress.result && progress.result.publicPath) {
                        // NÃO alteramos o publicPath original, apenas geramos o downloadUrl
                        progress.result.downloadUrl = `${baseUrl}${progress.result.publicPath}`;
                    }

                    // Escreve uma linha JSON no stream e descarrega
                    res.write(JSON.stringify(progress) + '\n');
                }
            );

            // Finaliza a resposta quando o loop do service acabar
            res.end();

        } catch (error: any) {
            console.error('[Controller Error]', error);
            // Se der erro no meio do stream, mandamos um JSON de erro final
            res.write(JSON.stringify({ status: 'error', message: 'Erro fatal no servidor' }));
            res.end();
        }
    }
}
