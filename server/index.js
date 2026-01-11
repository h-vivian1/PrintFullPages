const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const DOWNLOADS_DIR = path.join(__dirname, 'downloads', 'PRINTEDPAGES');

// Ensure downloads directory exists
if (!fs.existsSync(DOWNLOADS_DIR)) {
    fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

app.post('/print', async (req, res) => {
    const { links, format } = req.body;

    if (!links || !Array.isArray(links) || links.length === 0) {
        return res.status(400).json({ error: 'Lista de links inválida.' });
    }

    const validFormats = ['png', 'webp', 'pdf'];
    const selectedFormat = validFormats.includes(format) ? format : 'webp';

    console.log(`Initialising capture for ${links.length} links. Format: ${selectedFormat}`);

    const results = [];
    let browser;

    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu' // Windows often benefits from this in headless
            ]
        });

        for (const link of links) {
            let page;
            const result = { url: link, status: 'error', path: null, message: '' };

            try {
                page = await browser.newPage();
                // User Agent to bypass Cloudflare 520 / 403
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

                // Set viewport for better full page capture resolution
                await page.setViewport({ width: 1280, height: 800 });

                console.log(`Navigating to: ${link}`);
                // Optimization: networkidle2 is faster (allows 2 connections). Standard 30s timeout might be too short for heavy sites.
                await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });

                // --- POPUP KILLER & CLEANER ---
                try {
                    console.log('Cleaning page (popups, cookies, age gates)...');
                    await page.evaluate(() => {
                        // 1. Helper to finding buttons by text
                        const findButtonByText = (texts) => {
                            const buttons = Array.from(document.querySelectorAll('button, a, input[type="button"], div[role="button"]'));
                            return buttons.find(b => texts.some(t => b.innerText?.toLowerCase().includes(t)));
                        };

                        // 2. Try to click "I am 18", "Enter", "Agree", "Accept"
                        const positiveWords = ['18+', 'over 18', 'i am 18', 'enter', 'entrar', 'aceitar', 'accept', 'agree', 'concordo', 'sim', 'yes'];
                        const gateButton = findButtonByText(positiveWords);
                        if (gateButton) {
                            console.log('Clicking gate button:', gateButton.innerText);
                            gateButton.click();
                        }

                        // 3. Bruteforce Remove Common Annoyances via CSS
                        const style = document.createElement('style');
                        style.innerHTML = `
                            #onetrust-banner-sdk, .onetrust-banner-sdk, 
                            #cookie-banner, .cookie-banner,
                            #gdpr-banner, .gdpr-banner,
                            .modal-backdrop, .modal-overlay,
                            [class*="popup"], [class*="overlay"], [class*="modal"],
                            [id*="popup"], [id*="overlay"], [id*="modal"],
                            .ads, .ad-banner, .advertisement,
                            iframe[src*="googleads"], iframe[src*="doubleclick"]
                            { display: none !important; opacity: 0 !important; visibility: hidden !important; pointer-events: none !important; }
                            
                            /* Force scroll to be enabled in case a modal locked it */
                            body, html { overflow: auto !important; position: static !important; }
                        `;
                        document.head.appendChild(style);
                    });

                    // Small wait for any clicked actions to resolve or animations to clear
                    await new Promise(r => setTimeout(r, 2000));
                } catch (e) {
                    console.log('Cleanup minor error:', e.message);
                }
                // -----------------------------

                const sanitizeFilename = (url) => {
                    return url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                };

                const timestamp = Date.now();
                const filename = `${sanitizeFilename(link)}_${timestamp}.${selectedFormat}`;
                const filepath = path.join(DOWNLOADS_DIR, filename);

                if (selectedFormat === 'pdf') {
                    await page.pdf({
                        path: filepath,
                        format: 'A4',
                        printBackground: true
                    });
                } else {
                    await page.screenshot({
                        path: filepath,
                        fullPage: true,
                        type: selectedFormat
                    });
                }

                result.status = 'success';
                result.path = filepath;
                console.log(`Success: ${filepath}`);

            } catch (err) {
                console.error(`Error processing ${link}:`, err.message);
                result.message = err.message;
            } finally {
                if (page) await page.close();
            }
            results.push(result);
        }

    } catch (err) {
        console.error('Browser launch error:', err);
        return res.status(500).json({ error: 'Erro interno ao iniciar o navegador.' });
    } finally {
        if (browser) await browser.close();
    }

    res.json({ results });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Saving files to: ${DOWNLOADS_DIR}`);
});
