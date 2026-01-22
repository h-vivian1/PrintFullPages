import puppeteer, { Browser, Page } from 'puppeteer';

interface ScraperOptions {
    width?: number;
    height?: number;
}

export class PuppeteerScraper {
    private browser: Browser | null = null;

    /**
     * Inicializa o navegador com configurações anti-detecção
     */
    async init(): Promise<void> {
        this.browser = await puppeteer.launch({
            headless: true, // Modo headless novo do Chrome
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });
    }

    /**
     * Fecha o navegador e libera memória
     */
    async close(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
        }
    }

    /**
     * Navega, limpa e captura uma única URL
     */
    async capturePage(url: string, outputPath: string, format: 'png' | 'webp' | 'pdf'): Promise<void> {
        if (!this.browser) throw new Error("Browser not initialized. Call init() first.");

        let page: Page | null = null;

        try {
            page = await this.browser.newPage();

            // 1. Setup Anti-detecção e Viewport
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
            await page.setViewport({ width: 1280, height: 800 });

            // 2. Navegação Otimizada
            console.log(`[Scraper] Navegando para: ${url}`);
            await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

            // 3. Executa o "Faxineiro Gentil" (Cookies e Popups)
            await this.applyGentleCleaner(page, url);

            // 4. Captura
            if (format === 'pdf') {
                await page.pdf({
                    path: outputPath,
                    format: 'A4',
                    printBackground: true
                });
            } else {
                await page.screenshot({
                    path: outputPath,
                    fullPage: true,
                    type: format
                });
            }

        } catch (error: any) {
            console.error(`[Scraper Error] Falha em ${url}: ${error.message}`);
            throw error; // Re-lança para o Service tratar
        } finally {
            if (page) await page.close();
        }
    }

    /**
     * Lógica isolada para fechar modais e aceitar cookies
     */
    private async applyGentleCleaner(page: Page, url: string): Promise<void> {
        try {
            // A. Tentar setar cookies conhecidos via protocolo (mais rápido que clicar)
            const domain = new URL(url).hostname;
            await page.setCookie(
                { name: 'age_gate', value: '18', domain: domain },
                { name: 'over18', value: '1', domain: domain },
                { name: 'adult', value: '1', domain: domain }
            );

            // B. Clicar em botões visíveis (Injetado no contexto da página)
            await page.evaluate(() => {
                const positiveWords = ['18+', 'over 18', 'maior de 18', 'i am 18', 'enter', 'entrar', 'aceitar', 'accept', 'agree', 'sim', 'yes', 'continuar', 'confirmo'];

                const elements = Array.from(document.querySelectorAll<HTMLElement>('button, a, div[role="button"], input[type="submit"], span'));

                const target = elements.find(el => {
                    if (el.offsetParent === null) return false; // Deve estar visível
                    const text = el.innerText?.toLowerCase() || '';
                    return positiveWords.some(pw => text.includes(pw));
                });

                if (target) {
                    // console.log('Clicking button:', target.innerText); // Opcional: Log no browser context
                    target.click();
                }
            });

            // Pequena pausa para animações de fechar modal
            await new Promise(r => setTimeout(r, 2000));

        } catch (e) {
            // Falhas no cleaner não devem parar o scraping, apenas logamos
            console.warn(`[Scraper Warning] Gentle Cleaner falhou levemente:`, e);
        }
    }
}
