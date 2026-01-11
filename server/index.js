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
                '--disable-gpu'
            ]
        });

        for (const link of links) {
            let page;
            const result = { url: link, status: 'error', path: null, message: '' };

            try {
                page = await browser.newPage();

                // 1. Anti-detection: Set a real User-Agent to bypass Cloudflare
                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

                // 2. Viewport: Standard desktop size
                await page.setViewport({ width: 1280, height: 800 });

                console.log(`Navigating to: ${link}`);
                // 3. Navigation: networkidle2 allows for faster load times (waits for 2 connections max)
                await page.goto(link, { waitUntil: 'networkidle2', timeout: 60000 });

                // --- GENTLE CLEANER (Invokes NO CSS changes, safe for fullpage) ---
                try {
                    console.log('Attemping gentle clicker...');

                    // A. Try Cookies first
                    try {
                        const domain = new URL(link).hostname;
                        await page.setCookie(
                            { name: 'age_gate', value: '18', domain: domain },
                            { name: 'over18', value: '1', domain: domain },
                            { name: 'adult', value: '1', domain: domain }
                        );
                    } catch (e) { }

                    // B. Gentle Clicker - ONLY clicks visible buttons, does not touch layout
                    await page.evaluate(() => {
                        const positiveWords = ['18+', 'over 18', 'maior de 18', 'i am 18', 'enter', 'entrar', 'aceitar', 'accept', 'agree', 'sim', 'yes', 'continuar', 'confirmo'];

                        // Find buttons/links that contain these words
                        const elements = Array.from(document.querySelectorAll('button, a, div[role="button"], input[type="submit"], span'));

                        const target = elements.find(el => {
                            // Must be visible
                            if (el.offsetParent === null) return false;
                            const text = el.innerText?.toLowerCase() || '';
                            return positiveWords.some(pw => text.includes(pw));
                        });

                        if (target) {
                            console.log('Clicking button:', target.innerText);
                            target.click();
                        }
                    });

                    // Wait for click animation
                    await new Promise(r => setTimeout(r, 2000));
                } catch (e) {
                    console.log('Cleanup error:', e.message);
                }
                // -------------------------------------------------------------

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
                        fullPage: true, // This is the key for full scroll capture
                        type: selectedFormat
                    });
                }

                // Serve static files from downloads directory
                app.use('/downloads', express.static(DOWNLOADS_DIR));

                // ... inside the POST route ...

                const protocol = req.protocol;
                const host = req.get('host');
                const publicUrl = `${protocol}://${host}/downloads/${filename}`;

                result.status = 'success';
                result.path = filepath;
                result.downloadUrl = publicUrl;
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
