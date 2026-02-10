import path from 'path';
import fs from 'fs/promises';
import { PuppeteerScraper } from '../providers/scraper/PuppeteerScraper';
import { PDFDocument } from 'pdf-lib';
import { getDateFolder, sanitizeFilename } from '../utils/formatters';

export interface ScrapeResult {
    url: string;
    status: 'success' | 'error';
    filename?: string;
    publicPath?: string;
    localPath?: string;
    downloadUrl?: string;
    message?: string;
}

// Nova interface para o update de progresso
export interface ProgressUpdate {
    current: number;      // Quantos já foram
    total: number;        // Total de links
    percent: number;      // % completado
    estimatedTime: number;// Segundos restantes (estimativa)
    lastUrl: string;      // Última URL processada
    status: 'processing' | 'completed';
    result?: ScrapeResult; // O resultado parcial (para ir mostrando na tela)
}

// Tipo da função de callback
type ProgressCallback = (data: ProgressUpdate) => void;

export class ScraperService {
    private downloadsRoot: string;

    constructor() {
        // De /dist/services para /server/downloads (dois níveis acima)
        this.downloadsRoot = path.resolve(__dirname, '../../downloads');
    }

    // Agora aceita o callback onProgress e slowScroll
    async execute(links: string[], format: 'png' | 'webp' | 'pdf', slowScroll: boolean = false, onProgress?: ProgressCallback): Promise<ScrapeResult[]> {
        const dateFolder = getDateFolder();
        const targetDir = path.join(this.downloadsRoot, dateFolder);

        try {
            await fs.access(targetDir);
        } catch {
            await fs.mkdir(targetDir, { recursive: true });
        }

        const scraper = new PuppeteerScraper();
        const results: ScrapeResult[] = [];
        const startTime = Date.now(); // Marca o início para calcular média

        try {
            // Avisa que iniciou (0%)
            if (onProgress) onProgress({
                current: 0,
                total: links.length,
                percent: 0,
                estimatedTime: 0, // Indefinido ainda
                lastUrl: '',
                status: 'processing'
            });

            await scraper.init();

            for (let i = 0; i < links.length; i++) {
                const link = links[i];

                // Lógica de Scraping (igual anterior)
                const timestamp = Date.now();
                const safeName = sanitizeFilename(link);
                const filename = `${safeName}_${timestamp}.${format}`;
                const filePath = path.join(targetDir, filename);

                const result: ScrapeResult = { url: link, status: 'error' };

                try {
                    await scraper.capturePage(link, filePath, format, slowScroll);
                    result.status = 'success';
                    result.filename = filename;
                    result.localPath = filePath;
                    result.publicPath = `/downloads/${dateFolder}/${filename}`;
                } catch (error: any) {
                    result.message = error.message;
                    console.error(`[Service Error] ${link}: ${error.message}`);
                }

                results.push(result);

                // --- CÁLCULO DE ESTIMATIVA DE TEMPO ---
                const now = Date.now();
                const timeElapsed = now - startTime;
                const processedCount = i + 1;
                const avgTimePerLink = timeElapsed / processedCount;
                const remainingLinks = links.length - processedCount;
                const estimatedRemainingMs = avgTimePerLink * remainingLinks;

                // Dispara o callback informando o progresso
                if (onProgress) {
                    onProgress({
                        current: processedCount,
                        total: links.length,
                        percent: Math.round((processedCount / links.length) * 100),
                        estimatedTime: Math.ceil(estimatedRemainingMs / 1000), // Em segundos
                        lastUrl: link,
                        status: processedCount === links.length ? 'completed' : 'processing',
                        result: result // Envia o resultado unitário para a UI já renderizar
                    });
                }
            }

        } catch (fatalError) {
            console.error('[Service Fatal]', fatalError);
            throw fatalError;
        } finally {
            await scraper.close();
        }

        // Se for PDF e tiver mais de 1 resultado bem-sucedido, mesclar
        if (format === 'pdf' && results.filter(r => r.status === 'success').length > 1) {
            console.log('[Service] 📄 Mesclando PDFs...');
            const timestamp = Date.now();
            const mergedFilename = `merged_${timestamp}.pdf`;
            const mergedPath = path.join(targetDir, mergedFilename);

            const successfulResults = results.filter(r => r.status === 'success' && r.localPath);
            const pdfPaths = successfulResults.map(r => r.localPath!);

            try {
                await this.mergePDFs(pdfPaths, mergedPath);

                // Deletar PDFs individuais
                for (const pdfPath of pdfPaths) {
                    await fs.unlink(pdfPath);
                }

                console.log(`[Service] ✅ PDFs mesclados: ${mergedFilename}`);

                // Retornar apenas o PDF mesclado
                return [{
                    url: `${successfulResults.length} páginas mescladas`,
                    status: 'success',
                    filename: mergedFilename,
                    localPath: mergedPath,
                    publicPath: `/downloads/${dateFolder}/${mergedFilename}`
                }];
            } catch (mergeError) {
                console.error('[Service] ❌ Erro ao mesclar PDFs:', mergeError);
                // Se falhar, retorna os PDFs individuais
            }
        }

        return results;
    }

    /**
     * Mescla múltiplos PDFs em um único arquivo
     */
    private async mergePDFs(pdfPaths: string[], outputPath: string): Promise<void> {
        const mergedPdf = await PDFDocument.create();

        for (const pdfPath of pdfPaths) {
            try {
                const pdfBytes = await fs.readFile(pdfPath);
                const pdf = await PDFDocument.load(pdfBytes);
                const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
                copiedPages.forEach((page) => mergedPdf.addPage(page));
            } catch (error) {
                console.warn(`[Service] ⚠️  Erro ao processar PDF ${pdfPath}:`, error);
            }
        }

        const mergedPdfBytes = await mergedPdf.save();
        await fs.writeFile(outputPath, mergedPdfBytes);
    }
}
